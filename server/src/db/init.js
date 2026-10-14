import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { pool } from './pool.js'
import { config } from '../config.js'

const read = (name) => readFileSync(fileURLToPath(new URL(name, import.meta.url)), 'utf8')
// schema.sql DELETES every table first. Never let that happen to a live site by accident.
if (config.isProd && !process.argv.includes('--force')) {
  const [{ exists }] = (await pool.query("SELECT to_regclass('public.users') IS NOT NULL AS exists")).rows
  if (exists) {
    console.error('Refusing to run: this production database already has tables, and db:init would erase them.\nUse `npm run db:migrate` to update it safely. (Add --force only if you really want to wipe it.)')
    await pool.end()
    process.exit(1)
  }
}
await pool.query(read('./schema.sql'))
await pool.query(read('./migrate.sql'))
console.log('Database tables created.')
await pool.end()
