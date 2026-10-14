import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { io } from 'socket.io-client'
import { api, getToken, setToken, SOCKET_ORIGIN } from '../api/client'
import { hydrate } from '../data'
import useLocalStorage from '../hooks/useLocalStorage'

const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)

const emptyBookmarks = { places: [], stories: [], villages: [], events: [] }

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(!getToken()) // false while we restore a saved login
  const [dataVersion, setDataVersion] = useState(0) // bumped when public data is reloaded
  const [bookmarks, setBookmarks] = useState(emptyBookmarks)
  const [likes, setLikes] = useState([])
  const [notifications, setNotifications] = useState([])
  const [contributions, setContributions] = useState([]) // the signed-in user's own submissions
  const [playlists, setPlaylists] = useState([])         // the signed-in user's playlists
  const [recentSearches, setRecentSearches] = useLocalStorage('hh_recent', ['Gondal', 'Stepwell'])
  const [toast, setToast] = useState(null)
  const [socket, setSocket] = useState(null)   // live connection to the server

  const showToast = useCallback((message) => {
    setToast({ message, id: Date.now() })
    setTimeout(() => setToast(null), 2800)
  }, [])

  // Reload the public records (like counts depend on who is asking).
  const refreshData = useCallback(async () => {
    hydrate(await api.bootstrap())
    setDataVersion((v) => v + 1)
  }, [])

  const applyState = (state) => {
    setUser(state.user)
    setBookmarks(state.bookmarks)
    setLikes(state.likes)
    setNotifications(state.notifications)
    setContributions(state.contributions)
  }
  const clearState = () => {
    setUser(null); setBookmarks(emptyBookmarks); setLikes([]); setNotifications([]); setContributions([]); setPlaylists([])
  }
  const loadState = useCallback(async () => {
    const [state, lists] = await Promise.all([api.myState(), api.playlists()])
    applyState(state)
    setPlaylists(lists)
  }, [])

  // Restore the session on page load.
  useEffect(() => {
    if (!getToken()) return
    loadState().catch(() => { setToken(null); clearState() }).finally(() => setReady(true))
  }, [loadState])

  // Live connection. It is re-created when someone logs in or out, because the login token decides
  // which private rooms (their own notifications, the admin room) the server puts them in.
  useEffect(() => {
    const s = io(SOCKET_ORIGIN, { auth: { token: getToken() ?? undefined } })
    let timer
    s.on('notification', (n) => {
      setNotifications((prev) => (prev.some((x) => x.id === n.id) ? prev : [n, ...prev]))
      showToast(n.text)
    })
    s.on('contribution:updated', () => loadState().catch(() => {}))          // my submission was reviewed
    s.on('data:changed', () => {                                              // someone published or edited content
      clearTimeout(timer)
      timer = setTimeout(() => refreshData().catch(() => {}), 400)
    })
    setSocket(s)
    return () => { clearTimeout(timer); s.disconnect() }
  }, [user?.id]) // eslint-disable-line

  const startSession = async ({ token, user: profile }) => {
    setToken(token)
    setUser(profile)
    await Promise.all([loadState(), refreshData()])
    return profile
  }
  const login = async (credentials) => { const profile = await startSession(await api.login(credentials)); showToast('Welcome back'); return profile }
  const register = async (details) => { await startSession(await api.register(details)); showToast('Account created') }
  const googleLogin = async () => { await startSession(await api.googleDemo()); showToast('Signed in with the demo Google account') }
  const logout = async () => {
    setToken(null); clearState()
    await refreshData().catch(() => {})
    showToast('You have been logged out')
  }

  const deleteAccount = async (password) => {
    await api.deleteAccount(password)
    setToken(null); clearState()
    await refreshData().catch(() => {})
    showToast('Your account was deleted')
  }

  // ---- playlists ----
  // Create a playlist, optionally with a first item already in it (used by the "Add to playlist" menu).
  const createPlaylist = async (data, firstItemId) => {
    let created = await api.createPlaylist(data)
    if (firstItemId) created = { ...created, itemIds: (await api.addToPlaylist(created.id, firstItemId)).itemIds }
    setPlaylists((prev) => [created, ...prev])
    return created
  }
  // Add the item if it is not in the playlist, otherwise remove it. The screen updates first, then the server.
  const togglePlaylistItem = async (playlistId, itemId) => {
    const list = playlists.find((p) => p.id === playlistId)
    if (!list) return
    const has = list.itemIds.includes(itemId)
    const set = (ids) => setPlaylists((prev) => prev.map((p) => (p.id === playlistId ? { ...p, itemIds: ids } : p)))
    set(has ? list.itemIds.filter((i) => i !== itemId) : [...list.itemIds, itemId])
    try {
      const { itemIds } = has ? await api.removeFromPlaylist(playlistId, itemId) : await api.addToPlaylist(playlistId, itemId)
      set(itemIds)
      showToast(has ? `Removed from “${list.title}”` : `Added to “${list.title}”`)
    } catch (err) { set(list.itemIds); showToast(err.message) }
  }
  const refreshPlaylists = () => api.playlists().then(setPlaylists).catch(() => {})

  const requireLogin = (message) => {
    if (user) return true
    showToast(message)
    return false
  }

  const isBookmarked = (type, id) => bookmarks[type]?.includes(id)
  const toggleBookmark = async (type, id) => {
    if (!requireLogin('Log in to save heritage to My Heritage')) return
    const already = isBookmarked(type, id)
    const flip = (on) => setBookmarks((prev) => ({ ...prev, [type]: on ? [...prev[type], id] : prev[type].filter((x) => x !== id) }))
    flip(!already)                       // update the screen immediately
    try {
      await api.toggleBookmark(type, id)
      showToast(already ? 'Removed from My Heritage' : 'Saved to My Heritage')
    } catch (err) { flip(already); showToast(err.message) }
  }

  const isLiked = (id) => likes.includes(id)
  const toggleLike = async (id) => {
    if (!requireLogin('Log in to like this')) return
    const already = isLiked(id)
    const flip = (on) => setLikes((prev) => (on ? [...prev, id] : prev.filter((x) => x !== id)))
    flip(!already)
    try { await api.toggleLike(id) } catch (err) { flip(already); showToast(err.message) }
  }

  const markRead = async (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    api.markRead(id).catch(() => {})
  }
  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    api.markAllRead().catch(() => {})
  }
  const unreadCount = notifications.filter((n) => !n.read).length

  const addContribution = async (formData) => {
    const created = await api.submitContribution(formData)
    setContributions((prev) => [created, ...prev])
    api.me().then(({ user: profile }) => setUser(profile)).catch(() => {})
    return created
  }
  const updateContribution = async (id, formData) => {
    const updated = await api.updateContribution(id, formData)
    setContributions((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
    api.me().then(({ user: profile }) => setUser(profile)).catch(() => {})
    return updated
  }
  const addReport = async (data) => {
    await api.submitReport(data)
    showToast('Report sent to the review team')
  }

  const addRecentSearch = (term) => {
    if (!term.trim()) return
    setRecentSearches((prev) => [term, ...prev.filter((t) => t !== term)].slice(0, 5))
  }

  const value = useMemo(() => ({
    user, ready, deleteAccount, login, register, googleLogin, logout, bookmarks, isBookmarked, toggleBookmark, likes, isLiked, toggleLike,
    notifications, markRead, markAllRead, unreadCount, contributions, addContribution, updateContribution, addReport, refreshData,
    recentSearches, addRecentSearch, clearRecent: () => setRecentSearches([]), toast, showToast, dataVersion, socket,
    requireLogin, playlists, createPlaylist, togglePlaylistItem, refreshPlaylists,
  }), [user, ready, socket, playlists, bookmarks, likes, notifications, contributions, recentSearches, toast, dataVersion]) // eslint-disable-line

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
