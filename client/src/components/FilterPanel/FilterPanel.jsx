// filters: [{ key, label, options: [{ value, label }] }]
export default function FilterPanel({ filters, values, onChange, onReset }) {
  const active = Object.values(values).filter(Boolean).length
  return (
    <div className="filter-panel">
      {filters.map((f) => (
        <div className="field" key={f.key}>
          <label htmlFor={`f-${f.key}`}>{f.label}</label>
          <select id={`f-${f.key}`} value={values[f.key] ?? ''} onChange={(e) => onChange(f.key, e.target.value)}>
            <option value="">All</option>
            {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      ))}
      {active > 0 && <button type="button" className="text-link filter-reset" onClick={onReset}>Clear {active} filter{active > 1 ? 's' : ''}</button>}
    </div>
  )
}
