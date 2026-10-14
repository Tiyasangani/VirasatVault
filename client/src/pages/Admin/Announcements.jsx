import { useCallback, useEffect, useState } from 'react'
import { Megaphone, BellRing } from 'lucide-react'
import { api } from '../../api/client'
import { useApp } from '../../context/AppContext'
import { DISTRICTS } from '../../data/categories'
import { formatDate } from '../../utils/format'
import useDocumentTitle from '../../hooks/useDocumentTitle'

export default function Announcements() {
  useDocumentTitle('Announcements')
  const { showToast } = useApp()
  const [message, setMessage] = useState('')
  const [audience, setAudience] = useState('all')
  const [district, setDistrict] = useState(DISTRICTS[0])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [history, setHistory] = useState([])

  const loadHistory = useCallback(() => api.admin.broadcasts().then(setHistory).catch(() => {}), [])
  useEffect(() => { loadHistory() }, [loadHistory])

  const send = async (e) => {
    e.preventDefault()
    setError('')
    if (message.trim().length < 5) { setError('Write at least a short sentence.'); return }
    setBusy(true)
    try {
      const { recipients } = await api.admin.sendBroadcast({ message, audience, district: audience === 'district' ? district : undefined })
      showToast(`Sent to ${recipients} ${recipients === 1 ? 'person' : 'people'}`)
      setMessage(''); loadHistory()
    } catch (err) { setError(err.fields?.message ?? err.fields?.district ?? err.message) } finally { setBusy(false) }
  }

  const runReminders = async () => {
    try { const { sent } = await api.admin.runReminders(); showToast(sent ? `Sent ${sent} event reminder${sent === 1 ? '' : 's'}` : 'No new reminders were due') } catch (err) { showToast(err.message) }
  }

  return (
    <>
      <h1>Announcements</h1>
      <p className="muted">Messages appear instantly in each member’s notifications, even while they are browsing.</p>

      <form className="announce-form" onSubmit={send} noValidate>
        <div className={`field ${error ? 'has-error' : ''}`}>
          <label htmlFor="announce-message">Message</label>
          <textarea id="announce-message" rows="3" maxLength={300} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="For example: Heritage walk this Sunday at 8 am, everyone is welcome." />
          <div className="field-foot">{error ? <p className="field-error" role="alert">{error}</p> : <span />}<span className="count">{message.length}/300</span></div>
        </div>
        <fieldset className="audience">
          <legend className="label">Send to</legend>
          <label className="check"><input type="radio" name="audience" checked={audience === 'all'} onChange={() => setAudience('all')} /> All members</label>
          <label className="check"><input type="radio" name="audience" checked={audience === 'district'} onChange={() => setAudience('district')} /> Members in one district</label>
          {audience === 'district' && (
            <select aria-label="District" value={district} onChange={(e) => setDistrict(e.target.value)}>{DISTRICTS.map((d) => <option key={d}>{d}</option>)}</select>
          )}
        </fieldset>
        <button type="submit" className="btn btn-primary" disabled={busy}><Megaphone size={16} aria-hidden="true" /> {busy ? 'Sending...' : 'Send announcement'}</button>
      </form>

      <h2 className="admin-h2">Event reminders</h2>
      <p className="muted">Members are reminded automatically when an event in their district (or one they saved) is 1 to 3 days away, on the day it starts, and while a multi-day event is on. Each reminder is sent once. The check runs every 15 minutes.</p>
      <button className="btn btn-secondary" onClick={runReminders}><BellRing size={16} aria-hidden="true" /> Check for reminders now</button>

      <h2 className="admin-h2">Sent announcements</h2>
      {history.length === 0 ? <p className="muted">Nothing sent yet.</p> : (
        <ul className="plain-list sent-list">
          {history.map((b) => (
            <li key={b.id}>
              <p>{b.message}</p>
              <p className="meta">{formatDate(b.date, { day: 'numeric', month: 'short', year: 'numeric' })}, {b.audience === 'all' ? 'all members' : `${b.district} district`}, {b.recipients} recipient{b.recipients === 1 ? '' : 's'}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
