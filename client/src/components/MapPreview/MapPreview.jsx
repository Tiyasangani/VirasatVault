import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { renderToStaticMarkup } from 'react-dom/server'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import { Castle, Droplets, Flower2, Frame, Landmark, MapPin, Building2, X } from 'lucide-react'
import SmartImage from '../SmartImage/SmartImage'
import { VerifiedMark } from '../Badge/Badge'
import { villageName } from '../../data'

export const TYPE_ICON = { temple: Flower2, fort: Castle, stepwell: Droplets, monument: Landmark, museum: Frame, building: Building2, village: MapPin }
export const TYPE_NAME = { temple: 'Temple', fort: 'Fort', stepwell: 'Stepwell', monument: 'Monument', museum: 'Museum', building: 'Historical building', village: 'Village' }

// A round coloured pin with the type's icon inside (drawn as a Leaflet divIcon).
const pinIcon = (type, active) => {
  const Icon = TYPE_ICON[type] ?? MapPin
  return L.divIcon({
    className: 'pin-wrap',
    html: `<span class="pin pin-${type} ${active ? 'is-active' : ''}">${renderToStaticMarkup(<Icon size={15} aria-hidden="true" />)}</span>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })
}

// Real OpenStreetMap tiles. Needs internet for the map background; markers and popups work from our own data.
export default function MapPreview({ points, selectedId, onSelect, height = 460, wheelZoom = false }) {
  const box = useRef(null)
  const map = useRef(null)
  const cluster = useRef(null)
  const markers = useRef({})
  const select = useRef(onSelect)
  select.current = onSelect
  const selected = points.find((p) => p.id === selectedId)

  // Create the map once.
  useEffect(() => {
    const m = L.map(box.current, { scrollWheelZoom: wheelZoom, zoomControl: true }).setView([22.2, 70.8], 9)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(m)
    if (!wheelZoom) { // on small previews, scroll the page normally until the map is clicked
      m.on('focus', () => m.scrollWheelZoom.enable())
      m.on('blur', () => m.scrollWheelZoom.disable())
    }
    cluster.current = L.markerClusterGroup({ showCoverageOnHover: false, maxClusterRadius: 36 }).addTo(m)
    map.current = m
    const watcher = new ResizeObserver(() => m.invalidateSize())
    watcher.observe(box.current)
    return () => { watcher.disconnect(); m.remove(); map.current = null }
  }, [wheelZoom])

  // Rebuild the markers when the list of points changes, and zoom to fit them.
  useEffect(() => {
    const group = cluster.current
    if (!group) return
    group.clearLayers()
    markers.current = {}
    points.forEach((p) => {
      const marker = L.marker([p.lat, p.lng], { icon: pinIcon(p.type, false), title: p.title, alt: `${p.title}, ${TYPE_NAME[p.type]}`, keyboard: true })
      if (p.type === 'village') marker.bindTooltip(p.title, { permanent: true, direction: 'right', offset: [14, 0], className: 'map-tip' })
      marker.on('click', () => select.current(p.id))
      markers.current[p.id] = marker
      group.addLayer(marker)
    })
    if (points.length === 1) map.current.setView([points[0].lat, points[0].lng], 14)
    else if (points.length > 1) map.current.fitBounds(L.latLngBounds(points.map((p) => [p.lat, p.lng])), { padding: [40, 40], maxZoom: 12 })
  }, [points])

  // Highlight the selected marker and bring it into view.
  useEffect(() => {
    points.forEach((p) => markers.current[p.id]?.setIcon(pinIcon(p.type, p.id === selectedId)))
    const marker = markers.current[selectedId]
    if (marker && cluster.current) cluster.current.zoomToShowLayer(marker, () => map.current.panTo(marker.getLatLng()))
  }, [selectedId, points])

  return (
    <div className="map" style={{ height }}>
      <div ref={box} className="map-canvas" />
      {selected ? (
        <div className="map-popup" role="dialog" aria-label={`Preview: ${selected.title}`}>
          <button type="button" className="icon-btn map-popup-close" onClick={() => onSelect(null)} aria-label="Close preview"><X size={16} /></button>
          <SmartImage src={selected.image} alt={selected.title} ratio="16 / 9" />
          <div className="map-popup-body">
            <p className="meta">{TYPE_NAME[selected.type]}, {villageName(selected.village)}</p>
            <h3 className="card-title">{selected.title}</h3>
            <p className="card-text clamp-2">{selected.summary}</p>
            {selected.verified !== undefined && <VerifiedMark verified={selected.verified} />}
            <Link to={selected.href} className="btn btn-primary btn-sm">View details</Link>
          </div>
        </div>
      ) : (
        <p className="map-hint">Select a marker to preview a record.</p>
      )}
    </div>
  )
}
