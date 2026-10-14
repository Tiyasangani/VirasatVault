import 'dotenv/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const env = process.env
const isProd = env.NODE_ENV === 'production'
const first = (list) => (list ?? '').split(',')[0].trim()

const clientOrigin = env.CLIENT_ORIGIN || 'http://localhost:5173'
const publicUrl = (env.PUBLIC_URL || 'http://localhost:5000').replace(/\/$/, '')
const serveClient = env.SERVE_CLIENT === 'true'

export const config = {
  isProd,
  port: Number(env.PORT) || 5000,
  databaseUrl: env.DATABASE_URL,
  databaseSsl: env.DATABASE_SSL === 'true',
  jwtSecret: env.JWT_SECRET,
  jwtExpiresIn: env.JWT_EXPIRES_IN || '7d',
  bcryptRounds: Number(env.BCRYPT_ROUNDS) || 12,
  clientOrigin,
  publicUrl,
  serveClient,
  clientDist: env.CLIENT_DIST || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../client/dist'),
  // The public address people type in their browser. Used in emails and the sitemap.
  siteUrl: (env.SITE_URL || (serveClient ? publicUrl : first(clientOrigin))).replace(/\/$/, ''),
  // The fixed-account "Continue with Google" button is for demos only; it is off in production.
  enableDemoLogin: env.ENABLE_DEMO_LOGIN === 'true' || !isProd,
  smtp: { host: env.SMTP_HOST, port: Number(env.SMTP_PORT) || 587, secure: env.SMTP_SECURE === 'true', user: env.SMTP_USER, pass: env.SMTP_PASS, from: env.MAIL_FROM || 'VirasatVault <no-reply@localhost>' },
  mailEnabled: Boolean(env.SMTP_HOST),
  cloudinaryEnabled: Boolean(env.CLOUDINARY_URL),
}

// Called by the server at start-up (not by the setup scripts). Refuses to start with unsafe production
// settings and says exactly what to fix.
export function validateConfig() {
  const problems = []
  if (!config.databaseUrl) problems.push('DATABASE_URL is missing.')
  if (!config.jwtSecret) problems.push('JWT_SECRET is missing.')
  if (isProd) {
    if (config.jwtSecret && (config.jwtSecret.length < 32 || /change|secret-key|example/i.test(config.jwtSecret))) problems.push('JWT_SECRET must be a long random string (at least 32 characters). Generate one with: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"')
    if (!env.CLIENT_ORIGIN && !serveClient) problems.push('CLIENT_ORIGIN must be set to your website address (or set SERVE_CLIENT=true).')
    if (!config.publicUrl.startsWith('https://')) problems.push('PUBLIC_URL must start with https:// in production.')
    if (!config.mailEnabled) console.warn('WARNING: SMTP is not configured, so password-reset emails cannot be sent.')
    if (!config.cloudinaryEnabled) console.warn("WARNING: CLOUDINARY_URL is not set. Uploaded files will be stored on this server's disk and may be lost when it restarts.")
  }
  if (problems.length) {
    console.error('\nCannot start:\n - ' + problems.join('\n - ') + '\n')
    process.exit(1)
  }
}
