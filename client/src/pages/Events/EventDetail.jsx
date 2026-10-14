import { Link, useParams } from 'react-router-dom'
import { CalendarDays, MapPin, Ticket } from 'lucide-react'
import PhotoFigure from '../../components/PhotoFigure/PhotoFigure'
import BookmarkButton from '../../components/BookmarkButton/BookmarkButton'
import AddToPlaylist from '../../components/AddToPlaylist/AddToPlaylist'
import EventCard from '../../components/EventCard/EventCard'
import AddToCalendar from '../../components/AddToCalendar/AddToCalendar'
import { getEvent, events, villageName } from '../../data'
import { formatDate } from '../../utils/format'
import NotFound from '../NotFound/NotFound'
import { DEMO } from '../../config'
import useDocumentTitle from '../../hooks/useDocumentTitle'

export default function EventDetail() {
  const { slug } = useParams()
  const event = getEvent(slug)
  useDocumentTitle(event?.name)
  if (!event) return <NotFound />
  return (
    <>
      <header className="container story-page">
        <p className="breadcrumb"><Link to="/events">Events</Link> / {event.category}</p>
        <h1>{event.name}</h1>
        <PhotoFigure src={event.image} ctx={{ title: event.name, village: villageName(event.village), district: event.district, kind: 'Event', href: `/events/${event.slug}` }} ratio="21 / 9" eager />
      </header>
      <section className="section-tight">
        <div className="container article-grid">
          <div className="prose">
            <h2>About this event</h2>
            <p>{event.description}</p>
            <h2>Schedule</h2>
            <ul className="sources">{event.schedule.map((s) => <li key={s}><span>{s}</span></li>)}</ul>
            {DEMO && <p className="meta">Sample event for demonstration. Dates and venues are fictional.</p>}
          </div>
          <aside className="side-stack">
            <dl className="fact-list">
              <dt>Date</dt><dd className="with-icon"><CalendarDays size={15} aria-hidden="true" /> {formatDate(event.date)}{event.endDate ? ` to ${formatDate(event.endDate)}` : ''}</dd>
              <dt>Venue</dt><dd className="with-icon"><MapPin size={15} aria-hidden="true" /> {event.location}</dd>
              <dt>Village</dt><dd><Link className="text-link" to={`/villages/${event.village}`}>{villageName(event.village)}</Link></dd>
              <dt>Entry</dt><dd className="with-icon"><Ticket size={15} aria-hidden="true" /> {event.entry}</dd>
            </dl>
            <div className="inline-actions"><BookmarkButton type="events" id={event.id} label /><AddToPlaylist itemId={event.id} /></div>
            <AddToCalendar event={event} />
          </aside>
        </div>
      </section>
      <section className="section section-tint"><div className="container"><h2>More events</h2><div className="grid-cards">{events.filter((e) => e.id !== event.id).slice(0, 3).map((e) => <EventCard key={e.id} event={e} />)}</div></div></section>
    </>
  )
}
