import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LayoutGrid, List } from 'lucide-react'
import SearchBar from '../../components/SearchBar/SearchBar'
import FilterPanel from '../../components/FilterPanel/FilterPanel'
import HeritageCard from '../../components/HeritageCard/HeritageCard'
import { CardSkeleton } from '../../components/LoadingSkeleton/LoadingSkeleton'
import { EmptyState, ErrorState } from '../../components/States/States'
import { exploreItems, villages } from '../../data'
import { CATEGORIES, DISTRICTS, HERITAGE_TYPES, PERIODS } from '../../data/categories'
import useSimulatedLoad from '../../hooks/useSimulatedLoad'
import useDocumentTitle from '../../hooks/useDocumentTitle'

const SORTS = {
  relevance: 'Most relevant',
  popular: 'Most appreciated',
  az: 'Title A to Z',
  verified: 'Verified first',
}

export default function Explore() {
  useDocumentTitle('Explore Heritage')
  const [params, setParams] = useSearchParams()
  const [view, setView] = useState('grid')
  const [failed, setFailed] = useState(false)
  const get = (k) => params.get(k) ?? ''
  const set = (k, v) => {
    const next = new URLSearchParams(params)
    v ? next.set(k, v) : next.delete(k)
    setParams(next, { replace: true })
  }

  const q = get('q'), category = get('category'), district = get('district'), village = get('village'), period = get('period'), htype = get('htype'), sort = get('sort') || 'relevance'
  const loading = useSimulatedLoad([q, category, district, village, period, htype, sort], 350)

  const results = useMemo(() => {
    const term = q.toLowerCase()
    const list = exploreItems.filter((i) =>
      (!term || `${i.title} ${i.summary}`.toLowerCase().includes(term)) &&
      (!category || i.category === category) && (!district || i.district === district) &&
      (!village || i.village === village) && (!period || i.period === period) && (!htype || i.htype === htype))
    const sorted = [...list]
    if (sort === 'popular') sorted.sort((a, b) => b.popularity - a.popularity)
    if (sort === 'az') sorted.sort((a, b) => a.title.localeCompare(b.title))
    if (sort === 'verified') sorted.sort((a, b) => Number(b.verified) - Number(a.verified))
    return sorted
  }, [q, category, district, village, period, htype, sort])

  const filters = [
    { key: 'district', label: 'District', options: DISTRICTS.map((d) => ({ value: d, label: d })) },
    { key: 'village', label: 'Village', options: villages.map((v) => ({ value: v.slug, label: v.name })) },
    { key: 'period', label: 'Historical period', options: PERIODS.map((p) => ({ value: p, label: p })) },
    { key: 'htype', label: 'Heritage type', options: HERITAGE_TYPES.map((t) => ({ value: t, label: t })) },
  ]
  const values = { district, village, period, htype }

  return (
    <>
      <section className="page-head">
        <div className="container">
          <h1>Explore Heritage</h1>
          <p>Browse the archive by category, place and period. Records marked Verified have been checked against their sources.</p>
          <SearchBar large value={q} onChange={(v) => set('q', v)} />
        </div>
      </section>

      <section className="section-tight">
        <div className="container">
          <div className="tabs" role="tablist" aria-label="Category">
            <button role="tab" aria-selected={!category} onClick={() => set('category', '')}>All</button>
            {CATEGORIES.map((c) => <button key={c.id} role="tab" aria-selected={category === c.id} onClick={() => set('category', c.id)}>{c.label}</button>)}
          </div>
          <div className="filter-row">
            <FilterPanel filters={filters} values={values} onChange={set} onReset={() => setParams(q ? { q } : {}, { replace: true })} />
          </div>
          <div className="result-bar">
            <p className="meta" aria-live="polite">{loading ? 'Loading records...' : `${results.length} record${results.length === 1 ? '' : 's'}`}</p>
            <div className="result-tools">
              <label htmlFor="sort" className="sr-only">Sort by</label>
              <select id="sort" value={sort} onChange={(e) => set('sort', e.target.value)}>
                {Object.entries(SORTS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <div className="view-toggle" role="group" aria-label="Layout">
                <button className={view === 'grid' ? 'on' : ''} onClick={() => setView('grid')} aria-pressed={view === 'grid'} aria-label="Grid view"><LayoutGrid size={18} /></button>
                <button className={view === 'list' ? 'on' : ''} onClick={() => setView('list')} aria-pressed={view === 'list'} aria-label="List view"><List size={18} /></button>
              </div>
            </div>
          </div>

          {failed ? <ErrorState onRetry={() => setFailed(false)} />
            : loading ? <CardSkeleton count={6} />
            : results.length === 0 ? <EmptyState />
            : view === 'grid' ? <div className="grid-cards">{results.map((r) => <HeritageCard key={r.id} item={r} />)}</div>
            : <div className="list-stack">{results.map((r) => <HeritageCard key={r.id} item={r} variant="list" />)}</div>}
        </div>
      </section>
    </>
  )
}
