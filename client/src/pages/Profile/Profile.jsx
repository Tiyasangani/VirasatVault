import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Award } from 'lucide-react'
import HeritageCard from '../../components/HeritageCard/HeritageCard'
import StoryCard from '../../components/StoryCard/StoryCard'
import { StatusMark } from '../../components/Badge/Badge'
import { EmptyState } from '../../components/States/States'
import { useApp } from '../../context/AppContext'
import { exploreItems, stories } from '../../data'
import { BADGES } from '../../data/admin'
import { formatDate } from '../../utils/format'
import useDocumentTitle from '../../hooks/useDocumentTitle'

const TABS = ['Contributions', 'Saved heritage', 'Liked stories', 'Badges']

export default function Profile() {
  useDocumentTitle('My profile')
  const { user, ready, contributions, bookmarks, likes, deleteAccount } = useApp()
  const [deleting, setDeleting] = useState(false)
  const [password, setPassword] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [tab, setTab] = useState(TABS[0])
  if (!ready) return null
  if (!user) return <Navigate to="/login" replace />

  const mine = contributions
  const approvedCount = user.approved
  const nextBadge = BADGES.find((b) => b.points > user.points)
  const earned = BADGES.filter((b) => b.points <= user.points)
  const top = earned[earned.length - 1]
  const saved = exploreItems.filter((i) => i.kind === 'heritage' && bookmarks.places.includes(i.id))
  const liked = stories.filter((s) => likes.includes(s.id))

  return (
    <>
      <section className="page-head profile-head">
        <div className="container profile-row">
          <div className="avatar" aria-hidden="true">{user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}</div>
          <div>
            <h1>{user.name}</h1>
            <p className="meta">{user.village}, {user.district} District. {user.email}</p>
            <p className="profile-title"><Award size={17} aria-hidden="true" /> {top?.name ?? 'New member'}</p>
          </div>
          <dl className="profile-stats">
            <div><dt>Approved</dt><dd>{approvedCount}</dd></div>
            <div><dt>Pending</dt><dd>{mine.filter((c) => c.status === 'Pending' || c.status === 'Under Review').length}</dd></div>
            <div><dt>Points</dt><dd>{user.points}</dd></div>
          </dl>
        </div>
      </section>
      <section className="section-tight"><div className="container">
        <p className="profile-line"><strong>{approvedCount} Approved Contributions.</strong> {nextBadge ? `${nextBadge.points - user.points} more points to earn ${nextBadge.name}.` : 'You have earned every badge.'}</p>
        <div className="tabs" role="tablist">{TABS.map((t) => <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}>{t}</button>)}</div>
        <div className="tab-panel">
          {tab === 'Contributions' && (mine.length ? (
            <table className="table"><thead><tr><th>Title</th><th>Category</th><th>Submitted</th><th>Status</th></tr></thead>
              <tbody>{mine.map((c) => <tr key={c.id}><td data-label="Title">{c.title}{c.adminNote && <span className="meta note-line">Reviewer note: {c.adminNote}</span>}
                {c.status === 'Changes Requested' && <Link className="btn btn-secondary btn-sm note-line" to={`/contribute/${c.id}/edit`}>Edit and resubmit</Link>}</td><td data-label="Category">{c.category}</td><td data-label="Submitted">{formatDate(c.submitted, { day: 'numeric', month: 'short', year: 'numeric' })}</td><td data-label="Status"><StatusMark status={c.status} /></td></tr>)}</tbody></table>
          ) : <EmptyState title="No contributions yet." text="Share your first story, photograph or place." />)}
          {tab === 'Saved heritage' && (saved.length ? <div className="grid-cards">{saved.map((i) => <HeritageCard key={i.id} item={i} />)}</div> : <EmptyState title="Nothing saved yet." text="Use the bookmark on any record to keep it here." action={<Link to="/explore" className="btn btn-secondary">Explore heritage</Link>} />)}
          {tab === 'Liked stories' && (liked.length ? <div className="grid-cards">{liked.map((s) => <StoryCard key={s.id} story={s} />)}</div> : <EmptyState title="No liked stories." text="Stories you like will appear here." action={<Link to="/stories" className="btn btn-secondary">Read stories</Link>} />)}
          {tab === 'Badges' && (
            <ul className="badge-list">{BADGES.map((b) => { const got = b.points <= user.points; return <li key={b.name} className={got ? 'is-earned' : ''}><Award size={22} aria-hidden="true" /><div><h3 className="card-title">{b.name}</h3><p className="card-text">{b.text}. Needs {b.points} points.</p><p className="meta">{got ? 'Earned' : 'Not yet earned'}</p></div></li> })}</ul>
          )}
        </div>
        {user.role !== 'admin' && (
          <section className="danger-zone" aria-label="Delete account">
            <h2>Delete my account</h2>
            <p className="muted">This removes your likes, saved items, reviews and notifications, and takes your name off anything you published. It cannot be undone.</p>
            {!deleting ? <button className="btn btn-danger" onClick={() => setDeleting(true)}>Delete my account</button> : (
              <form className="delete-form" onSubmit={async (e) => { e.preventDefault(); setDeleteError(''); try { await deleteAccount(password) } catch (err) { setDeleteError(err.fields?.password ?? err.message) } }}>
                <div className={`field ${deleteError ? 'has-error' : ''}`}>
                  <label htmlFor="delete-password">Enter your password to confirm</label>
                  <input id="delete-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
                  {deleteError && <p className="field-error" role="alert">{deleteError}</p>}
                </div>
                <div className="form-actions"><button type="button" className="btn btn-ghost" onClick={() => { setDeleting(false); setPassword(''); setDeleteError('') }}>Cancel</button><button type="submit" className="btn btn-danger" disabled={!password}>Permanently delete</button></div>
              </form>
            )}
          </section>
        )}
      </div></section>
    </>
  )
}
