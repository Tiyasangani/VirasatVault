import { Router } from 'express'
import { z } from 'zod'
import { pool, query } from '../db/pool.js'
import { adminFileUpload } from '../middleware/upload.js'
import { HttpError, asyncHandler } from '../middleware/errors.js'
import { slugify } from '../utils/text.js'
import { announceNewEvent, announceNewRecord } from '../utils/notify.js'
import { emitToAll } from '../realtime.js'

// Mounted inside routes/admin.js, so every route here is already admin-only.
const router = Router()

const text = z.string().trim()
const fileOrUrl = text.refine((v) => v === '' || /^https?:\/\//.test(v) || v.startsWith('/uploads/'), 'Use a web address or an uploaded file.')
const pair = z.object({ name: text.min(1, 'Name is required.'), note: text.default('') })
const paragraphs = z.array(text.min(1)).min(1, 'Add at least one paragraph.')
const num = (min, max, msg) => z.coerce.number({ invalid_type_error: msg }).min(min, msg).max(max, msg)

const CATEGORY_IDS = ['villages', 'historical-places', 'festivals', 'folk-stories', 'food', 'music', 'dance', 'handicrafts', 'personalities', 'oral-history']
const MAP_TYPES = ['temple', 'fort', 'stepwell', 'monument', 'museum', 'building', 'village']
const EVENT_CATEGORIES = ['Festivals', 'Village Fairs', 'Cultural Programs', 'Exhibitions', 'Traditional Celebrations']

const villageSchema = z.object({
  name: text.min(2, 'Enter the village name.').max(100),
  district: text.min(2, 'Enter the district.'),
  region: text.min(2).default('Saurashtra'),
  summary: text.min(10, 'Write a short summary.'),
  intro: paragraphs,
  lat: num(-90, 90, 'Latitude must be between -90 and 90.'),
  lng: num(-180, 180, 'Longitude must be between -180 and 180.'),
  image: fileOrUrl.default(''),
  gallery: z.array(fileOrUrl).default([]),
  people: z.array(pair).default([]),
  foods: z.array(pair).default([]),
  festivals: z.array(pair).default([]),
})

const heritageSchema = z.object({
  title: text.min(5, 'Give the record a clear title.').max(200),
  category: z.enum(CATEGORY_IDS, { errorMap: () => ({ message: 'Choose a category.' }) }),
  type: z.enum(MAP_TYPES, { errorMap: () => ({ message: 'Choose a map type.' }) }),
  htype: z.enum(['Tangible', 'Intangible', 'Documentary']),
  village: text.min(1, 'Choose a village.'),
  district: text.min(2, 'Enter the district.'),
  period: text.min(2, 'Choose a period.'),
  yearLabel: text.default(''),
  image: fileOrUrl.default(''),
  gallery: z.array(fileOrUrl).default([]),
  lat: num(-90, 90, 'Latitude must be between -90 and 90.'),
  lng: num(-180, 180, 'Longitude must be between -180 and 180.'),
  summary: text.min(10, 'Write a short summary.'),
  description: paragraphs,
  significance: text.default(''),
  timeline: z.array(z.object({ year: text.min(1), text: text.min(1) })).default([]),
  sources: z.array(z.object({ title: text.min(1), type: text.default('Source') })).default([]),
  contributor: text.min(2).default('VirasatVault Team'),
  verified: z.boolean().default(false),
})

const eventSchema = z.object({
  name: text.min(3, 'Give the event a name.').max(200),
  category: z.enum(EVENT_CATEGORIES, { errorMap: () => ({ message: 'Choose an event type.' }) }),
  date: text.regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a start date.'),
  endDate: text.regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')).transform((v) => v || null),
  village: text.min(1, 'Choose a village.'),
  location: text.min(2, 'Enter the venue.'),
  district: text.min(2, 'Enter the district.'),
  image: fileOrUrl.default(''),
  description: text.min(10, 'Write a short description.'),
  schedule: z.array(text.min(1)).default([]),
  entry: text.default(''),
})

const oralSchema = z.object({
  title: text.min(3, 'Give the recording a title.').max(200),
  speaker: text.min(2, 'Who is speaking?').max(150),
  village: text.min(1, 'Choose a village.'),
  duration: num(0, 36000, 'Duration must be in seconds.').default(0),
  description: text.min(10, 'Write a short description.'),
  audioUrl: fileOrUrl.default(''),
})

const j = JSON.stringify
const changed = () => emitToAll('data:changed', {})   // every open page reloads the public data
const villageId = async (slug) => {
  const [v] = await query('SELECT id, name FROM villages WHERE slug = $1', [slug])
  if (!v) throw new HttpError(400, 'Unknown village.', { village: 'Choose a village from the list.' })
  return v
}
// Turn a unique-constraint error into a friendly message.
const guard = (fn) => asyncHandler(async (req, res) => {
  try { await fn(req, res) } catch (err) {
    if (err.code === '23505') throw new HttpError(409, 'A record with that name or address already exists.')
    throw err
  }
})
const notFoundIfEmpty = (rows, what) => { if (!rows.length) throw new HttpError(404, `${what} not found.`); return rows[0] }

// ---- file upload (returns the stored path to paste into a form field) ----
router.post('/upload', ...adminFileUpload, (req, res) => {
  if (!req.file) throw new HttpError(400, 'Choose a file to upload.')
  res.status(201).json({ path: req.file.stored, name: req.file.originalname })
})

// ---- villages ----
router.post('/villages', guard(async (req, res) => {
  const d = villageSchema.parse(req.body)
  const slug = slugify(req.body.slug || d.name)
  const [row] = await query(
    `INSERT INTO villages (slug,name,district,region,image,gallery,summary,intro,lat,lng,people,foods,festivals)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING slug`,
    [slug, d.name, d.district, d.region, d.image, j(d.gallery), d.summary, j(d.intro), d.lat, d.lng, j(d.people), j(d.foods), j(d.festivals)])
  changed()
  res.status(201).json(row)
}))
router.put('/villages/:slug', guard(async (req, res) => {
  const d = villageSchema.parse(req.body)
  const rows = await query(
    `UPDATE villages SET name=$2,district=$3,region=$4,image=$5,gallery=$6,summary=$7,intro=$8,lat=$9,lng=$10,people=$11,foods=$12,festivals=$13
     WHERE slug=$1 RETURNING slug`,
    [req.params.slug, d.name, d.district, d.region, d.image, j(d.gallery), d.summary, j(d.intro), d.lat, d.lng, j(d.people), j(d.foods), j(d.festivals)])
  changed()
  res.json(notFoundIfEmpty(rows, 'Village'))
}))
router.delete('/villages/:slug', guard(async (req, res) => {
  const [v] = await query('SELECT id FROM villages WHERE slug = $1', [req.params.slug])
  if (!v) throw new HttpError(404, 'Village not found.')
  const [c] = await query(`SELECT (SELECT COUNT(*) FROM heritage WHERE village_id=$1) AS heritage,
    (SELECT COUNT(*) FROM stories WHERE village_id=$1) AS stories, (SELECT COUNT(*) FROM events WHERE village_id=$1) AS events`, [v.id])
  await query('DELETE FROM villages WHERE id = $1', [v.id])   // ON DELETE CASCADE removes the village's records too
  changed()
  res.json({ deleted: true, removed: { heritage: Number(c.heritage), stories: Number(c.stories), events: Number(c.events) } })
}))

// ---- heritage records ----
const heritageValues = (d, villageRowId) => [
  d.title, d.category, d.type, d.htype, villageRowId, d.district, d.period, d.yearLabel, d.image, j(d.gallery), d.lat, d.lng,
  d.summary, j(d.description), d.significance, j(d.timeline), j(d.sources), d.contributor, d.verified]

router.post('/heritage', guard(async (req, res) => {
  const d = heritageSchema.parse(req.body)
  const village = await villageId(d.village)
  const client = await pool.connect()
  try {
    const { rows: [{ id }] } = await client.query("SELECT nextval(pg_get_serial_sequence('heritage','id')) AS id")
    const code = village.name.replace(/[aeiou\s]/gi, '').slice(0, 3).toUpperCase().padEnd(3, 'X')
    const { rows: [row] } = await client.query(
      `INSERT INTO heritage (id,slug,record_no,title,category,type,htype,village_id,district,period,year_label,image,gallery,lat,lng,summary,description,significance,timeline,sources,contributor_name,verified)
       VALUES ($20,$21,$22,$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19) RETURNING slug`,
      [...heritageValues(d, village.id), id, `${slugify(d.title)}-${id}`, `HH-${code}-${String(id).padStart(4, '0')}`])
    changed()
    if (d.verified) await announceNewRecord({ title: d.title, slug: row.slug, district: d.district })
    res.status(201).json(row)
  } finally { client.release() }
}))
router.put('/heritage/:slug', guard(async (req, res) => {
  const d = heritageSchema.parse(req.body)
  const village = await villageId(d.village)
  const rows = await query(
    `UPDATE heritage SET title=$1,category=$2,type=$3,htype=$4,village_id=$5,district=$6,period=$7,year_label=$8,image=$9,gallery=$10,lat=$11,lng=$12,
       summary=$13,description=$14,significance=$15,timeline=$16,sources=$17,contributor_name=$18,verified=$19 WHERE slug=$20 RETURNING slug`,
    [...heritageValues(d, village.id), req.params.slug])
  changed()
  res.json(notFoundIfEmpty(rows, 'Heritage record'))
}))
router.delete('/heritage/:slug', guard(async (req, res) => {
  notFoundIfEmpty(await query('DELETE FROM heritage WHERE slug = $1 RETURNING id', [req.params.slug]), 'Heritage record')
  changed()
  res.json({ deleted: true })
}))

// ---- events ----
const eventValues = (d, vid) => [d.name, d.category, d.date, d.endDate, vid, d.location, d.district, d.image, d.description, j(d.schedule), d.entry]
router.post('/events', guard(async (req, res) => {
  const d = eventSchema.parse(req.body)
  const village = await villageId(d.village)
  const [row] = await query(
    `INSERT INTO events (name,category,event_date,end_date,village_id,location,district,image,description,schedule,entry,slug)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING slug`,
    [...eventValues(d, village.id), `${slugify(d.name)}-${Date.now().toString(36)}`])
  changed()
  await announceNewEvent({ name: d.name, slug: row.slug, district: d.district })
  res.status(201).json(row)
}))
router.put('/events/:slug', guard(async (req, res) => {
  const d = eventSchema.parse(req.body)
  const village = await villageId(d.village)
  const rows = await query(
    `UPDATE events SET name=$1,category=$2,event_date=$3,end_date=$4,village_id=$5,location=$6,district=$7,image=$8,description=$9,schedule=$10,entry=$11
     WHERE slug=$12 RETURNING slug`, [...eventValues(d, village.id), req.params.slug])
  changed()
  res.json(notFoundIfEmpty(rows, 'Event'))
}))
router.delete('/events/:slug', guard(async (req, res) => {
  notFoundIfEmpty(await query('DELETE FROM events WHERE slug = $1 RETURNING id', [req.params.slug]), 'Event')
  changed()
  res.json({ deleted: true })
}))

// ---- oral histories (with audio file) ----
router.post('/oral-histories', guard(async (req, res) => {
  const d = oralSchema.parse(req.body)
  const village = await villageId(d.village)
  const [row] = await query('INSERT INTO oral_histories (title,speaker,village_id,duration,description,audio_url) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id',
    [d.title, d.speaker, village.id, Math.round(d.duration), d.description, d.audioUrl || null])
  changed()
  res.status(201).json({ id: `o${row.id}` })
}))
router.put('/oral-histories/:id', guard(async (req, res) => {
  const d = oralSchema.parse(req.body)
  const village = await villageId(d.village)
  const rows = await query('UPDATE oral_histories SET title=$1,speaker=$2,village_id=$3,duration=$4,description=$5,audio_url=$6 WHERE id=$7 RETURNING id',
    [d.title, d.speaker, village.id, Math.round(d.duration), d.description, d.audioUrl || null, Number(req.params.id.replace(/\D/g, ''))])
  notFoundIfEmpty(rows, 'Oral history')
  changed()
  res.json({ id: `o${rows[0].id}` })
}))
router.delete('/oral-histories/:id', guard(async (req, res) => {
  notFoundIfEmpty(await query('DELETE FROM oral_histories WHERE id = $1 RETURNING id', [Number(req.params.id.replace(/\D/g, ''))]), 'Oral history')
  changed()
  res.json({ deleted: true })
}))

// ---- analytics for the dashboard charts ----
router.get('/analytics', asyncHandler(async (_req, res) => {
  const [byMonth, byStatus, byDistrict, topVillages, byCategory] = await Promise.all([
    query(`SELECT to_char(m, 'Mon YY') AS label, COUNT(c.id)::int AS value
           FROM generate_series(date_trunc('month', now()) - interval '5 months', date_trunc('month', now()), interval '1 month') m
           LEFT JOIN contributions c ON date_trunc('month', c.submitted_at) = m GROUP BY m ORDER BY m`),
    query('SELECT status AS label, COUNT(*)::int AS value FROM contributions GROUP BY status ORDER BY value DESC'),
    query('SELECT district AS label, COUNT(*)::int AS value FROM heritage GROUP BY district ORDER BY value DESC'),
    query(`SELECT v.name AS label, (SELECT COUNT(*) FROM heritage h WHERE h.village_id = v.id) + (SELECT COUNT(*) FROM stories s WHERE s.village_id = v.id) AS value
           FROM villages v ORDER BY value DESC, v.name LIMIT 5`),
    query('SELECT category AS label, COUNT(*)::int AS value FROM heritage GROUP BY category ORDER BY value DESC'),
  ])
  res.json({ byMonth, byStatus, byDistrict, topVillages: topVillages.map((r) => ({ ...r, value: Number(r.value) })), byCategory })
}))

export default router
