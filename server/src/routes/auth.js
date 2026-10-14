import { Router } from 'express'
import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'
import rateLimit from 'express-rate-limit'
import { z } from 'zod'
import { config } from '../config.js'
import { query } from '../db/pool.js'
import { requireAuth, signToken } from '../middleware/auth.js'
import { HttpError, asyncHandler } from '../middleware/errors.js'
import { getUserWithCounts } from '../utils/queries.js'
import { sendMail } from '../mailer.js'
import { disconnectUser } from '../realtime.js'

const router = Router()
const limiter = (limit, windowMs, key) => rateLimit({
  windowMs, limit, standardHeaders: true, legacyHeaders: false, keyGenerator: key,
  message: { message: 'Too many attempts. Please wait a while and try again.' },
})
const ip = (req) => req.ip
// Logins are limited per IP *and* email, so one attacker cannot hammer a single account.
const loginLimiter = limiter(10, 15 * 60 * 1000, (req) => `${req.ip}|${String(req.body?.email ?? '').toLowerCase()}`)
const registerLimiter = limiter(10, 60 * 60 * 1000, ip)
const resetLimiter = limiter(5, 60 * 60 * 1000, ip)

const passwordRule = z.string().min(8, 'Use at least 8 characters.').max(128, 'That password is too long.').regex(/\d/, 'Add at least one number.')
const registerSchema = z.object({
  name: z.string().trim().min(3, 'Enter your full name.').max(100),
  email: z.string().trim().toLowerCase().email('Enter a valid email address.').max(255),
  password: passwordRule,
  village: z.string().trim().min(1, 'Choose your village.').max(100),
  district: z.string().trim().min(1, 'Choose your district.').max(100),
  acceptTerms: z.literal(true, { errorMap: () => ({ message: 'Please accept the Terms and Privacy Policy to create an account.' }) }),
})
const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.').max(128),
})

const session = async (res, id, status = 200) => {
  const user = await getUserWithCounts(id)
  const [{ token_version }] = await query('SELECT token_version FROM users WHERE id = $1', [id])
  res.status(status).json({ token: signToken({ ...user, token_version }), user })
}

router.post('/register', registerLimiter, asyncHandler(async (req, res) => {
  const data = registerSchema.parse(req.body)
  const [exists] = await query('SELECT 1 FROM users WHERE email = $1', [data.email])
  if (exists) throw new HttpError(409, 'An account with this email already exists.', { email: 'This email is already registered.' })
  const hash = await bcrypt.hash(data.password, config.bcryptRounds)
  const [row] = await query(
    'INSERT INTO users (name, email, password_hash, village, district, terms_accepted_at) VALUES ($1,$2,$3,$4,$5, now()) RETURNING id',
    [data.name, data.email, hash, data.village, data.district])
  await session(res, row.id, 201)
}))

router.post('/login', loginLimiter, asyncHandler(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body)
  const [user] = await query('SELECT id, password_hash, banned FROM users WHERE email = $1', [email])
  // Same message for unknown email and wrong password, so attackers cannot tell which emails exist.
  if (!user || !(await bcrypt.compare(password, user.password_hash))) throw new HttpError(401, 'Email or password is incorrect.')
  if (user.banned) throw new HttpError(403, 'This account has been suspended. Contact the site team if you think this is a mistake.')
  await session(res, user.id)
}))

// DEMO ONLY: signs in one fixed account. Real Google sign-in needs OAuth. Disabled in production.
router.post('/google-demo', loginLimiter, asyncHandler(async (_req, res) => {
  if (!config.enableDemoLogin) throw new HttpError(404, 'Route not found.')
  const email = 'google.visitor@heritagehub.demo'
  let [user] = await query('SELECT id FROM users WHERE email = $1', [email])
  if (!user) {
    const hash = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), config.bcryptRounds)
    ;[user] = await query("INSERT INTO users (name, email, password_hash, village, district) VALUES ('Google Visitor',$1,$2,'Gondal','Rajkot') RETURNING id", [email, hash])
  }
  await session(res, user.id)
}))

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex')

// Password reset. The link is emailed. Without SMTP (local development only) it is printed in the server
// terminal and returned in the response so you can test the flow.
router.post('/forgot-password', resetLimiter, asyncHandler(async (req, res) => {
  const { email } = z.object({ email: z.string().trim().toLowerCase().email('Enter a valid email address.') }).parse(req.body)
  const out = { message: 'If that email is registered, we have sent a reset link. It works for 30 minutes.' }
  const [user] = await query('SELECT id, name FROM users WHERE email = $1 AND NOT banned', [email])
  if (user) {
    const token = crypto.randomBytes(32).toString('hex')
    await query("INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES ($1, $2, now() + interval '30 minutes')", [user.id, hashToken(token)])
    const link = `${config.siteUrl}/reset-password/${token}`
    if (config.mailEnabled) {
      sendMail({ to: email, subject: 'Reset your VirasatVault password', text: `Hello ${user.name},\n\nUse this link to choose a new password. It works for 30 minutes and only once:\n\n${link}\n\nIf you did not ask for this, you can ignore this email; your password has not changed.\n\nVirasatVault` })
        .catch((e) => console.error('Reset email failed:', e.message))
    } else if (!config.isProd) {
      console.log(`Password reset link for ${email}: ${link}`)
      out.devLink = link
    }
  }
  res.json(out)   // identical answer whether or not the email exists
}))

router.post('/reset-password', resetLimiter, asyncHandler(async (req, res) => {
  const { token, password } = z.object({ token: z.string().min(20).max(200), password: passwordRule }).parse(req.body)
  const [reset] = await query('SELECT id, user_id FROM password_resets WHERE token_hash = $1 AND NOT used AND expires_at > now()', [hashToken(token)])
  if (!reset) throw new HttpError(400, 'This reset link is invalid or has expired. Please request a new one.')
  // token_version + 1 logs the person out of every device that used the old password.
  await query('UPDATE users SET password_hash = $1, token_version = token_version + 1 WHERE id = $2', [await bcrypt.hash(password, config.bcryptRounds), reset.user_id])
  await query('UPDATE password_resets SET used = true WHERE user_id = $1', [reset.user_id])
  disconnectUser(reset.user_id)
  res.json({ message: 'Password updated. You can now log in.' })
}))

router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  res.json({ user: await getUserWithCounts(req.user.id) })
}))

// Let people delete their own account. Their name is removed from anything they published.
router.delete('/me', requireAuth, loginLimiter, asyncHandler(async (req, res) => {
  const { password } = z.object({ password: z.string().min(1, 'Enter your password to confirm.') }).parse(req.body)
  if (req.user.role === 'admin') throw new HttpError(403, 'Reviewer accounts cannot be deleted here. Ask another reviewer.')
  const [user] = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id])
  if (!(await bcrypt.compare(password, user.password_hash))) throw new HttpError(401, 'That password is not correct.', { password: 'That password is not correct.' })
  const id = req.user.id
  await query("UPDATE heritage SET contributor_name = 'Former contributor' WHERE user_id = $1", [id])
  await query("UPDATE contributions SET contributor_name = 'Former contributor' WHERE user_id = $1", [id])
  await query("UPDATE comments SET author = 'Former member' WHERE user_id = $1", [id])
  await query('DELETE FROM users WHERE id = $1', [id])    // likes, bookmarks, reviews and notifications are removed with it
  disconnectUser(id)
  res.json({ deleted: true })
}))

export default router
