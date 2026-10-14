import { useState } from 'react'
import { Pencil, Plus, Trash2, Upload } from 'lucide-react'
import { api, fileSrc } from '../../api/client'
import { useApp } from '../../context/AppContext'
import { villages, heritage, events, oralHistories, recordsInVillage } from '../../data'
import { CATEGORIES, DISTRICTS, PERIODS, HERITAGE_TYPES, MAP_TYPES, EVENT_CATEGORIES } from '../../data/categories'
import { formatDate, formatDuration } from '../../utils/format'
import { EmptyState } from '../../components/States/States'
import useDocumentTitle from '../../hooks/useDocumentTitle'

// ---- helpers that turn a textarea into a list and back ----
const split = (text, sep) => text.split(sep).map((t) => t.trim()).filter(Boolean)
const pairsOf = (a, b) => ({
  parse: (text) => split(text, '\n').map((line) => { const [x, ...rest] = line.split('|'); return { [a]: x.trim(), [b]: rest.join('|').trim() } }),
  stringify: (list = []) => list.map((i) => `${i[a]} | ${i[b] ?? ''}`).join('\n'),
})
const FORMATS = {
  paragraphs: { parse: (t) => split(t, /\n\s*\n/), stringify: (l = []) => l.join('\n\n'), hint: 'Separate paragraphs with a blank line.' },
  lines: { parse: (t) => split(t, '\n'), stringify: (l = []) => l.join('\n'), hint: 'One item per line.' },
  people: { ...pairsOf('name', 'note'), hint: 'One per line, written as: Name | short note' },
  timeline: { ...pairsOf('year', 'text'), hint: 'One per line, written as: 1900 | what happened' },
  sources: { ...pairsOf('title', 'type'), hint: 'One per line, written as: Source title | type (Printed source, Oral testimony...)' },
}

const villageOptions = () => villages.map((v) => ({ value: v.slug, label: v.name }))

