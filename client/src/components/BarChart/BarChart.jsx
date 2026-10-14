// Small dependency-free charts. orientation: "horizontal" (labelled rows) or "vertical" (columns).
export default function BarChart({ title, data, orientation = 'horizontal', format = (v) => v }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <figure className="chart">
      <figcaption className="label">{title}</figcaption>
      {data.length === 0 && <p className="meta">No data yet.</p>}
      {orientation === 'horizontal' ? (
        <ul className="plain-list chart-rows">
          {data.map((d) => (
            <li key={d.label}>
              <span className="chart-label">{format(d.label)}</span>
              <span className="chart-track"><span className="chart-bar" style={{ width: `${(d.value / max) * 100}%` }} /></span>
              <span className="chart-value">{d.value}</span>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="plain-list chart-cols">
          {data.map((d) => (
            <li key={d.label}>
              <span className="chart-value">{d.value}</span>
              <span className="chart-col" style={{ height: `${Math.max(2, (d.value / max) * 100)}%` }} />
              <span className="chart-label">{d.label}</span>
            </li>
          ))}
        </ul>
      )}
    </figure>
  )
}
