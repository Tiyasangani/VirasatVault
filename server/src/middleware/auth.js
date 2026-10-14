import jwt from 'jsonwebtoken'
import { config } from '../config.js'
import { query } from '../db/pool.js'
import { HttpError } from './errors.js'

// The token carries a version number. Changing a password bumps the version in the database,
// which instantly invalidates every token issued before it.
export const signToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role, v: user.token_version ?? 0 }, config.jwtSecret, { expiresIn: config.jwtExpiresIn })

// Returns the user for a valid, current token, otherwise null. Also used by the live (Socket.IO) connection.
export async function userFromToken(token) {
  try {
    const payload = jwt.verify(token, config.jwtSecret)
    const [user] = await query('SELECT id, name, email, role, token_version, banned FROM users WHERE id = $1', [payload.sub])
    if (!user || (payload.v ?? 0) !== user.token_version) return null
    return user
  } catch {
    return null
  }
}

async function loadUser(req) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return null
  return userFromToken(header.slice(7))
}

// Adds req.user when a valid token is sent, but never blocks the request.
export const optionalAuth = async (req, _res, next) => {
  const user = await loadUser(req)
  req.user = user && !user.banned ? user : null
  next()
}

export const requireAuth = async (req, _res, next) => {
  const user = await loadUser(req)
  if (!user) return next(new HttpError(401, 'Please log in to continue.'))
  if (user.banned) return next(new HttpError(403, 'This account has been suspended. Contact the site team if you think this is a mistake.'))
  req.user = user
  next()
}

export const requireAdmin = (req, _res, next) => {
  if (req.user?.role !== 'admin') return next(new HttpError(403, 'Reviewer access only.'))
  next()
}
