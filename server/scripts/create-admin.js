// Creates (or updates) a reviewer/admin account.
//   npm run create-admin -- you@example.com "Your Name"
// The password is asked for in the terminal (or read from the ADMIN_PASSWORD variable).
import readline from 'node:readline'
import bcrypt from 'bcryptjs'
import { pool } from '../src/db/pool.js'
import { config } from '../src/config.js'

const [email, ...nameParts] = process.argv.slice(2)
const name = nameParts.join(' ') || 'Archive Admin'
if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
  console.error('Usage: npm run create-admin -- you@example.com "Your Name"')
  process.exit(1)
}

const ask = (prompt) => new Promise((resolve) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true })
  const write = rl._writeToOutput
  rl._writeToOutput = (s) => (rl.line !== undefined && s !== prompt && !s.includes('\n') ? write.call(rl, '*') : write.call(rl, s))   // hide what is typed
  rl.question(prompt, (answer) => { rl.close(); console.log(); resolve(answer) })
})

const password = process.env.ADMIN_PASSWORD || await ask('Choose a password (at least 10 characters, with a number): ')
if (password.length < 10 || !/\d/.test(password)) {
  console.error('Password must be at least 10 characters and include a number.')
  process.exit(1)
}
const hash = await bcrypt.hash(password, config.bcryptRounds)
await pool.query(
  `INSERT INTO users (name, email, password_hash, role, village, district, terms_accepted_at) VALUES ($1,$2,$3,'admin','-','-', now())
   ON CONFLICT (email) DO UPDATE SET role = 'admin', password_hash = EXCLUDED.password_hash, banned = false, token_version = users.token_version + 1`,
  [name, email.toLowerCase(), hash])
console.log(`Admin account ready: ${email.toLowerCase()}`)
await pool.end()
