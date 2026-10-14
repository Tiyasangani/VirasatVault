import { Link } from 'react-router-dom'
import { Logo } from '../Navbar/Navbar'
import { DEMO, DESCRIPTION, TAGLINE } from '../../config'
import InstallButton from '../InstallButton/InstallButton'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-about">
          <Logo />
          <p className="footer-tagline">{TAGLINE}</p>
          <p>{DESCRIPTION}</p>
          {DEMO && <p className="meta">All records in this prototype are sample data for demonstration.</p>}
        </div>
        <nav aria-label="Explore"><h2 className="label">Explore</h2>
          <ul className="plain-list"><li><Link to="/explore">All heritage</Link></li><li><Link to="/villages">Villages</Link></li><li><Link to="/map">Heritage map</Link></li><li><Link to="/stories">Stories</Link></li><li><Link to="/gallery">Photo gallery</Link></li><li><Link to="/trail">Trail planner</Link></li><li><Link to="/events">Events</Link></li></ul>
        </nav>
        <nav aria-label="Participate"><h2 className="label">Participate</h2>
          <ul className="plain-list"><li><Link to="/contribute">Contribute heritage</Link></li><li><Link to="/contributors">Contributors</Link></li><li><Link to="/ask">Ask VirasatVault</Link></li><li><Link to="/bookmarks">My Heritage</Link></li><li><Link to="/playlists">My playlists</Link></li><li><Link to="/profile">Contributor profile</Link></li></ul>
        </nav>
        <nav aria-label="About"><h2 className="label">About</h2>
          <ul className="plain-list"><li><Link to="/about">How verification works</Link></li><li><Link to="/insights">Archive insights</Link></li><li><Link to="/admin">Reviewer area</Link></li><li><Link to="/terms">Terms of Use</Link></li><li><Link to="/privacy">Privacy Policy</Link></li><li><Link to="/login">Login</Link></li></ul>
        </nav>
      </div>
      <div className="container footer-base"><InstallButton /><p>© 2026 VirasatVault. Every Place Has a Past. Every Story Deserves a Future.</p></div>
    </footer>
  )
}
