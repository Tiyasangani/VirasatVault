import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'

// Shows "Install app" only when the browser says the site can be installed.
export default function InstallButton() {
  const [prompt, setPrompt] = useState(null)
  const [installed, setInstalled] = useState(false)
  useEffect(() => {
    const ready = (e) => { e.preventDefault(); setPrompt(e) }
    const done = () => { setInstalled(true); setPrompt(null) }
    window.addEventListener('beforeinstallprompt', ready)
    window.addEventListener('appinstalled', done)
    return () => { window.removeEventListener('beforeinstallprompt', ready); window.removeEventListener('appinstalled', done) }
  }, [])
  if (!prompt || installed) return null
  const install = async () => { prompt.prompt(); await prompt.userChoice.catch(() => {}); setPrompt(null) }
  return <button type="button" className="install-btn" onClick={install}><Download size={15} aria-hidden="true" /> Install the app</button>
}
