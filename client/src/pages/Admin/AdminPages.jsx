import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Check, FilePenLine, X } from 'lucide-react'
import BarChart from '../../components/BarChart/BarChart'
import ContentManager from './ContentManager'
import SmartImage from '../../components/SmartImage/SmartImage'
import { StatusMark } from '../../components/Badge/Badge'
import { CardSkeleton } from '../../components/LoadingSkeleton/LoadingSkeleton'
import { ErrorState } from '../../components/States/States'
import { useApp } from '../../context/AppContext'
import { api } from '../../api/client'
import { useSocketEvent } from '../../hooks/useRealtime'
import { exploreItems } from '../../data'
import { CATEGORIES, categoryLabel } from '../../data/categories'
import { REVIEW_STATUSES } from '../../data/admin'
import { formatDate } from '../../utils/format'
import useDocumentTitle from '../../hooks/useDocumentTitle'

// Small hook: run an API call on mount, expose { data, setData, error, loading, reload }.
function useApiData(loader) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const load = useCallback(() => {
    setError(null)
    loader().then(setData).catch((e) => setError(e.message))
  }, [loader])
  useEffect(load, [load])
  return { data, setData, error, loading: !data && !error, reload: load }
}

const loadDashboard = () => Promise.all([api.admin.stats(), api.admin.contributions(), api.admin.analytics()])

export function Dashboard() {
  useDocumentTitle('Admin dashboard')
  const { data, error, reload, loading } = useApiData(loadDashboard)
  useSocketEvent('admin:refresh', reload)   // numbers update the moment something is submitted or reviewed
  if (error) return <ErrorState onRetry={reload} />
  if (loading) return <CardSkeleton count={3} />
  const [s, contributions, charts] = data
  const stats = [
    ['Total users', s.users, 'Registered accounts'],
    ['Heritage records', s.heritage, 'Published in the archive'],
    ['Villages', s.villages, 'With a village page'],
    ['Pending contributions', s.pending, 'Waiting for a reviewer'],
    ['Verified records', s.verified, 'Passed review'],
    ['Open reports', s.reports, 'Need attention'],
  ]
  return (
    <>
      <h1>Dashboard</h1>
      <p className="muted">What needs attention in the archive today.</p>
      <dl className="stat-grid">{stats.map(([k, v, n]) => <div key={k}><dt>{k}</dt><dd>{v}</dd><span className="meta">{n}</span></div>)}</dl>
      <h2 className="admin-h2">Activity</h2>
      <div className="chart-grid">
        <BarChart title="Submissions per month" data={charts.byMonth} orientation="vertical" />
        <BarChart title="Submissions by status" data={charts.byStatus} />
        <BarChart title="Heritage records per district" data={charts.byDistrict} />
        <BarChart title="Most documented villages" data={charts.topVillages} />
        <BarChart title="Records by category" data={charts.byCategory} format={categoryLabel} />
      </div>
      <h2 className="admin-h2">Recent submissions</h2>
      <table className="table"><thead><tr><th>Title</th><th>Contributor</th><th>Submitted</th><th>Status</th></tr></thead>
        <tbody>{contributions.slice(0, 5).map((c) => <tr key={c.id}><td data-label="Title"><Link className="text-link" to="/admin/contributions">{c.title}</Link></td><td data-label="Contributor">{c.contributor}</td><td data-label="Submitted">{formatDate(c.submitted, { day: 'numeric', month: 'short' })}</td><td data-label="Status"><StatusMark status={c.status} /></td></tr>)}</tbody></table>
    </>
  )
}

