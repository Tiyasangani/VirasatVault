import { AlertTriangle, SearchX } from 'lucide-react'
import Button from '../Button/Button'

export function EmptyState({ title = 'No heritage records found.', text = 'Try a different search or clear a filter. If you know something that belongs here, you can add it.', action }) {
  return (
    <div className="state">
      <SearchX size={30} strokeWidth={1.3} aria-hidden="true" />
      <h3>{title}</h3>
      <p>{text}</p>
      {action ?? <Button variant="secondary" to="/contribute">Contribute heritage</Button>}
    </div>
  )
}

export function ErrorState({ onRetry }) {
  return (
    <div className="state" role="alert">
      <AlertTriangle size={30} strokeWidth={1.3} aria-hidden="true" />
      <h3>Something went wrong. Please try again.</h3>
      <p>The records could not be loaded. Check your connection and retry.</p>
      {onRetry && <Button variant="secondary" onClick={onRetry}>Try again</Button>}
    </div>
  )
}
