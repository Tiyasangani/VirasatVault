import { Router } from 'express'
import { z } from 'zod'
import { pool, query } from '../db/pool.js'
import { requireAdmin, requireAuth } from '../middleware/auth.js'
import { HttpError, asyncHandler } from '../middleware/errors.js'
import { reportOut } from '../utils/serializers.js'
import { withHistory } from '../utils/queries.js'
import { levelFor } from '../utils/levels.js'
import contentRoutes from './adminContent.js'
import { announceNewRecord, notifyUser, notifyWhere } from '../utils/notify.js'
import { disconnectUser, emitToAdmins, emitToAll, emitToUser, emitToWatchers } from '../realtime.js'
import { runReminders } from '../scheduler.js'
import { categoryId, slugify } from '../utils/text.js'
import { REVIEW_STATUSES } from './constants.js'

const router = Router()
router.use(requireAuth, requireAdmin)
router.use(contentRoutes)

const POINTS_FOR_APPROVAL = 25

router.get('/stats', asyncHandler(async (_req, res) => {
  const [row] = await query(`SELECT
    (SELECT COUNT(*) FROM users) AS users,
    (SELECT COUNT(*) FROM heritage) AS heritage,
    (SELECT COUNT(*) FROM villages) AS villages,
    (SELECT COUNT(*) FROM contributions WHERE status IN ('Pending','Under Review')) AS pending,
    (SELECT COUNT(*) FROM heritage WHERE verified) AS verified,
    (SELECT COUNT(*) FROM reports WHERE status = 'Open') AS reports`)
  res.json(Object.fromEntries(Object.entries(row).map(([k, v]) => [k, Number(v)])))
}))

router.get('/contributions', asyncHandler(async (_req, res) => {
  res.json(await withHistory(await query('SELECT * FROM contributions ORDER BY submitted_at DESC, id DESC')))
}))

const NOTICE = {
  Approved: (t) => ['approved', `Your heritage submission “${t}” was approved.`],
  'Changes Requested': (t, note) => ['changes', `Your contribution “${t}” requires changes.${note ? ` Reviewer note: ${note}` : ''}`],
  Rejected: (t, note) => ['changes', `Your contribution “${t}” was not accepted.${note ? ` Reason: ${note}` : ''}`],
}

