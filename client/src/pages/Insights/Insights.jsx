import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import BarChart from '../../components/BarChart/BarChart'
import Button from '../../components/Button/Button'
import { heritage, villages, stories, events, oralHistories, villageName } from '../../data'
import { CATEGORIES, HERITAGE_TYPES, PERIODS, categoryLabel } from '../../data/categories'
import useDocumentTitle from '../../hooks/useDocumentTitle'

const count = (list, key, order) => {
  const m = new Map(order.map((o) => [o, 0]))
  list.forEach((x) => m.set(key(x), (m.get(key(x)) ?? 0) + 1))
  return [...m].map(([label, value]) => ({ label, value }))
}

// How complete is a record? One point for each good-practice item.
const CHECKS = [
  ['Verified by a reviewer', (h) => h.verified],
  ['Two or more sources', (h) => (h.sources?.length ?? 0) >= 2],
  ['Three or more timeline entries', (h) => (h.timeline?.length ?? 0) >= 3],
  ['Two or more photographs', (h) => new Set([h.image, ...(h.gallery ?? [])].filter(Boolean)).size >= 2],
  ['Three paragraphs of description', (h) => (h.description?.length ?? 0) >= 3],
]
const scoreOf = (h) => CHECKS.filter(([, fn]) => fn(h)).length
const missingOf = (h) => CHECKS.filter(([, fn]) => !fn(h)).map(([label]) => label)

export default function Insights() {
  useDocumentTitle('Archive Insights')

  const data = useMemo(() => {
    const photos = new Set([...heritage.flatMap((h) => [h.image, ...(h.gallery ?? [])]), ...villages.flatMap((v) => [v.image, ...(v.gallery ?? [])]), ...stories.map((s) => s.image), ...events.map((e) => e.image)].filter(Boolean))
    const verified = heritage.filter((h) => h.verified).length
    const byCategory = count(heritage, (h) => categoryLabel(h.category), CATEGORIES.map((c) => c.label))
    const byVillage = count(heritage, (h) => villageName(h.village), villages.map((v) => v.name)).sort((a, b) => b.value - a.value)
    const byPeriod = count(heritage, (h) => h.period, PERIODS)
    const byType = count(heritage, (h) => h.htype, HERITAGE_TYPES)
    const scored = heritage.map((h) => ({ h, score: scoreOf(h), missing: missingOf(h) }))
    const needsHelp = [...scored].filter((s) => s.score < CHECKS.length).sort((a, b) => a.score - b.score).slice(0, 6)
    const average = scored.length ? scored.reduce((n, s) => n + s.score, 0) / scored.length / CHECKS.length : 0
    return {
      photos: photos.size, verified, byCategory, byVillage, byPeriod, byType, needsHelp, average,
      emptyCategories: byCategory.filter((c) => c.value === 0).map((c) => c.label),
      quietVillages: byVillage.filter((v) => v.value <= 1).map((v) => v.label),
      awaiting: heritage.filter((h) => !h.verified),
      top: [...heritage].sort((a, b) => b.likes - a.likes).slice(0, 5),
    }
  }, [])

  const pct = heritage.length ? Math.round((data.verified / heritage.length) * 100) : 0
  const stats = [
    ['Heritage records', heritage.length], ['Verified', `${pct}%`], ['Villages', villages.length], ['Stories', stories.length],
    ['Events', events.length], ['Oral histories', oralHistories.length], ['Photographs', data.photos], ['Avg. completeness', `${Math.round(data.average * 100)}%`],
  ]

  return (
    <>
      <section className="page-head">
        <div className="container">
          <h1>Archive Insights</h1>
          <p>A live picture of what VirasatVault holds today, and where the gaps are. It is built from the published records, so it changes as people contribute.</p>
        </div>
      </section>

      <section className="section-tight">
        <div className="container">
          <dl className="insight-stats">
            {stats.map(([label, value]) => <div key={label}><dd>{value}</dd><dt>{label}</dt></div>)}
          </dl>
        </div>
      </section>

      <section className="section section-tint">
        <div className="container insight-charts">
          <BarChart title="Records by category" data={data.byCategory} />
          <BarChart title="Records by village" data={data.byVillage} />
          <BarChart title="Records by historical period" data={data.byPeriod} />
          <BarChart title="Records by heritage type" data={data.byType} />
        </div>
      </section>

      <section className="section">
        <div className="container insight-cols">
          <div>
            <h2>Where the archive needs you</h2>
            <p className="section-lead">Gaps that a new contribution would fill straight away.</p>
            <ul className="insight-gaps">
              {data.emptyCategories.length > 0 && <li><strong>No records yet in:</strong> {data.emptyCategories.join(', ')}.</li>}
              {data.quietVillages.length > 0 && <li><strong>Villages with one record or none:</strong> {data.quietVillages.join(', ')}.</li>}
              {data.awaiting.length > 0 && <li><strong>{data.awaiting.length} record{data.awaiting.length === 1 ? '' : 's'} awaiting verification.</strong> Sources and photographs help reviewers confirm them: {data.awaiting.map((h, i) => <span key={h.id}>{i > 0 && ', '}<Link className="text-link" to={`/heritage/${h.slug}`}>{h.title}</Link></span>)}.</li>}
              {data.emptyCategories.length === 0 && data.quietVillages.length === 0 && data.awaiting.length === 0 && <li>Every category and village is covered and every record is verified. Keep adding detail.</li>}
            </ul>
            <Button to="/contribute">Contribute heritage</Button>
          </div>
          <div>
            <h2>Records that could be richer</h2>
            <p className="section-lead">Each record is scored on five good-practice checks.</p>
            <ul className="insight-list">
              {data.needsHelp.map(({ h, score, missing }) => (
                <li key={h.id}>
                  <div className="row-between"><Link className="text-link" to={`/heritage/${h.slug}`}>{h.title}</Link><span className="meta">{score} of {CHECKS.length}</span></div>
                  <span className="meta">Missing: {missing.join('; ')}</span>
                </li>
              ))}
              {data.needsHelp.length === 0 && <li className="muted">Every record passes all five checks.</li>}
            </ul>
          </div>
        </div>
      </section>

      <section className="section section-tint">
        <div className="container narrow">
          <h2>Most appreciated records</h2>
          <ol className="insight-top">
            {data.top.map((h) => <li key={h.id}><Link to={`/heritage/${h.slug}`}>{h.title}</Link><span className="meta">{villageName(h.village)} · {h.likes} likes</span></li>)}
          </ol>
        </div>
      </section>
    </>
  )
}
