import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'

// Tells people when the connection drops, and what still works.
export default function OfflineBanner() {
  const [offline, setOffline] = useState(typeof navigator !== 'undefined' && navigator.onLine === false)
  useEffect(() => {
    const down = () => setOffline(true), up = () => setOffline(false)
    window.addEventListener('offline', down); window.addEventListener('online', up)
    return () => { window.removeEventListener('offline', down); window.removeEventListener('online', up) }
  }, [])
  if (!offline) return null
  return (
    <div className="offline-bar" role="status">
      <WifiOff size={16} aria-hidden="true" />
      <span>You are offline. Pages and records you have already opened still work. Photos, maps, sign-in and live updates need a connection.</span>
    </div>
  )
}