// Each resource describes its list columns, form fields and how to convert to/from the API shape.
const RESOURCES = {
  villages: {
    title: 'Villages', singular: 'village', key: (v) => v.slug, items: () => villages,
    columns: [['Village', (v) => v.name], ['District', (v) => v.district], ['Records', (v) => recordsInVillage(v.slug)]],
    fields: () => [
      { name: 'name', label: 'Village name', type: 'text' },
      { name: 'district', label: 'District', type: 'text' },
      { name: 'region', label: 'Region', type: 'text' },
      { name: 'lat', label: 'Latitude', type: 'number', hint: 'Example: 21.96' },
      { name: 'lng', label: 'Longitude', type: 'number', hint: 'Example: 70.80' },
      { name: 'summary', label: 'Short summary', type: 'textarea', rows: 2, wide: true },
      { name: 'intro', label: 'About the village', type: 'list', format: 'paragraphs', rows: 6, wide: true },
      { name: 'image', label: 'Main image', type: 'image', wide: true },
      { name: 'gallery', label: 'Gallery images', type: 'list', format: 'lines', rows: 3, wide: true, hint: 'One image address per line.' },
      { name: 'people', label: 'Famous people', type: 'list', format: 'people', rows: 3, wide: true },
      { name: 'foods', label: 'Traditional food', type: 'list', format: 'people', rows: 3, wide: true },
      { name: 'festivals', label: 'Festivals and traditions', type: 'list', format: 'people', rows: 3, wide: true },
    ],
    blank: { region: 'Saurashtra', district: 'Rajkot' },
  },
  heritage: {
    title: 'Heritage records', singular: 'heritage record', key: (h) => h.slug, items: () => heritage,
    columns: [['Record', (h) => h.recordNo], ['Title', (h) => h.title], ['Village', (h) => villages.find((v) => v.slug === h.village)?.name], ['Status', (h) => (h.verified ? 'Verified' : 'Awaiting verification')]],
    fields: () => [
      { name: 'title', label: 'Title', type: 'text', wide: true },
      { name: 'category', label: 'Category', type: 'select', options: CATEGORIES.map((c) => ({ value: c.id, label: c.label })) },
      { name: 'type', label: 'Map marker type', type: 'select', options: MAP_TYPES.filter((t) => t.id !== 'village').concat([{ id: 'village', label: 'Village / intangible' }, { id: 'building', label: 'Historical building' }]).map((t) => ({ value: t.id, label: t.label })) },
      { name: 'htype', label: 'Heritage type', type: 'select', options: HERITAGE_TYPES.map((t) => ({ value: t, label: t })) },
      { name: 'village', label: 'Village', type: 'select', options: villageOptions() },
      { name: 'district', label: 'District', type: 'text' },
      { name: 'period', label: 'Historical period', type: 'select', options: PERIODS.map((p) => ({ value: p, label: p })) },
      { name: 'yearLabel', label: 'Date label', type: 'text', hint: 'Example: 17th century, or Date under research' },
      { name: 'lat', label: 'Latitude', type: 'number' },
      { name: 'lng', label: 'Longitude', type: 'number' },
      { name: 'summary', label: 'Short summary', type: 'textarea', rows: 2, wide: true },
      { name: 'description', label: 'Description', type: 'list', format: 'paragraphs', rows: 6, wide: true },
      { name: 'significance', label: 'Historical significance', type: 'textarea', rows: 2, wide: true },
      { name: 'timeline', label: 'Timeline', type: 'list', format: 'timeline', rows: 3, wide: true },
      { name: 'sources', label: 'Sources and references', type: 'list', format: 'sources', rows: 3, wide: true },
      { name: 'image', label: 'Main image', type: 'image', wide: true },
      { name: 'gallery', label: 'Gallery images', type: 'list', format: 'lines', rows: 3, wide: true, hint: 'One image address per line.' },
      { name: 'contributor', label: 'Credited to', type: 'text' },
      { name: 'verified', label: 'Verified Heritage (reviewer has checked the sources)', type: 'checkbox', wide: true },
    ],
    blank: { type: 'building', htype: 'Tangible', contributor: 'VirasatVault Team', verified: false },
  },
  events: {
    title: 'Events', singular: 'event', key: (e) => e.slug, items: () => events,
    columns: [['Event', (e) => e.name], ['Date', (e) => formatDate(e.date)], ['Venue', (e) => e.location], ['Type', (e) => e.category]],
    fields: () => [
      { name: 'name', label: 'Event name', type: 'text', wide: true },
      { name: 'category', label: 'Event type', type: 'select', options: EVENT_CATEGORIES.map((c) => ({ value: c, label: c })) },
      { name: 'village', label: 'Village', type: 'select', options: villageOptions() },
      { name: 'date', label: 'Start date', type: 'date' },
      { name: 'endDate', label: 'End date (optional)', type: 'date' },
      { name: 'location', label: 'Venue', type: 'text' },
      { name: 'district', label: 'District', type: 'text' },
      { name: 'entry', label: 'Entry', type: 'text', hint: 'Example: Free entry' },
      { name: 'description', label: 'Description', type: 'textarea', rows: 4, wide: true },
      { name: 'schedule', label: 'Schedule', type: 'list', format: 'lines', rows: 3, wide: true },
      { name: 'image', label: 'Image', type: 'image', wide: true },
    ],
    blank: {},
  },
  'oral-histories': {
    title: 'Oral histories', singular: 'oral history', key: (o) => o.id, items: () => oralHistories,
    columns: [['Title', (o) => o.title], ['Speaker', (o) => o.speaker], ['Audio', (o) => (o.audioUrl ? 'Recording attached' : 'No file (sample)')], ['Length', (o) => formatDuration(o.duration)]],
    fields: () => [
      { name: 'title', label: 'Title', type: 'text', wide: true },
      { name: 'speaker', label: 'Speaker', type: 'text', hint: 'Example: Ramaben Vaghela, age 82' },
      { name: 'village', label: 'Village', type: 'select', options: villageOptions() },
      { name: 'description', label: 'Description', type: 'textarea', rows: 3, wide: true },
      { name: 'audioUrl', label: 'Audio recording', type: 'audio', wide: true },
      { name: 'duration', label: 'Length in seconds', type: 'number', hint: 'Filled in automatically when you upload a file.' },
    ],
    blank: { duration: 0 },
  },
}

