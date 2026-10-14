import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import PhotoFigure from '../../components/PhotoFigure/PhotoFigure'
import ImageGallery from '../../components/ImageGallery/ImageGallery'
import ListenButton from '../../components/ListenButton/ListenButton'
import TrailButton from '../../components/TrailButton/TrailButton'
import HeritageCard from '../../components/HeritageCard/HeritageCard'
import StoryCard from '../../components/StoryCard/StoryCard'
import AudioPlayer from '../../components/AudioPlayer/AudioPlayer'
import Timeline from '../../components/Timeline/Timeline'
import MapPreview from '../../components/MapPreview/MapPreview'
import BookmarkButton from '../../components/BookmarkButton/BookmarkButton'
import AddToPlaylist from '../../components/AddToPlaylist/AddToPlaylist'
import Button from '../../components/Button/Button'
import { getVillage, heritage, stories, oralHistories, exploreItems, mapPoints, recordsInVillage } from '../../data'
import NotFound from '../NotFound/NotFound'
import { DEMO } from '../../config'
import useDocumentTitle from '../../hooks/useDocumentTitle'

const TABS = ['Places', 'Traditions', 'Stories', 'Food and people']

export default function VillageDetail() {
  const { slug } = useParams()
  const village = getVillage(slug)
  const [tab, setTab] = useState(TABS[0])
  const [selected, setSelected] = useState(null)
  useDocumentTitle(village?.name)
  if (!village) return <NotFound />

  const places = exploreItems.filter((i) => i.kind === 'heritage' && i.village === slug)
  const villageStories = stories.filter((s) => s.village === slug)
  const oral = oralHistories.filter((o) => o.village === slug)
  const related = exploreItems.filter((i) => i.kind === 'heritage' && i.village !== slug && i.district === village.district).slice(0, 3)
  const timeline = heritage.filter((h) => h.village === slug).flatMap((h) => h.timeline.filter((t) => /\d/.test(t.year)).map((t) => ({ ...t, text: `${t.text} (${h.title})` }))).slice(0, 6)
  const count = recordsInVillage(slug)
  const photos = [...new Set([village.image, ...(village.gallery ?? [])].filter(Boolean))]
  const photoCtx = { title: village.name, village: village.name, district: village.district, kind: 'Village', href: `/villages/${village.slug}` }

  return (
    <>
      <section className="village-hero">
        <PhotoFigure src={photos[0]} images={photos} index={0} ctx={photoCtx} ratio="21 / 9" eager imgClass="village-hero-img" showCaption={false} className="village-hero-fig" />
        <div className="container village-hero-text">
          <p className="breadcrumb"><Link to="/villages">Villages</Link> / {village.name}</p>
          <h1>{village.name}</h1>
          <p className="village-sub with-icon"><MapPin size={16} aria-hidden="true" /> {village.district} District, Gujarat. {count} heritage records.</p>
        </div>
      </section>

      <section className="section-tight">
        <div className="container article-grid">
          <div className="prose">
            <h2>About the Village</h2>
            {village.intro.map((p, i) => <p key={i}>{p}</p>)}
            {DEMO && <p className="meta">Sample text for demonstration. Verify with local sources before publishing.</p>}
            <div className="inline-actions"><BookmarkButton type="villages" id={village.id} label /><AddToPlaylist itemId={village.id} /><TrailButton id={village.id} /><ListenButton text={`${village.name}. ${village.intro.join(' ')}`} /><Button variant="secondary" size="sm" to={`/explore?village=${slug}`}>All records from {village.name}</Button></div>
          </div>
          <aside className="fact-list" aria-label="Village facts">
            <dl>
              <dt>District</dt><dd>{village.district}</dd>
              <dt>Region</dt><dd>{village.region}</dd>
              <dt>Heritage records</dt><dd>{count}</dd>
              <dt>Oral histories</dt><dd>{oral.length}</dd>
            </dl>
          </aside>
        </div>
      </section>

      <section className="section section-tint">
        <div className="container">
          <div className="tabs" role="tablist" aria-label={`${village.name} heritage`}>
            {TABS.map((t) => <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}>{t}</button>)}
          </div>
          <div className="tab-panel" role="tabpanel">
            {tab === 'Places' && (places.length ? <div className="grid-cards">{places.map((p) => <HeritageCard key={p.id} item={p} />)}</div> : <p className="muted">No historical places recorded yet. <Link className="text-link" to="/contribute">Add one</Link>.</p>)}
            {tab === 'Traditions' && <ul className="note-list">{village.festivals.map((f) => <li key={f.name}><h3 className="card-title">{f.name}</h3><p className="card-text">{f.note}</p></li>)}</ul>}
            {tab === 'Stories' && (villageStories.length ? <div className="grid-cards">{villageStories.map((s) => <StoryCard key={s.id} story={s} />)}</div> : <p className="muted">No stories yet. <Link className="text-link" to="/contribute">Share one</Link>.</p>)}
            {tab === 'Food and people' && (
              <div className="two-col">
                <div><h3>Traditional food</h3><ul className="note-list">{village.foods.map((f) => <li key={f.name}><h4 className="card-title">{f.name}</h4><p className="card-text">{f.note}</p></li>)}</ul></div>
                <div><h3>Famous people</h3><ul className="note-list">{village.people.map((f) => <li key={f.name}><h4 className="card-title">{f.name}</h4><p className="card-text">{f.note}</p></li>)}</ul></div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>Old Photographs</h2>
          <p className="section-lead">A growing set of photographs from the archive and contributors. Select a picture to read its full description.</p>
          <ImageGallery images={photos} ctx={photoCtx} />
        </div>
      </section>

      {oral.length > 0 && (
        <section className="section section-dark">
          <div className="container oral"><div className="oral-intro"><h2>Oral Histories</h2><p>Recorded with permission from speakers in {village.name}.</p></div><div>{oral.map((o) => <AudioPlayer key={o.id} story={o} />)}</div></div>
        </section>
      )}

      {timeline.length > 0 && (
        <section className="section">
          <div className="container narrow"><h2>Heritage Timeline</h2><Timeline layout="vertical" items={timeline} /></div>
        </section>
      )}

      <section className="section section-tint">
        <div className="container split">
          <div className="split-text"><h2>Location</h2><p>{village.name} lies in {village.district} District. Markers show the records documented here.</p></div>
          <MapPreview points={mapPoints.filter((p) => p.village === slug)} selectedId={selected} onSelect={setSelected} height={380} />
        </div>
      </section>

      {related.length > 0 && (
        <section className="section">
          <div className="container"><h2>Related Heritage</h2><p className="section-lead">More from {village.district} District.</p><div className="grid-cards">{related.map((p) => <HeritageCard key={p.id} item={p} />)}</div></div>
        </section>
      )}
    </>
  )
}
