import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Globe, ListMusic, Lock } from 'lucide-react'
import SmartImage from '../../components/SmartImage/SmartImage'
import { EmptyState } from '../../components/States/States'
import { useApp } from '../../context/AppContext'
import { resolveItem } from '../../utils/playlist'
import useDocumentTitle from '../../hooks/useDocumentTitle'

export function PlaylistCover({ itemIds }) {
  const images = itemIds.map(resolveItem).filter((i) => i?.image).slice(0, 4)
  if (images.length === 0) return <div className="pl-cover pl-cover-empty" aria-hidden="true"><ListMusic size={30} strokeWidth={1.2} /></div>
  return (
    <div className={`pl-cover pl-cover-${images.length}`} aria-hidden="true">
      {images.map((i) => <SmartImage key={i.id} src={i.image} alt="" ratio="1 / 1" />)}
    </div>
  )
}

export default function Playlists() {
  useDocumentTitle('My playlists')
  const { user, ready, playlists, createPlaylist, showToast } = useApp()
  const [form, setForm] = useState({ title: '', description: '', isPublic: false })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  if (!ready) return null
  if (!user) return <Navigate to="/login" replace />

  const create = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('Give the playlist a name.'); return }
    setBusy(true); setError('')
    try { await createPlaylist(form); setForm({ title: '', description: '', isPublic: false }); showToast('Playlist created') } catch (err) { setError(err.fields?.title ?? err.message) } finally { setBusy(false) }
  }

  return (
    <>
      <section className="page-head"><div className="container"><h1>My playlists</h1><p>Group places, stories, events, villages and oral histories into lists for a trip, a lesson, or just for yourself. Share a list with a link, or play its recordings one after another.</p></div></section>
      <section className="section-tight"><div className="container pl-layout">
        <div>
          {playlists.length === 0 ? <EmptyState title="No playlists yet." text="Create one here, or use the Playlist button on any record, story or recording." action={<span />} /> : (
            <ul className="pl-grid">
              {playlists.map((p) => (
                <li key={p.id}>
                  <Link to={`/playlists/${p.code}`} className="pl-card">
                    <PlaylistCover itemIds={p.itemIds} />
                    <div>
                      <h2 className="card-title">{p.title}</h2>
                      {p.description && <p className="card-text clamp-2">{p.description}</p>}
                      <p className="meta with-icon">{p.isPublic ? <Globe size={13} aria-hidden="true" /> : <Lock size={13} aria-hidden="true" />} {p.isPublic ? 'Public' : 'Private'}, {p.itemIds.length} item{p.itemIds.length === 1 ? '' : 's'}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <form className="pl-new" onSubmit={create} noValidate>
          <h2>New playlist</h2>
          <div className={`field ${error ? 'has-error' : ''}`}>
            <label htmlFor="pl-title">Name</label>
            <input id="pl-title" type="text" maxLength={80} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="For example: Gondal in a day" />
            {error && <p className="field-error" role="alert">{error}</p>}
          </div>
          <div className="field">
            <label htmlFor="pl-desc">Description (optional)</label>
            <textarea id="pl-desc" rows="2" maxLength={300} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <label className="check"><input type="checkbox" checked={form.isPublic} onChange={(e) => setForm({ ...form, isPublic: e.target.checked })} /> Anyone with the link can view it</label>
          <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Creating...' : 'Create playlist'}</button>
        </form>
      </div></section>
    </>
  )
}
