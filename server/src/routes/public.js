import { Router } from 'express'
import { query } from '../db/pool.js'
import { optionalAuth } from '../middleware/auth.js'
import { HttpError, asyncHandler } from '../middleware/errors.js'
import { bootstrapData, listEvents, listHeritage, listOral, listStories, listVillages } from '../utils/queries.js'
import { villageOut } from '../utils/serializers.js'

const router = Router()
router.use(optionalAuth)

const one = (item, what) => { if (!item) throw new HttpError(404, `${what} not found.`); return item }

router.get('/bootstrap', asyncHandler(async (req, res) => res.json(await bootstrapData(req.user?.id ?? null))))

router.get('/villages', asyncHandler(async (_req, res) => res.json(await listVillages())))
router.get('/villages/:slug', asyncHandler(async (req, res) => {
  const [row] = await query('SELECT * FROM villages WHERE slug = $1', [req.params.slug])
  res.json(villageOut(one(row, 'Village')))
}))

// Optional filters: ?category=&district=&village=&verified=true&q=
router.get('/heritage', asyncHandler(async (req, res) => {
  const { category, district, village, verified, q } = req.query
  const where = []; const params = []
  const add = (sql, value) => { params.push(value); where.push(sql.replaceAll('?', `$${params.length + 1}`)) }
  if (category) add('AND base.category = ?', category)
  if (district) add('AND base.district = ?', district)
  if (village) add('AND v.slug = ?', village)
  if (verified === 'true') where.push('AND base.verified = true')
  if (q) add("AND (base.title ILIKE ? OR base.summary ILIKE ?)", `%${q}%`)
  res.json(await listHeritage(req.user?.id ?? null, where.join(' '), params))
}))
router.get('/heritage/:slug', asyncHandler(async (req, res) => {
  const [item] = await listHeritage(req.user?.id ?? null, 'AND base.slug = $2', [req.params.slug])
  res.json(one(item, 'Heritage record'))
}))

router.get('/stories', asyncHandler(async (req, res) => res.json(await listStories(req.user?.id ?? null))))
router.get('/stories/:slug', asyncHandler(async (req, res) => {
  const [item] = await listStories(req.user?.id ?? null, 'AND base.slug = $2', [req.params.slug])
  res.json(one(item, 'Story'))
}))

router.get('/events', asyncHandler(async (_req, res) => res.json(await listEvents())))
router.get('/events/:slug', asyncHandler(async (req, res) => {
  const [item] = await listEvents('AND e.slug = $1', [req.params.slug])
  res.json(one(item, 'Event'))
}))
router.get('/oral-histories', asyncHandler(async (_req, res) => res.json(await listOral())))

// Global search across heritage, villages, stories, events, people, food and festivals.
// Matches by substring first, and also tolerates typos using PostgreSQL trigram similarity (pg_trgm).
const score = (title, text) =>
  `(CASE WHEN ${title} ILIKE $1 THEN 3 ELSE 0 END + CASE WHEN ${text} ILIKE $1 THEN 1 ELSE 0 END + CASE WHEN word_similarity($2, ${title}) > 0.45 THEN 2 ELSE 0 END)`

router.get('/search', asyncHandler(async (req, res) => {
  const q = String(req.query.q ?? '').trim().slice(0, 80)
  if (!q) return res.json([])
  const like = `%${q.replace(/[%_\\]/g, '\\$&')}%`
  const rows = await query(
    `SELECT * FROM (
       SELECT 'h' || h.id AS id, 'Heritage places' AS "group", h.title, h.summary, '/heritage/' || h.slug AS href, v.slug AS village, h.district,
              ${score('h.title', 'h.summary')} AS score
         FROM heritage h JOIN villages v ON v.id = h.village_id
       UNION ALL
       SELECT 'v-' || slug, 'Villages', name, summary, '/villages/' || slug, slug, district, ${score('name', 'summary')} FROM villages
       UNION ALL
       SELECT 's' || s.id, 'Stories', s.title, s.excerpt, '/stories/' || s.slug, v.slug, s.district, ${score('s.title', 's.excerpt')}
         FROM stories s JOIN villages v ON v.id = s.village_id
       UNION ALL
       SELECT 'e' || e.id, 'Events', e.name, e.description, '/events/' || e.slug, v.slug, e.district, ${score('e.name', 'e.description')}
         FROM events e JOIN villages v ON v.id = e.village_id
       UNION ALL
       SELECT v.slug || '-' || k.col || '-' || (k.ord::text), k.grp, k.item->>'name', k.item->>'note', '/villages/' || v.slug, v.slug, v.district,
              ${score("(k.item->>'name')", "(k.item->>'note')")}
         FROM villages v,
              LATERAL (
                SELECT 'p' AS col, 'People' AS grp, x.item, x.ord FROM jsonb_array_elements(v.people) WITH ORDINALITY AS x(item, ord)
                UNION ALL SELECT 'f', 'Food', x.item, x.ord FROM jsonb_array_elements(v.foods) WITH ORDINALITY AS x(item, ord)
                UNION ALL SELECT 'fe', 'Festivals', x.item, x.ord FROM jsonb_array_elements(v.festivals) WITH ORDINALITY AS x(item, ord)
              ) k
     ) r WHERE score > 0 ORDER BY score DESC, title LIMIT 40`, [like, q])
  res.json(rows.map(({ score: _s, ...r }) => r))
}))

export default router
