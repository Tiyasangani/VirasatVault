import fs from 'node:fs'
import { pool } from '../src/db/pool.js'
const B = 'http://localhost:5000'
const up = new URL('../uploads', import.meta.url).pathname
const req = async (path, { method = 'GET', body, token, form } = {}) => {
  const r = await fetch(B + path, { method, headers: { ...(body ? { 'content-type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: form ?? (body ? JSON.stringify(body) : undefined) })
  return { status: r.status, data: await r.json().catch(() => null), headers: r.headers, raw: r }
}
let fails = 0
const ok = (label, cond) => { console.log((cond ? 'PASS ' : 'FAIL ') + label); if (!cond) fails++ }
const login = async (email, password) => (await req('/api/auth/login', { method: 'POST', body: { email, password } }))
const admin = (await login('admin@heritagehub.demo', 'Admin@123')).data
const T = admin.token

console.log('--- headers and public files')
const h = await req('/api/health')
ok('health checks the database', h.status === 200 && h.data.db === true)
ok('security headers set (CSP, nosniff, no x-powered-by)', !!h.headers.get('content-security-policy') && h.headers.get('x-content-type-options') === 'nosniff' && !h.headers.get('x-powered-by'))
const robots = await (await fetch(B + '/robots.txt')).text(); ok('robots.txt hides admin and lists sitemap', robots.includes('Disallow: /admin') && robots.includes('sitemap.xml'))
const sm = await (await fetch(B + '/sitemap.xml')).text(); ok('sitemap lists records', sm.includes('/heritage/old-stepwell-xyz') && sm.includes('/villages/gondal'))
ok('unknown API path gives JSON 404', (await req('/api/nope')).status === 404)

console.log('--- registration needs consent')
const user = { name: 'Launch Tester', email: 'launch@example.com', password: 'Passw0rdOne', village: 'Gondal', district: 'Rajkot' }
let r = await req('/api/auth/register', { method: 'POST', body: user })
ok('registration without accepting terms rejected', r.status === 400 && r.data.fields?.acceptTerms)
r = await req('/api/auth/register', { method: 'POST', body: { ...user, acceptTerms: true } })
ok('registration with consent works', r.status === 201)
const U = r.data.token, uid = r.data.user.id
const row = (await pool.query('SELECT terms_accepted_at FROM users WHERE id=$1', [uid])).rows[0]; ok('consent time stored', !!row.terms_accepted_at)

console.log('--- uploads are verified by content')
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64')
const fields = { title: 'Lamp Niches of the Old Well', category: 'historical-places', village: 'dhoraji', district: 'Rajkot', period: 'Living tradition', description: 'Small stone niches along the third landing of the old well once held oil lamps during Diwali evenings, according to elders.', source: 'Interview with elders' }
const build = (extra = {}, file) => { const f = new FormData(); Object.entries({ ...fields, ...extra }).forEach(([k, v]) => f.append(k, v)); if (file) f.append('images', file.blob, file.name); return f }
r = await req('/api/contributions', { method: 'POST', token: U, form: build({}, { blob: new Blob([png], { type: 'image/png' }), name: 'a.png' }) })
ok('contribution without the rights confirmation rejected', r.status === 400 && r.data.fields?.rights)
const before = fs.readdirSync(up).length
r = await req('/api/contributions', { method: 'POST', token: U, form: build({ rights: 'true' }, { blob: new Blob(['<script>alert(1)</script> not an image'], { type: 'image/jpeg' }), name: 'evil.jpg' }) })
ok('a fake image (wrong real content) is rejected', r.status === 400 && /not a valid image/.test(r.data.message))
ok('...and the file is not kept on disk', fs.readdirSync(up).length === before)
r = await req('/api/contributions', { method: 'POST', token: U, form: build({ rights: 'true' }, { blob: new Blob([png], { type: 'image/png' }), name: 'a.png' }) })
ok('a real PNG is accepted', r.status === 201 && r.data.images.length === 1)
r = await req('/api/admin/upload', { method: 'POST', token: T, form: (() => { const f = new FormData(); f.append('file', new Blob(['hello'], { type: 'audio/mpeg' }), 'x.mp3'); return f })() })
ok('text pretending to be audio rejected on admin upload', r.status === 400)

console.log('--- reviews and comments moderation')
await req('/api/reviews', { method: 'POST', token: U, body: { targetId: 'h1', rating: 1, text: 'Abusive review text' } })
let list = (await req('/api/reviews/h1')).data; const rv = list.reviews.find((x) => x.author === 'Launch Tester')
ok('review posted', !!rv)
ok('member cannot delete other reviews via admin route', (await req(`/api/admin/reviews/${rv.id}`, { method: 'DELETE', token: U })).status === 403)
ok('admin can remove a review', (await req(`/api/admin/reviews/${rv.id}`, { method: 'DELETE', token: T })).status === 200 && (await req('/api/reviews/h1')).data.reviews.every((x) => x.author !== 'Launch Tester'))
const c1 = (await req('/api/comments', { method: 'POST', token: U, body: { targetId: 'h3', text: 'Rude comment to remove.' } })).data
ok('admin can remove a comment', (await req(`/api/admin/comments/${c1.id.replace('cm', '')}`, { method: 'DELETE', token: T })).status === 200 && (await req('/api/comments/h3')).data.every((c) => c.id !== c1.id))

console.log('--- suspending accounts')
ok('admin cannot suspend self', (await req(`/api/admin/users/${admin.user.id}/ban`, { method: 'PATCH', token: T, body: { banned: true } })).status === 400)
ok('member cannot suspend anyone', (await req(`/api/admin/users/${uid}/ban`, { method: 'PATCH', token: U, body: { banned: true } })).status === 403)
ok('admin suspends the user', (await req(`/api/admin/users/${uid}/ban`, { method: 'PATCH', token: T, body: { banned: true } })).status === 200)
ok('suspended token is refused (403)', (await req('/api/me/state', { token: U })).status === 403)
ok('suspended user cannot log in', (await login(user.email, user.password)).status === 403)
await req(`/api/admin/users/${uid}/ban`, { method: 'PATCH', token: T, body: { banned: false } })
ok('restored user can log in again', (await login(user.email, user.password)).status === 200)

console.log('--- password reset logs out old sessions')
const t1 = (await login(user.email, user.password)).data.token
const fp = (await req('/api/auth/forgot-password', { method: 'POST', body: { email: user.email } })).data
ok('dev reset link returned (no email configured, not production)', !!fp.devLink)
const reset = (await req('/api/auth/reset-password', { method: 'POST', body: { token: fp.devLink.split('/').pop(), password: 'BrandNew123' } }))
ok('password reset works', reset.status === 200)
ok('the OLD login token no longer works', (await req('/api/auth/me', { token: t1 })).status === 401)
ok('login with the new password works', (await login(user.email, 'BrandNew123')).status === 200)
ok('google demo login enabled outside production', (await req('/api/auth/google-demo', { method: 'POST' })).status === 200)

console.log('--- deleting your own account')
const U2 = (await login(user.email, 'BrandNew123')).data.token
await req('/api/comments', { method: 'POST', token: U2, body: { targetId: 'h3', text: 'A comment that should stay but be anonymous.' } })
ok('wrong password refused', (await req('/api/auth/me', { method: 'DELETE', token: U2, body: { password: 'nope' } })).status === 401)
ok('admin accounts cannot self-delete', (await req('/api/auth/me', { method: 'DELETE', token: T, body: { password: 'Admin@123' } })).status === 403)
ok('correct password deletes the account', (await req('/api/auth/me', { method: 'DELETE', token: U2, body: { password: 'BrandNew123' } })).status === 200)
ok('cannot log in afterwards', (await login(user.email, 'BrandNew123')).status === 401)
const cm = (await req('/api/comments/h3')).data.find((c) => c.text.startsWith('A comment that should stay'))
ok('their comment remains but the name is removed', cm?.author === 'Former member')

console.log('--- brute-force protection')
let last = 0
for (let i = 0; i < 11; i++) last = (await login('victim@example.com', 'wrong-password-' + i)).status
ok('11th wrong login in a row is blocked (429)', last === 429)

await pool.end()
console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED')
process.exit(fails ? 1 : 0)
