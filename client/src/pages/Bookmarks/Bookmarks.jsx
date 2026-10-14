import { useState } from 'react'
import { Link } from 'react-router-dom'
import HeritageCard from '../../components/HeritageCard/HeritageCard'
import StoryCard from '../../components/StoryCard/StoryCard'
import VillageCard from '../../components/VillageCard/VillageCard'
import EventCard from '../../components/EventCard/EventCard'
import { EmptyState } from '../../components/States/States'
import { exploreItems, stories, villages, events } from '../../data'
import { useApp } from '../../context/AppContext'
import useDocumentTitle from '../../hooks/useDocumentTitle'

export default function Bookmarks() {
  useDocumentTitle('My Heritage')
  const { bookmarks } = useApp()
  const [tab, setTab] = useState('places')
  const TABS = [['places', 'Saved Places'], ['stories', 'Saved Stories'], ['villages', 'Saved Villages'], ['events', 'Saved Events']]
  const empty = <EmptyState title="Nothing saved here yet." text="Tap the bookmark on any record to keep it in My Heritage." action={<Link to="/explore" className="btn btn-secondary">Explore heritage</Link>} />
  const lists = {
    places: exploreItems.filter((i) => i.kind === 'heritage' && bookmarks.places.includes(i.id)).map((i) => <HeritageCard key={i.id} item={i} />),
    stories: stories.filter((s) => bookmarks.stories.includes(s.id)).map((s) => <StoryCard key={s.id} story={s} />),
    villages: villages.filter((v) => bookmarks.villages.includes(v.id)).map((v) => <VillageCard key={v.id} village={v} />),
    events: events.filter((e) => bookmarks.events.includes(e.id)).map((e) => <EventCard key={e.id} event={e} />),
  }
  return (
    <>
      <section className="page-head"><div className="container"><h1>My Heritage</h1><p>Everything you have saved. Want to group items into a trip or a lesson? Make a <Link to="/playlists" className="text-link">playlist</Link>.</p></div></section>
      <section className="section-tight"><div className="container">
        <div className="tabs" role="tablist">{TABS.map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>{l} ({lists[k].length})</button>)}</div>
        <div className="tab-panel">{lists[tab].length ? <div className="grid-cards">{lists[tab]}</div> : empty}</div>
      </div></section>
    </>
  )
}
