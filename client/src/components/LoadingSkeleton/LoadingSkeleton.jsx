export function CardSkeleton({ count = 3 }) {
  return (
    <div className="grid-cards" aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <div className="skeleton-card" key={i}>
          <div className="skeleton" style={{ aspectRatio: '4 / 3' }} />
          <div className="skeleton line" style={{ width: '70%' }} />
          <div className="skeleton line" style={{ width: '90%' }} />
          <div className="skeleton line" style={{ width: '40%' }} />
        </div>
      ))}
    </div>
  )
}
