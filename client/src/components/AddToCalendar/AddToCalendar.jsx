import { CalendarPlus, Download } from 'lucide-react'
import { downloadIcs, googleCalendarUrl } from '../../utils/calendar'
import { villageName } from '../../data'

export default function AddToCalendar({ event }) {
  const village = villageName(event.village)
  return (
    <div className="add-cal">
      <p className="label">Add to your calendar</p>
      <div className="inline-actions" style={{ marginTop: 0 }}>
        <a className="btn btn-secondary btn-sm" href={googleCalendarUrl(event, village)} target="_blank" rel="noreferrer"><CalendarPlus size={15} aria-hidden="true" /> Google Calendar</a>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => downloadIcs(event, village)}><Download size={15} aria-hidden="true" /> Apple / Outlook (.ics)</button>
      </div>
      <p className="meta">The .ics file includes a reminder one day before.</p>
    </div>
  )
}
