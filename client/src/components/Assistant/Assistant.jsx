import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpenText, Send, X } from 'lucide-react'
import { SUGGESTIONS } from '../../data/assistantAnswers'
import { api } from '../../api/client'

// "Ask VirasatVault": styled like a reference-desk ledger, not a chat app.
export default function Assistant({ onClose }) {
  const [entries, setEntries] = useState([])
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const endRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }) }, [entries, busy])

  const ask = (question) => {
    const q = question.trim()
    if (!q || busy) return
    setText('')
    setBusy(true)
    api.ask(q)
      .then((reply) => setEntries((prev) => [...prev, { q, ...reply }]))
      .catch((err) => setEntries((prev) => [...prev, { q, text: err.message, refs: [] }]))
      .finally(() => setBusy(false))
  }

  return (
    <section className="assistant" aria-label="Ask VirasatVault">
      <div className="assistant-head">
        <div>
          <h2 className="assistant-title"><BookOpenText size={20} aria-hidden="true" /> Ask VirasatVault</h2>
          <p className="meta">Answers come from archive records and link back to them.</p>
        </div>
        {onClose && <button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><X size={20} /></button>}
      </div>

      <div className="assistant-log" aria-live="polite">
        {entries.length === 0 && (
          <div className="assistant-intro">
            <p>Ask about a village, a place or a tradition. Try one of these:</p>
            <ul className="plain-list">
              {SUGGESTIONS.map((s) => <li key={s}><button type="button" className="suggest" onClick={() => ask(s)}>{s}</button></li>)}
            </ul>
          </div>
        )}
        {entries.map((e, i) => (
          <article key={i} className="ledger-entry">
            <h3 className="ledger-q">{e.q}</h3>
            <p>{e.text}</p>
            {e.refs.length > 0 && (
              <div className="ledger-refs">
                <p className="label">From the archive</p>
                <ul className="plain-list">{e.refs.map((r) => <li key={r.href + r.title}><Link to={r.href} onClick={onClose}>{r.title}</Link></li>)}</ul>
              </div>
            )}
          </article>
        ))}
        {busy && <p className="meta ledger-wait">Looking through the archive...</p>}
        <div ref={endRef} />
      </div>

      <form className="assistant-form" onSubmit={(ev) => { ev.preventDefault(); ask(text) }}>
        <label htmlFor="ask-input" className="sr-only">Your question</label>
        <input id="ask-input" value={text} onChange={(e) => setText(e.target.value)} placeholder="What would you like to know?" maxLength={160} />
        <button type="submit" className="btn btn-primary btn-sm" disabled={!text.trim() || busy}><Send size={15} aria-hidden="true" /> Ask</button>
      </form>
    </section>
  )
}
