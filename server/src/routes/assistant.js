import { Router } from 'express'
import { z } from 'zod'
import { asyncHandler } from '../middleware/errors.js'
import { bootstrapData } from '../utils/queries.js'

const router = Router()

// Rule-based placeholder. To use a real language model, replace the body of `answer`
// with a call to your AI provider and pass it the records found below as context.
function answer(question, { villages, heritage, stories, events }) {
  const q = question.toLowerCase()
  const village = villages.find((v) => q.includes(v.name.toLowerCase()))
  const heritageRef = (h) => ({ title: h.title, href: `/heritage/${h.slug}` })

  if (q.includes('temple')) {
    const all = heritage.filter((h) => h.type === 'temple')
    const inRajkot = all.filter((h) => h.district === 'Rajkot')
    const items = q.includes('rajkot') && inRajkot.length ? inRajkot : all
    return { text: `The archive lists ${items.length} temple record${items.length === 1 ? '' : 's'} that match: ${items.map((i) => i.title).join('; ')}. Records without a verified mark are still waiting for source checks.`, refs: items.map(heritageRef) }
  }
  if (q.includes('festival')) {
    return { text: 'Festivals documented in this region include Navratri garba in Wankaner, Uttarayan in Gondal, and the folk arts fair in Morbi. Upcoming dates are listed on the Events page.', refs: events.slice(0, 3).map((e) => ({ title: e.name, href: `/events/${e.slug}` })) }
  }
  if (!village && /folk|\bstor(y|ies)\b/.test(q)) {
    const list = stories.filter((s) => s.category === 'Folk Stories' || s.category === 'Oral Histories')
    const names = [...new Set(list.map((s) => villages.find((v) => v.slug === s.village)?.name))].join(' and ')
    return { text: `Folk stories and oral histories have been contributed from ${names}.`, refs: list.map((s) => ({ title: s.title, href: `/stories/${s.slug}` })) }
  }
  if (village) {
    const places = heritage.filter((h) => h.village === village.slug)
    const list = q.includes('near') || q.includes('place') ? `: ${places.map((p) => p.title).join('; ')}` : ''
    return { text: `${village.intro[0]} The archive holds ${places.length} heritage record${places.length === 1 ? '' : 's'} for ${village.name}${list}.`, refs: [{ title: `${village.name} village page`, href: `/villages/${village.slug}` }, ...places.slice(0, 3).map(heritageRef)] }
  }
  const words = q.split(/\W+/).filter((w) => w.length > 3)
  const hits = [...heritage.map((h) => ({ ...h, href: `/heritage/${h.slug}` })), ...stories.map((s) => ({ ...s, summary: s.excerpt, href: `/stories/${s.slug}` }))]
    .filter((i) => words.some((w) => `${i.title} ${i.summary ?? ''}`.toLowerCase().includes(w))).slice(0, 4)
  if (hits.length) return { text: 'These records may help with your question.', refs: hits.map((h) => ({ title: h.title, href: h.href })) }
  return { text: 'I could not find a record that matches that yet. You can search the archive, or contribute what you know.', refs: [{ title: 'Share your heritage', href: '/contribute' }] }
}

router.post('/assistant', asyncHandler(async (req, res) => {
  const { question } = z.object({ question: z.string().trim().min(2).max(160) }).parse(req.body)
  res.json(answer(question, await bootstrapData()))
}))

export default router
