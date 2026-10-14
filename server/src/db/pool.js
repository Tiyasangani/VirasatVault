import pg from 'pg'
import { config } from '../config.js'

// Return DATE columns as plain "YYYY-MM-DD" strings instead of JS Date objects.
pg.types.setTypeParser(1082, (value) => value)

export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
  ssl: config.databaseSsl ? { rejectUnauthorized: false } : undefined,   // hosted databases (Neon, Supabase, Render) need SSL
})
// A dropped idle connection must not crash the server.
pool.on('error', (err) => console.error('Database pool error:', err.message))

export const query = async (text, params = []) => (await pool.query(text, params)).rows