// API object -> form strings
const toForm = (resource, item) => {
  const fields = RESOURCES[resource].fields()
  const form = {}
  fields.forEach((f) => {
    const v = item[f.name]
    if (f.type === 'list') form[f.name] = FORMATS[f.format].stringify(v)
    else if (f.type === 'checkbox') form[f.name] = Boolean(v)
    else form[f.name] = v ?? ''
  })
  return form
}
// form strings -> API object
const toPayload = (resource, form) => {
  const payload = {}
  RESOURCES[resource].fields().forEach((f) => {
    const v = form[f.name]
    payload[f.name] = f.type === 'list' ? FORMATS[f.format].parse(v ?? '') : f.type === 'number' ? (v === '' ? '' : Number(v)) : v
  })
  if (resource === 'villages') payload.slug = form.slug
  return payload
}

function FileField({ field, value, onChange, setError, onUploaded }) {
  const [busy, setBusy] = useState(false)
  const pick = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setBusy(true)
    try {
      const { path } = await api.admin.upload(file)
      onChange(path)
      onUploaded?.(path, file)
    } catch (err) { setError(err.message) } finally { setBusy(false); e.target.value = '' }
  }
  return (
    <div className="file-field">
      <input id={`f-${field.name}`} type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder="Paste a web address, or upload a file" />
      <label className="btn btn-secondary btn-sm"><Upload size={15} aria-hidden="true" /> {busy ? 'Uploading...' : 'Upload'}
        <input className="sr-only" type="file" accept={field.type === 'audio' ? 'audio/*' : 'image/*'} onChange={pick} /></label>
      {value && field.type === 'image' && <img className="file-preview" src={fileSrc(value)} alt="Preview" onError={(e) => { e.target.style.display = 'none' }} />}
      {value && field.type === 'audio' && <audio controls src={fileSrc(value)} className="file-audio" />}
    </div>
  )
}

