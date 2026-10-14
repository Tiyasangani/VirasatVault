import fs from 'node:fs'
import path from 'node:path'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { config } from './config.js'
import { pool, query } from './db/pool.js'
import { uploadDir } from './middleware/upload.js'
import { errorHandler, notFound } from './middleware/errors.js'
import authRoutes from './routes/auth.js'
import publicRoutes from './routes/public.js'
import meRoutes from './routes/me.js'
import adminRoutes from './routes/admin.js'
import assistantRoutes from './routes/assistant.js'
import contributorRoutes from './routes/contributors.js'
import reviewRoutes from './routes/reviews.js'
import playlistRoutes from './routes/playlists.js'

const app = express()
app.disable('x-powered-by')
// Behind a host's proxy (Render, Railway...) the real visitor IP is in X-Forwarded-For. Needed for rate limiting.
if (config.isProd) app.set('trust proxy', 1)

// Security headers. The CSP lists exactly what the website loads: its own files, Google Fonts,
// photos from any HTTPS address (uploads, Cloudinary, map tiles) and the live WebSocket connection.
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },   // the website may be on another origin than the API
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      'script-src': ["'self'"],
      'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
      'img-src': ["'self'", 'data:', 'blob:', 'https:'],
      'media-src': ["'self'", 'blob:', 'https:'],
      'connect-src': ["'self'", 'ws:', 'wss:', ...config.clientOrigin.split(',').map((o) => o.trim())],
      'frame-ancestors': ["'none'"],
      'upgrade-insecure-requests': config.isProd ? [] : null,
    },
  },
}))
app.use(cors({ origin: config.clientOrigin.split(',').map((o) => o.trim()) }))
app.use(compression())
app.use(morgan(config.isProd ? 'combined' : 'dev', { skip: (req) => req.path === '/api/health' }))
app.use(express.json({ limit: '100kb' }))

// Rate limits: a general one for everything, and a tighter one for anything that changes data.
const tooMany = { message: 'Too many requests. Please slow down and try again shortly.' }
app.use('/api', rateLimit({ windowMs: 60_000, limit: 300, standardHeaders: true, legacyHeaders: false, message: tooMany }))
app.use('/api', rateLimit({ windowMs: 60_000, limit: 90, standardHeaders: true, legacyHeaders: false, message: tooMany, skip: (req) => req.method === 'GET' }))

app.use('/uploads', express.static(uploadDir, { maxAge: '7d', setHeaders: (res) => res.setHeader('Content-Disposition', 'inline') }))

// Hosts ping this to know the server is healthy. It checks the database too.
app.get('/api/health', async (_req, res) => {
  try { await pool.query('SELECT 1'); res.json({ ok: true, db: true }) } catch { res.status(503).json({ ok: false, db: false }) }
})
app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api', publicRoutes)
app.use('/api', meRoutes)
app.use('/api', assistantRoutes)
app.use('/api', contributorRoutes)
app.use('/api', reviewRoutes)
app.use('/api', playlistRoutes)
app.use('/api', notFound)           // unknown /api paths get a JSON 404

// Search engines
app.get('/robots.txt', (_req, res) => {
  res.type('text/plain').send(`User-agent: *\nDisallow: /admin\nDisallow: /api/\nSitemap: ${config.siteUrl}/sitemap.xml\n`)
})
app.get('/sitemap.xml', async (_req, res, next) => {
  try {
    const [heritage, villages, stories, events] = await Promise.all([
      query('SELECT slug FROM heritage'), query('SELECT slug FROM villages'), query('SELECT slug FROM stories'), query('SELECT slug FROM events')])
    const pages = ['', '/explore', '/villages', '/map', '/stories', '/events', '/about', '/contributors', '/terms', '/privacy',
      ...villages.map((r) => `/villages/${r.slug}`), ...heritage.map((r) => `/heritage/${r.slug}`),
      ...stories.map((r) => `/stories/${r.slug}`), ...events.map((r) => `/events/${r.slug}`)]
    res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map((p) => `  <url><loc>${config.siteUrl}${p}</loc></url>`).join('\n')}\n</urlset>`)
  } catch (err) { next(err) }
})

// Optional: serve the built React website from this same server (one deployment, no CORS needed).
if (config.serveClient) {
  if (!fs.existsSync(path.join(config.clientDist, 'index.html'))) {
    console.error(`SERVE_CLIENT=true but ${config.clientDist}/index.html was not found. Build the client first (npm run build).`)
    process.exit(1)
  }
  app.use(express.static(config.clientDist, { index: false, maxAge: '1h', setHeaders: (res, file) => { if (file.includes(`${path.sep}assets${path.sep}`)) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable') } }))
  // Any other address is a page of the React app (its own router decides what to show).
  app.get('*', (req, res, next) => (req.path.startsWith('/uploads') || req.path.startsWith('/socket.io') ? next() : res.sendFile(path.join(config.clientDist, 'index.html'))))
}

app.use(notFound)
app.use(errorHandler)
export default app
