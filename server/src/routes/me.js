import { Router } from 'express'
import { z } from 'zod'
import { pool, query } from '../db/pool.js'
import { requireAuth, optionalAuth } from '../middleware/auth.js'
import { contributionUpload } from '../middleware/upload.js'
import { HttpError, asyncHandler } from '../middleware/errors.js'
import { notificationOut, reportOut } from '../utils/serializers.js'
import { config } from '../config.js'
import { getUserWithCounts, ownerOf, withHistory } from '../utils/queries.js'
import { notifyAdmins, notifyUser } from '../utils/notify.js'
import { emitToAdmins, emitToWatchers } from '../realtime.js'
import { CATEGORIES, categoryLabel } from '../utils/text.js'
import { REPORT_REASONS } from './constants.js'

const router = Router()
const itemId = z.string().regex(/^[a-z]-?[a-z0-9-]{1,38}$/, 'Invalid item.')

// Everything the signed-in user has: profile, saved items, likes, notifications, own contributions.
router.get('/me/state', requireAuth, asyncHandler(async (req, res) => {
  const id = req.user.id
  const [user, bookmarkRows, likeRows, notes, contribs] = await Promise.all([
    getUserWithCounts(id),
    query('SELECT item_type, item_id FROM bookmarks WHERE user_id = $1', [id]),
    query('SELECT item_id FROM likes WHERE user_id = $1', [id]),
    query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50', [id]),
    query('SELECT * FROM contributions WHERE user_id = $1 ORDER BY id DESC', [id]),
  ])
  const bookmarks = { places: [], stories: [], villages: [], events: [] }
  bookmarkRows.forEach((b) => bookmarks[b.item_type]?.push(b.item_id))
  res.json({ user, bookmarks, likes: likeRows.map((l) => l.item_id), notifications: notes.map(notificationOut), contributions: await withHistory(contribs) })
}))

router.post('/bookmarks/toggle', requireAuth, asyncHandler(async (req, res) => {
  const { type, id } = z.object({ type: z.enum(['places', 'stories', 'villages', 'events']), id: itemId }).parse(req.body)
  const removed = await query('DELETE FROM bookmarks WHERE user_id=$1 AND item_type=$2 AND item_id=$3 RETURNING 1', [req.user.id, type, id])
  if (!removed.length) await query('INSERT INTO bookmarks (user_id, item_type, item_id) VALUES ($1,$2,$3)', [req.user.id, type, id])
  res.json({ saved: !removed.length })
}))

router.post('/likes/toggle', requireAuth, asyncHandler(async (req, res) => {
  const { id } = z.object({ id: itemId }).parse(req.body)
  const removed = await query('DELETE FROM likes WHERE user_id=$1 AND item_id=$2 RETURNING 1', [req.user.id, id])
  if (!removed.length) {
    await query('INSERT INTO likes (user_id, item_id) VALUES ($1,$2)', [req.user.id, id])
    const owner = await ownerOf(id)
    if (owner?.userId && owner.userId !== req.user.id) {
      await notifyUser(owner.userId, { type: 'like', text: `${req.user.name} liked your record “${owner.title}”.`, link: `/heritage/${owner.slug}` })
    }
  }
  res.json({ liked: !removed.length })
}))

router.patch('/notifications/:id/read', requireAuth, asyncHandler(async (req, res) => {
  await query('UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2', [Number(req.params.id), req.user.id])
  res.json({ ok: true })
}))
router.post('/notifications/read-all', requireAuth, asyncHandler(async (req, res) => {
  await query('UPDATE notifications SET read = true WHERE user_id = $1', [req.user.id])
  res.json({ ok: true })
}))

// Comments are public to read, but you must be logged in to post.
router.get('/comments/:targetId', asyncHandler(async (req, res) => {
  const rows = await query('SELECT id, author, text, created_at FROM comments WHERE target_id = $1 ORDER BY created_at', [req.params.targetId])
  res.json(rows.map((r) => ({ id: `cm${r.id}`, author: r.author, text: r.text, date: r.created_at })))
}))
router.post('/comments', requireAuth, asyncHandler(async (req, res) => {
  const { targetId, text } = z.object({ targetId: itemId, text: z.string().trim().min(3, 'Write a few words before posting.').max(1000) }).parse(req.body)
  const [row] = await query('INSERT INTO comments (target_id, user_id, author, text) VALUES ($1,$2,$3,$4) RETURNING id, author, text, created_at', [targetId, req.user.id, req.user.name, text])
  const comment = { id: `cm${row.id}`, author: row.author, text: row.text, date: row.created_at }
  emitToWatchers(targetId, 'comment:new', { targetId, comment })     // appears instantly for everyone viewing this page
  const owner = await ownerOf(targetId)
  if (owner?.userId && owner.userId !== req.user.id) {
    await notifyUser(owner.userId, { type: 'comment', text: `${req.user.name} commented on “${owner.title}”.`, link: `/heritage/${owner.slug}` })
  }
  res.status(201).json(comment)
}))

