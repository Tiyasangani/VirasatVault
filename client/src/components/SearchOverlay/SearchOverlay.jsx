import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Clock, Search, X } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { groupResults, suggestionTerms } from '../../utils/search'
import { api } from '../../api/client'

export default function SearchOverlay({ onClose }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const { recentSearches, addRecentSearch, clearRecent } = useApp()
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const groups = useMemo(() => groupResults(results), [results])

  // Ask the server, waiting 250 ms after the last keystroke so we do not send a request per letter.
  useEffect(() => {
    const term = query.trim()
    if (!term) { setResults([]); setSearching(false); return undefined }
    setSearching(true)
    let cancelled = false
    const timer = setTimeout(() => {
      api.search(term).then((r) => !cancelled && setResults(r)).catch(() => !cancelled && setResults([])).finally(() => !cancelled && setSearching(false))
    }, 250)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [query])

  useEffect(() => {
    inputRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])

  const submit = (term) => {
    const text = (term ?? query).trim()
    if (!text) return
    addRecentSearch(text)
    onClose()
    navigate(`/explore?q=${encodeURIComponent(text)}`)
  }

  return (
    <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Search VirasatVault" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="search-panel">
        <form className="search-field" onSubmit={(e) => { e.preventDefault(); submit() }}>
          <Search size={22} aria-hidden="true" />
          <label htmlFor="global-search" className="sr-only">Search villages, places, stories, events, food, festivals and people</label>
          <input id="global-search" ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search villages, places, stories, food, people..." autoComplete="off" />
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close search"><X size={22} /></button>
        </form>

        <div className="search-results">
          {!query && (
            <div className="search-start">
              {recentSearches.length > 0 && (
                <section>
                  <div className="row-between"><h3 className="label">Recent searches</h3><button className="text-link" onClick={clearRecent}>Clear</button></div>
                  <ul className="plain-list">
                    {recentSearches.map((t) => (
                      <li key={t}><button type="button" className="list-btn" onClick={() => submit(t)}><Clock size={15} aria-hidden="true" /> {t}</button></li>
                    ))}
                  </ul>
                </section>
              )}
              <section>
                <h3 className="label">Try searching for</h3>
                <ul className="plain-list">
                  {suggestionTerms.map((t) => <li key={t}><button type="button" className="list-btn" onClick={() => setQuery(t)}>{t}</button></li>)}
                </ul>
              </section>
            </div>
          )}

          {query && !searching && results.length === 0 && (
            <p className="search-none">Nothing in the archive matches “{query}” yet. <Link to="/contribute" onClick={onClose} className="text-link">Know something about it? Contribute it.</Link></p>
          )}

          {query && Object.entries(groups).map(([group, items]) => (
            <section key={group} className="search-group">
              <h3 className="label">{group}</h3>
              <ul className="plain-list">
                {items.slice(0, 4).map((r) => (
                  <li key={r.id}>
                    <Link to={r.href} onClick={() => { addRecentSearch(query); onClose() }} className="search-hit">
                      <span className="search-hit-title">{r.title}</span>
                      <span className="search-hit-text">{r.summary}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          {query && results.length > 0 && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => submit()}>See all results in Explore</button>
          )}
        </div>
      </div>
    </div>
  )
}
