// Distance and route helpers for the Trail Planner. All distances are straight-line (as the crow flies),
// multiplied by ROAD_FACTOR to give a realistic road estimate for village roads.

export const ROAD_FACTOR = 1.3
const R = 6371 // Earth radius in km

export function haversineKm(a, b) {
  const rad = (d) => (d * Math.PI) / 180
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)))
}

export const roadKm = (a, b) => haversineKm(a, b) * ROAD_FACTOR

export function formatKm(km) {
  if (!Number.isFinite(km)) return ''
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km < 10 ? km.toFixed(1) : Math.round(km)} km`
}

export function formatMinutes(min) {
  const m = Math.max(0, Math.round(min))
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60), r = m % 60
  return r ? `${h} h ${r} min` : `${h} h`
}

// Average speed on rural roads including slow stretches, and time spent at each stop.
export const DRIVE_KMH = 35
export const MINUTES_PER_STOP = 20
export const driveMinutes = (km) => (km / DRIVE_KMH) * 60

// Greedy "nearest next stop" ordering. Starts from `start` (a point) or from the first stop.
export function optimiseOrder(points, start) {
  if (points.length < 3 && !start) return points
  const left = [...points]
  const out = []
  let here = start ?? left.shift()
  if (!start) out.push(here)
  while (left.length) {
    let best = 0
    for (let i = 1; i < left.length; i++) if (haversineKm(here, left[i]) < haversineKm(here, left[best])) best = i
    here = left.splice(best, 1)[0]
    out.push(here)
  }
  return out
}

export function totalRoadKm(points, start) {
  const seq = start ? [start, ...points] : points
  let km = 0
  for (let i = 1; i < seq.length; i++) km += roadKm(seq[i - 1], seq[i])
  return km
}

// Google Maps accepts up to 9 waypoints between origin and destination.
export const MAX_MAPS_STOPS = 11
export function mapsDirectionsUrl(points, start) {
  const seq = start ? [start, ...points] : points
  if (seq.length < 2) return null
  const ll = (p) => `${p.lat},${p.lng}`
  const used = seq.slice(0, MAX_MAPS_STOPS)
  const params = new URLSearchParams({ api: '1', origin: ll(used[0]), destination: ll(used[used.length - 1]), travelmode: 'driving' })
  if (used.length > 2) params.set('waypoints', used.slice(1, -1).map(ll).join('|'))
  return `https://www.google.com/maps/dir/?${params.toString()}`
}
