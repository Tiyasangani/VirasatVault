// Detailed content for every photograph used on VirasatVault.
//
// Each entry is keyed by the Unsplash photo id found inside the image URL, so the details follow the
// picture wherever it appears (record pages, village pages, stories, events, the gallery and the viewer).
// Photographs uploaded by contributors do not have an entry here; they get automatic details built from
// the record they belong to (see getImageInfo below), so nothing is ever left without a caption.
//
// IMPORTANT FOR EDITORS: the texts describe the heritage SUBJECT that each picture stands for in the
// archive (what to look at, why it matters, how to document it). When you replace a stock photograph with
// your own, update the matching entry so the caption describes your photograph exactly.

export const SUBJECTS = {
  palace: 'Palaces and royal residences',
  fort: 'Forts, walls and gateways',
  stepwell: 'Stepwells and water heritage',
  temple: 'Temples and shrines',
  village: 'Village life and landscape',
  street: 'Bazaars, lanes and streets',
  festival: 'Festivals and fairs',
  food: 'Traditional food',
  craft: 'Arts and handicrafts',
  dance: 'Dance and performance',
  monument: 'Monuments and public buildings',
}

const credit = 'Photograph via Unsplash. Illustrative image; the photographer is credited on the original Unsplash page.'

export const PHOTO_DETAILS = {
  'photo-1599661046289-e31897846e41': {
    key: 'palace', subject: 'palace',
    title: 'Palace façade with carved stone balconies',
    caption: 'A princely-era palace front, where carved balconies and arched openings frame the building.',
    description: [
      'This photograph stands for the palace architecture of Saurashtra, where the ruling families of small princely states built residences that mixed local stone-carving traditions with ideas from elsewhere.',
      'Look at the balconies (jharokhas), the arched openings and the repeating window bays. Each one tells a documenter something: the type of stone, the hand of a particular carving workshop, and the later repairs that changed the original design.',
    ],
    lookFor: ['Projecting balconies with carved brackets', 'Arched doorways and window bays', 'Changes in stone colour that show later repairs', 'Inscriptions or plaques near the entrance'],
    why: 'Palaces are the best known buildings of the region, but their courtyards, service wings and neighbouring lanes are poorly recorded. A dated photograph today becomes evidence for future conservation.',
    howToDocument: 'Photograph the whole façade from across the road, then close-ups of each carved panel. Note the date, the time of day and your position so others can repeat the view.',
    tags: ['architecture', 'palace', 'sandstone', 'princely era', 'Saurashtra'],
    season: 'Best light: early morning and late afternoon, when carving casts shadows.',
    credit,
  },
  'photo-1477587458883-47145ed94245': {
    key: 'palaceTwo', subject: 'palace',
    title: 'Palace grounds, long verandas and symmetrical wings',
    caption: 'A riverside palace seen across open grounds, with verandas and wings arranged symmetrically.',
    description: [
      'This photograph represents the later, more formally planned palaces of the princely period, built within gardens or open grounds rather than inside a walled town.',
      'The long verandas, regular windows and balanced wings reflect a household that hosted guests and public events. Gardens and approach roads are part of the heritage and are often the first things to change.',
    ],
    lookFor: ['Symmetrical wings on either side of the entrance', 'Long covered verandas', 'Garden layout and approach road', 'Roof-line details such as domes and chhatris'],
    why: 'Grounds, boundary walls and gardens disappear faster than the main building. Recording them keeps the palace understandable as a whole place.',
    howToDocument: 'Take a wide view of the grounds first, then each wing. Ask elders what events were held in the grounds and add their names and dates as sources.',
    tags: ['palace', 'gardens', 'verandas', 'riverside', 'princely era'],
    season: 'Best light: soft morning light. Avoid midday glare on pale walls.',
    credit,
  },
  'photo-1596402184320-417e7178b2cd': {
    key: 'fort', subject: 'fort',
    title: 'Old fort gateway and surviving wall',
    caption: 'A weathered gateway and a stretch of old wall, the last visible trace of a town boundary.',
    description: [
      'This photograph stands for the town gateways and fort walls that once marked the edge of a settlement. Traders, bullock carts and processions all entered through such gates.',
      'Only parts of most walls survive. What remains, such as a gate arch, a bastion or a stretch of rubble masonry, is valuable because it shows where the old town ended.',
    ],
    lookFor: ['The gate arch and its keystone', 'Thickness and material of the wall', 'Signs of later patching or blocked openings', 'Worn steps or thresholds that show daily use'],
    why: 'Boundary structures are often removed for roads and shops. A record made now preserves the outline of the historic town even after the stones are gone.',
    howToDocument: 'Stand at the same spot for every shot. Add a person or a measuring pole for scale, and mark the gate on the map from the record page.',
    tags: ['fort', 'gateway', 'town wall', 'masonry', 'medieval'],
    season: 'Best light: low sun along the wall shows surface texture clearly.',
    credit,
  },
  'photo-1548013146-72479768bada': {
    key: 'stepwell', subject: 'stepwell',
    title: 'Stepwell descending in landings and stone steps',
    caption: 'A stepped well whose landings and niches once served as both a water source and a meeting place.',
    description: [
      'This photograph represents the stepwells (vavs and kunds) of Gujarat: deep, stepped structures that gave people year-round access to groundwater and shade.',
      'The geometry is part of the story. Steps descend in flights, landings give space to rest, and niches in the walls often held lamps or small shrines. For many villages the stepwell was also the social centre of the old quarter.',
    ],
    lookFor: ['Flights of steps and wide landings', 'Niches and carved pillars', 'Water level and the stain lines on the walls', 'Any inscription, even if worn'],
    why: 'Stepwells are among the most vulnerable water structures in the region. Piped water reduced their use, and many are now filled with silt or rubbish.',
    howToDocument: 'Photograph from the top looking down, then from the lowest safe landing looking up. Never climb on damaged steps; record only what you can reach safely.',
    tags: ['stepwell', 'vav', 'water heritage', 'carved pillars', 'village'],
    season: 'Best light: around midday, when sun reaches the lower landings.',
    credit,
  },
  'photo-1561361513-2d000a50f0dc': {
    key: 'temple', subject: 'temple',
    title: 'Ornamented temple with carved façade',
    caption: 'A richly worked temple front combining carved stone and decorative detail.',
    description: [
      'This photograph represents the ornate temple architecture found across Saurashtra, built over several generations by ruling families and local merchants.',
      'Temples are living heritage. The building, the daily rituals and the festivals around it belong together, so a good record describes the structure and also how the community uses it.',
    ],
    lookFor: ['Carved figures and floral panels', 'Spires (shikhara) and porch (mandapa) shapes', 'Decorative metalwork or painted detail', 'Dedication stones with donor names and dates'],
    why: 'Repairs and repainting change temples quickly. A dated photograph shows what was original and what was added later.',
    howToDocument: 'Ask permission before photographing inside. Record the name of the temple, the priest or trustee, and the main festival days.',
    tags: ['temple', 'shikhara', 'carving', 'living heritage'],
    season: 'Best light: morning, before crowds arrive.',
    credit,
  },
  'photo-1609766857041-ed402ea8069a': {
    key: 'templeTwo', subject: 'temple',
    title: 'Riverside shrine and temple steps',
    caption: 'A small shrine with steps leading toward the water, repeatedly repaired by local families.',
    description: [
      'This photograph stands for small neighbourhood and riverside shrines. They are rarely listed in official surveys, yet they carry some of the strongest community memory.',
      'Steps, platforms and shrine rooms are often rebuilt in parts. The oldest stones, usually in the sanctum or the lowest steps, can differ from the newer work and are worth recording carefully.',
    ],
    lookFor: ['Steps leading down to the river or a tank', 'The oldest stones, often in the sanctum', 'Panels or plaques added after floods or repairs', 'Lamp niches and bell frames'],
    why: 'Community-maintained shrines depend on a few families. Writing down who built, repaired and cares for the shrine keeps that knowledge from being lost.',
    howToDocument: 'Photograph each repair phase separately and ask elders when each was done. Different views about age should be recorded as testimony, not settled by guesswork.',
    tags: ['shrine', 'riverside', 'steps', 'community repair'],
    season: 'Best light: early morning, when the river reflects the shrine.',
    credit,
  },
  'photo-1532375810709-75b1da00537c': {
    key: 'village', subject: 'village',
    title: 'Village landscape and everyday life',
    caption: 'The fields, lanes and houses around a village, the setting in which all other heritage sits.',
    description: [
      'This photograph represents the village itself as heritage: its layout, its houses, its fields and the paths people walk every day.',
      'Many traditions only make sense in their setting. Where the well stands in relation to the temple, which lane leads to the market, and where the fair is held are all facts that a map and a photograph can preserve.',
    ],
    lookFor: ['How houses cluster around a well, temple or chowk', 'Building materials used in older homes', 'Paths that connect quarters of the village', 'Trees and open spaces used for gatherings'],
    why: 'Village layouts change as roads, concrete houses and piped water arrive. Wide views taken now are valuable comparison material for the future.',
    howToDocument: 'Take wide, steady photographs from a rooftop or high ground and label the main landmarks. Record the names villagers use for each quarter.',
    tags: ['village', 'landscape', 'settlement', 'everyday life'],
    season: 'Best light: golden hour, early morning or evening.',
    credit,
  },
  'photo-1514222134-b57cbb8ce073': {
    key: 'street', subject: 'street',
    title: 'Old bazaar lane with shopfronts',
    caption: 'A narrow bazaar lane lined with shopfronts, the trading heart of an old town.',
    description: [
      'This photograph represents the old bazaars of Saurashtra, where lanes were organised by trade and by community quarter.',
      'Shopfronts, signboards, wooden balconies and the width of the lane carry history. Elders often remember the lane shop by shop, and those memories can be matched to a photograph to build a shared map of the past.',
    ],
    lookFor: ['Carved wooden brackets and balconies above shops', 'Painted signboards and old lettering', 'Width of the lane and the position of gateways', 'Which trades occupy which stretch of the lane'],
    why: 'Bazaars change fastest. Signboards, shutters and trades are replaced within a few years, so a dated photo is a record of a particular moment.',
    howToDocument: 'Walk the lane from one end to the other and photograph both sides at regular intervals. Ask a shopkeeper for the names of each shop in earlier decades.',
    tags: ['bazaar', 'streetscape', 'trade', 'wooden balconies'],
    season: 'Best light: morning, before shutters open and traffic builds.',
    credit,
  },
  'photo-1566552881560-0be862a7c445': {
    key: 'festival', subject: 'festival',
    title: 'Festival crowd, lights and celebration',
    caption: 'A fair or festival in full swing, with decoration, lights and people gathered together.',
    description: [
      'This photograph represents festivals and village fairs: the seasonal gatherings that give a place its calendar.',
      'A festival is more than a date. Who organises it, where stalls are set up, which songs are sung and what food is sold are all part of the tradition and should be written down along with photographs.',
    ],
    lookFor: ['Decorations, lamps and temporary structures', 'Costume and ornament worn for the occasion', 'Where different groups stand or perform', 'Food stalls and handicraft stalls around the ground'],
    why: 'Festivals change as organisers, venues and sponsors change. Notes made over several years show which parts are stable and which are new.',
    howToDocument: 'Photograph the same spot at the start, the peak and the end of the event. Record the organising committee and ask permission before photographing close portraits.',
    tags: ['festival', 'fair', 'celebration', 'community'],
    season: 'Best light: dusk, when lights and sky balance.',
    credit,
  },
  'photo-1567188040759-fb8a883dc6d8': {
    key: 'food', subject: 'food',
    title: 'Traditional meal of millet bread, curry and accompaniments',
    caption: 'A home-style regional meal, served the way households describe it.',
    description: [
      'This photograph stands for traditional food heritage: everyday meals, festival dishes and the methods used to prepare them.',
      'Food heritage is transmitted by watching and tasting. A useful record gives ingredients, quantities in household units, the order of cooking, the vessel used and the occasion when the dish is served.',
    ],
    lookFor: ['The vessels and tools used (tawa, handi, wooden spoons)', 'Accompaniments served on the side', 'Garnishes added only at the table', 'Differences between households for the same dish'],
    why: 'Recipes rarely exist on paper. When an elder stops cooking, details such as timing and texture disappear with them.',
    howToDocument: 'Photograph the dish and also the cooking, step by step. Write the recipe in the cook’s own words and credit them by name with permission.',
    tags: ['food', 'recipe', 'household tradition', 'Kathiawadi'],
    season: 'Best light: natural window light on a plain surface.',
    credit,
  },
  'photo-1604871000636-074fa5117945': {
    key: 'craft', subject: 'craft',
    title: 'Hand craft: printed and dyed textiles',
    caption: 'Hand-worked textile and craft materials, showing colour, pattern and the work of the maker.',
    description: [
      'This photograph represents the hand crafts of the region, such as block printing, dyeing, weaving and carving, which are passed from one generation to the next inside families.',
      'Pattern, colour and tool all carry knowledge. Documenting a craft means recording the maker, the workshop, the materials, the sequence of steps and the names that craftspeople give to their patterns.',
    ],
    lookFor: ['Repeated patterns and the blocks that make them', 'Natural or synthetic dyes in use', 'Tools such as carved blocks, brushes and vats', 'Differences between hand and machine finishing'],
    why: 'Machine printing is changing workshops within a single generation. Hand methods recorded now may not be demonstrable in twenty years.',
    howToDocument: 'Photograph every stage, from raw cloth to finished piece. Record the maker’s name, family workshop and how long they have practised.',
    tags: ['craft', 'textile', 'block printing', 'dyeing'],
    season: 'Best light: open workshop doorway or courtyard, with indirect daylight.',
    credit,
  },
  'photo-1582510003544-4d00b7f74220': {
    key: 'dance', subject: 'dance',
    title: 'Dancers in traditional costume',
    caption: 'Performers in traditional dress, moving in the circles and steps of a folk dance.',
    description: [
      'This photograph represents folk dance traditions such as garba and ras, performed in circles with clapping, sticks and songs.',
      'Steps, rhythm, song and costume vary between neighbourhoods. Teachers and older dancers can explain which variations are local, and those explanations are as important as the photographs.',
    ],
    lookFor: ['The formation (circle, line or pairs)', 'Hand movements, clapping patterns or sticks', 'Costume, ornaments and colours', 'The musicians and instruments supporting the dance'],
    why: 'Local variations are merging into a single popular style. Dated recordings of older forms preserve what makes each neighbourhood different.',
    howToDocument: 'Record short video clips of each step along with the song name and the teacher’s name. Ask the group for permission before sharing publicly.',
    tags: ['dance', 'garba', 'ras', 'costume', 'folk performance'],
    season: 'Best light: evening events under stage lighting, so use a steady hand.',
    credit,
  },
  'photo-1564507592333-c60657eea523': {
    key: 'monument', subject: 'monument',
    title: 'Monument with domes and arches',
    caption: 'A public monument or heritage building with domes, arches and formal proportions.',
    description: [
      'This photograph stands for monuments and public buildings: museums, memorials, gateways and civic structures that anchor a town’s identity.',
      'Their style often mixes local and imported ideas. Noting the domes, arches, brackets and inscriptions helps reviewers place the building in a period and compare it with others.',
    ],
    lookFor: ['Domes, chhatris and arched openings', 'Foundation or opening stones with dates', 'Material changes between original and repaired sections', 'Signs of current use (museum, office, school)'],
    why: 'Public buildings are used and altered every year. A documented condition record helps conservation teams see what has changed.',
    howToDocument: 'Photograph all four sides and the entrance. Record the current use, opening hours and who maintains the building.',
    tags: ['monument', 'public building', 'domes', 'arches'],
    season: 'Best light: clear mornings, with the sun behind you.',
    credit,
  },
  'photo-1524492412937-b28074a5d7da': {
    key: 'monumentTwo', subject: 'monument',
    title: 'Landmark building in a mix of architectural styles',
    caption: 'A large landmark whose façade blends regional and outside architectural features.',
    description: [
      'This photograph represents landmark buildings that combine several architectural traditions, typical of princely-era construction in Gujarat.',
      'Because such buildings were often expanded in phases, the façade can tell several stories at once. A good record separates the original design from later additions and notes who commissioned each.',
    ],
    lookFor: ['Different window shapes on the same façade', 'Towers, domes or porticos added in later phases', 'The relationship between the building and its approach road', 'Plaques naming the architect or patron'],
    why: 'Landmarks often become the symbol of a town. Collecting photographs from different decades builds a visual history of the place.',
    howToDocument: 'Look for archive photographs in family albums and match them to your own current views from the same position.',
    tags: ['landmark', 'architecture', 'mixed styles', 'princely era'],
    season: 'Best light: late afternoon on a clear day.',
    credit,
  },
}

