import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { NOTE_ICON } from '../../components/NotificationDropdown/NotificationDropdown'
import { useApp } from '../../context/AppContext'
import { timeAgo } from '../../utils/format'
import useDocumentTitle from '../../hooks/useDocumentTitle'

const TYPE_LABEL = { approved: 'Approved', comment: 'Comment', like: 'Like', district: 'Your district', event: 'Event', changes: 'Changes needed', broadcast: 'Announcement', review: 'Review', submission: 'Submission', report: 'Report', playlist: 'Playlist' }

export default function Notifications() {
  useDocumentTitle('Notifications')
  const { notifications, markRead, markAllRead, unreadCount } = useApp()
  return (
    <>
      <section className="page-head"><div className="container row-between"><div><h1>Notifications</h1><p>{unreadCount ? `${unreadCount} unread` : 'You are up to date.'}</p></div><button type="button" className="btn btn-secondary btn-sm" onClick={markAllRead} disabled={!unreadCount}>Mark all as read</button></div></section>
      <section className="section-tight"><div className="container narrow">
        <ul className="plain-list notif-page">
          {notifications.map((n) => {
            const Icon = NOTE_ICON[n.type] ?? Bell
            return (
              <li key={n.id} className={n.read ? '' : 'is-unread'}>
                <Icon size={20} aria-hidden="true" />
                <div><p className="notif-text">{n.link ? <Link to={n.link} onClick={() => markRead(n.id)}>{n.text}</Link> : n.text}</p><p className="meta">{TYPE_LABEL[n.type]}. {timeAgo(n.time)}</p></div>
                {!n.read && <button type="button" className="text-link" onClick={() => markRead(n.id)}>Mark as read</button>}
              </li>
            )
          })}
        </ul>
      </div></section>
    </>
  )
}
