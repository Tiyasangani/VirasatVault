import { useState } from 'react'
import { Link } from 'react-router-dom'
import SmartImage from '../../components/SmartImage/SmartImage'
import Button from '../../components/Button/Button'
import VillageCard from '../../components/VillageCard/VillageCard'
import StoryCard from '../../components/StoryCard/StoryCard'
import EventCard from '../../components/EventCard/EventCard'
import MapPreview from '../../components/MapPreview/MapPreview'
import Timeline from '../../components/Timeline/Timeline'
import AudioPlayer from '../../components/AudioPlayer/AudioPlayer'
import CompareSlider from '../../components/CompareSlider/CompareSlider'
import PhotoFigure from '../../components/PhotoFigure/PhotoFigure'
import { IMG } from '../../data/images'
import { villages, stories, events, oralHistories, mapPoints, heritage, villageName } from '../../data'
import { DEMO, DESCRIPTION } from '../../config'
import { regionTimeline, thenNow } from '../../data/timeline'
import useDocumentTitle from '../../hooks/useDocumentTitle'

const PIPELINE = [
  ['Discover', 'Find villages, places and traditions that search engines rarely list.'],
  ['Contribute', 'Add what you know: photographs, stories, recordings, sources.'],
  ['Verify', 'Reviewers check each submission against its sources.'],
  ['Preserve', 'Verified records join a permanent public archive.'],
  ['Explore', 'Anyone can browse, map, scan and share the result.'],
]

const TILES = [
  { label: 'Historical Places', to: '/explore?category=historical-places', image: IMG.palace, area: 'a', text: 'Palaces, forts, temples, stepwells and old buildings.' },
  { label: 'Villages', to: '/villages', image: IMG.village, area: 'b', text: 'Histories told village by village.' },
  { label: 'Folk Stories', to: '/stories', image: IMG.stepwell, area: 'c', text: 'Tales told on steps and verandas.' },
  { label: 'Festivals', to: '/events', image: IMG.festival, area: 'd', text: 'Fairs, garba and seasonal rites.' },
  { label: 'Traditional Food', to: '/explore?category=food', image: IMG.food, area: 'e', text: 'Family recipes and local dishes.' },
  { label: 'Arts & Handicrafts', to: '/explore?category=handicrafts', image: IMG.craft, area: 'f', text: 'Printing, weaving and carving.' },
]

