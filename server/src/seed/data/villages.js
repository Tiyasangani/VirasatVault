import { IMG } from './images.js'

// Sample data for demonstration. Descriptions are written as draft archive text and
// must be verified with local sources before real use.
export const villages = [
  {
    id: 'v-gondal', slug: 'gondal', name: 'Gondal', district: 'Rajkot', region: 'Saurashtra',
    image: IMG.palace, gallery: [IMG.palace, IMG.palaceTwo, IMG.street, IMG.monument],
    summary: 'Explore the history, architecture, traditions and stories of Gondal.',
    intro: [
      'Gondal grew as the seat of a princely state in the Kathiawar peninsula, and its streets still carry the marks of that past: palace compounds along the Gondali river, old market lanes, and public buildings planned in the late nineteenth century.',
      'For this archive Gondal is a good test of what VirasatVault is for. The palaces are well known, but the neighbourhood memories, family recipes and festival songs around them are held mostly by elders and have rarely been written down.',
    ],
    lat: 21.96, lng: 70.80,
    people: [
      { name: 'Maharaja Bhagvatsinhji', note: 'Ruler of Gondal State, remembered for his interest in education, public health and the Gujarati language.' },
      { name: 'Local weavers of Gondal', note: 'Families who kept hand-loom traditions alive in the old market quarter (sample entry).' },
    ],
    foods: [
      { name: 'Sev tamatar nu shaak', note: 'A quick Kathiawadi curry of tomato and fine gram-flour sev, eaten with bajra rotla.' },
      { name: 'Gondal-style chaas', note: 'Spiced buttermilk served at festival gatherings (sample entry).' },
    ],
    festivals: [
      { name: 'Navratri garba in the old courtyards', note: 'Neighbourhood garba organised by families around the palace quarter.' },
      { name: 'Uttarayan', note: 'Kite flying across rooftops on 14 January.' },
    ],
  },
  {
    id: 'v-dhoraji', slug: 'dhoraji', name: 'Dhoraji', district: 'Rajkot', region: 'Saurashtra',
    image: IMG.fort, gallery: [IMG.fort, IMG.stepwell, IMG.village],
    summary: 'A river town of old gateways, step-wells and trading lanes along the Bhadar.',
    intro: [
      'Dhoraji sits on the Bhadar river and was a trading town long before the railway reached the region. Its old gateways, wells and haveli-style houses are mostly unrecorded.',
      'Residents describe a town that was organised by community quarters. Each quarter had its own well, temple and festival calendar, and that memory is exactly what this archive hopes to capture.',
    ],
    lat: 21.73, lng: 70.45,
    people: [{ name: 'Elder traders of the old bazaar', note: 'Several families have offered to record oral histories (sample entry).' }],
    foods: [{ name: 'Dhoraji farsan', note: 'Savoury snacks sold in the main bazaar, a regular topic in family memories.' }],
    festivals: [{ name: 'Annual village fair', note: 'A winter fair around the riverside temple (sample entry).' }],
  },
  {
    id: 'v-jetpur', slug: 'jetpur', name: 'Jetpur', district: 'Rajkot', region: 'Saurashtra',
    image: IMG.craft, gallery: [IMG.craft, IMG.street, IMG.village],
    summary: 'Known for its printing and dyeing workshops, and the families who built them.',
    intro: [
      'Jetpur is widely associated with textile printing and dyeing, and the craft is as much a story of families and neighbourhoods as of technique.',
      'The archive is collecting pattern books, blocks and the recollections of printers whose methods have changed within a single generation.',
    ],
    lat: 21.75, lng: 70.62,
    people: [{ name: 'Master block printers', note: 'Craftspeople whose workshops are being documented (sample entry).' }],
    foods: [{ name: 'Bajra rotla with garlic chutney', note: 'A winter meal remembered in many Saurashtra households.' }],
    festivals: [{ name: 'Dyers’ community gathering', note: 'An annual workshop-quarter celebration (sample entry).' }],
  },
  {
    id: 'v-wankaner', slug: 'wankaner', name: 'Wankaner', district: 'Morbi', region: 'Saurashtra',
    image: IMG.palaceTwo, gallery: [IMG.palaceTwo, IMG.palace, IMG.monument],
    summary: 'A hill-edge town with a landmark palace and a long tradition of courtly music.',
    intro: [
      'Wankaner is remembered for the Ranjit Vilas Palace, a large building on a rise above the Machhu river. The town’s smaller buildings, temples and baithaks receive far less attention.',
      'VirasatVault records here focus on the palace precinct and on the songs and stories of the families who lived around it.',
    ],
    lat: 22.61, lng: 70.94,
    people: [{ name: 'Court musicians’ descendants', note: 'Families preserving old compositions (sample entry).' }],
    foods: [{ name: 'Ghee-laden churma ladoo', note: 'Prepared for festivals and weddings (sample entry).' }],
    festivals: [{ name: 'Navratri garba', note: 'Large public garba grounds on the edge of town.' }],
  },
  {
    id: 'v-morbi', slug: 'morbi', name: 'Morbi', district: 'Morbi', region: 'Saurashtra',
    image: IMG.temple, gallery: [IMG.temple, IMG.templeTwo, IMG.street],
    summary: 'A river town of ornate old buildings, temples and a strong tradition of local craft.',
    intro: [
      'Morbi has a layered architectural character, with ornate old buildings and temples built over several generations by a princely court and by local merchants.',
      'The archive hopes to gather photographs and memories of buildings that have changed or disappeared, alongside records of those that still stand.',
    ],
    lat: 22.82, lng: 70.84,
    people: [{ name: 'Local historians', note: 'Volunteers helping verify architectural records (sample entry).' }],
    foods: [{ name: 'Kathiawadi undhiyu', note: 'A mixed winter vegetable dish, prepared differently in every household.' }],
    festivals: [{ name: 'Janmashtami fair', note: 'Folk performances and a market around the Mani Mandir area (sample entry).' }],
  },
]
