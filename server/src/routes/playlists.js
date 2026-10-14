import { Router } from 'express'
import crypto from 'node:crypto'
import { z } from 'zod'
import { pool, query } from '../db/pool.js'
import { optionalAuth, requireAuth } from '../middleware/auth.js'
import { HttpError, asyncHandler } from '../middleware/errors.js'
import { notifyUser } from '../utils/notify.js'

const router = Router()
const MAX_PLAYLISTS = 30
const MAX_ITEMS = 100

const itemId = z.string().regex(/^([hseo]\d{1,9}|v-[a-z0-9-]{1,60})$/, 'Invalid item.')
const title = z.string().trim().min(1, 'Give the playlist a name.').max(80, 'Keep the name under 80 characters.')
const description = z.string().trim().max(300, 'Keep the description under 300 characters.')

const out = (p, ids) => ({ id: p.id, code: p.share_code, title: p.title, description: p.description, isPublic: p.is_public, itemIds: ids, updatedAt: p.updated_at })
const newCode = () => crypto.randomBytes(6).toString('base64url')

async function itemExists(id) {
  const n = Number(id.slice(1))
  if (id.startsWith('v-')) return (await query('SELECT 1 FROM villages WHERE slug = $1', [id.slice(2)])).length > 0
  const table = { h: 'heritage', s: 'stories', e: 'events', o: 'oral_histories' }[id[0]]
  return (await query(`SELECT 1 FROM ${table} WHERE id = $1`, [n])).length > 0
}
const idsOf = async (playlistId) => (await query('SELECT item_id FROM playlist_items WHERE playlist_id = $1 ORDER BY position', [playlistId])).map((r) => r.item_id)

// Loads a playlist the signed-in user owns, or answers 404 (we never reveal other people's private lists).
async function owned(req) {
  const [p] = await query('SELECT * FROM playlists WHERE id = $1 AND user_id = $2', [Number(req.params.id), req.user.id])
  if (!p) throw new HttpError(404, 'Playlist not found.')
  return p
}
const touch = (id) => query('UPDATE playlists SET updated_at = now() WHERE id = $1', [id])

async function createFor(userId, { title: t, description: d = '', isPublic = false }) {
  const [{ count }] = await query('SELECT COUNT(*)::int AS count FROM playlists WHERE user_id = $1', [userId])
  if (count >= MAX_PLAYLISTS) throw new HttpError(409, `You can have up to ${MAX_PLAYLISTS} playlists. Delete one to make room.`)
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const [row] = await query('INSERT INTO playlists (user_id, title, description, is_public, share_code) VALUES ($1,$2,$3,$4,$5) RETURNING *', [userId, t, d, isPublic, newCode()])
      return row
    } catch (err) { if (err.code !== '23505') throw err }   // share code clash (extremely rare): try another
  }
  throw new HttpError(500, 'Could not create the playlist. Please try again.')
}

router.get('/playlists', requireAuth, asyncHandler(async (req, res) => {
  const rows = await query(
    `SELECT p.*, COALESCE((SELECT array_agg(i.item_id ORDER BY i.position) FROM playlist_items i WHERE i.playlist_id = p.id), '{}') AS ids
     FROM playlists p WHERE p.user_id = $1 ORDER BY p.updated_at DESC`, [req.user.id])
  res.json(rows.map((p) => out(p, p.ids)))
}))

router.post('/playlists', requireAuth, asyncHandler(async (req, res) => {
  const d = z.object({ title, description: description.optional(), isPublic: z.boolean().optional() }).parse(req.body)
  res.status(201).json(out(await createFor(req.user.id, d), []))
}))

router.patch('/playlists/:id', requireAuth, asyncHandler(async (req, res) => {
  const d = z.object({ title: title.optional(), description: description.optional(), isPublic: z.boolean().optional() }).parse(req.body)
  const p = await owned(req)
  const [row] = await query('UPDATE playlists SET title = $1, description = $2, is_public = $3, updated_at = now() WHERE id = $4 RETURNING *',
    [d.title ?? p.title, d.description ?? p.description, d.isPublic ?? p.is_public, p.id])
  res.json(out(row, await idsOf(p.id)))
}))