export default function Home() {
  useDocumentTitle('')
  const [selected, setSelected] = useState(null)
  const [tnIndex, setTnIndex] = useState(0)
  const tn = thenNow[tnIndex]
  const featuredStory = stories.find((s) => s.featured) ?? stories[0]
  const heroRecord = heritage.find((h) => h.verified && h.image)   // the hero shows a real verified record when one exists
  const otherStories = stories.filter((s) => s !== featuredStory)
  // Four different photographs from verified records, each with its full description in the viewer.
  const seen = new Set()
  const pictureItems = heritage.filter((h) => h.image && !seen.has(h.image) && seen.add(h.image)).slice(0, 4)
    .map((h) => ({ src: h.image, ctx: { title: h.title, village: villageName(h.village), district: h.district, kind: 'Heritage record', href: `/heritage/${h.slug}` } }))

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <h1 className="hero-title"><span>Every Place Has a Past.</span> <span className="hero-title-2">Every Story Deserves a Future.</span></h1>
            <p className="hero-lead">{DESCRIPTION}</p>
            <div className="hero-actions">
              <Button to="/explore">Explore Heritage</Button>
              <Button to="/contribute" variant="secondary">Share Your Story</Button>
            </div>
            <p className="hero-note"><em>Virasat</em> means heritage. VirasatVault is where it is kept safe, so that the next generation can find it.</p>
          </div>
          <figure className="hero-figure">
            <SmartImage src={heroRecord?.image ?? IMG.palace} alt={heroRecord ? heroRecord.title : 'Historic stone architecture in Gujarat'} ratio="4 / 5" eager />
            {heroRecord && (
              <figcaption className="plate">
                <strong>{heroRecord.title}</strong>
                <span>Record {heroRecord.recordNo}. Verified Heritage</span>
              </figcaption>
            )}
          </figure>
        </div>
        <div className="container">
          <ol className="pipeline" aria-label="How VirasatVault works">
            {PIPELINE.map(([name, text], i) => (
              <li key={name}><span className="pipeline-n">{i + 1}</span><h2>{name}</h2><p>{text}</p></li>
            ))}
          </ol>
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="container">
          <div className="section-head"><h2>Discover Our Heritage</h2><p>Six ways into the archive, from the grand and well-known to the everyday and almost forgotten.</p></div>
          <div className="tile-grid">
            {TILES.map((t) => (
              <Link key={t.label} to={t.to} className={`tile tile-${t.area}`}>
                <SmartImage src={t.image} alt={t.label} ratio="auto" style={{ position: 'absolute', inset: 0, aspectRatio: 'auto', height: '100%' }} />
                <span className="tile-text"><span className="tile-label">{t.label}</span><span className="tile-sub">{t.text}</span></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

{villages.length > 0 && (
<>
      {/* Villages */}
      <section className="section section-tint">
        <div className="container">
          <div className="section-head row-between"><div><h2>Stories From Our Villages</h2><p>Each village page gathers places, people, food, festivals and photographs in one place.</p></div><Link to="/villages" className="text-link hide-xs">All villages</Link></div>
          <div className="village-grid">
            {villages.map((v, i) => <div key={v.id} className={i === 0 ? 'village-lead' : ''}><VillageCard village={v} /></div>)}
          </div>
        </div>
      </section>

</>
)}

      {/* Photographs */}
      {pictureItems.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head row-between"><div><h2>Heritage in Pictures</h2><p>Every photograph in the archive comes with a full description: what it shows, what to look for and why it matters.</p></div><Link to="/gallery" className="text-link hide-xs">Open the gallery</Link></div>
            <div className="gallery-grid gallery-grid-4">
              {pictureItems.map((it, i) => <PhotoFigure key={it.src} src={it.src} items={pictureItems} index={i} ratio="4 / 3" />)}
            </div>
          </div>
        </section>
      )}

      {/* Map */}
      <section className="section">
        <div className="container split">
          <div className="split-text">
            <h2>Explore Heritage Near You</h2>
            <p>Temples, forts, stepwells, historic buildings and museums are placed on the map so you can plan a visit, or find what is hidden in your own district.</p>
            <ul className="plain-list legend">
              <li>Temples and shrines</li><li>Forts and gateways</li><li>Stepwells</li><li>Historical buildings</li><li>Museums and villages</li>
            </ul>
            <Button to="/map" variant="secondary">Open the full map</Button>
          </div>
          <MapPreview points={mapPoints} selectedId={selected} onSelect={setSelected} height={470} />
        </div>
      </section>

{featuredStory && (
<>
      {/* Voices */}
      <section className="section section-tint">
        <div className="container">
          <div className="section-head row-between"><div><h2>Voices of Heritage</h2><p>Folk tales, memories and traditional knowledge, written by the people who carry them.</p></div><Link to="/stories" className="text-link hide-xs">Read all stories</Link></div>
          <div className="magazine">
            <div className="magazine-lead"><StoryCard story={featuredStory} variant="feature" /></div>
            <div className="magazine-rest">
              {otherStories.slice(0, 4).map((s) => <StoryCard key={s.id} story={s} variant="compact" />)}
            </div>
          </div>
        </div>
      </section>

</>
)}

      {DEMO && (
<>
      {/* Timeline */}
      <section className="section">
        <div className="container">
          <div className="section-head"><h2>A Journey Through Time</h2><p>A short regional timeline. Each village page carries its own, with sources.</p></div>
          <Timeline items={regionTimeline} />
        </div>
      </section>

      {/* Then & Now */}
      <section className="section section-tint">
        <div className="container thennow">
          <div className="thennow-text">
            <h2>Then &amp; Now</h2>
            <div className="tabs" role="tablist" aria-label="Choose a place">
              {thenNow.map((t, i) => <button key={t.id} role="tab" aria-selected={i === tnIndex} onClick={() => setTnIndex(i)}>{t.place.split(',')[0]}</button>)}
            </div>
            <h3 className="feature-title">{tn.place}</h3>
            <p className="meta">Photographed {tn.year}</p>
            <p>{tn.text}</p>
            <p className="meta">Drag the slider to compare. In this prototype the older view is a sepia treatment of the same photograph; replace it with a scanned archive photo.</p>
          </div>
          <CompareSlider key={tn.id} nowSrc={IMG[tn.image]} place={tn.place} year={tn.year} />
        </div>
      </section>

</>
)}

      {oralHistories.length > 0 && (
<>
      {/* Oral history */}
      <section className="section section-dark">
        <div className="container oral">
          <div className="oral-intro"><h2>Listen to the Voices of the Past</h2><p>Elders and local historians describe their villages in their own words. Recordings are being added with permission from each speaker.</p></div>
          <div>{oralHistories.map((o) => <AudioPlayer key={o.id} story={o} />)}</div>
        </div>
      </section>

</>
)}

      {events.length > 0 && (
<>
      {/* Events */}
      <section className="section">
        <div className="container">
          <div className="section-head row-between"><div><h2>Cultural Events</h2><p>Festivals, fairs, programs and exhibitions open to the public.</p></div><Link to="/events" className="text-link hide-xs">All events</Link></div>
          <div className="grid-cards">{events.slice(0, 3).map((e) => <EventCard key={e.id} event={e} />)}</div>
        </div>
      </section>

</>
)}

      {/* Trail planner */}
      <section className="section section-tint">
        <div className="container feature-teaser">
          <div><h2>Plan Your Own Heritage Trail</h2><p>Pick the palaces, stepwells, temples and villages you want to see. VirasatVault finds places near you, puts your stops in a sensible order, and opens the route in Google Maps or prints it for the road.</p></div>
          <div className="inline-actions" style={{ marginTop: 0 }}><Button to="/trail">Plan a Trail</Button><Button to="/insights" variant="secondary">See Archive Insights</Button></div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="container cta-inner">
          <div><h2>Know a Story Worth Preserving?</h2><p>Your memories, photographs and stories can help preserve our heritage for future generations. Every submission is reviewed before it joins the verified archive.</p></div>
          <Button to="/contribute">Contribute Heritage</Button>
        </div>
      </section>
    </>
  )
}
