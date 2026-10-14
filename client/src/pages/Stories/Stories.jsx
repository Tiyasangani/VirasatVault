import { useMemo, useState } from 'react'
import SearchBar from '../../components/SearchBar/SearchBar'
import StoryCard from '../../components/StoryCard/StoryCard'
import { EmptyState } from '../../components/States/States'
import { stories, villages } from '../../data'
import { STORY_CATEGORIES } from '../../data/categories'
import useDocumentTitle from '../../hooks/useDocumentTitle'

export default function Stories() {
  useDocumentTitle('Stories')
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  const [village, setVillage] = useState('')
  const results = useMemo(() => stories.filter((s) =>
    (!q || `${s.title} ${s.excerpt}`.toLowerCase().includes(q.toLowerCase())) && (!category || s.category === category) && (!village || s.village === village)), [q, category, village])
  const filtering = q || category || village
  const featured = results.find((s) => s.featured)
  const rest = featured && !filtering ? results.filter((s) => s !== featured) : results

  return (
    <>
      <section className="page-head">
        <div className="container">
          <h1>Stories</h1>
          <p>An archive of folk tales, spoken histories and memories, each credited to the person who shared it.</p>
          <SearchBar large value={q} onChange={setQ} placeholder="Search stories" />
        </div>
      </section>
      <section className="section-tight">
        <div className="container">
          <div className="tabs" role="tablist" aria-label="Story category">
            <button role="tab" aria-selected={!category} onClick={() => setCategory('')}>All</button>
            {STORY_CATEGORIES.map((c) => <button key={c} role="tab" aria-selected={category === c} onClick={() => setCategory(c)}>{c}</button>)}
          </div>
          <div className="result-bar"><p className="meta">{results.length} stories</p>
            <div className="result-tools"><label htmlFor="story-village" className="sr-only">Location</label>
              <select id="story-village" value={village} onChange={(e) => setVillage(e.target.value)}><option value="">All locations</option>{villages.map((v) => <option key={v.id} value={v.slug}>{v.name}</option>)}</select></div></div>
          {results.length === 0 ? <EmptyState title="No stories found." text="Try another category or location, or share a story of your own." /> : (
            <>
              {featured && !filtering && <div className="story-feature"><StoryCard story={featured} variant="feature" /></div>}
              <div className="grid-cards stories-row">{rest.map((s) => <StoryCard key={s.id} story={s} />)}</div>
            </>
          )}
        </div>
      </section>
    </>
  )
}
