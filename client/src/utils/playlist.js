import { exploreItems, events, oralHistories, getVillage } from '../data'
import { categoryLabel } from '../data/categories'

// Turns a playlist item id (h3, s1, e2, o1, v-gondal) into something we can draw.
// Returns null when the record no longer exists.
export function resolveItem(id) {
  if (id.startsWith('e')) {
    const e = events.find((x) => x.id === id)
    return e && { id, kind: 'event', label: 'Event', title: e.name, image: e.image, href: `/events/${e.slug}`, village: e.village, sub: e.category }
  }
  if (id.startsWith('o')) {
    const o = oralHistories.find((x) => x.id === id)
    return o && { id, kind: 'oral', label: 'Oral history', title: o.title, image: getVillage(o.village)?.image, href: `/villages/${o.village}`, village: o.village, sub: o.speaker, story: o }
  }
  const item = exploreItems.find((x) => x.id === id)
  if (!item) return null
  const label = item.kind === 'village' ? 'Village' : item.kind === 'story' ? 'Story' : categoryLabel(item.category)
  return { id, kind: item.kind, label, title: item.title, image: item.image, href: item.href, village: item.village, sub: item.summary }
}
