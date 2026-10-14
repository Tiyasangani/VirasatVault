import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, ListPlus } from 'lucide-react'
import { useApp } from '../../context/AppContext'

// "Add to playlist" button with a small menu: tick a playlist to add/remove this item, or create a new one.
export default function AddToPlaylist({ itemId, compact = false, className = '' }) {
  const { user, requireLogin, playlists, createPlaylist, togglePlaylistItem, showToast } = useApp()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const box = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const close = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false) }
    const esc = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc) }
  }, [open])

  const toggleOpen = () => { if (!user) { requireLogin('Log in to make playlists'); return } setOpen((o) => !o) }
  const inAny = playlists.some((p) => p.itemIds.includes(itemId))

  const create = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setBusy(true)
    try {
      const created = await createPlaylist({ title: name.trim() }, itemId)
      showToast(`Added to “${created.title}”`)
      setName('')
    } catch (err) { showToast(err.fields?.title ?? err.message) } finally { setBusy(false) }
  }

  return (
    <div className={`dropdown add-playlist ${className}`} ref={box}>
      <button type="button" className={`icon-btn ${inAny ? 'is-on' : ''}`} onClick={toggleOpen} aria-expanded={open} aria-haspopup="true" aria-label={compact ? 'Add to playlist' : undefined}>
        <ListPlus size={18} aria-hidden="true" />{!compact && <span>Playlist</span>}
      </button>
      {open && (
        <div className="dropdown-panel playlist-menu" role="group" aria-label="Add to playlist">
          <p className="label">Add to playlist</p>
          {playlists.length === 0 && <p className="meta">You have no playlists yet. Create your first one below.</p>}
          <ul className="plain-list">
            {playlists.map((p) => {
              const has = p.itemIds.includes(itemId)
              return (
                <li key={p.id}>
                  <label className="check">
                    <input type="checkbox" checked={has} onChange={() => togglePlaylistItem(p.id, itemId)} />
                    <span>{p.title}</span>
                    {has && <Check size={14} aria-hidden="true" />}
                  </label>
                </li>
              )
            })}
          </ul>
          <form className="playlist-new" onSubmit={create}>
            <label htmlFor={`new-pl-${itemId}`} className="sr-only">New playlist name</label>
            <input id={`new-pl-${itemId}`} type="text" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} placeholder="New playlist name" />
            <button type="submit" className="btn btn-secondary btn-sm" disabled={busy || !name.trim()}>Create</button>
          </form>
          <Link to="/playlists" className="text-link" onClick={() => setOpen(false)}>Manage my playlists</Link>
        </div>
      )}
    </div>
  )
}
