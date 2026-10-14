import { useEffect, useState } from 'react'

// Pretends to fetch data so skeleton loaders can be shown. Delete when a real API is added.
export default function useSimulatedLoad(deps = [], ms = 450) {
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), ms)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return loading
}
