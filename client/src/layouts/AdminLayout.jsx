import { NavLink, Outlet, Link } from 'react-router-dom'
import { BookOpenCheck, FileWarning, Flag, Landmark, LayoutDashboard, MapPinned, CalendarDays, Megaphone, Mic, Tags, Users } from 'lucide-react'
import { useApp } from '../context/AppContext'
import Toast from '../components/Toast/Toast'
import { Logo } from '../components/Navbar/Navbar'

const ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/contributions', label: 'Contributions', icon: BookOpenCheck },
  { to: '/admin/reports', label: 'Reports', icon: Flag },
  { to: '/admin/announcements', label: 'Announcements', icon: Megaphone },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/villages', label: 'Villages', icon: MapPinned },
  { to: '/admin/heritage', label: 'Heritage', icon: Landmark },
  { to: '/admin/events', label: 'Events', icon: CalendarDays },
  { to: '/admin/oral-histories', label: 'Oral histories', icon: Mic },
  { to: '/admin/categories', label: 'Categories', icon: Tags },
]

export default function AdminLayout() {
  const { user, ready } = useApp()
  if (!ready) return null
  if (user?.role !== 'admin') {
    return (
      <div className="admin-gate">
        <FileWarning size={34} strokeWidth={1.3} aria-hidden="true" />
        <h1>Reviewer access only</h1>
        <p>This area is for archive reviewers. For the demo, log in with an email that starts with <strong>admin</strong>, such as admin@heritagehub.demo.</p>
        <Link to="/login" className="btn btn-primary">Go to login</Link>
        <Link to="/" className="text-link">Back to VirasatVault</Link>
      </div>
    )
  }
  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <Logo />
        <p className="meta admin-who">Reviewer: {user.name}</p>
        <nav aria-label="Admin">
          {ITEMS.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end}><Icon size={17} aria-hidden="true" /> {label}</NavLink>)}
        </nav>
        <Link to="/" className="text-link admin-exit">View public site</Link>
      </aside>
      <main className="admin-main" id="main"><Outlet /></main>
      <Toast />
    </div>
  )
}
