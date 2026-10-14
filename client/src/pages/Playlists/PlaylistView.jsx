import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowDown, ArrowUp, Copy, Globe, Lock, Play, Trash2, X } from 'lucide-react'
import { api } from '../../api/client'
import { useApp } from '../../context/AppContext'
import SmartImage from '../../components/SmartImage/SmartImage'
import PlaylistPlayer from '../../components/AudioPlayer/PlaylistPlayer'
import { EmptyState } from '../../components/States/States'
import { resolveItem } from '../../utils/playlist'
import { villageName } from '../../data'
import NotFound from '../NotFound/NotFound'
import useDocumentTitle from '../../hooks/useDocumentTitle'

// Opens a playlist by its share code. Owners can edit it; everyone else sees it read-only.
export default function PlaylistView() {
  const { code } = useParams()
  const navigate = useNavigate()
  const { user, refreshPlaylists, showToast, dataVersion } = useApp()
  const [list, setList] = useState(null)
  const [missing, setMissing] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({ title: '', description: '' })
  const [playing, setPlaying] = useState(false)
  useDocumentTitle(list?.title)
  void dataVersion

  const load = useCallback(() => api.sharedPlaylist(code).then(setList).catch(() => setMissing(true)), [code])
  useEffect(() => { setList(null); setMissing(false); load() }, [load, user?.id])

  if (missing) return <NotFound />
  if (!list) return <section className="section container"><p className="muted">Loading...</p></section>

  const items = list.itemIds.map((id) => ({ id, item: resolveItem(id) }))
  const tracks = items.map((i) => i.item?.story).filter(Boolean)
  const url = `${window.location.origin}/playlists/${list.code}`

  // Shows the change at once, then saves; if saving fails the screen goes back to how it was.
  const save = async (patch) => {
    const before = list
    setList((l) => ({ ...l, ...patch }))
    try { const updated = await api.updatePlaylist(list.id, patch); setList((l) => ({ ...l, ...updated })); refreshPlaylists(); return true } catch (err) { setList(before); showToast(err.fields?.title ?? err.message); return false }
  }
  const move = async (index, delta) => {
    const ids = [...list.itemIds]; const to = index + delta
    if (to < 0 || to >= ids.length) return
    ;[ids[index], ids[to]] = [ids[to], ids[index]]
    const before = list.itemIds
    setList((l) => ({ ...l, itemIds: ids }))
    try { await api.reorderPlaylist(list.id, ids); refreshPlaylists() } catch (err) { setList((l) => ({ ...l, itemIds: before })); showToast(err.message) }
  }
  const remove = async (id) => {
    try { const { itemIds } = await api.removeFromPlaylist(list.id, id); setList((l) => ({ ...l, itemIds })); refreshPlaylists() } catch (err) { showToast(err.message) }
  }
  const destroy = async () => {
    if (!window.confirm(`Delete the playlist “${list.title}”? The records in it are not affected.`)) return
    try { await api.deletePlaylist(list.id); await refreshPlaylists(); showToast('Playlist deleted'); navigate('/playlists') } catch (err) { showToast(err.message) }
  }
  const copyLink = async () => { try { await navigator.clipboard.writeText(url); showToast('Link copied') } catch { showToast(url) } }
  const saveCopy = async () => {
    if (!user) { showToast('Log in to save a copy'); return }
    try { const copy = await api.copyPlaylist(list.code); await refreshPlaylists(); showToast('Saved to your playlists'); navigate(`/playlists/${copy.code}`) } catch (err) { showToast(err.message) }
  }

  return (
    <>
      <section className="page-head">
        <div className="container">
          <p className="breadcrumb">{list.isOwner ? <Link to="/playlists">My playlists</Link> : 'Playlist'} / {list.title}</p>
          {editing ? (
            <form className="pl-edit" onSubmit={async (e) => { e.preventDefault(); if (await save(draft)) setEditing(false) }}>
              <div className="field"><label htmlFor="pl-edit-title">Name</label><input id="pl-edit-title" type="text" maxLength={80} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></div>
              <div className="field"><label htmlFor="pl-edit-desc">Description</label><textarea id="pl-edit-desc" rows="2" maxLength={300} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></div>
              <div className="form-actions pl-actions"><button type="submit" className="btn btn-primary btn-sm">Save</button><button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button></div>
            </form>
          ) : (
            <>
              <h1>{list.title}</h1>
              {list.description && <p>{list.description}</p>}
            </>
          )}
          <p className="meta with-icon">{list.isPublic ? <Globe size={13} aria-hidden="true" /> : <Lock size={13} aria-hidden="true" />} {list.isPublic ? 'Public' : 'Private'}, {items.length} item{items.length === 1 ? '' : 's'}{!list.isOwner && <>, by {list.owner}</>}</p>
          <div className="pl-toolbar">
            {tracks.length > 0 && <button className="btn btn-primary btn-sm" onClick={() => setPlaying(true)}><Play size={15} aria-hidden="true" /> Play all recordings ({tracks.length})</button>}
            {list.isPublic && <button className="btn btn-secondary btn-sm" onClick={copyLink}><Copy size={15} aria-hidden="true" /> Copy link</button>}
            {list.isOwner ? (
              <>
                <button className="btn btn-secondary btn-sm" onClick={() => { setDraft({ title: list.title, description: list.description }); setEditing(true) }}>Rename</button>
                <label className="check pl-public"><input type="checkbox" checked={list.isPublic} onChange={(e) => save({ isPublic: e.target.checked })} /> Anyone with the link can view</label>
                <button className="btn btn-danger btn-sm" onClick={destroy}><Trash2 size={15} aria-hidden="true" /> Delete</button>
              </>
            ) : <button className="btn btn-secondary btn-sm" onClick={saveCopy}>Save a copy to my playlists</button>}
          </div>
        </div>
      </section>

      <section className="section-tight"><div className="container narrow">
        {playing && tracks.length > 0 && <PlaylistPlayer tracks={tracks} onClose={() => setPlaying(false)} />}
        {items.length === 0 ? <EmptyState title="This playlist is empty." text={list.isOwner ? 'Open any record, story, event or recording and use its Playlist button to add it here.' : 'The owner has not added anything yet.'} action={list.isOwner ? <Link to="/explore" className="btn btn-secondary">Explore heritage</Link> : <span />} /> : (
          <ol className="pl-items">
            {items.map(({ id, item }, index) => (
              <li key={id}>
                <span className="pl-num">{index + 1}</span>
                {item ? (
                  <>
                    <Link to={item.href} className="pl-thumb" aria-label={item.title}><SmartImage src={item.image} alt="" ratio="1 / 1" /></Link>
                    <div className="pl-info">
                      <p className="meta">{item.label}{item.village ? `, ${villageName(item.village)}` : ''}</p>
                      <h2 className="card-title"><Link to={item.href}>{item.title}</Link></h2>
                      {item.sub && <p className="card-text clamp-2">{item.sub}</p>}
                    </div>
                  </>
                ) : <div className="pl-info"><p className="muted">This item is no longer available.</p></div>}
                {list.isOwner && (
                  <div className="pl-controls">
                    <button className="icon-btn" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Move ${item?.title ?? 'item'} up`}><ArrowUp size={17} /></button>
                    <button className="icon-btn" onClick={() => move(index, 1)} disabled={index === items.length - 1} aria-label={`Move ${item?.title ?? 'item'} down`}><ArrowDown size={17} /></button>
                    <button className="icon-btn" onClick={() => remove(id)} aria-label={`Remove ${item?.title ?? 'item'}`}><X size={17} /></button>
                  </div>
                )}
              </li>
            ))}
          </ol>
        )}
      </div></section>
    </>
  )
}
