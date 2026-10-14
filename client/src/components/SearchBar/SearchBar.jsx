import { Search, X } from 'lucide-react'

export default function SearchBar({ value, onChange, placeholder = 'Search villages, places, stories, traditions...', label = 'Search', large = false }) {
  return (
    <div className={`searchbar ${large ? 'searchbar-lg' : ''}`}>
      <label htmlFor="searchbar-input" className="sr-only">{label}</label>
      <Search size={19} aria-hidden="true" />
      <input id="searchbar-input" type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoComplete="off" />
      {value && (
        <button type="button" className="icon-btn" onClick={() => onChange('')} aria-label="Clear search"><X size={16} /></button>
      )}
    </div>
  )
}
