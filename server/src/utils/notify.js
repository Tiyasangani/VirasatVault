import { query } from '../db/pool.js'
import { notificationOut } from './serializers.js'
import { emitToUser } from '../realtime.js'

// Save a notification in the database AND push it to the person's open browser right now.
export async function notifyUser(userId, { type, text, link = null }) {
  if (!userId) return null
  const [row] = await query('INSERT INTO notifications (user_id, type, text, link) VALUES ($1,$2,$3,$4) RETURNING *', [userId, type, text, link])
  emitToUser(userId, 'notification', notificationOut(row))
  return row
}

// Notify every user that matches a SQL condition (the condition may use $4, $5... for its own values).
export async function notifyWhere(where, params, { type, text, link = null }) {
  const rows = await query(
    `INSERT INTO notifications (user_id, type, text, link) SELECT id, $1, $2, $3 FROM users WHERE ${where} RETURNING *`,
    [type, text, link, ...params])
  rows.forEach((r) => emitToUser(r.user_id, 'notification', notificationOut(r)))
  return rows.length
}

export const notifyAdmins = (payload) => notifyWhere("role = 'admin'", [], payload)

// Everyone in the same district (except the author) hears about a newly published record or event.
export const announceNewRecord = ({ title, slug, district, authorId = null }) =>
  notifyWhere("role = 'member' AND district = $4 AND id <> $5", [district, authorId ?? 0],
    { type: 'district', text: `New heritage added in your district: “${title}”.`, link: `/heritage/${slug}` })

export const announceNewEvent = ({ name, slug, district }) =>
  notifyWhere("role = 'member' AND district = $4", [district],
    { type: 'event', text: `New event in your district: “${name}”.`, link: `/events/${slug}` })
