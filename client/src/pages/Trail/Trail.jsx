import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowDown, ArrowUp, Check, Copy, Crosshair, ExternalLink, Plus, Printer, Shuffle, Trash2, X } from 'lucide-react'
import SearchBar from '../../components/SearchBar/SearchBar'
import MapPreview, { TYPE_NAME } from '../../components/MapPreview/MapPreview'
import { EmptyState } from '../../components/States/States'
import { mapPoints, villageName } from '../../data'
import { useApp } from '../../context/AppContext'
import useTrail from '../../hooks/useTrail'
import useDocumentTitle from '../../hooks/useDocumentTitle'
import { MAX_MAPS_STOPS, MINUTES_PER_STOP, driveMinutes, formatKm, formatMinutes, haversineKm, mapsDirectionsUrl, optimiseOrder, roadKm, totalRoadKm } from '../../utils/geo'

export default function Trail() {
  useDocumentTitle('Heritage Trail Planner')
  const { showToast } = useApp()
  const trail = useTrail()
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState('')
  const [me, setMe] = useState(null)            // { lat, lng } once the visitor shares their location
  const [locating, setLocating] = useState(false)
  const [fromMe, setFromMe] = useState(true)
  const [selected, setSelected] = useState(null)

  const byId = useMemo(() => new Map(mapPoints.map((p) => [p.id, p])), [])

  // /trail?p=a,b,c loads a shared trail; /trail?add=id adds one place. Both clean the address afterwards.
  useEffect(() => {
    const shared = params.get('p'), add = params.get('add')
    if (!shared && !add) return
    if (shared) trail.set(shared.split(',').filter((id) => byId.has(id)))
    if (add && byId.has(add)) trail.add(add)
    setParams({}, { replace: true })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const stops = trail.ids.map((id) => byId.get(id)).filter(Boolean)
  const start = me && fromMe ? { lat: me.lat, lng: me.lng, title: 'Your location' } : null

  const locate = () => {
    if (!navigator.geolocation) { showToast('Your browser cannot share its location'); return }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => { setMe({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocating(false) },
      () => { setLocating(false); showToast('Location was not shared. You can still build a trail by hand.') },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    )
  }

  const available = useMemo(() => {
    const term = q.trim().toLowerCase()
    const list = mapPoints.filter((p) => !term || `${p.title} ${villageName(p.village)} ${TYPE_NAME[p.type] ?? ''}`.toLowerCase().includes(term))
      .map((p) => ({ ...p, away: me ? haversineKm(me, p) * 1.3 : null }))
    return me ? list.sort((a, b) => a.away - b.away) : list
  }, [q, me])

  const legs = stops.map((p, i) => {
    const prev = i === 0 ? start : stops[i - 1]
    return prev ? roadKm(prev, p) : null
  })
  const km = totalRoadKm(stops, start)
  const minutes = driveMinutes(km) + stops.length * MINUTES_PER_STOP
  const mapsUrl = mapsDirectionsUrl(stops, start)
  const tooMany = stops.length + (start ? 1 : 0) > MAX_MAPS_STOPS

  const optimise = () => {
    if (stops.length < 2) return
    const ordered = optimiseOrder(stops, start)
    trail.set(ordered.map((p) => p.id))
    showToast('Stops re-ordered to the shortest sensible route')
  }
  const share = async () => {
    const link = `${window.location.origin}/trail?p=${trail.ids.join(',')}`
    try { await navigator.clipboard.writeText(link); showToast('Trail link copied') } catch { showToast(link) }
  }

  return (
    <>
      <section className="page-head no-print">
        <div className="container">
          <h1>Heritage Trail Planner</h1>
          <p>Choose the places you want to see, let VirasatVault put them in a sensible order, then open the route in Google Maps or print it for the road. Your trail is saved in this browser.</p>
        </div>
      </section>

      <section className="section-tight">
        <div className="container trail-grid">
          <div className="trail-pick no-print">
            <h2 className="trail-h">Places</h2>
            <div className="trail-tools">
              <SearchBar value={q} onChange={setQ} placeholder="Search places and villages" label="Search places" />
              <button type="button" className="btn btn-secondary btn-sm" onClick={locate} disabled={locating}><Crosshair size={15} aria-hidden="true" /> {locating ? 'Finding you...' : me ? 'Update my location' : 'Places near me'}</button>
            </div>
            {me && <p className="meta">Sorted by approximate road distance from you.</p>}
            <ul className="trail-list" aria-label="Available places">
              {available.map((p) => {
                const on = trail.has(p.id)
                return (
                  <li key={p.id} className="trail-item">
                    <div className="trail-item-text">
                      <strong>{p.title}</strong>
                      <span className="meta">{TYPE_NAME[p.type] ?? 'Place'}, {villageName(p.village)}{p.away != null ? ` · ${formatKm(p.away)} away` : ''}</span>
                    </div>
                    <button type="button" className={`btn btn-sm ${on ? 'btn-ghost' : 'btn-secondary'}`} onClick={() => (on ? trail.remove(p.id) : trail.add(p.id))} aria-pressed={on} aria-label={`${on ? 'Remove' : 'Add'} ${p.title}`}>
                      {on ? <><Check size={14} aria-hidden="true" /> Added</> : <><Plus size={14} aria-hidden="true" /> Add</>}
                    </button>
                  </li>
                )
              })}
              {available.length === 0 && <li className="muted">No places match your search.</li>}
            </ul>
          </div>

          <div className="trail-plan">
            <div className="row-between trail-plan-head">
              <h2 className="trail-h">My trail {stops.length > 0 && <span className="meta">({stops.length} stop{stops.length === 1 ? '' : 's'})</span>}</h2>
              {stops.length > 0 && <button type="button" className="text-link no-print" onClick={() => { trail.clear(); showToast('Trail cleared') }}><Trash2 size={13} aria-hidden="true" /> Clear all</button>}
            </div>

            {stops.length === 0 ? (
              <EmptyState title="Your trail is empty." text="Add places from the list, or use the “Add to trail” button on any record or village page." action={<Link className="btn btn-secondary" to="/explore">Explore heritage</Link>} />
            ) : (
              <>
                {me && <label className="trail-from no-print"><input type="checkbox" checked={fromMe} onChange={(e) => setFromMe(e.target.checked)} /> Start from my location</label>}
                <ol className="trail-stops">
                  {start && <li className="trail-stop trail-start"><span className="trail-n">★</span><div><strong>Your location</strong><span className="meta">Starting point</span></div></li>}
                  {stops.map((p, i) => (
                    <li key={p.id} className="trail-stop">
                      <span className="trail-n">{i + 1}</span>
                      <div className="trail-stop-body">
                        {legs[i] != null && <span className="trail-leg">{formatKm(legs[i])} · about {formatMinutes(driveMinutes(legs[i]))} by road</span>}
                        <Link to={p.href} className="trail-stop-title">{p.title}</Link>
                        <span className="meta">{TYPE_NAME[p.type] ?? 'Place'}, {villageName(p.village)}</span>
                      </div>
                      <div className="trail-stop-actions no-print">
                        <button type="button" className="icon-btn" onClick={() => trail.move(p.id, -1)} disabled={i === 0} aria-label={`Move ${p.title} up`}><ArrowUp size={16} aria-hidden="true" /></button>
                        <button type="button" className="icon-btn" onClick={() => trail.move(p.id, 1)} disabled={i === stops.length - 1} aria-label={`Move ${p.title} down`}><ArrowDown size={16} aria-hidden="true" /></button>
                        <button type="button" className="icon-btn" onClick={() => trail.remove(p.id)} aria-label={`Remove ${p.title}`}><X size={16} aria-hidden="true" /></button>
                      </div>
                    </li>
                  ))}
                </ol>

                <dl className="trail-summary">
                  <div><dt>Approx. distance</dt><dd>{formatKm(km)}</dd></div>
                  <div><dt>Approx. time</dt><dd>{formatMinutes(minutes)}</dd></div>
                  <div><dt>Stops</dt><dd>{stops.length}</dd></div>
                </dl>
                <p className="meta">Distances are estimated from straight-line distance plus 30% for village roads, at about 35 km/h, with {MINUTES_PER_STOP} minutes per stop. Google Maps will give exact figures.</p>

                <div className="inline-actions no-print">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={optimise} disabled={stops.length < 2}><Shuffle size={15} aria-hidden="true" /> Best order</button>
                  {mapsUrl && <a className="btn btn-primary btn-sm" href={mapsUrl} target="_blank" rel="noreferrer"><ExternalLink size={15} aria-hidden="true" /> Open in Google Maps</a>}
                  <button type="button" className="btn btn-secondary btn-sm" onClick={share}><Copy size={15} aria-hidden="true" /> Copy link</button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => window.print()}><Printer size={15} aria-hidden="true" /> Print</button>
                </div>
                {tooMany && <p className="meta no-print">Google Maps takes up to {MAX_MAPS_STOPS} stops in one route. The first {MAX_MAPS_STOPS} will be opened.</p>}
              </>
            )}
          </div>
        </div>
      </section>

      {stops.length > 0 && (
        <section className="section section-tint no-print">
          <div className="container">
            <h2>Trail map</h2>
            <p className="section-lead">Your stops on the map. Select a pin to preview it.</p>
            <MapPreview points={stops} selectedId={selected} onSelect={setSelected} height={420} />
          </div>
        </section>
      )}
    </>
  )
}
