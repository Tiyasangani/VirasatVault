import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, Search, X } from 'lucide-react'
import NotificationDropdown from '../NotificationDropdown/NotificationDropdown'
import ThemeToggle from '../ThemeToggle/ThemeToggle'
import SearchOverlay from '../SearchOverlay/SearchOverlay'
import { useApp } from '../../context/AppContext'

const LINKS = [
  { to: '/explore', label: 'Explore' },
  { to: '/villages', label: 'Villages' },
  { to: '/map', label: 'Heritage Map' },
  { to: '/stories', label: 'Stories' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/events', label: 'Events' },
  { to: '/about', label: 'About' },
]

export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="VirasatVault, home">
      <svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true"><rect width="32" height="32" rx="5" fill="currentColor" /><path d="M6 27V15a10 10 0 0 1 20 0v12z" fill="var(--accent-soft)" /><path d="M10.5 27V15.5a5.5 5.5 0 0 1 11 0V27z" fill="currentColor" /><path d="M16 11.2l2.6 2.6-2.6 2.6-2.6-2.6z" fill="var(--accent)" /></svg>
      <span className="logo-text"><span className="logo-name">VirasatVault</span><span className="logo-sub">Preserving Cultural Heritage</span></span>
    </Link>
  )
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { user, logout } = useApp()
  const location = useLocation()

  useEffect(() => setMenuOpen(false), [location.pathname])

  return (
    <header className="site-header">
      <div className="container header-row">
        <Logo />
        <nav className="main-nav" aria-label="Main">
          {LINKS.map((l) => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>)}
        </nav>
        <div className="header-actions">
          <button type="button" className="icon-btn nav-icon" onClick={() => setSearchOpen(true)} aria-label="Search"><Search size={20} /></button>
          <ThemeToggle />
          {user && <NotificationDropdown />}
          {user ? (
            <>
              <Link to="/profile" className="nav-text-link">{user.name.split(' ')[0]}</Link>
              <button type="button" className="nav-text-link hide-sm" onClick={logout}>Log out</button>
            </>
          ) : (
            <Link to="/login" className="nav-text-link">Login</Link>
          )}
          <Link to="/contribute" className="btn btn-primary btn-sm hide-xs">Contribute</Link>
          <button type="button" className="icon-btn menu-toggle" onClick={() => setMenuOpen((o) => !o)} aria-expanded={menuOpen} aria-controls="mobile-menu" aria-label={menuOpen ? 'Close menu' : 'Open menu'}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav id="mobile-menu" className="mobile-menu" aria-label="Mobile">
          {LINKS.map((l) => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>)}
          <hr />
          {user && <><NavLink to="/profile">My profile</NavLink><NavLink to="/bookmarks">My Heritage</NavLink><NavLink to="/playlists">My playlists</NavLink><NavLink to="/notifications">Notifications</NavLink>{user.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}</>}
          <NavLink to="/trail">Trail Planner</NavLink>
          <NavLink to="/insights">Archive Insights</NavLink>
          <NavLink to="/ask">Ask VirasatVault</NavLink>
          <Link to="/contribute" className="btn btn-primary">Contribute heritage</Link>
          {user ? <button type="button" className="nav-text-link" onClick={logout}>Log out</button> : <Link to="/login" className="btn btn-secondary">Login</Link>}
        </nav>
      )}
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </header>
  )
}
