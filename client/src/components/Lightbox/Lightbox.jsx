import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Copy, ExternalLink, Info, X } from 'lucide-react'
import SmartImage from '../SmartImage/SmartImage'
import { getImageInfo } from '../../data/imageDetails'

const LightboxContext = createContext({ openLightbox: () => {} })
export const useLightbox = () => useContext(LightboxContext)

// items: [{ src, ctx }]  ctx = { title, village, district, kind, href, index, total, appearsIn }
export function LightboxProvider({ children }) {
  const [state, setState] = useState(null)   // { items, index } or null
  const openLightbox = useCallback((items, index = 0) => {
    if (items?.length) setState({ items, index: Math.min(Math.max(index, 0), items.length - 1) })
  }, [])
  const close = useCallback(() => setState(null), [])
  const value = useMemo(() => ({ openLightbox }), [openLightbox])
  return (
    <LightboxContext.Provider value={value}>
      {children}
      {state && <LightboxView items={state.items} start={state.index} onClose={close} />}
    </LightboxContext.Provider>
  )
}

function Section({ title, children }) {
  return <section className="lb-sec"><h3>{title}</h3>{children}</section>
}

function LightboxView({ items, start, onClose }) {
  const [index, setIndex] = useState(start)
  const [copied, setCopied] = useState(false)
  const [panelOpen, setPanelOpen] = useState(true)
  const dialogRef = useRef(null)
  const item = items[index]
  const info = useMemo(() => getImageInfo(item.src, item.ctx), [item])
  const many = items.length > 1

  const go = useCallback((step) => setIndex((i) => (i + step + items.length) % items.length), [items.length])

  useEffect(() => {
    const previous = document.activeElement
    dialogRef.current?.focus()
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight' && items.length > 1) go(1)
      else if (e.key === 'ArrowLeft' && items.length > 1) go(-1)
      else if (e.key === 'Tab') {   // keep keyboard focus inside the viewer
        const focusable = dialogRef.current?.querySelectorAll('a[href], button:not([disabled])')
        if (!focusable?.length) return
        const first = focusable[0]; const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; previous?.focus?.() }
  }, [go, items.length, onClose])

  const copyCaption = async () => {
    const text = `${info.heading}. ${info.caption}${info.place ? ` (${info.place})` : ''}. ${info.credit}`
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch { setCopied(false) }
  }

  const appears = info.context?.appearsIn
  return (
    <div className="lb-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="lb" role="dialog" aria-modal="true" aria-label={`Photograph details: ${info.heading}`} tabIndex={-1} ref={dialogRef}>
        <div className="lb-bar">
          <span className="lb-count" aria-live="polite">{many ? `${index + 1} of ${items.length}` : 'Photograph'}</span>
          <div className="lb-bar-actions">
            <button type="button" className="icon-btn lb-btn" onClick={() => setPanelOpen((o) => !o)} aria-pressed={panelOpen}><Info size={18} aria-hidden="true" /><span>Details</span></button>
            <button type="button" className="icon-btn lb-btn" onClick={onClose} aria-label="Close viewer"><X size={20} aria-hidden="true" /></button>
          </div>
        </div>
        <div className={`lb-body ${panelOpen ? '' : 'lb-body-wide'}`}>
          <div className="lb-stage">
            {many && <button type="button" className="lb-nav lb-prev" onClick={() => go(-1)} aria-label="Previous photograph"><ChevronLeft size={26} aria-hidden="true" /></button>}
            <SmartImage key={item.src} src={item.src} alt={info.alt} ratio="auto" className="lb-img" eager style={{ aspectRatio: 'auto' }} />
            {many && <button type="button" className="lb-nav lb-next" onClick={() => go(1)} aria-label="Next photograph"><ChevronRight size={26} aria-hidden="true" /></button>}
          </div>
          {panelOpen && (
            <aside className="lb-panel" aria-label="Photograph details">
              <p className="lb-kind">{info.subjectLabel}</p>
              <h2 className="lb-title">{info.heading}</h2>
              <p className="lb-caption">{info.caption}</p>
              {info.place && <p className="meta lb-place">{info.place}</p>}
              <Section title="About this photograph">{info.description.map((p, i) => <p key={i}>{p}</p>)}</Section>
              {info.lookFor?.length > 0 && <Section title="What to look for"><ul>{info.lookFor.map((l) => <li key={l}>{l}</li>)}</ul></Section>}
              {info.why && <Section title="Why it matters"><p>{info.why}</p></Section>}
              {info.howToDocument && <Section title="How to document it"><p>{info.howToDocument}</p>{info.season && <p className="meta">{info.season}</p>}</Section>}
              {info.tags?.length > 0 && <ul className="lb-tags" aria-label="Tags">{info.tags.map((t) => <li key={t}>{t}</li>)}</ul>}
              {Array.isArray(appears) && appears.length > 0 ? (
                <Section title="Appears in"><ul className="lb-links">{appears.map((a) => <li key={a.href}><Link to={a.href} onClick={onClose}>{a.label}</Link><span className="meta"> {a.kind}</span></li>)}</ul></Section>
              ) : info.context?.href ? (
                <p className="lb-links-one"><Link className="text-link" to={info.context.href} onClick={onClose}>Open {info.context.kind ? info.context.kind.toLowerCase() : 'page'}</Link></p>
              ) : null}
              <p className="meta lb-credit">{info.credit}</p>
              <div className="lb-actions">
                <button type="button" className="btn btn-secondary btn-sm" onClick={copyCaption}><Copy size={15} aria-hidden="true" /> {copied ? 'Caption copied' : 'Copy caption'}</button>
                <a className="btn btn-secondary btn-sm" href={info.src} target="_blank" rel="noreferrer"><ExternalLink size={15} aria-hidden="true" /> Open original</a>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}
