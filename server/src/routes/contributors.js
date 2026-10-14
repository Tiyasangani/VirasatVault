import { Router } from 'express'
import { query } from '../db/pool.js'
import { HttpError, asyncHandler } from '../middleware/errors.js'
import { levelFor } from '../utils/levels.js'
import { fileUrl } from '../utils/serializers.js'

const router = Router()

// Public leaderboard. Never exposes emails.
router.get('/contributors', asyncHandler(async (req, res) => {
  const district = req.query.district ? String(req.query.district) : null
  const rows = await query(
    `SELECT u.id, u.name, u.village, u.district, u.points,
            (SELECT COUNT(*) FROM contributions c WHERE c.user_id = u.id AND c.status = 'Approved')::int AS approved
     FROM users u
     WHERE u.role = 'member' AND ($1::text IS NULL OR u.district = $1)
       AND (u.points > 0 OR EXISTS (SELECT 1 FROM contributions c WHERE c.user_id = u.id AND c.status = 'Approved'))
     ORDER BY u.points DESC, approved DESC, u.name LIMIT 50`, [district])
  res.json(rows.map((r) => ({ ...r, level: levelFor(r.points) })))
}))

router.get('/contributors/:id', asyncHandler(async (req, res) => {
  const [u] = await query(`SELECT id, name, village, district, points, created_at::date AS joined FROM users WHERE id = $1 AND role = 'member'`, [Number(req.params.id)])
  if (!u) throw new HttpError(404, 'Contributor not found.')
  const records = await query(
    `SELECT c.id, c.title, c.category, c.village, h.slug, h.image, h.verified
     FROM contributions c LEFT JOIN heritage h ON h.id = c.heritage_id
     WHERE c.user_id = $1 AND c.status = 'Approved' ORDER BY c.id DESC`, [u.id])
  res.json({ ...u, level: levelFor(u.points), approved: records.length,
    records: records.map((r) => ({ id: r.id, title: r.title, category: r.category, village: r.village, slug: r.slug, image: fileUrl(r.image), verified: r.verified })) })
}))

export default router
