import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { pool } from './pool.js'

const sql = readFileSync(fileURLToPath(new URL('./migrate.sql', import.meta.url)), 'utf8')
await pool.query(sql)
console.log('Migration applied.')
await pool.end()
