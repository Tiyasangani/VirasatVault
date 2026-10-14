// Public data now comes from the API. main.jsx calls hydrate() once before the app renders,
// and again after login/logout. The arrays below are filled in place, so every page that
// imports them keeps working unchanged.
export const villages = []
export const heritage = []
export const stories = []
export const events = []
export const oralHistories = []
export const exploreItems = []   // heritage + villages + stories in one list for Explore
export const mapPoints = []      // heritage + villages with coordinates

const replace = (target, items) => target.splice(0, target.length, ...items)

export function hydrate(payload) {
  replace(villages, payload.villages)
  replace(heritage, payload.heritage)
  replace(stories, payload.stories)
  replace(events, payload.events)
  replace(oralHistories, payload.oralHistories)

  replace(exploreItems, [
    ...heritage.map((h) => ({
      id: h.id, kind: 'heritage', title: h.title, category: h.category, village: h.village, district: h.district,
      period: h.period, htype: h.htype, image: h.image, summary: h.summary, href: `/heritage/${h.slug}`,
      verified: h.verified, popularity: h.likes, year: h.yearLabel,
    })),
    ...villages.map((v) => ({
      id: v.id, kind: 'village', title: v.name, category: 'villages', village: v.slug, district: v.district,
      period: 'Living tradition', htype: 'Tangible', image: v.image, summary: v.summary, href: `/villages/${v.slug}`,
      verified: true, popularity: recordsInVillage(v.slug) * 10, year: '',
    })),
    ...stories.map((s) => ({
      id: s.id, kind: 'story', title: s.title, category: s.explore, village: s.village, district: s.district,
      period: 'Living tradition', htype: 'Documentary', image: s.image, summary: s.excerpt, href: `/stories/${s.slug}`,
      verified: false, popularity: s.likes, year: s.date,
    })),
  ])

  replace(mapPoints, [
    ...heritage.map((h) => ({ id: h.id, type: h.type, title: h.title, category: 'Heritage', village: h.village, lat: h.lat, lng: h.lng, image: h.image, summary: h.summary, href: `/heritage/${h.slug}`, verified: h.verified })),
    ...villages.map((v) => ({ id: v.id, type: 'village', title: v.name, category: 'Village', village: v.slug, lat: v.lat, lng: v.lng, image: v.image, summary: v.summary, href: `/villages/${v.slug}` })),
  ])
}

export const getVillage = (slug) => villages.find((v) => v.slug === slug)
export const villageName = (slug) => getVillage(slug)?.name ?? slug
export const getHeritage = (slug) => heritage.find((h) => h.slug === slug)
export const getStory = (slug) => stories.find((s) => s.slug === slug)
export const getEvent = (slug) => events.find((e) => e.slug === slug)

export const recordsInVillage = (slug) =>
  heritage.filter((h) => h.village === slug).length + stories.filter((s) => s.village === slug).length
