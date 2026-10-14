import { Router } from 'express'
import { z } from 'zod'
import { query } from '../db/pool.js'
import { optionalAuth, requireAuth } from '../middleware/auth.js'
import { HttpError, asyncHandler } from '../middleware/errors.js'
import { ownerOf } from '../utils/queries.js'
import { notifyUser } from '../utils/notify.js'
import { emitToWatchers } from '../realtime.js'

const router = Router()
const target = z.string().regex(/^[hs]\d{1,9}$/, 'Invalid item.')   // h3 = heritage record 3, s1 = story 1

const reviewOut = (r) => ({ id: r.id, userId: r.user_id, author: r.author, rating: r.rating, text: r.text, date: r.updated_at })

async function summaryFor(targetId) {
  const [r] = await query('SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0) AS average, COUNT(*)::int AS count FROM reviews WHERE target_id = $1', [targetId])
  return { average: Number(r.average), count: r.count }
}

router.get('/reviews/:targetId', optionalAuth, asyncHandler(async (req, res) => {
  const targetId = target.parse(req.params.targetId)
  const rows = await query('SELECT * FROM reviews WHERE target_id = $1 ORDER BY updated_at DESC', [targetId])
  const reviews = rows.map(reviewOut)
  res.json({ ...(await summaryFor(targetId)), reviews, mine: reviews.find((r) => r.userId === req.user?.id) ?? null })
}))

router.post('/reviews', requireAuth, asyncHandler(async (req, res) => {
  const d = z.object({
    targetId: target,
    rating: z.coerce.number().int().min(1, 'Choose a star rating.').max(5, 'Choose a star rating.'),
    text: z.string().trim().max(600, 'Keep the review under 600 characters.').default(''),
  }).parse(req.body)

  const exists = d.targetId.startsWith('h')
    ? await query('SELECT 1 FROM heritage WHERE id = $1', [Number(d.targetId.slice(1))])
    : await query('SELECT 1 FROM stories WHERE id = $1', [Number(d.targetId.slice(1))])
  if (!exists.length) throw new HttpError(404, 'That item no longer exists.')
  const owner = await ownerOf(d.targetId)
  if (owner?.userId === req.user.id) throw new HttpError(403, 'You cannot review your own contribution.')

  // One review per person: a second submission edits the first.
  const [row] = await query(
    `INSERT INTO reviews (target_id, user_id, author, rating, text) VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (target_id, user_id) DO UPDATE SET rating = EXCLUDED.rating, text = EXCLUDED.text, updated_at = now()
     RETURNING *, (xmax = 0) AS inserted`, [d.targetId, req.user.id, req.user.name, d.rating, d.text])

  emitToWatchers(d.targetId, 'review:changed', { targetId: d.targetId })   // live update for everyone on that page
  if (row.inserted && owner?.userId) {
    await notifyUser(owner.userId, { type: 'review', text: `${req.user.name} rated “${owner.title}” ${d.rating} out of 5.`, link: `/heritage/${owner.slug}` })
  }
  res.status(row.inserted ? 201 : 200).json(reviewOut(row))
}))

router.delete('/reviews/:targetId', requireAuth, asyncHandler(async (req, res) => {
  const targetId = target.parse(req.params.targetId)
  const rows = await query('DELETE FROM reviews WHERE target_id = $1 AND user_id = $2 RETURNING id', [targetId, req.user.id])
  if (!rows.length) throw new HttpError(404, 'You have not reviewed this item.')
  emitToWatchers(targetId, 'review:changed', { targetId })
  res.json({ deleted: true })
}))

export default router
