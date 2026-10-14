import { Bookmark } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function BookmarkButton({ type, id, label = false, className = '' }) {
  const { isBookmarked, toggleBookmark } = useApp()
  const saved = isBookmarked(type, id)
  return (
    <button
      type="button"
      className={`icon-btn bookmark ${saved ? 'is-on' : ''} ${className}`}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from My Heritage' : 'Save to My Heritage'}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleBookmark(type, id) }}
    >
      <Bookmark size={18} fill={saved ? 'currentColor' : 'none'} aria-hidden="true" />
      {label && <span>{saved ? 'Saved' : 'Save'}</span>}
    </button>
  )
}
