import { useState } from 'react'
import EventCard from '../../components/EventCard/EventCard'
import { EmptyState } from '../../components/States/States'
import { events } from '../../data'
import { EVENT_CATEGORIES } from '../../data/categories'
import useDocumentTitle from '../../hooks/useDocumentTitle'

export default function Events() {
  useDocumentTitle('Events')
  const [cat, setCat] = useState('')
  const list = [...events].filter((e) => !cat || e.category === cat).sort((a, b) => new Date(a.date) - new Date(b.date))
  const [next, ...rest] = list
  return (
    <>
      <section className="page-head"><div className="container"><h1>Upcoming Events</h1><p>Festivals, village fairs, cultural programs, exhibitions and traditional celebrations.</p></div></section>
      <section className="section-tight">
        <div className="container">
          <div className="tabs" role="tablist" aria-label="Event type">
            <button role="tab" aria-selected={!cat} onClick={() => setCat('')}>All events</button>
            {EVENT_CATEGORIES.map((c) => <button key={c} role="tab" aria-selected={cat === c} onClick={() => setCat(c)}>{c}</button>)}
          </div>
          {!next ? <EmptyState title="No events in this category." text="Check back soon, or tell us about a local event." /> : (
            <>
              <h2 className="sub-head">Next up</h2>
              <div className="story-feature"><EventCard event={next} /></div>
              {rest.length > 0 && <><h2 className="sub-head">Later</h2><div className="grid-cards">{rest.map((e) => <EventCard key={e.id} event={e} />)}</div></>}
            </>
          )}
        </div>
      </section>
    </>
  )
}
