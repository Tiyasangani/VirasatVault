export const CATEGORIES = [
  { id: 'villages', label: 'Villages' },
  { id: 'historical-places', label: 'Historical Places' },
  { id: 'festivals', label: 'Festivals' },
  { id: 'folk-stories', label: 'Folk Stories' },
  { id: 'food', label: 'Food' },
  { id: 'music', label: 'Music' },
  { id: 'dance', label: 'Dance' },
  { id: 'handicrafts', label: 'Handicrafts' },
  { id: 'personalities', label: 'Personalities' },
  { id: 'oral-history', label: 'Oral History' },
]

export const PERIODS = [
  'Medieval (1200–1750)',
  'Princely era (1750–1947)',
  'Modern (after 1947)',
  'Living tradition',
]

export const HERITAGE_TYPES = ['Tangible', 'Intangible', 'Documentary']

export const DISTRICTS = ['Rajkot', 'Morbi', 'Surendranagar']

export const STORY_CATEGORIES = ['Folk Stories', 'Oral Histories', 'Historical Stories', 'Personal Memories', 'Traditional Knowledge']

export const MAP_TYPES = [
  { id: 'village', label: 'Villages and traditions' },
  { id: 'temple', label: 'Temples' },
  { id: 'fort', label: 'Forts' },
  { id: 'stepwell', label: 'Stepwells' },
  { id: 'monument', label: 'Monuments' },
  { id: 'museum', label: 'Museums' },
  { id: 'building', label: 'Historical Buildings' },
]

export const categoryLabel = (id) => CATEGORIES.find((c) => c.id === id)?.label ?? id

export const EVENT_CATEGORIES = ['Festivals', 'Village Fairs', 'Cultural Programs', 'Exhibitions', 'Traditional Celebrations']
