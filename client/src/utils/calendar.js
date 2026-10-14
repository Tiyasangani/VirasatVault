// Calendar export for events. Events are all-day, so dates are handled as plain YYYY-MM-DD text
// (no time zones involved, nothing can shift by a day).

const compact = (iso) => String(iso).replaceAll('-', '')               // 2026-10-11 -> 20261011
function nextDay(iso) {                                                // end dates are exclusive in iCalendar and Google
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d + 1))
  return `${dt.getUTCFullYear()}${String(dt.getUTCMonth() + 1).padStart(2, '0')}${String(dt.getUTCDate()).padStart(2, '0')}`
}

const detailsOf = (event, villageLabel) => [
  event.description,
  event.schedule?.length ? `Schedule:\n${event.schedule.join('\n')}` : '',
  event.entry ? `Entry: ${event.entry}` : '',
  `More: ${window.location.origin}/events/${event.slug}`,
].filter(Boolean).join('\n\n') + (villageLabel ? `\n\nVillage: ${villageLabel}` : '')

export function googleCalendarUrl(event, villageLabel) {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.name,
    dates: `${compact(event.date)}/${nextDay(event.endDate || event.date)}`,
    details: detailsOf(event, villageLabel),
    location: [event.location, event.district && `${event.district} District`, 'Gujarat'].filter(Boolean).join(', '),
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

const esc = (t) => String(t).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;')
// Lines longer than 75 bytes must be folded (RFC 5545).
const fold = (line) => {
  const enc = new TextEncoder(); const out = []; let cur = ''
  for (const ch of line) {
    if (enc.encode(cur + ch).length > 74) { out.push(cur); cur = ' ' + ch } else cur += ch
  }
  out.push(cur)
  return out.join('\r\n')
}

export function buildIcs(event, villageLabel) {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//VirasatVault//Events//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.slug}@virasatvault`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${compact(event.date)}`,
    `DTEND;VALUE=DATE:${nextDay(event.endDate || event.date)}`,
    `SUMMARY:${esc(event.name)}`,
    `LOCATION:${esc([event.location, event.district && `${event.district} District`, 'Gujarat'].filter(Boolean).join(', '))}`,
    `DESCRIPTION:${esc(detailsOf(event, villageLabel))}`,
    `URL:${window.location.origin}/events/${event.slug}`,
    'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', `DESCRIPTION:${esc(`Tomorrow: ${event.name}`)}`, 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ]
  return lines.map(fold).join('\r\n') + '\r\n'
}

export function downloadIcs(event, villageLabel) {
  const blob = new Blob([buildIcs(event, villageLabel)], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `${event.slug}.ics`
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}
