import { query } from './db/pool.js'
import { notifyUser } from './utils/notify.js'

// Event reminders. A person is reminded when an event is in their district (or they saved it):
//   "soon"  when it starts in 1 to 3 days,  "today"  on the day it starts,  "live"  while a multi-day event is on.
// Each kind is sent once per person per event.
const WINDOWS = [
  { kind: 'soon', when: '(e.event_date - CURRENT_DATE) BETWEEN 1 AND 3' },
  { kind: 'today', when: 'e.event_date = CURRENT_DATE' },
  { kind: 'live', when: 'e.event_date < CURRENT_DATE AND e.end_date >= CURRENT_DATE' },
]
const day = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })

export async function runReminders() {
  let sent = 0
  for (const { kind, when } of WINDOWS) {
    const rows = await query(
      `WITH targets AS (
         SELECT e.id AS event_id, e.name, e.slug, e.location, e.event_date, e.end_date, (e.event_date - CURRENT_DATE) AS days, u.id AS user_id
         FROM events e
         JOIN users u ON u.role = 'member' AND (u.district = e.district OR EXISTS (
           SELECT 1 FROM bookmarks b WHERE b.user_id = u.id AND b.item_type = 'events' AND b.item_id = 'e' || e.id))
         WHERE ${when}
       ), fresh AS (
         INSERT INTO event_reminders (event_id, user_id, kind) SELECT event_id, user_id, $1 FROM targets
         ON CONFLICT DO NOTHING RETURNING event_id, user_id
       )
       SELECT t.* FROM targets t JOIN fresh f ON f.event_id = t.event_id AND f.user_id = t.user_id`, [kind])
    for (const r of rows) {
      const text = kind === 'today' ? `“${r.name}” is happening today at ${r.location}.`
        : kind === 'live' ? `“${r.name}” is on now until ${day(r.end_date)} at ${r.location}.`
        : `“${r.name}” starts ${r.days === 1 ? 'tomorrow' : `in ${r.days} days`} (${day(r.event_date)}) at ${r.location}.`
      await notifyUser(r.user_id, { type: 'event', text, link: `/events/${r.slug}` })
      sent += 1
    }
  }
  return sent
}

export function startScheduler(everyMinutes = 15) {
  const run = () => runReminders().then((n) => n && console.log(`Sent ${n} event reminder(s).`)).catch((e) => console.error('Reminder job failed:', e.message))
  setTimeout(run, 5000).unref()
  setInterval(run, everyMinutes * 60 * 1000).unref()
}