export function ContributionReview() {
  useDocumentTitle('Review contributions')
  const { showToast, refreshData } = useApp()
  const { data: list, setData: setList, error, loading, reload } = useApiData(api.admin.contributions)
  useSocketEvent('admin:refresh', reload)   // new submissions appear without refreshing
  const [filter, setFilter] = useState('All')
  const [openId, setOpenId] = useState(null)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  if (error) return <ErrorState onRetry={reload} />
  if (loading) return <CardSkeleton count={2} />

  const visible = list.filter((c) => filter === 'All' || c.status === filter)
  const current = list.find((c) => c.id === (openId ?? list[0]?.id))

  const act = async (status) => {
    setBusy(true)
    try {
      const updated = await api.admin.review(current.id, status, note)
      setList((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
      setNote('')
      showToast(status === 'Approved' ? 'Approved and published to the archive' : `Contribution marked as ${status.toLowerCase()}`)
      if (status === 'Approved') refreshData().catch(() => {}) // new record should appear on the public site
    } catch (err) { showToast(err.message) } finally { setBusy(false) }
  }

  return (
    <>
      <h1>Contributions</h1>
      <p className="muted">Check each submission against its sources. Only approved records become part of the verified archive.</p>
      <div className="tabs" role="tablist">{['All', ...REVIEW_STATUSES].map((s) => <button key={s} role="tab" aria-selected={filter === s} onClick={() => setFilter(s)}>{s}</button>)}</div>
      <div className="review-grid">
        <ul className="plain-list review-list" aria-label="Submissions">
          {visible.length === 0 && <li className="muted review-empty">Nothing with this status.</li>}
          {visible.map((c) => (
            <li key={c.id}><button type="button" className={current?.id === c.id ? 'is-sel' : ''} onClick={() => { setOpenId(c.id); setNote('') }}>
              <span className="review-title">{c.title}</span><span className="meta">{c.contributor}, {c.village}</span><StatusMark status={c.status} />
            </button></li>
          ))}
        </ul>
        {current ? (
          <article className="review-detail">
            <div className="row-between"><h2>{current.title}</h2><StatusMark status={current.status} /></div>
            <dl className="fact-list inline">
              <dt>Contributor</dt><dd>{current.contributor}</dd><dt>Village</dt><dd>{current.village}, {current.district}</dd>
              <dt>Submitted</dt><dd>{formatDate(current.submitted)}</dd><dt>Category</dt><dd>{current.category}</dd><dt>Period</dt><dd>{current.period}</dd>
            </dl>
            <h3>Description</h3><p>{current.description}</p>
            {current.images.length > 0 && <><h3>Images</h3><div className="review-images">{current.images.map((src, i) => <SmartImage key={i} src={src} alt={`Submitted image ${i + 1}`} ratio="4 / 3" />)}</div></>}
            <h3>Sources</h3><p>{current.sources || 'None given.'}</p>
            <h3>References</h3><p>{current.reference || 'None given.'}</p>
            {current.extra && <><h3>Additional information</h3><p>{current.extra}</p></>}
            {current.history?.length > 0 && (
              <>
                <h3>Review history</h3>
                <ol className="plain-list review-history">
                  {current.history.map((h) => <li key={h.id}><span className="meta">{h.actor === 'reviewer' ? 'Reviewer' : current.contributor}, {formatDate(h.date, { day: 'numeric', month: 'short' })} <StatusMark status={h.status} /></span>{h.note && <p>{h.note}</p>}</li>)}
                </ol>
              </>
            )}
            {current.status === 'Approved' ? (
              <p className="reviewer-note">Approved and published{current.heritageId ? <> as <Link className="text-link" to="/explore">a verified record</Link></> : ''}. Published records cannot be changed here.</p>
            ) : (
              <>
                <div className="field"><label htmlFor="note">Note to contributor</label><textarea id="note" rows="2" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Required when rejecting or requesting changes." /></div>
                <div className="review-actions">
                  <button className="btn btn-primary" disabled={busy} onClick={() => act('Approved')}><Check size={16} aria-hidden="true" /> Approve</button>
                  <button className="btn btn-secondary" disabled={busy} onClick={() => act('Changes Requested')}><FilePenLine size={16} aria-hidden="true" /> Request changes</button>
                  <button className="btn btn-danger" disabled={busy} onClick={() => act('Rejected')}><X size={16} aria-hidden="true" /> Reject</button>
                  <button className="btn btn-ghost" disabled={busy} onClick={() => act('Under Review')}>Mark under review</button>
                </div>
              </>
            )}
          </article>
        ) : <p className="muted">Select a submission to review.</p>}
      </div>
    </>
  )
}

export function ReportsAdmin() {
  useDocumentTitle('Reports')
  const { data: reports, setData, error, loading, reload } = useApiData(api.admin.reports)
  useSocketEvent('admin:refresh', reload)
  if (error) return <ErrorState onRetry={reload} />
  if (loading) return <CardSkeleton count={2} />
  const resolve = async (id) => {
    const updated = await api.admin.resolveReport(id)
    setData((prev) => prev.map((r) => (r.id === id ? updated : r)))
  }
  return (
    <>
      <h1>Reports</h1>
      <p className="muted">Problems flagged by readers. Resolve a report after checking the record.</p>
      <table className="table"><thead><tr><th>Record</th><th>Reason</th><th>Details</th><th>Reported by</th><th>Status</th><th><span className="sr-only">Action</span></th></tr></thead>
        <tbody>{reports.map((r) => <tr key={r.id}><td data-label="Record">{r.target}</td><td data-label="Reason">{r.reason}</td><td data-label="Details">{r.detail}</td><td data-label="Reported by">{r.reporter}<span className="meta note-line">{formatDate(r.date, { day: 'numeric', month: 'short' })}</span></td><td data-label="Status"><StatusMark status={r.status} /></td><td>{r.status === 'Open' && <button className="btn btn-secondary btn-sm" onClick={() => resolve(r.id)}>Resolve</button>}</td></tr>)}</tbody></table>
    </>
  )
}

// Members list with the power to suspend (and restore) an account.
function UsersAdmin() {
  const { showToast } = useApp()
  const { data: users, setData, error, loading, reload } = useApiData(api.admin.users)
  if (error) return <ErrorState onRetry={reload} />
  if (loading) return <CardSkeleton count={2} />
  const toggle = async (u) => {
    if (!u.banned && !window.confirm(`Suspend ${u.name}? They will be logged out and cannot post until restored.`)) return
    try {
      await api.admin.setBanned(u.id, !u.banned)
      setData((prev) => prev.map((x) => (x.id === u.id ? { ...x, banned: !u.banned } : x)))
      showToast(u.banned ? 'Account restored' : 'Account suspended')
    } catch (err) { showToast(err.message) }
  }
  return (
    <>
      <h1>Users</h1>
      <p className="muted">Suspended members are logged out immediately and cannot log in or post.</p>
      <table className="table"><thead><tr><th>Name</th><th>Email</th><th>Village</th><th>Level</th><th>Contributions</th><th>Status</th><th><span className="sr-only">Action</span></th></tr></thead>
        <tbody>{users.map((u) => (
          <tr key={u.id}><td data-label="Name">{u.name}</td><td data-label="Email">{u.email}</td><td data-label="Village">{u.village}</td><td data-label="Level">{u.role}</td><td data-label="Contributions">{u.contributions}</td>
            <td data-label="Status">{u.banned ? <span className="status st-rejected">Suspended</span> : 'Active'}</td>
            <td className="row-actions">{!u.isAdmin && <button className={`btn btn-sm ${u.banned ? 'btn-secondary' : 'btn-danger'}`} onClick={() => toggle(u)}>{u.banned ? 'Restore' : 'Suspend'}</button>}</td></tr>
        ))}</tbody></table>
    </>
  )
}

// Read-only lists for the remaining sections. Users come from the API; the others use the loaded public data.
export function TableAdmin() {
  const { section } = useParams()
  useDocumentTitle(`Admin ${section}`)
  if (section === 'users') return <UsersAdmin />
  if (['villages', 'heritage', 'events', 'oral-histories'].includes(section)) return <ContentManager key={section} resource={section} />

  const tables = {
    categories: { cols: ['Category', 'Records'], rows: CATEGORIES.map((c) => [c.label, exploreItems.filter((i) => i.category === c.id).length]) },
  }
  const t = tables[section]
  if (!t) return <><h1>Not found</h1><p className="muted">No admin section called “{section}”.</p></>
  return (
    <>
      <h1 style={{ textTransform: 'capitalize' }}>{section}</h1>
      <p className="muted">Read-only overview.</p>
      <table className="table"><thead><tr>{t.cols.map((c) => <th key={c}>{c}</th>)}</tr></thead><tbody>{t.rows.map((r, i) => <tr key={i}>{r.map((cell, j) => <td key={j} data-label={t.cols[j]}>{cell}</td>)}</tr>)}</tbody></table>
    </>
  )
}
