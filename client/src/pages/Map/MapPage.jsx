import { useMemo, useState } from 'react'
import { Filter } from 'lucide-react'
import MapPreview, { TYPE_ICON } from '../../components/MapPreview/MapPreview'
import { mapPoints } from '../../data'
import { MAP_TYPES } from '../../data/categories'
import useDocumentTitle from '../../hooks/useDocumentTitle'

export default function MapPage() {
  useDocumentTitle('Heritage Map')
  const [active, setActive] = useState(MAP_TYPES.map((t) => t.id))
  const [selected, setSelected] = useState(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const points = useMemo(() => mapPoints.filter((p) => active.includes(p.type)), [active])

  const toggle = (id) => { setActive((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id])); setSelected(null) }
  const countOf = (id) => mapPoints.filter((p) => p.type === id).length

  return (
    <div className="map-page">
      <aside className={`map-side ${panelOpen ? 'is-open' : ''}`}>
        <div className="row-between"><h1 className="map-title">Explore Heritage</h1>
          <button type="button" className="btn btn-secondary btn-sm map-filter-toggle" onClick={() => setPanelOpen((o) => !o)} aria-expanded={panelOpen}><Filter size={15} aria-hidden="true" /> Filters</button></div>
        <div className="map-filters">
          <fieldset>
            <legend className="label">Show on map</legend>
            {MAP_TYPES.map((t) => {
              const Icon = TYPE_ICON[t.id]
              return (
                <label key={t.id} className="check">
                  <input type="checkbox" checked={active.includes(t.id)} onChange={() => toggle(t.id)} />
                  <Icon size={16} aria-hidden="true" /> {t.label} <span className="meta">{countOf(t.id)}</span>
                </label>
              )
            })}
          </fieldset>
          <button type="button" className="text-link" onClick={() => setActive(MAP_TYPES.map((t) => t.id))}>Show all</button>
        </div>
        <div className="map-list">
          <h2 className="label">{points.length} on the map</h2>
          <ul className="plain-list">
            {points.map((p) => <li key={p.id}><button type="button" className={`list-btn ${selected === p.id ? 'is-sel' : ''}`} onClick={() => setSelected(p.id)}>{p.title}</button></li>)}
          </ul>
        </div>
      </aside>
      <div className="map-main"><MapPreview points={points} selectedId={selected} onSelect={setSelected} height="100%" wheelZoom /></div>
    </div>
  )
}
