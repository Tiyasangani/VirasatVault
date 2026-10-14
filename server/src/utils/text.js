export const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 80)

export const CATEGORIES = [
  ['villages', 'Villages'], ['historical-places', 'Historical Places'], ['festivals', 'Festivals'],
  ['folk-stories', 'Folk Stories'], ['food', 'Food'], ['music', 'Music'], ['dance', 'Dance'],
  ['handicrafts', 'Handicrafts'], ['personalities', 'Personalities'], ['oral-history', 'Oral History'],
]
export const categoryLabel = (id) => CATEGORIES.find(([i]) => i === id)?.[1]
export const categoryId = (label) => CATEGORIES.find(([, l]) => l === label)?.[0] ?? 'historical-places'