// Pull the Unsplash photo id out of any image URL.
const photoId = (src = '') => {
  const m = String(src).match(/(photo-[0-9a-f]+-[0-9a-f]+)/i)
  return m ? m[1] : null
}

// Details for one image. `ctx` is the page the picture sits on, for example
// { title: record.title, village: 'Gondal', district: 'Rajkot', kind: 'Heritage record', href: '/heritage/x', index: 0, total: 3 }.
// Always returns a complete object so the viewer never shows an empty panel.
export function getImageInfo(src, ctx = {}) {
  const base = PHOTO_DETAILS[photoId(src)]
  const place = [ctx.village, ctx.district && `${ctx.district} District`].filter(Boolean).join(', ')
  const position = ctx.total > 1 ? `Photograph ${ctx.index + 1} of ${ctx.total}` : 'Photograph'
  const heading = ctx.title ? `${ctx.title}${ctx.total > 1 ? `, ${position.toLowerCase()}` : ''}` : (base?.title ?? 'Heritage photograph')

  if (base) {
    return {
      ...base,
      src,
      heading,
      place,
      subjectLabel: SUBJECTS[base.subject],
      alt: `${ctx.title ? `${ctx.title}: ` : ''}${base.title}. ${base.caption}`,
      context: ctx,
      isUpload: false,
    }
  }

  // Contributor upload or any other image: build details from the record it belongs to.
  const label = ctx.title || 'Contributed photograph'
  return {
    key: 'upload', subject: 'village', src, heading,
    title: label,
    caption: `${label}${place ? `, ${place}` : ''}. Photograph supplied by a community contributor.`,
    description: [
      `This photograph was contributed to the archive${ctx.title ? ` as part of the record “${ctx.title}”` : ''}${place ? ` from ${place}` : ''}.`,
      'Contributor photographs are reviewed together with the sources given in the record. Details such as the date, the photographer and the exact spot may be added by reviewers as they are confirmed.',
    ],
    lookFor: ['Any text, signs or inscriptions in the frame', 'Parts of the structure or scene that have since changed', 'People, tools or objects that show how the place was used'],
    why: 'Photographs from families and communities are often the only visual record of how a place looked in the past.',
    howToDocument: 'If you know when and where this was taken, add a comment on the record page so a reviewer can add it to the details.',
    tags: ['contributed photograph', ctx.village, ctx.district].filter(Boolean),
    season: '',
    credit: 'Photograph supplied by a community contributor, shared under the terms accepted at submission.',
    place, alt: `${label}${place ? `, ${place}` : ''}`, subjectLabel: 'Community photograph', context: ctx, isUpload: true,
  }
}

// Short caption used under images on pages (one or two sentences).
export function getCaption(src, ctx = {}) {
  const info = getImageInfo(src, ctx)
  return { title: info.heading, text: info.caption }
}

export const knownPhotoCount = Object.keys(PHOTO_DETAILS).length
