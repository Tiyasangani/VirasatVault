import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, CalendarDays, CheckCircle2, FilePenLine, FilePlus2, Flag, Heart, MapPin, ListMusic, Megaphone, MessageCircle, Star } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { timeAgo } from '../../utils/format'

export const NOTE_ICON = { approved: CheckCircle2, comment: MessageCircle, like: Heart, district: MapPin, event: CalendarDays, changes: FilePenLine, broadcast: Megaphone, review: Star, submission: FilePlus2, report: Flag, playlist: ListMusic }

export default function NotificationDropdown() {
  const { notifications, unreadCount, markRead, markAllRead } = useApp()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    const esc = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc) }
  }, [])

  return (
    <div className="dropdown" ref={ref}>
      <button type="button" className="icon-btn nav-icon" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={`Notifications, ${unreadCount} unread`}>
        <Bell size={20} />
        {unreadCount > 0 && <span className="count-dot">{unreadCount}</span>}
      </button>
      {open && (
        <div className="dropdown-panel notif-panel">
          <div className="row-between dropdown-head">
            <h2 className="label">Notifications</h2>
            {unreadCount > 0 && <button type="button" className="text-link" onClick={markAllRead}>Mark all as read</button>}
          </div>
          <ul className="plain-list">
            {notifications.slice(0, 5).map((n) => {
              const Icon = NOTE_ICON[n.type] ?? Bell
              return (
                <li key={n.id}>
                  <button type="button" className={`notif-row ${n.read ? '' : 'is-unread'}`} onClick={() => { markRead(n.id); setOpen(false); if (n.link) navigate(n.link) }}>
                    <Icon size={17} aria-hidden="true" />
                    <span><span className="notif-text">{n.text}</span><span className="meta">{timeAgo(n.time)}</span></span>
                  </button>
                </li>
              )
            })}
          </ul>
          <Link to="/notifications" className="dropdown-foot text-link" onClick={() => setOpen(false)}>View all notifications</Link>
        </div>
      )}
    </div>
  )
}
