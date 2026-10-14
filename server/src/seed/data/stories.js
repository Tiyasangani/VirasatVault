import { IMG } from './images.js'

export const stories = [
  {
    id: 's1', slug: 'the-well-that-never-ran-dry', title: 'The Well That Never Ran Dry', category: 'Folk Stories',
    village: 'dhoraji', district: 'Rajkot', contributor: 'Ramesh Vaghela', readTime: 6, date: '2026-08-14',
    image: IMG.stepwell, featured: true, likes: 142, explore: 'folk-stories',
    excerpt: 'In the dry year of the old calendar, the only water left in the quarter was in a single stepwell, and the story of why has been told on its steps ever since.',
    body: [
      'Every quarter of old Dhoraji has a version of this story. In the one told near the stepwell, a drought emptied the river and the wells of the lower lanes, but the old well kept its water.',
      'Elders say the reason was a promise: the families who built the steps agreed that no person would ever be turned away from it. In the tale, a traveller tests this promise on the hottest afternoon of the year.',
      'Whether or not the story is literal, it records something real about shared water and shared responsibility. This version was told by Ramesh Vaghela’s grandmother and has been transcribed with her family’s permission.',
    ],
  },
  {
    id: 's2', slug: 'my-grandfathers-bazaar', title: 'My Grandfather’s Bazaar', category: 'Personal Memories',
    village: 'dhoraji', district: 'Rajkot', contributor: 'Kavita Mehta', readTime: 4, date: '2026-07-30',
    image: IMG.street, likes: 58, explore: 'folk-stories',
    excerpt: 'A granddaughter walks the old market lane, naming each shop as it was in the 1960s.',
    body: ['The bazaar began at the gate and ended at the river. My grandfather’s shop sold cloth and he knew every customer’s family by name.', 'Most of the shops have changed hands. I have tried to draw the lane from memory and would like others to correct me.'],
  },
  {
    id: 's3', slug: 'songs-of-the-court-musicians', title: 'Songs of the Court Musicians', category: 'Oral Histories',
    village: 'wankaner', district: 'Morbi', contributor: 'Kishan Zala', readTime: 8, date: '2026-07-12',
    image: IMG.palaceTwo, likes: 77, explore: 'oral-history',
    excerpt: 'A descendant of palace musicians describes the compositions his family still sings and who taught them.',
    body: ['The family has kept a repertoire passed down by ear. Some songs are connected to specific festivals; others were written for guests.', 'This interview was recorded in two sessions and is available as audio in the Oral History collection.'],
  },
  {
    id: 's4', slug: 'how-a-block-is-carved', title: 'How a Printing Block Is Carved', category: 'Traditional Knowledge',
    village: 'jetpur', district: 'Rajkot', contributor: 'Bhavna Solanki', readTime: 5, date: '2026-06-22',
    image: IMG.craft, likes: 64, explore: 'folk-stories',
    excerpt: 'A step-by-step account from a Jetpur workshop, from choosing the wood to testing the first print.',
    body: ['The carver begins with a seasoned piece of wood and a drawing on tracing paper. The pattern is transferred and cut away in stages.', 'A block is tested on scrap cloth. If one line prints thick, the whole block is trimmed again. A good block may last for years.'],
  },
  {
    id: 's5', slug: 'when-the-river-flooded-gondal', title: 'The Night the River Rose', category: 'Historical Stories',
    village: 'gondal', district: 'Rajkot', contributor: 'Meera Joshi', readTime: 7, date: '2026-05-18',
    image: IMG.palace, likes: 49, explore: 'folk-stories',
    excerpt: 'Residents remember a flood night differently depending on which side of the river they lived on.',
    body: ['The retelling varies in detail, but all agree the river rose faster than anyone expected. This account compiles three family recollections.', 'Dates remain uncertain; this is a story awaiting verification against written records.'],
  },
  {
    id: 's6', slug: 'an-elders-recipe-for-chaas', title: 'An Elder’s Recipe for Chaas', category: 'Traditional Knowledge',
    village: 'gondal', district: 'Rajkot', contributor: 'Kavita Mehta', readTime: 3, date: '2026-04-09',
    image: IMG.food, likes: 31, explore: 'folk-stories',
    excerpt: 'Spices, salt and the exact moment to stop churning, as taught by an aunt in Gondal.',
    body: ['Ingredients are simple. What matters, she says, is that the curd is a day old and the churning is slow.', 'She also shares how chaas is served at weddings, in clay cups, with a pinch of roasted cumin.'],
  },
]
