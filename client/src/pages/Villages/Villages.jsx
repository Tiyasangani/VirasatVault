import { useMemo, useState } from 'react'
import SearchBar from '../../components/SearchBar/SearchBar'
import VillageCard from '../../components/VillageCard/VillageCard'
import FilterPanel from '../../components/FilterPanel/FilterPanel'
import { EmptyState } from '../../components/States/States'
import { villages, recordsInVillage } from '../../data'
import { DISTRICTS } from '../../data/categories'
import useDocumentTitle from '../../hooks/useDocumentTitle'

export default function Villages() {
  useDocumentTitle('Villages')
  const [q, setQ] = useState('')
  const [filters, setFilters] = useState({ district: '', region: '', count: '' })
  const results = useMemo(() => villages.filter((v) =>
    (!q || `${v.name} ${v.summary}`.toLowerCase().includes(q.toLowerCase())) &&
    (!filters.district || v.district === filters.district) && (!filters.region || v.region === filters.region) &&
    (!filters.count || recordsInVillage(v.slug) >= Number(filters.count))), [q, filters])

  const config = [
    { key: 'district', label: 'District', options: DISTRICTS.slice(0, 2).map((d) => ({ value: d, label: d })) },
    { key: 'region', label: 'Region', options: [{ value: 'Saurashtra', label: 'Saurashtra' }] },
    { key: 'count', label: 'Heritage records', options: [{ value: '3', label: '3 or more' }, { value: '5', label: '5 or more' }] },
  ]
  return (
    <>
      <section className="page-head">
        <div className="container">
          <h1>Villages</h1>
          <p>Every record in VirasatVault belongs to a place. Start with a village and follow what it holds.</p>
          <SearchBar large value={q} onChange={setQ} placeholder="Search villages by name" />
        </div>
      </section>
      <section className="section-tight">
        <div className="container">
          <FilterPanel filters={config} values={filters} onChange={(k, v) => setFilters((f) => ({ ...f, [k]: v }))} onReset={() => setFilters({ district: '', region: '', count: '' })} />
          <p className="meta result-bar">{results.length} village{results.length === 1 ? '' : 's'}</p>
          {results.length ? <div className="grid-cards">{results.map((v) => <VillageCard key={v.id} village={v} />)}</div> : <EmptyState title="No villages match." text="Try removing a filter. If your village is missing, it can be added by contributors." />}
        </div>
      </section>
    </>
  )
}