// Contribution: multipart form (text fields + image/video/audio files).
const contributionSchema = z.object({
  title: z.string().trim().min(5, 'Give your contribution a clear title (at least 5 characters).').max(90),
  category: z.string().refine((v) => CATEGORIES.some(([id]) => id === v), 'Choose a category.'),
  village: z.string().trim().min(1, 'Choose the village this belongs to.'),
  district: z.string().trim().min(1, 'Choose a district.'),
  period: z.string().trim().min(1, 'Choose the closest historical period.'),
  description: z.string().trim().min(50, 'Describe it in at least 50 characters.').max(1500),
  source: z.string().trim().min(1, 'Tell us where this information comes from.').max(500),
  reference: z.string().trim().max(500).optional().default(''),
  extra: z.string().trim().max(600).optional().default(''),
  rights: z.literal('true', { errorMap: () => ({ message: 'Please confirm you have the right to share this material.' }) }),
})

router.post('/contributions', requireAuth, ...contributionUpload, asyncHandler(async (req, res) => {
  const data = contributionSchema.parse(req.body)
  const [village] = await query('SELECT name FROM villages WHERE slug = $1', [data.village])
  if (!village) throw new HttpError(400, 'Unknown village.', { village: 'Choose a village from the list.' })
  const files = req.files ?? {}
  const images = (files.images ?? []).map((f) => f.stored)
  const [row] = await query(
    `INSERT INTO contributions (user_id, contributor_name, title, category, village, district, period, description, images, video_url, audio_url, sources, reference, extra)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
    [req.user.id, req.user.name, data.title, categoryLabel(data.category), village.name, data.district, data.period, data.description,
      JSON.stringify(images), files.video?.[0]?.stored ?? null, files.audio?.[0]?.stored ?? null,
      data.source, data.reference, data.extra])
  // Tell every reviewer, live, that something is waiting.
  await notifyAdmins({ type: 'submission', text: `New contribution awaiting review: “${data.title}” from ${req.user.name}.`, link: '/admin/contributions' })
  emitToAdmins('admin:refresh', { what: 'contributions' })
  res.status(201).json((await withHistory([row]))[0])
}))

// Contributor edits a submission that a reviewer sent back, then resubmits it.
const toPath = (url) => (url.startsWith(config.publicUrl) ? url.slice(config.publicUrl.length) : url)
router.put('/contributions/:id', requireAuth, ...contributionUpload, asyncHandler(async (req, res) => {
  const data = contributionSchema.parse(req.body)
  const [current] = await query('SELECT * FROM contributions WHERE id = $1', [Number(req.params.id)])
  if (!current || current.user_id !== req.user.id) throw new HttpError(404, 'Contribution not found.')
  if (current.status !== 'Changes Requested') throw new HttpError(409, 'Only submissions with requested changes can be edited.')
  const [village] = await query('SELECT name FROM villages WHERE slug = $1', [data.village])
  if (!village) throw new HttpError(400, 'Unknown village.', { village: 'Choose a village from the list.' })

  let keep = []
  try { keep = JSON.parse(req.body.keepImages || '[]').map(toPath) } catch { keep = [] }
  keep = keep.filter((p) => current.images.includes(p))                      // only images that really belong to this submission
  const files = req.files ?? {}
  const images = [...keep, ...(files.images ?? []).map((f) => f.stored)].slice(0, 6)

  const [row] = await query(
    `UPDATE contributions SET title=$1, category=$2, village=$3, district=$4, period=$5, description=$6, images=$7,
       video_url=COALESCE($8, video_url), audio_url=COALESCE($9, audio_url), sources=$10, reference=$11, extra=$12,
       status='Pending', admin_note=NULL, submitted_at=CURRENT_DATE WHERE id=$13 RETURNING *`,
    [data.title, categoryLabel(data.category), village.name, data.district, data.period, data.description, JSON.stringify(images),
      files.video?.[0]?.stored ?? null, files.audio?.[0]?.stored ?? null,
      data.source, data.reference, data.extra, current.id])
  await query('INSERT INTO contribution_history (contribution_id, actor, status, note) VALUES ($1,$2,$3,$4)',
    [current.id, 'contributor', 'Pending', String(req.body.message ?? '').trim().slice(0, 500) || 'Resubmitted with changes.'])
  await notifyAdmins({ type: 'submission', text: `${req.user.name} resubmitted “${data.title}” after requested changes.`, link: '/admin/contributions' })
  emitToAdmins('admin:refresh', { what: 'contributions' })
  res.json((await withHistory([row]))[0])
}))

router.post('/reports', optionalAuth, asyncHandler(async (req, res) => {
  const data = z.object({
    target: z.string().trim().min(1).max(200),
    reason: z.enum(REPORT_REASONS),
    detail: z.string().trim().min(15, 'Please add at least a sentence so reviewers know what to check.').max(500),
  }).parse(req.body)
  const [row] = await query('INSERT INTO reports (user_id, reporter_name, target, reason, detail) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [req.user?.id ?? null, req.user?.name ?? 'Guest visitor', data.target, data.reason, data.detail])
  await notifyAdmins({ type: 'report', text: `New report (${data.reason}) about “${data.target}”.`, link: '/admin/reports' })
  emitToAdmins('admin:refresh', { what: 'reports' })
  res.status(201).json(reportOut(row))
}))

export default router
