import { useCallback, useEffect, useState } from 'react'

const KEY = 'vv_theme'

export function initialTheme() {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'dark' || saved === 'light') return saved
  } catch { /* storage may be blocked; fall through */ }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// Light / dark colour theme, remembered between visits. index.html applies it before the first paint.
export default function useTheme() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || initialTheme())
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#17110c' : '#3a2a1e')
    try { localStorage.setItem(KEY, theme) } catch { /* ignore */ }
  }, [theme])
  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])
  return [theme, toggle]
}
