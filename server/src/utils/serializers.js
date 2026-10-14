import { config } from '../config.js'

// Database rows -> the exact object shapes the React app already uses.

// Uploaded files are stored as "/uploads/x.jpg"; make them absolute so any frontend origin can load them.
export const fileUrl = (value) => (value?.startsWith('/uploads/') ? `${config.publicUrl}${value}` : value)

export const villageOut = (r) => ({
  id: `v-${r.slug}`, slug: r.slug, name: r.name, district: r.district, region: r.region,
  image: fileUrl(r.image), gallery: r.gallery, summary: r.summary, intro: r.intro,
  lat: r.lat, lng: r.lng, people: r.people, foods: r.foods, festivals: r.festivals,
})

export const heritageOut = (r) => ({
  id: `h${r.id}`, slug: r.slug, recordNo: r.record_no, title: r.title, category: r.category, type: r.type, htype: r.htype,
  village: r.village_slug, district: r.district, period: r.period, yearLabel: r.year_label,
  image: fileUrl(r.image), gallery: r.gallery.map(fileUrl), lat: r.lat, lng: r.lng, summary: r.summary,
  description: r.description, significance: r.significance, timeline: r.timeline, sources: r.sources,
  contributor: r.contributor_name, verified: r.verified, likes: Number(r.likes),
})

export const storyOut = (r) => ({
  id: `s${r.id}`, slug: r.slug, title: r.title, category: r.category, explore: r.explore, village: r.village_slug,
  district: r.district, contributor: r.contributor_name, readTime: r.read_time, date: r.published_on,
  image: fileUrl(r.image), featured: r.featured, likes: Number(r.likes), excerpt: r.excerpt, body: r.body,
})

export const eventOut = (r) => ({
  id: `e${r.id}`, slug: r.slug, name: r.name, category: r.category, date: r.event_date, endDate: r.end_date ?? undefined,
  village: r.village_slug, location: r.location, district: r.district, image: fileUrl(r.image),
  description: r.description, schedule: r.schedule, entry: r.entry,
})

export const oralOut = (r) => ({
  id: `o${r.id}`, title: r.title, speaker: r.speaker, village: r.village_slug, duration: r.duration,
  description: r.description, audioUrl: fileUrl(r.audio_url),
})

export const contributionOut = (r) => ({
  id: r.id, title: r.title, category: r.category, contributor: r.contributor_name, village: r.village,
  district: r.district, submitted: r.submitted_at, status: r.status, period: r.period, description: r.description,
  images: r.images.map(fileUrl), sources: r.sources, reference: r.reference, extra: r.extra,
  adminNote: r.admin_note ?? '', heritageId: r.heritage_id ? `h${r.heritage_id}` : null,
})

export const reportOut = (r) => ({
  id: r.id, target: r.target, reason: r.reason, detail: r.detail, reporter: r.reporter_name, date: r.created_at, status: r.status,
})

export const notificationOut = (r) => ({ id: String(r.id), type: r.type, text: r.text, link: r.link ?? null, time: r.created_at, read: r.read })

export const userOut = (r) => ({
  id: r.id, name: r.name, email: r.email, village: r.village, district: r.district, role: r.role,
  points: r.points, approved: Number(r.approved ?? 0), pending: Number(r.pending ?? 0),
})

export const historyOut = (r) => ({ id: r.id, actor: r.actor, status: r.status, note: r.note ?? '', date: r.created_at })
