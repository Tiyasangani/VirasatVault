import multer from 'multer'
import path from 'node:path'
import fs from 'node:fs'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { config } from '../config.js'
import { HttpError } from './errors.js'

export const uploadDir = fileURLToPath(new URL('../../uploads', import.meta.url))
fs.mkdirSync(uploadDir, { recursive: true })

const ALLOWED_MIME = { images: /^image\/(jpeg|png|webp|gif)$/, video: /^video\//, audio: /^audio\// }

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `${crypto.randomUUID()}${/^\.[a-z0-9]{1,5}$/.test(ext) ? ext : ''}`)   // never trust the uploaded name
  },
})

// ---- Check the real file contents ("magic bytes"), not just the label the browser sent ----
const read = (file, n = 16) => { const fd = fs.openSync(file, 'r'); const buf = Buffer.alloc(n); fs.readSync(fd, buf, 0, n, 0); fs.closeSync(fd); return buf }
const ascii = (buf, from, to) => buf.toString('latin1', from, to)
const SIGNATURES = {
  image: (b) => (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) || ascii(b, 1, 4) === 'PNG' || ascii(b, 0, 4) === 'GIF8' || (ascii(b, 0, 4) === 'RIFF' && ascii(b, 8, 12) === 'WEBP'),
  audio: (b) => ascii(b, 0, 3) === 'ID3' || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0) || (ascii(b, 0, 4) === 'RIFF' && ascii(b, 8, 12) === 'WAVE')
    || ascii(b, 0, 4) === 'OggS' || ascii(b, 4, 8) === 'ftyp' || ascii(b, 0, 4) === 'fLaC' || (b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3),
  video: (b) => ascii(b, 4, 8) === 'ftyp' || (b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3) || ascii(b, 0, 4) === 'OggS',
}
const KIND = { images: ['image'], audio: ['audio'], video: ['video'], file: ['image', 'audio'] }

const allFiles = (req) => (req.files ? Object.values(req.files).flat() : req.file ? [req.file] : [])
const discard = (files) => files.forEach((f) => fs.promises.unlink(f.path).catch(() => {}))

export function verifyUploads(req, _res, next) {
  const files = allFiles(req)
  for (const f of files) {
    const kinds = KIND[f.fieldname] ?? []
    let ok = false
    try { const head = read(f.path); ok = kinds.some((k) => SIGNATURES[k](head)) } catch { ok = false }
    if (!ok) { discard(files); return next(new HttpError(400, `“${f.originalname}” is not a valid ${kinds.join(' or ')} file.`)) }
  }
  next()
}

// Where the file ends up. With CLOUDINARY_URL set it is uploaded to Cloudinary (survives server restarts);
// otherwise it stays on this server's disk and is served from /uploads. `file.stored` is what we save in the database.
export async function persistUploads(req, _res, next) {
  const files = allFiles(req)
  try {
    if (config.cloudinaryEnabled) {
      const { v2: cloudinary } = await import('cloudinary')
      for (const f of files) {
        const result = await cloudinary.uploader.upload(f.path, { folder: 'heritagehub', resource_type: 'auto' })
        f.stored = result.secure_url
        await fs.promises.unlink(f.path).catch(() => {})
      }
    } else {
      files.forEach((f) => { f.stored = `/uploads/${f.filename}` })
    }
    next()
  } catch (err) {
    console.error('File storage failed:', err.message)
    discard(files)
    next(new HttpError(502, 'We could not store your file. Please try again in a moment.'))
  }
}

const contributionFields = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024, files: 8 },
  fileFilter: (_req, file, cb) => (ALLOWED_MIME[file.fieldname]?.test(file.mimetype) ? cb(null, true) : cb(new HttpError(400, `Unsupported file type for ${file.fieldname}.`))),
}).fields([{ name: 'images', maxCount: 6 }, { name: 'video', maxCount: 1 }, { name: 'audio', maxCount: 1 }])

const adminFile = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => (/^(image\/(jpeg|png|webp|gif)|audio\/)/.test(file.mimetype) ? cb(null, true) : cb(new HttpError(400, 'Only image or audio files are allowed.'))),
}).single('file')

// Use as: router.post(path, requireAuth, ...contributionUpload, handler)
export const contributionUpload = [contributionFields, verifyUploads, persistUploads]
export const adminFileUpload = [adminFile, verifyUploads, persistUploads]
