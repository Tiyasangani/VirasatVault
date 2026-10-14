import { useCallback, useEffect, useState } from 'react'

const KEY = 'vv_trail'
const EVENT = 'vv-trail-change'

const read = () => {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '[]')
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string').slice(0, 30) : []
  } catch { return [] }
}

// The visitor's saved trail: an ordered list of place ids, kept in this browser. Shared by every component.
export default function useTrail() {
  const [ids, setIds] = useState(read)

  useEffect(() => {
    const sync = () => setIds(read())
    window.addEventListener(EVENT, sync)
    window.addEventListener('storage', sync)
    return () => { window.removeEventListener(EVENT, sync); window.removeEventListener('storage', sync) }
  }, [])

  const save = useCallback((next) => {
    const clean = [...new Set(next)].slice(0, 30)
    try { localStorage.setItem(KEY, JSON.stringify(clean)) } catch { /* storage blocked: keep in memory only */ }
    setIds(clean)
    window.dispatchEvent(new Event(EVENT))
  }, [])

  const has = useCallback((id) => ids.includes(id), [ids])
  const add = useCallback((id) => save([...read(), id]), [save])
  const remove = useCallback((id) => save(read().filter((x) => x !== id)), [save])
  const toggle = useCallback((id) => { const cur = read(); save(cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]); return !cur.includes(id) }, [save])
  const move = useCallback((id, step) => {
    const cur = read(); const i = cur.indexOf(id); const j = i + step
    if (i < 0 || j < 0 || j >= cur.length) return
    ;[cur[i], cur[j]] = [cur[j], cur[i]]
    save(cur)
  }, [save])
  return { ids, has, add, remove, toggle, move, set: save, clear: () => save([]) }
}