// Review a contribution. Approving it publishes a verified heritage record (inside one transaction).
router.patch('/contributions/:id', asyncHandler(async (req, res) => {
  const { status, note } = z.object({ status: z.enum(REVIEW_STATUSES), note: z.string().trim().max(500).optional().default('') }).parse(req.body)
  const client = await pool.connect()
  let after = null   // work to do once the transaction has committed (so we never announce something that rolled back)
  try {
    await client.query('BEGIN')
    const { rows: [c] } = await client.query('SELECT * FROM contributions WHERE id = $1 FOR UPDATE', [Number(req.params.id)])
    if (!c) throw new HttpError(404, 'Contribution not found.')
    if (c.status === 'Approved' && status !== 'Approved') throw new HttpError(409, 'An approved contribution is already published and cannot be changed.')
    if (['Rejected', 'Changes Requested'].includes(status) && !note && !c.admin_note) throw new HttpError(400, 'Add a short note so the contributor knows why.')

    let heritageId = c.heritage_id
    let published = null
    if (status === 'Approved' && !heritageId) {
      const { rows: [village] } = await client.query('SELECT * FROM villages WHERE lower(name) = lower($1)', [c.village])
      if (!village) throw new HttpError(400, `No village called ${c.village} exists yet. Add the village first.`)
      const { rows: [{ id: newId }] } = await client.query("SELECT nextval(pg_get_serial_sequence('heritage','id')) AS id")
      const category = categoryId(c.category)
      const code = village.name.replace(/[aeiou\s]/gi, '').slice(0, 3).toUpperCase().padEnd(3, 'X')
      const jitter = ((Number(newId) % 7) - 3) * 0.002
      const paragraphs = c.description.split(/\n{2,}/).filter(Boolean)
      const sources = [{ title: c.sources || 'Contributor account', type: 'Contributor submission' }]
      if (c.reference) sources.push({ title: c.reference, type: 'Reference' })
      const images = c.images ?? []
      const { rows: [h] } = await client.query(
        `INSERT INTO heritage (id, slug, record_no, title, category, type, htype, village_id, district, period, year_label, image, gallery, lat, lng,
           summary, description, significance, timeline, sources, contributor_name, verified, user_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,'[]',$19,$20,true,$21) RETURNING id, slug`,
        [newId, `${slugify(c.title)}-${newId}`, `HH-${code}-${String(newId).padStart(4, '0')}`, c.title, category,
          category === 'historical-places' ? 'building' : 'village',
          ['historical-places', 'villages'].includes(category) ? 'Tangible' : category === 'oral-history' ? 'Documentary' : 'Intangible',
          village.id, c.district, c.period || 'Living tradition', 'Community record', images[0] ?? village.image, JSON.stringify(images),
          village.lat + jitter, village.lng - jitter, c.description.slice(0, 180).trim() + (c.description.length > 180 ? '…' : ''),
          JSON.stringify(paragraphs), `Contributed by ${c.contributor_name} and verified by a VirasatVault reviewer.`, JSON.stringify(sources), c.contributor_name, c.user_id])
      heritageId = h.id
      published = { title: c.title, slug: h.slug, district: c.district, authorId: c.user_id }
      // A contribution with an audio recording also becomes a playable oral history.
      if (c.audio_url) {
        await client.query('INSERT INTO oral_histories (title,speaker,village_id,duration,description,audio_url) VALUES ($1,$2,$3,0,$4,$5)',
          [c.title, c.contributor_name, village.id, c.description.slice(0, 200), c.audio_url])
      }
      if (c.user_id) await client.query('UPDATE users SET points = points + $1 WHERE id = $2', [POINTS_FOR_APPROVAL, c.user_id])
    }

    const { rows: [updated] } = await client.query(
      'UPDATE contributions SET status=$1, admin_note=$2, heritage_id=$3, reviewed_at=now() WHERE id=$4 RETURNING *',
      [status, note || c.admin_note || null, heritageId, c.id])
    if (status !== c.status || note) {
      await client.query('INSERT INTO contribution_history (contribution_id, actor, status, note) VALUES ($1,$2,$3,$4)', [c.id, 'reviewer', status, note || null])
    }
    after = { userId: c.user_id, notice: NOTICE[status] ? NOTICE[status](c.title, note) : null, published, link: published ? `/heritage/${published.slug}` : '/profile' }
    await client.query('COMMIT')
    const [withHist] = await withHistory([updated])
    // After the commit: tell the contributor, tell the district, refresh every open admin page.
    if (after.userId) {
      if (after.notice) await notifyUser(after.userId, { type: after.notice[0], text: after.notice[1], link: after.link })
      emitToUser(after.userId, 'contribution:updated', { id: updated.id })
    }
    if (after.published) { await announceNewRecord(after.published); emitToAll('data:changed', {}) }
    emitToAdmins('admin:refresh', { what: 'contributions' })
    res.json(withHist)
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}))

router.get('/reports', asyncHandler(async (_req, res) => {
  res.json((await query('SELECT * FROM reports ORDER BY (status = \'Open\') DESC, id DESC')).map(reportOut))
}))
router.patch('/reports/:id/resolve', asyncHandler(async (req, res) => {
  const [row] = await query("UPDATE reports SET status = 'Resolved' WHERE id = $1 RETURNING *", [Number(req.params.id)])
  if (!row) throw new HttpError(404, 'Report not found.')
  res.json(reportOut(row))
}))

// ---- announcements: an admin writes a message and every matching member gets it instantly ----
const broadcastSchema = z.object({
  message: z.string().trim().min(5, 'Write at least a short sentence.').max(300, 'Keep it under 300 characters.'),
  audience: z.enum(['all', 'district']),
  district: z.string().trim().optional(),
}).refine((d) => d.audience === 'all' || d.district, { message: 'Choose a district.', path: ['district'] })

router.post('/broadcasts', asyncHandler(async (req, res) => {
  const d = broadcastSchema.parse(req.body)
  const recipients = d.audience === 'all'
    ? await notifyWhere("role = 'member'", [], { type: 'broadcast', text: d.message })
    : await notifyWhere("role = 'member' AND district = $4", [d.district], { type: 'broadcast', text: d.message })
  const [row] = await query('INSERT INTO broadcasts (admin_id, message, audience, district, recipients) VALUES ($1,$2,$3,$4,$5) RETURNING id',
    [req.user.id, d.message, d.audience, d.audience === 'district' ? d.district : null, recipients])
  res.status(201).json({ id: row.id, recipients })
}))
router.get('/broadcasts', asyncHandler(async (_req, res) => {
  const rows = await query('SELECT id, message, audience, district, recipients, created_at AS date FROM broadcasts ORDER BY id DESC LIMIT 20')
  res.json(rows)
}))
// Run the event-reminder job right now (it also runs by itself every 15 minutes).
router.post('/reminders/run', asyncHandler(async (_req, res) => res.json({ sent: await runReminders() })))

router.get('/users', asyncHandler(async (_req, res) => {
  const rows = await query(`SELECT u.id, u.name, u.email, u.village, u.points, u.role, u.banned, u.created_at::date AS joined,
    (SELECT COUNT(*) FROM contributions c WHERE c.user_id = u.id) AS contributions FROM users u ORDER BY u.id`)
  res.json(rows.map((u) => ({ id: u.id, name: u.name, email: u.email, village: u.village, role: u.role === 'admin' ? 'Reviewer' : levelFor(u.points), isAdmin: u.role === 'admin', banned: u.banned, contributions: Number(u.contributions), joined: u.joined })))
}))

// ---- moderation ----
// Suspend or restore an account. A suspended person cannot log in or post, and their live connection is closed.
router.patch('/users/:id/ban', asyncHandler(async (req, res) => {
  const { banned } = z.object({ banned: z.boolean() }).parse(req.body)
  const id = Number(req.params.id)
  if (id === req.user.id) throw new HttpError(400, 'You cannot suspend your own account.')
  const [target] = await query('SELECT role FROM users WHERE id = $1', [id])
  if (!target) throw new HttpError(404, 'User not found.')
  if (target.role === 'admin') throw new HttpError(403, 'Reviewer accounts cannot be suspended here.')
  await query('UPDATE users SET banned = $1 WHERE id = $2', [banned, id])
  if (banned) disconnectUser(id)
  res.json({ id, banned })
}))

// Remove an inappropriate comment or review. Pages that are open update immediately.
router.delete('/comments/:id', asyncHandler(async (req, res) => {
  const [row] = await query('DELETE FROM comments WHERE id = $1 RETURNING target_id', [Number(req.params.id)])
  if (!row) throw new HttpError(404, 'Comment not found.')
  emitToWatchers(row.target_id, 'comment:removed', { targetId: row.target_id, id: `cm${req.params.id}` })
  res.json({ deleted: true })
}))
router.delete('/reviews/:id', asyncHandler(async (req, res) => {
  const [row] = await query('DELETE FROM reviews WHERE id = $1 RETURNING target_id', [Number(req.params.id)])
  if (!row) throw new HttpError(404, 'Review not found.')
  emitToWatchers(row.target_id, 'review:changed', { targetId: row.target_id })
  res.json({ deleted: true })
}))

export default router
