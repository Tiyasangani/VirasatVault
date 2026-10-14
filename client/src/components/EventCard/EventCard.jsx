import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import SmartImage from '../SmartImage/SmartImage'
import BookmarkButton from '../BookmarkButton/BookmarkButton'
import Button from '../Button/Button'
import { formatDate } from '../../utils/format'

export function DateBlock({ date }) {
  const d = new Date(date)
  return (
    <div className="date-block" aria-label={formatDate(date)}>
      <span className="date-day">{d.getDate()}</span>
      <span className="date-month">{d.toLocaleDateString('en-IN', { month: 'short' })} {d.getFullYear()}</span>
    </div>
  )
}

export default function EventCard({ event }) {
  return (
    <article className="e-card">
      <Link to={`/events/${event.slug}`} className="e-card-media" aria-label={event.name}>
        <SmartImage src={event.image} alt={event.name} ratio="3 / 2" />
      </Link>
      <div className="e-card-body">
        <DateBlock date={event.date} />
        <div className="e-card-info">
          <p className="meta">{event.category}</p>
          <h3 className="card-title"><Link to={`/events/${event.slug}`}>{event.name}</Link></h3>
          <p className="meta with-icon"><MapPin size={14} aria-hidden="true" /> {event.location}</p>
          <div className="e-card-actions">
            <Button variant="secondary" size="sm" to={`/events/${event.slug}`}>View event</Button>
            <BookmarkButton type="events" id={event.id} />
          </div>
        </div>
      </div>
    </article>
  )
}
