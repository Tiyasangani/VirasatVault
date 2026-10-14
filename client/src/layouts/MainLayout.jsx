import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { BookOpenText } from 'lucide-react'
import Navbar from '../components/Navbar/Navbar'
import Footer from '../components/Footer/Footer'
import Toast from '../components/Toast/Toast'
import Assistant from '../components/Assistant/Assistant'
import BackToTop from '../components/BackToTop/BackToTop'
import OfflineBanner from '../components/OfflineBanner/OfflineBanner'

export default function MainLayout() {
  const [askOpen, setAskOpen] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])

  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <OfflineBanner />
      <Navbar />
      <main id="main"><Outlet /></main>
      <Footer />
      {pathname !== '/ask' && (
        <button type="button" className="ask-launch" onClick={() => setAskOpen(true)}><BookOpenText size={18} aria-hidden="true" /> Ask VirasatVault</button>
      )}
      {askOpen && (
        <div className="drawer-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setAskOpen(false)}>
          <div className="drawer"><Assistant onClose={() => setAskOpen(false)} /></div>
        </div>
      )}
      <BackToTop />
      <Toast />
    </>
  )
}
