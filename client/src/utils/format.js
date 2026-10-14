export const formatDate = (iso, opts = { day: 'numeric', month: 'long', year: 'numeric' }) =>
  new Date(iso).toLocaleDateString('en-IN', opts)

export const formatDuration = (seconds) => {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export const timeAgo = (iso) => {
  const diff = Math.max(0, (Date.now() - new Date(iso)) / 1000)
  if (diff < 3600) return `${Math.max(1, Math.round(diff / 60))} minutes ago`
  if (diff < 86400) return `${Math.round(diff / 3600)} hours ago`
  const days = Math.round(diff / 86400)
  return days === 1 ? 'Yesterday' : `${days} days ago`
}

export const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
