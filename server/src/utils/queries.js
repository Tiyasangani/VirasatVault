import { query } from '../db/pool.js'
import { heritageOut, villageOut, storyOut, eventOut, oralOut, userOut, contributionOut, historyOut } from './serializers.js'

// Likes shown on a card = seeded base + likes from every user except the one asking,
// because the frontend adds +1 itself when the current user has liked the item.
const likesSql = (prefix, idCol) =>
  `(base.likes_base + (SELECT COUNT(*) FROM likes l WHERE l.item_id = '${prefix}' || base.${idCol} AND l.user_id IS DISTINCT FROM $1))`

export const listVillages = async () => (await query('SELECT * FROM villages ORDER BY id')).map(villageOut)

export async function listHeritage(userId = null, where = '', params = []) {
  const rows = await query(
    `SELECT base.*, v.slug AS village_slug, ${likesSql('h', 'id')} AS likes
     FROM heritage base JOIN villages v ON v.id = base.village_id WHERE true ${where} ORDER BY base.id`, [userId, ...params])
  return rows.map(heritageOut)
}

export async function listStories(userId = null, where = '', params = []) {
  const rows = await query(
    `SELECT base.*, v.slug AS village_slug, ${likesSql('s', 'id')} AS likes
     FROM stories base JOIN villages v ON v.id = base.village_id WHERE true ${where} ORDER BY base.published_on DESC, base.id DESC`, [userId, ...params])
  return rows.map(storyOut)
}

export const listEvents = async (where = '', params = []) =>
  (await query(`SELECT e.*, v.slug AS village_slug FROM events e JOIN villages v ON v.id = e.village_id WHERE true ${where} ORDER BY e.event_date`, params)).map(eventOut)

export const listOral = async () =>
  (await query('SELECT o.*, v.slug AS village_slug FROM oral_histories o JOIN villages v ON v.id = o.village_id ORDER BY o.id')).map(oralOut)

// Everything the public site needs in one request.
export async function bootstrapData(userId = null) {
  const [villages, heritage, stories, events, oralHistories] = await Promise.all([
    listVillages(), listHeritage(userId), listStories(userId), listEvents(), listOral(),
  ])
  return { villages, heritage, stories, events, oralHistories }
}

export async function getUserWithCounts(id) {
  const [row] = await query(
    `SELECT u.*,
       (SELECT COUNT(*) FROM contributions c WHERE c.user_id = u.id AND c.status = 'Approved') AS approved,
       (SELECT COUNT(*) FROM contributions c WHERE c.user_id = u.id AND c.status IN ('Pending','Under Review')) AS pending
     FROM users u WHERE u.id = $1`, [id])
  return row ? userOut(row) : null
}

// Contribution rows -> API objects, each with its review history attached.
export async function withHistory(rows) {
  if (!rows.length) return []
  const history = await query('SELECT * FROM contribution_history WHERE contribution_id = ANY($1) ORDER BY created_at, id', [rows.map((r) => r.id)])
  return rows.map((r) => ({ ...contributionOut(r), history: history.filter((h) => h.contribution_id === r.id).map(historyOut) }))
}

// Who owns a record (so we can tell them about reviews, comments and likes). Only heritage records have owners.
export async function ownerOf(itemId) {
  if (!itemId.startsWith('h')) return null
  const [r] = await query('SELECT user_id, title, slug FROM heritage WHERE id = $1', [Number(itemId.slice(1))])
  return r ? { userId: r.user_id, title: r.title, slug: r.slug } : null
}
