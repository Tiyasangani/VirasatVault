// layout: "horizontal" (home page, becomes vertical on phones) or "vertical" (detail pages)
export default function Timeline({ items, layout = 'horizontal' }) {
  return (
    <ol className={`timeline timeline-${layout}`} style={{ '--count': items.length }}>
      {items.map((item, i) => (
        <li key={i} className="timeline-item">
          <span className="timeline-year">{item.year}</span>
          <span className="timeline-tick" aria-hidden="true" />
          <div className="timeline-text">
            {item.title && <h3 className="timeline-title">{item.title}</h3>}
            <p>{item.text}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
