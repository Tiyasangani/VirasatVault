import http from 'node:http'
import app from './app.js'
import { config, validateConfig } from './config.js'
import { pool } from './db/pool.js'
import { initRealtime } from './realtime.js'
import { startScheduler } from './scheduler.js'

validateConfig()

try {
  await pool.query('SELECT 1')
} catch (err) {
  console.error('Cannot connect to PostgreSQL. Check DATABASE_URL (and DATABASE_SSL=true for hosted databases).\n', err.message)
  process.exit(1)
}

// Express and Socket.IO share one HTTP server (and one port).
const server = http.createServer(app)
const io = initRealtime(server)
startScheduler()
server.listen(config.port, () => console.log(`VirasatVault running on http://localhost:${config.port} (${config.isProd ? 'production' : 'development'})`))

// Hosts send SIGTERM before restarting. Finish current requests, then close cleanly.
const shutdown = (signal) => {
  console.log(`${signal} received, shutting down...`)
  io.close()
  server.close(async () => { await pool.end().catch(() => {}); process.exit(0) })
  setTimeout(() => process.exit(1), 10_000).unref()
}
process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
process.on('unhandledRejection', (err) => console.error('Unhandled rejection:', err))
