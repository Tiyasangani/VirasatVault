import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CheckCircle2, ImagePlus, ShieldCheck } from 'lucide-react'
import Button from '../../components/Button/Button'
import { CATEGORIES, PERIODS, DISTRICTS } from '../../data/categories'
import { villages } from '../../data'
import { StatusMark } from '../../components/Badge/Badge'
import { useApp } from '../../context/AppContext'
import { formatDate } from '../../utils/format'
import useDocumentTitle from '../../hooks/useDocumentTitle'

const EMPTY = { title: '', category: '', village: '', district: '', description: '', period: '', source: '', reference: '', extra: '' }
const LIMITS = { title: 90, description: 1500, extra: 600 }

function Field({ id, label, hint, error, children }) {
  return (
    <div className={`field ${error ? 'has-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {hint && <span className="hint">{hint}</span>}
      {children}
      {error && <p className="field-error" role="alert">{error}</p>}
    </div>
  )
}

export default function Contribution() {
  const { id } = useParams()                 // present on /contribute/:id/edit
  const editing = Boolean(id)
  useDocumentTitle(editing ? 'Edit your submission' : 'Share Your Heritage')
  const { addContribution, updateContribution, contributions, showToast, user, ready } = useApp()
  const target = editing ? contributions.find((c) => String(c.id) === id) : null
  const prefilled = useRef(false)
  const [existing, setExisting] = useState([])   // images already stored on the server (edit mode)
  const [message, setMessage] = useState('')
  const [rights, setRights] = useState(false)   // confirms the person may share this material
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [images, setImages] = useState([])   // { name, url }
  const [media, setMedia] = useState({ video: null, audio: null })
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  // Fill the form with the saved submission when editing.
  useEffect(() => {
    if (!target || prefilled.current) return
    prefilled.current = true
    setForm({
      title: target.title, description: target.description, period: target.period ?? '', source: target.sources ?? '',
      reference: target.reference ?? '', extra: target.extra ?? '', district: target.district,
      category: CATEGORIES.find((c) => c.label === target.category)?.id ?? '',
      village: villages.find((v) => v.name === target.village)?.slug ?? '',
    })
    setExisting(target.images)
    setRights(true)
  }, [target])

  useEffect(() => () => images.forEach((i) => URL.revokeObjectURL(i.url)), []) // eslint-disable-line

  const update = (key, value) => { setForm((f) => ({ ...f, [key]: value })); if (errors[key]) setErrors((e) => ({ ...e, [key]: '' })) }

  const onImages = (e) => {
    const files = Array.from(e.target.files).filter((f) => f.type.startsWith('image/'))
    if (existing.length + images.length + files.length > 6) { showToast('You can add up to 6 images'); return }
    setImages((prev) => [...prev, ...files.map((f) => ({ name: f.name, file: f, url: URL.createObjectURL(f) }))])
  }

  const validate = () => {
    const next = {}
    if (form.title.trim().length < 5) next.title = 'Give your contribution a clear title (at least 5 characters).'
    if (!form.category) next.category = 'Choose a category.'
    if (!form.village) next.village = 'Choose the village this belongs to.'
    if (!form.district) next.district = 'Choose a district.'
    if (form.description.trim().length < 50) next.description = `Describe it in at least 50 characters (${form.description.trim().length} so far).`
    if (!form.period) next.period = 'Choose the closest historical period.'
    if (!rights) next.rights = 'Please confirm you have the right to share this material.'
    if (!form.source.trim()) next.source = 'Tell us where this information comes from, even if it is a family memory.'
    return next
  }

  const submit = async (e) => {
    e.preventDefault()
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length) { document.querySelector('.has-error input, .has-error select, .has-error textarea')?.focus(); return }
    // Files and text go to the server together as multipart form data.
    const data = new FormData()
    Object.entries(form).forEach(([key, value]) => data.append(key, value))
    data.append('rights', 'true')
    images.forEach((i) => data.append('images', i.file))
    if (media.video) data.append('video', media.video)
    if (media.audio) data.append('audio', media.audio)
    setBusy(true)
    try {
      if (editing) {
        data.append('keepImages', JSON.stringify(existing))
        data.append('message', message)
        await updateContribution(id, data)
      } else {
        await addContribution(data)
      }
      setDone(true)
    } catch (err) {
      setErrors({ ...err.fields, form: err.message })
    } finally { setBusy(false) }
  }

  if (!ready) return null
  if (!user) {
    return (
      <section className="section"><div className="container narrow state">
        <ShieldCheck size={40} strokeWidth={1.3} aria-hidden="true" />
        <h1>Log in to share your heritage</h1>
        <p>Contributions are linked to your account so reviewers can contact you and you can track the result.</p>
        <div className="inline-actions"><Button to="/login">Login</Button><Button to="/register" variant="secondary">Create account</Button></div>
      </div></section>
    )
  }
  if (editing && !target) {
    return <section className="section"><div className="container narrow state"><h1>We could not find that submission</h1><p>It may belong to another account.</p><Button to="/profile">Back to my profile</Button></div></section>
  }
  if (editing && target.status !== 'Changes Requested' && !done) {
    return <section className="section"><div className="container narrow state"><h1>This submission cannot be edited</h1><p>Only submissions where a reviewer requested changes can be edited. Current status: <StatusMark status={target.status} /></p><Button to="/profile">Back to my profile</Button></div></section>
  }
  if (done) {
    return (
      <section className="section"><div className="container narrow state">
        <CheckCircle2 size={40} strokeWidth={1.3} aria-hidden="true" />
        <h1>{editing ? 'Thank you. Your changes were sent back for review.' : 'Thank you. Your contribution is in the review queue.'}</h1>
        <p>A reviewer will check it against your sources. You will get a notification when it is approved or when changes are needed.</p>
        <div className="inline-actions"><Button to="/profile">View my contributions</Button><Button variant="secondary" onClick={() => { setForm(EMPTY); setImages([]); setDone(false) }}>Add another</Button></div>
      </div></section>
    )
  }

  return (
    <>
      <section className="page-head"><div className="container"><h1>{editing ? 'Edit your submission' : 'Share Your Heritage'}</h1><p>{editing ? 'A reviewer asked for changes. Update the details below and send it back for review.' : 'Add a place, story, photograph, tradition or recording. Tell us where it comes from so reviewers can check it.'}</p></div></section>
      <section className="section-tight">
        <div className="container contribute-grid">
          <form onSubmit={submit} noValidate className="contribute-form">
            {errors.form && <p className="form-alert" role="alert">{errors.form}</p>}
            {editing && target.history?.length > 0 && (
              <section className="review-history" aria-label="Review history">
                <h2 className="label">Review history</h2>
                <ol className="plain-list">
                  {target.history.map((h) => (
                    <li key={h.id}>
                      <span className="meta">{h.actor === 'reviewer' ? 'Reviewer' : 'You'}, {formatDate(h.date, { day: 'numeric', month: 'short', year: 'numeric' })} <StatusMark status={h.status} /></span>
                      {h.note && <p>{h.note}</p>}
                    </li>
                  ))}
                </ol>
              </section>
            )}
            <Field id="title" error={errors.title} label="Title"><input id="title" type="text" maxLength={LIMITS.title} value={form.title} onChange={(e) => update('title', e.target.value)} aria-invalid={!!errors.title} /><span className="count">{form.title.length}/{LIMITS.title}</span></Field>
            <div className="field-row">
              <Field id="category" error={errors.category} label="Category"><select id="category" value={form.category} onChange={(e) => update('category', e.target.value)}><option value="">Select</option>{CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</select></Field>
              <Field id="period" error={errors.period} label="Historical period"><select id="period" value={form.period} onChange={(e) => update('period', e.target.value)}><option value="">Select</option>{PERIODS.map((p) => <option key={p}>{p}</option>)}</select></Field>
            </div>
            <div className="field-row">
              <Field id="village" error={errors.village} label="Village"><select id="village" value={form.village} onChange={(e) => update('village', e.target.value)}><option value="">Select</option>{villages.map((v) => <option key={v.id} value={v.slug}>{v.name}</option>)}</select></Field>
              <Field id="district" error={errors.district} label="District"><select id="district" value={form.district} onChange={(e) => update('district', e.target.value)}><option value="">Select</option>{DISTRICTS.map((d) => <option key={d}>{d}</option>)}</select></Field>
            </div>
            <Field id="description" error={errors.description} label="Description" hint="What is it, what do you know about its history, and who remembers it?">
              <textarea id="description" rows="7" maxLength={LIMITS.description} value={form.description} onChange={(e) => update('description', e.target.value)} aria-invalid={!!errors.description} />
              <span className="count">{form.description.length}/{LIMITS.description}</span>
            </Field>

            <div className="field">
              <span className="field-label">Images</span>
              <span className="hint">Up to 6 photographs. Old photographs are especially welcome.</span>
              <label htmlFor="images" className="upload"><ImagePlus size={20} aria-hidden="true" /> Choose images</label>
              <input id="images" className="sr-only" type="file" accept="image/*" multiple onChange={onImages} />
              {(existing.length > 0 || images.length > 0) && (
                <ul className="previews">
                  {existing.map((src, i) => (
                    <li key={src}><img src={src} alt={`Saved photograph ${i + 1}`} /><button type="button" className="text-link" onClick={() => setExisting((p) => p.filter((x) => x !== src))}>Remove</button></li>
                  ))}{images.map((img, i) => (
                  <li key={img.url}><img src={img.url} alt={`Preview of ${img.name}`} /><button type="button" className="text-link" onClick={() => setImages((p) => p.filter((_, x) => x !== i))}>Remove</button></li>
                ))}</ul>
              )}
            </div>
            <div className="field-row">
              <div className="field"><label htmlFor="video">Video (optional)</label><input id="video" type="file" accept="video/*" onChange={(e) => setMedia((m) => ({ ...m, video: e.target.files[0] ?? null }))} />{media.video && <span className="hint">Selected: {media.video.name}</span>}</div>
              <div className="field"><label htmlFor="audio">Audio (optional)</label><input id="audio" type="file" accept="audio/*" onChange={(e) => setMedia((m) => ({ ...m, audio: e.target.files[0] ?? null }))} />{media.audio && <span className="hint">Selected: {media.audio.name}</span>}</div>
            </div>

            <Field id="source" error={errors.source} label="Historical source" hint="A book, document, person you interviewed, or your own family memory."><input id="source" type="text" value={form.source} onChange={(e) => update('source', e.target.value)} aria-invalid={!!errors.source} /></Field>
            <Field id="reference" error={errors.reference} label="Reference (optional)" hint="A link, library catalogue number or page."><input id="reference" type="text" value={form.reference} onChange={(e) => update('reference', e.target.value)} /></Field>
            <Field id="extra" error={errors.extra} label="Additional information (optional)"><textarea id="extra" rows="3" maxLength={LIMITS.extra} value={form.extra} onChange={(e) => update('extra', e.target.value)} /><span className="count">{form.extra.length}/{LIMITS.extra}</span></Field>

            <div className={`field ${errors.rights ? 'has-error' : ''}`}>
              <label className="check"><input type="checkbox" checked={rights} onChange={(e) => { setRights(e.target.checked); setErrors((x) => ({ ...x, rights: '' })) }} /> <span>I took these photographs or wrote this, or I have permission to share them, and I agree to the <Link to="/terms" className="text-link">Terms of Use</Link>.</span></label>
              {errors.rights && <p className="field-error" role="alert">{errors.rights}</p>}
            </div>
            {editing && (
              <div className="field"><label htmlFor="message">Note to the reviewer (optional)</label><textarea id="message" rows="2" maxLength={500} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Explain what you changed." /></div>
            )}
            <div className="form-actions">
              {editing ? <Button variant="ghost" to="/profile">Cancel</Button> : <Button variant="ghost" onClick={() => { setForm(EMPTY); setErrors({}) }}>Clear form</Button>}
              <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Sending...' : editing ? 'Resubmit for review' : 'Submit for review'}</button>
            </div>
          </form>

          <aside className="review-note">
            <ShieldCheck size={26} strokeWidth={1.4} aria-hidden="true" />
            <p className="review-lead">Your submission will be reviewed before becoming part of the verified heritage archive.</p>
            <ol className="plain-list review-steps">
              <li><strong>Submitted.</strong> Your entry waits in the queue.</li>
              <li><strong>Under review.</strong> A reviewer checks the sources.</li>
              <li><strong>Decision.</strong> Approved, changes requested, or rejected with a reason.</li>
            </ol>
            <p className="meta">You can follow the result from your <Link to="/profile" className="text-link">profile</Link> and in your notifications.</p>
          </aside>
        </div>
      </section>
    </>
  )
}