export default function ContentManager({ resource }) {
  const config = RESOURCES[resource]
  useDocumentTitle(`Admin: ${config.title}`)
  const { showToast, refreshData, dataVersion } = useApp() // dataVersion re-renders the list after a save
  const [mode, setMode] = useState('list')            // list | form
  const [editingKey, setEditingKey] = useState(null)  // null = creating
  const [form, setForm] = useState({})
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  void dataVersion

  const open = (item) => {
    setEditingKey(item ? config.key(item) : null)
    setForm(item ? toForm(resource, item) : { ...toForm(resource, {}), ...config.blank })
    setErrors({}); setMode('form')
  }
  const set = (name, value) => { setForm((f) => ({ ...f, [name]: value })); setErrors((e) => ({ ...e, [name]: '' })) }

  const save = async (e) => {
    e.preventDefault()
    setBusy(true); setErrors({})
    try {
      await api.admin.save(resource, editingKey, toPayload(resource, form))
      await refreshData()
      showToast(editingKey ? 'Changes saved' : `New ${config.singular} added`)
      setMode('list')
    } catch (err) {
      // nested keys like "people.0.name" are shown on their field ("people")
      const fields = Object.fromEntries(Object.entries(err.fields ?? {}).map(([k, v]) => [k.split('.')[0], v]))
      setErrors({ ...fields, form: err.message })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally { setBusy(false) }
  }

  const remove = async (item) => {
    const extra = resource === 'villages' ? `\n\nThis also deletes all ${recordsInVillage(item.slug)} records, stories and events that belong to this village.` : ''
    if (!window.confirm(`Delete “${item.title ?? item.name}”? This cannot be undone.${extra}`)) return
    try {
      await api.admin.remove(resource, config.key(item))
      await refreshData()
      showToast('Deleted')
    } catch (err) { showToast(err.message) }
  }

  if (mode === 'form') {
    return (
      <>
        <h1>{editingKey ? `Edit ${config.singular}` : `Add ${config.singular}`}</h1>
        <p className="muted">Fields marked in red need attention. Changes appear on the public site as soon as you save.</p>
        <form className="admin-form" onSubmit={save} noValidate>
          {errors.form && <p className="form-alert" role="alert">{errors.form}</p>}
          {config.fields().map((f) => (
            <div key={f.name} className={`field ${f.wide ? 'wide' : ''} ${errors[f.name] ? 'has-error' : ''}`}>
              {f.type === 'checkbox' ? (
                <label className="check"><input type="checkbox" checked={Boolean(form[f.name])} onChange={(e) => set(f.name, e.target.checked)} /> {f.label}</label>
              ) : (
                <>
                  <label htmlFor={`f-${f.name}`}>{f.label}</label>
                  {(f.hint || f.format) && <span className="hint">{f.hint ?? FORMATS[f.format].hint}</span>}
                  {f.type === 'select' ? (
                    <select id={`f-${f.name}`} value={form[f.name] ?? ''} onChange={(e) => set(f.name, e.target.value)}>
                      <option value="">Select</option>{f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : f.type === 'textarea' || f.type === 'list' ? (
                    <textarea id={`f-${f.name}`} rows={f.rows ?? 3} value={form[f.name] ?? ''} onChange={(e) => set(f.name, e.target.value)} />
                  ) : f.type === 'image' || f.type === 'audio' ? (
                    <FileField field={f} value={form[f.name] ?? ''} onChange={(v) => set(f.name, v)} setError={(m) => setErrors((x) => ({ ...x, [f.name]: m }))}
                      onUploaded={(path) => {
                        if (f.type !== 'audio') return
                        const probe = new Audio(fileSrc(path))   // read the real length from the file
                        probe.onloadedmetadata = () => Number.isFinite(probe.duration) && set('duration', Math.round(probe.duration))
                      }} />
                  ) : (
                    <input id={`f-${f.name}`} type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'} step={f.type === 'number' ? 'any' : undefined} value={form[f.name] ?? ''} onChange={(e) => set(f.name, e.target.value)} />
                  )}
                </>
              )}
              {errors[f.name] && <p className="field-error" role="alert">{errors[f.name]}</p>}
            </div>
          ))}
          <div className="form-actions wide">
            <button type="button" className="btn btn-ghost" onClick={() => setMode('list')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </>
    )
  }

  const items = config.items()
  return (
    <>
      <div className="row-between"><h1>{config.title}</h1><button className="btn btn-primary" onClick={() => open(null)}><Plus size={16} aria-hidden="true" /> Add {config.singular}</button></div>
      <p className="muted">{items.length} in the archive.</p>
      {items.length === 0 ? <EmptyState title={`No ${config.title.toLowerCase()} yet.`} text="Use the button above to add the first one." action={<span />} /> : (
        <table className="table">
          <thead><tr>{config.columns.map(([h]) => <th key={h}>{h}</th>)}<th><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>{items.map((item) => (
            <tr key={config.key(item)}>
              {config.columns.map(([h, get]) => <td key={h} data-label={h}>{get(item)}</td>)}
              <td className="row-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => open(item)} aria-label={`Edit ${item.title ?? item.name}`}><Pencil size={14} aria-hidden="true" /> Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => remove(item)} aria-label={`Delete ${item.title ?? item.name}`}><Trash2 size={14} aria-hidden="true" /> Delete</button>
              </td>
            </tr>
          ))}</tbody>
        </table>
      )}
    </>
  )
}
