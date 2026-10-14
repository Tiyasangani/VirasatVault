/* VirasatVault service worker: lets the site install as an app and keep working with a poor or no connection.
 *
 * What it does
 *  - Pages: network first, falling back to the saved app shell, so every page opens offline.
 *  - Site files (/assets): saved once, served instantly afterwards.
 *  - Public records (/api/bootstrap): network first, last good copy used offline. Only saved for signed-out
 *    requests, so one person's data is never shown to another on a shared device.
 *  - Uploaded photos (/uploads): saved as they are viewed.
 *  - Everything else (other APIs, live updates, outside photos, maps, fonts) is left to the browser untouched,
 *    which also keeps it compatible with the server's content-security policy.
 * Change VERSION to force every visitor to refresh their saved copy. */
const VERSION = 'vv-v1'
const SHELL = `${VERSION}-shell`
const DATA = `${VERSION}-data`
const FILES = `${VERSION}-files`
const MAX_UPLOADS = 80

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL)
      .then((cache) => cache.addAll(['/', '/favicon.svg', '/manifest.webmanifest', '/theme-init.js']))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  if (keys.length > max) await Promise.all(keys.slice(0, keys.length - max).map((k) => cache.delete(k)))
}

async function networkFirst(request, cacheName, cacheKey) {
  const cache = await caches.open(cacheName)
  try {
    const fresh = await fetch(request)
    if (fresh.ok) cache.put(cacheKey ?? request, fresh.clone())
    return fresh
  } catch (err) {
    const saved = await cache.match(cacheKey ?? request)
    if (saved) return saved
    throw err
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return          // outside photos, maps, fonts: browser handles them

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, SHELL, '/').catch(() => caches.match('/')))
    return
  }
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(caches.open(FILES).then(async (cache) => {
      const hit = await cache.match(request)
      if (hit) return hit
      const res = await fetch(request)
      if (res.ok) cache.put(request, res.clone())
      return res
    }))
    return
  }
  if (url.pathname.endsWith('/api/bootstrap')) {
    if (request.headers.has('Authorization')) {            // signed-in request: never store it
      event.respondWith(fetch(request).catch(async () => (await caches.open(DATA)).match(url.pathname) ?? Response.error()))
    } else {
      event.respondWith(networkFirst(request, DATA, url.pathname))
    }
    return
  }
  if (url.pathname.startsWith('/uploads/')) {
    event.respondWith(caches.open(FILES).then(async (cache) => {
      const hit = await cache.match(request)
      if (hit) return hit
      const res = await fetch(request)
      if (res.ok) { cache.put(request, res.clone()); trim(FILES, MAX_UPLOADS + 200) }
      return res
    }))
    return
  }
  if (['/favicon.svg', '/manifest.webmanifest', '/theme-init.js'].includes(url.pathname) || url.pathname.startsWith('/icons/')) {
    event.respondWith(caches.match(request).then((hit) => hit ?? fetch(request)))
  }
})
