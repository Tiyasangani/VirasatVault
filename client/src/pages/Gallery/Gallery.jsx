import { useMemo, useState } from 'react'
import SearchBar from '../../components/SearchBar/SearchBar'
import FilterPanel from '../../components/FilterPanel/FilterPanel'
import PhotoFigure from '../../components/PhotoFigure/PhotoFigure'
import { EmptyState } from '../../components/States/States'
import { heritage, villages, stories, events, villageName } from '../../data'
import { getImageInfo } from '../../data/imageDetails'
import useDocumentTitle from '../../hooks/useDocumentTitle'

// Every photograph in the archive, once, with the pages it appears on.
function collectPhotos() {
  const map = new Map()
  const add = (src, owner) => {
    if (!src) return
    const entry = map.get(src) ?? { src, owners: [] }
    if (!entry.owners.some((o) => o.href === owner.href)) entry.owners.push(owner)
    map.set(src, entry)
  }
  heritage.forEach((h) => [h.image, ...(h.gallery ?? [])].forEach((s) => add(s, { label: h.title, href: `/heritage/${h.slug}`, kind: 'Heritage record', village: h.village, district: h.district })))
  villages.forEach((v) => [v.image, ...(v.gallery ?? [])].forEach((s) => add(s, { label: v.name, href: `/villages/${v.slug}`, kind: 'Village', village: v.slug, district: v.district })))
  stories.forEach((s) => add(s.image, { label: s.title, href: `/stories/${s.slug}`, kind: 'Story', village: s.village, district: s.district }))
  events.forEach((e) => add(e.image, { label: e.name, href: `/events/${e.slug}`, kind: 'Event', village: e.village, district: e.district }))

  return [...map.values()].map((p) => {
    const first = p.owners[0]
    const single = p.owners.length === 1
    const ctx = {
      title: single ? first.label : undefined,           // a photo used in many places is titled by what it shows
      village: single ? villageName(first.village) : undefined,
      district: single ? first.district : undefined,
      kind: first.kind, href: first.href, appearsIn: p.owners,
    }
    const info = getImageInfo(p.src, { ...ctx, index: 0, total: 1 })
    return { ...p, ctx, info, villages: [...new Set(p.owners.map((o) => o.village))], districts: [...new Set(p.owners.map((o) => o.district))] }
  })
}

export default function Gallery() {
  useDocumentTitle('Photo Gallery')
  const photos = useMemo(collectPhotos, [])
  const [q, setQ] = useState('')
  const [filters, setFilters] = useState({ subject: '', village: '', district: '' })

  const subjects = [...new Set(photos.map((p) => p.info.subjectLabel))]
  const districts = [...new Set(photos.flatMap((p) => p.districts))].sort()
  const config = [
    { key: 'subject', label: 'Subject', options: subjects.map((s) => ({ value: s, label: s })) },
    { key: 'village', label: 'Village', options: villages.map((v) => ({ value: v.slug, label: v.name })) },
    { key: 'district', label: 'District', options: districts.map((d) => ({ value: d, label: d })) },
  ]
  const results = useMemo(() => {
    const term = q.trim().toLowerCase()
    return photos.filter((p) =>
      (!term || [p.info.heading, p.info.caption, p.info.description.join(' '), (p.info.tags ?? []).join(' '), p.owners.map((o) => o.label).join(' ')].join(' ').toLowerCase().includes(term)) &&
      (!filters.subject || p.info.subjectLabel === filters.subject) &&
      (!filters.village || p.villages.includes(filters.village)) &&
      (!filters.district || p.districts.includes(filters.district)))
  }, [photos, q, filters])

  const items = results.map((p) => ({ src: p.src, ctx: p.ctx }))
  return (
    <>
      <section className="page-head">
        <div className="container">
          <h1>Photo Gallery</h1>
          <p>Every photograph in the archive, each with a full description: what it shows, what to look for, why it matters and where it appears. Select a picture to open the viewer.</p>
          <SearchBar large value={q} onChange={setQ} placeholder="Search photographs, for example stepwell or palace" label="Search photographs" />
        </div>
      </section>
      <section className="section-tight">
        <div className="container">
          <FilterPanel filters={config} values={filters} onChange={(k, v) => setFilters((f) => ({ ...f, [k]: v }))} onReset={() => setFilters({ subject: '', village: '', district: '' })} />
          <p className="meta result-bar">{results.length} photograph{results.length === 1 ? '' : 's'}</p>
          {results.length ? (
            <div className="gallery-grid">
              {results.map((p, i) => <PhotoFigure key={p.src} src={p.src} items={items} index={i} ratio="4 / 3" />)}
            </div>
          ) : <EmptyState title="No photographs match." text="Try a different word or clear a filter." action={<button type="button" className="btn btn-secondary" onClick={() => { setQ(''); setFilters({ subject: '', village: '', district: '' }) }}>Clear search</button>} />}
        </div>
      </section>
    </>
  )
}
