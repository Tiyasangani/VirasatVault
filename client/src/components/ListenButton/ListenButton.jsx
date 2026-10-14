import { useEffect, useRef, useState } from 'react'
import { Square, Volume2 } from 'lucide-react'

// Read a page aloud with the browser's built-in voice (no server, no cost). Hidden where unsupported.
const chunk = (text) => (text.match(/[^.!?\n]+[.!?]*\s*/g) ?? [text]).reduce((acc, s) => {
  const last = acc[acc.length - 1]
  if (last && last.length + s.length < 180) acc[acc.length - 1] = last + s
  else acc.push(s)
  return acc
}, [])

export default function ListenButton({ text, label = 'Listen' }) {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined'
  const [speaking, setSpeaking] = useState(false)
  const run = useRef(0)

  useEffect(() => () => { if (supported) { run.current += 1; window.speechSynthesis.cancel() } }, [supported])
  if (!supported || !text) return null

  const stop = () => { run.current += 1; window.speechSynthesis.cancel(); setSpeaking(false) }
  const start = () => {
    window.speechSynthesis.cancel()
    const id = ++run.current
    const parts = chunk(text.replace(/\s+/g, ' ').trim())
    setSpeaking(true)
    parts.forEach((part, i) => {
      const u = new SpeechSynthesisUtterance(part)
      u.lang = 'en-IN'; u.rate = 0.95
      u.onend = () => { if (run.current === id && i === parts.length - 1) setSpeaking(false) }
      u.onerror = () => { if (run.current === id) setSpeaking(false) }
      window.speechSynthesis.speak(u)
    })
  }

  return (
    <button type="button" className="icon-btn" onClick={speaking ? stop : start} aria-pressed={speaking}>
      {speaking ? <Square size={16} aria-hidden="true" /> : <Volume2 size={18} aria-hidden="true" />}
      <span>{speaking ? 'Stop' : label}</span>
    </button>
  )
}
