// The only file that talks to the backend. Pages and context call these small functions.
const BASE = import.meta.env.VITE_API_URL || '/api'
const TOKEN_KEY = 'hh_token'

// Where uploaded files live. In development Vite proxies /uploads, so a relative path works.
const FILE_ORIGIN = BASE.startsWith('http') ? BASE.replace(/\/api\/?$/, '') : ''
export const fileSrc = (path) => (path?.startsWith('/uploads/') ? `${FILE_ORIGIN}${path}` : path)

// Live updates (Socket.IO) connect to the same server. Relative in development (Vite proxies it).
export const SOCKET_ORIGIN = BASE.startsWith('http') ? BASE.replace(/\/api\/?$/, '') : undefined

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token) => (token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY))

export class ApiError extends Error {
  constructor(message, status = 0, fields = {}) {
    super(message)
    this.status = status
    this.fields = fields || {}
  }
}

async function request(path, { method = 'GET', body, form } = {}) {
  const headers = {}
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  if (body) headers['Content-Type'] = 'application/json'

  let res
  try {
    res = await fetch(`${BASE}${path}`, { method, headers, body: form ?? (body ? JSON.stringify(body) : undefined) })
  } catch {
    throw new ApiError('Cannot reach the server. Check that the backend is running.')
  }
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    if (res.status === 401 && token && path !== '/auth/login') setToken(null) // expired or invalid token
    throw new ApiError(data?.message ?? 'Something went wrong. Please try again.', res.status, data?.fields)
  }
  return data
}

export const api = {
  bootstrap: () => request('/bootstrap'),
  search: (q) => request(`/search?q=${encodeURIComponent(q)}`),
  ask: (question) => request('/assistant', { method: 'POST', body: { question } }),

  login: (body) => request('/auth/login', { method: 'POST', body }),
  register: (body) => request('/auth/register', { method: 'POST', body }),
  googleDemo: () => request('/auth/google-demo', { method: 'POST' }),
  me: () => request('/auth/me'),
  playlists: () => request('/playlists'),
  createPlaylist: (body) => request('/playlists', { method: 'POST', body }),
  updatePlaylist: (id, body) => request(`/playlists/${id}`, { method: 'PATCH', body }),
  deletePlaylist: (id) => request(`/playlists/${id}`, { method: 'DELETE' }),
  addToPlaylist: (id, itemId) => request(`/playlists/${id}/items`, { method: 'POST', body: { itemId } }),
  removeFromPlaylist: (id, itemId) => request(`/playlists/${id}/items/${itemId}`, { method: 'DELETE' }),
  reorderPlaylist: (id, itemIds) => request(`/playlists/${id}/order`, { method: 'PUT', body: { itemIds } }),
  sharedPlaylist: (code) => request(`/playlists/shared/${code}`),
  copyPlaylist: (code) => request(`/playlists/shared/${code}/copy`, { method: 'POST' }),
  deleteAccount: (password) => request('/auth/me', { method: 'DELETE', body: { password } }),
  reviews: (targetId) => request(`/reviews/${targetId}`),
  saveReview: (body) => request('/reviews', { method: 'POST', body }),
  deleteReview: (targetId) => request(`/reviews/${targetId}`, { method: 'DELETE' }),
  forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: { email } }),
  resetPassword: (token, password) => request('/auth/reset-password', { method: 'POST', body: { token, password } }),
  contributors: (district) => request(`/contributors${district ? `?district=${encodeURIComponent(district)}` : ''}`),
  contributor: (id) => request(`/contributors/${id}`),
  updateContribution: (id, formData) => request(`/contributions/${id}`, { method: 'PUT', form: formData }),

  myState: () => request('/me/state'),
  toggleBookmark: (type, id) => request('/bookmarks/toggle', { method: 'POST', body: { type, id } }),
  toggleLike: (id) => request('/likes/toggle', { method: 'POST', body: { id } }),
  markRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () => request('/notifications/read-all', { method: 'POST' }),

  getComments: (targetId) => request(`/comments/${targetId}`),
  addComment: (targetId, text) => request('/comments', { method: 'POST', body: { targetId, text } }),
  submitContribution: (formData) => request('/contributions', { method: 'POST', form: formData }),
  submitReport: (body) => request('/reports', { method: 'POST', body }),

  admin: {
    stats: () => request('/admin/stats'),
    contributions: () => request('/admin/contributions'),
    review: (id, status, note) => request(`/admin/contributions/${id}`, { method: 'PATCH', body: { status, note } }),
    reports: () => request('/admin/reports'),
    resolveReport: (id) => request(`/admin/reports/${id}/resolve`, { method: 'PATCH' }),
    users: () => request('/admin/users'),
    analytics: () => request('/admin/analytics'),
    setBanned: (id, banned) => request(`/admin/users/${id}/ban`, { method: 'PATCH', body: { banned } }),
    deleteComment: (id) => request(`/admin/comments/${id}`, { method: 'DELETE' }),
    deleteReview: (id) => request(`/admin/reviews/${id}`, { method: 'DELETE' }),
    broadcasts: () => request('/admin/broadcasts'),
    sendBroadcast: (body) => request('/admin/broadcasts', { method: 'POST', body }),
    runReminders: () => request('/admin/reminders/run', { method: 'POST' }),
    upload: (file) => { const form = new FormData(); form.append('file', file); return request('/admin/upload', { method: 'POST', form }) },
    // resource: villages | heritage | events | oral-histories. key is the slug (or id for oral histories).
    save: (resource, key, body) => request(`/admin/${resource}${key ? `/${key}` : ''}`, { method: key ? 'PUT' : 'POST', body }),
    remove: (resource, key) => request(`/admin/${resource}/${key}`, { method: 'DELETE' }),
  },
}