router.delete('/playlists/:id', requireAuth, asyncHandler(async (req, res) => {
  const p = await owned(req)
  await query('DELETE FROM playlists WHERE id = $1', [p.id])
  res.json({ deleted: true })
}))

router.post('/playlists/:id/items', requireAuth, asyncHandler(async (req, res) => {
  const { itemId: id } = z.object({ itemId }).parse(req.body)
  const p = await owned(req)
  if (!(await itemExists(id))) throw new HttpError(404, 'That item no longer exists.')
  const ids = await idsOf(p.id)
  if (!ids.includes(id)) {
    if (ids.length >= MAX_ITEMS) throw new HttpError(409, `A playlist can hold up to ${MAX_ITEMS} items.`)
    await query('INSERT INTO playlist_items (playlist_id, item_id, position) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING', [p.id, id, ids.length + 1])
    await touch(p.id)
  }
  res.status(201).json({ itemIds: await idsOf(p.id) })
}))

router.delete('/playlists/:id/items/:itemId', requireAuth, asyncHandler(async (req, res) => {
  const p = await owned(req)
  await query('DELETE FROM playlist_items WHERE playlist_id = $1 AND item_id = $2', [p.id, req.params.itemId])
  // keep positions 1..n with no gaps
  await query(`UPDATE playlist_items pi SET position = r.n FROM (SELECT item_id, row_number() OVER (ORDER BY position) AS n FROM playlist_items WHERE playlist_id = $1) r
               WHERE pi.playlist_id = $1 AND pi.item_id = r.item_id`, [p.id])
  await touch(p.id)
  res.json({ itemIds: await idsOf(p.id) })
}))

// Reorder: the client sends the full list in the new order. It must contain exactly the same items.
router.put('/playlists/:id/order', requireAuth, asyncHandler(async (req, res) => {
  const { itemIds } = z.object({ itemIds: z.array(itemId).max(MAX_ITEMS) }).parse(req.body)
  const p = await owned(req)
  const current = await idsOf(p.id)
  if (itemIds.length !== current.length || new Set(itemIds).size !== itemIds.length || !itemIds.every((i) => current.includes(i))) {
    throw new HttpError(400, 'The new order must contain exactly the same items.')
  }
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    for (let i = 0; i < itemIds.length; i++) await client.query('UPDATE playlist_items SET position = $1 WHERE playlist_id = $2 AND item_id = $3', [i + 1, p.id, itemIds[i]])
    await client.query('UPDATE playlists SET updated_at = now() WHERE id = $1', [p.id])
    await client.query('COMMIT')
  } catch (err) { await client.query('ROLLBACK'); throw err } finally { client.release() }
  res.json({ itemIds })
}))

// Open a playlist by its share link. Public lists are visible to everyone; private ones only to their owner.
router.get('/playlists/shared/:code', optionalAuth, asyncHandler(async (req, res) => {
  const [p] = await query('SELECT p.*, u.name AS owner_name FROM playlists p JOIN users u ON u.id = p.user_id WHERE p.share_code = $1', [req.params.code])
  const isOwner = Boolean(p && req.user && req.user.id === p.user_id)
  if (!p || (!p.is_public && !isOwner)) throw new HttpError(404, 'This playlist does not exist or is private.')
  res.json({ ...out(p, await idsOf(p.id)), owner: p.owner_name, isOwner })
}))

// Save someone else's public playlist as your own private copy.
router.post('/playlists/shared/:code/copy', requireAuth, asyncHandler(async (req, res) => {
  const [src] = await query('SELECT * FROM playlists WHERE share_code = $1 AND is_public = true', [req.params.code])
  if (!src) throw new HttpError(404, 'This playlist does not exist or is private.')
  if (src.user_id === req.user.id) throw new HttpError(400, 'That playlist is already yours.')
  const copy = await createFor(req.user.id, { title: src.title, description: src.description, isPublic: false })
  await query('INSERT INTO playlist_items (playlist_id, item_id, position) SELECT $1, item_id, position FROM playlist_items WHERE playlist_id = $2', [copy.id, src.id])
  await notifyUser(src.user_id, { type: 'playlist', text: `${req.user.name} saved a copy of your playlist “${src.title}”.`, link: `/playlists/${src.share_code}` })
  res.status(201).json(out(copy, await idsOf(copy.id)))
}))

export default router
