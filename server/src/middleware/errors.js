import { ZodError } from 'zod'

export class HttpError extends Error {
  constructor(status, message, fields) {
    super(message)
    this.status = status
    this.fields = fields
  }
}

// Wrap async route handlers so rejected promises reach the error middleware.
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

export const notFound = (_req, _res, next) => next(new HttpError(404, 'Route not found.'))

export function errorHandler(err, _req, res, _next) {
  if (err instanceof ZodError) {
    const fields = Object.fromEntries(err.issues.map((i) => [i.path.join('.'), i.message]))
    return res.status(400).json({ message: 'Please check the highlighted fields.', fields })
  }
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ message: 'A file is too large (max 8 MB).' })
  if (err.status) return res.status(err.status).json({ message: err.message, fields: err.fields })
  console.error(err)
  res.status(500).json({ message: 'Something went wrong. Please try again.' })
}
