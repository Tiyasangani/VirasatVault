import { Route } from 'lucide-react'
import useTrail from '../../hooks/useTrail'
import { useApp } from '../../context/AppContext'

// "Add to my trail" toggle for a place or village (id as used by the map points).
export default function TrailButton({ id }) {
  const { has, toggle } = useTrail()
  const { showToast } = useApp()
  const on = has(id)
  const click = () => showToast(toggle(id) ? 'Added to your heritage trail' : 'Removed from your heritage trail')
  return (
    <button type="button" className={`icon-btn ${on ? 'is-on' : ''}`} onClick={click} aria-pressed={on}>
      <Route size={18} aria-hidden="true" /><span>{on ? 'In my trail' : 'Add to trail'}</span>
    </button>
  )
}
