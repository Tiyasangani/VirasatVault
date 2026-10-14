import { io } from 'socket.io-client'
const B = 'http://localhost:5000/api', S = 'http://localhost:5000'
const post = async (path, body, token, method = 'POST') => {
  const r = await fetch(B + path, { method, headers: { 'content-type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined })
  return { status: r.status, data: await r.json().catch(() => null) }
}
const login = async (email, password) => (await post('/auth/login', { email, password })).data.token
const pass = { admin: ['admin@heritagehub.demo', 'Admin@123'] }
const T = {}
for (const [k, e] of Object.entries({ admin: 'admin@heritagehub.demo', ramesh: 'ramesh@example.com', meera: 'meera@example.com', kishan: 'kishan@example.com', dipti: 'dipti@example.com', bhavna: 'bhavna@example.com' })) T[k] = await login(e, k === 'admin' ? 'Admin@123' : 'Member@123')

const log = {}   // name -> [{event, payload}]
const connect = (name, token) => new Promise((resolve) => {
  const s = io(S, { auth: token ? { token } : {} })
  log[name] = []
  for (const ev of ['notification', 'admin:refresh', 'contribution:updated', 'data:changed', 'review:changed', 'comment:new']) s.on(ev, (p) => log[name].push({ ev, p }))
  s.on('connect', () => resolve(s))
})
const socks = {}
for (const n of ['admin', 'ramesh', 'meera', 'kishan', 'dipti', 'bhavna']) socks[n] = await connect(n, T[n])
socks.visitor = await connect('visitor', null)
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const got = (n, ev, type) => log[n].filter((x) => x.ev === ev && (!type || x.p.type === type))
const reset = () => Object.values(log).forEach((l) => (l.length = 0))
let fails = 0
const ok = (label, cond) => { console.log((cond ? 'PASS ' : 'FAIL ') + label); if (!cond) fails++ }

console.log('--- automatic event reminder (scheduler runs 5s after start)')
await wait(7000)
const k0 = got('kishan', 'notification', 'event'), d0 = got('dipti', 'notification', 'event')
ok('Morbi members got a reminder with no manual action', k0.length >= 1 && d0.length >= 1)
console.log('   ', k0[0]?.p.text)
ok('Rajkot member did not', got('ramesh', 'notification', 'event').length === 0)
let run = await post('/admin/reminders/run', null, T.admin); ok('running again sends none (no duplicates)', run.data.sent === 0)
reset()

console.log('--- admin announcement')
await post('/admin/broadcasts', { message: 'Heritage walk this Sunday, everyone is welcome.', audience: 'all' }, T.admin)
await wait(500)
ok('every member got it live', ['ramesh', 'meera', 'kishan', 'dipti', 'bhavna'].every((n) => got(n, 'notification', 'broadcast').length === 1))
ok('admin and visitor did not', got('admin', 'notification', 'broadcast').length === 0 && got('visitor', 'notification').length === 0)
reset()
const b2 = await post('/admin/broadcasts', { message: 'Morbi district meeting at 5 pm.', audience: 'district', district: 'Morbi' }, T.admin)
await wait(500)
ok('district announcement only reaches that district', got('kishan', 'notification', 'broadcast').length === 1 && got('dipti', 'notification', 'broadcast').length === 1 && got('ramesh', 'notification', 'broadcast').length === 0)
ok('recipient count recorded', b2.data.recipients === 2)
ok('member cannot send announcements', (await post('/admin/broadcasts', { message: 'Spam spam spam', audience: 'all' }, T.ramesh)).status === 403)
ok('empty message rejected', (await post('/admin/broadcasts', { message: 'x', audience: 'all' }, T.admin)).status === 400)
reset()

console.log('--- new submission reaches admins live')
const fd = new FormData()
Object.entries({ title: 'Lamp Niches of the Old Well', category: 'historical-places', village: 'dhoraji', district: 'Rajkot', period: 'Living tradition', description: 'Small stone niches along the third landing of the old well once held oil lamps during Diwali evenings, according to elders.', source: 'Interview with elders', rights: 'true' }).forEach(([k, v]) => fd.append(k, v))
const sub = await fetch(B + '/contributions', { method: 'POST', headers: { Authorization: `Bearer ${T.ramesh}` }, body: fd })
await wait(500)
ok('admin got a live "submission" notification', got('admin', 'notification', 'submission').length === 1)
ok('admin pages told to refresh', got('admin', 'admin:refresh').length === 1)
ok('submitter did not get one', got('ramesh', 'notification', 'submission').length === 0)
reset()

console.log('--- approving publishes and announces to the district')
const pending = (await post('/admin/contributions', null, T.admin, 'GET')).data
const bh = pending.find((c) => c.title.startsWith('Kalyan Rai'))   // Jetpur, Rajkot, from Nilesh (no account)
const ramC = pending.find((c) => c.title === 'Pattern Books of the Solanki Workshop')   // Bhavna's, Jetpur
await post(`/admin/contributions/${ramC.id}`, { status: 'Approved' }, T.admin, 'PATCH')
await wait(600)
ok('contributor (Bhavna) told "approved" live', got('bhavna', 'notification', 'approved').length === 1)
ok('contributor page told to refresh', got('bhavna', 'contribution:updated').length === 1)
ok('Rajkot members told about new heritage in their district', got('ramesh', 'notification', 'district').length === 1 && got('meera', 'notification', 'district').length === 1)
ok('Morbi member NOT told', got('kishan', 'notification', 'district').length === 0)
ok('author not told twice', got('bhavna', 'notification', 'district').length === 0)
ok('every open page (even visitors) told to reload data', got('visitor', 'data:changed').length === 1 && got('kishan', 'data:changed').length === 1)
reset()
await post(`/admin/contributions/${bh.id}`, { status: 'Rejected', note: 'No source provided.' }, T.admin, 'PATCH'); await wait(400)
ok('rejection by admin sends no district announcement', got('ramesh', 'notification', 'district').length === 0)
reset()

console.log('--- live reviews, comments and likes')
socks.meera.emit('watch', 'h3'); socks.kishan.emit('watch', 'h3'); await wait(300)
let r = await post('/reviews', { targetId: 'h3', rating: 5, text: 'Wonderful record.' }, T.dipti)
ok('review saved (201)', r.status === 201)
await wait(500)
ok('people viewing the page got a live update', got('meera', 'review:changed').length === 1 && got('kishan', 'review:changed').length === 1)
ok('people NOT viewing did not', got('bhavna', 'review:changed').length === 0)
ok('owner (Ramesh) notified of the new review', got('ramesh', 'notification', 'review').length === 1)
reset()
r = await post('/reviews', { targetId: 'h3', rating: 3, text: 'Changed my mind.' }, T.dipti); await wait(400)
ok('editing a review is 200 and updates live', r.status === 200 && got('meera', 'review:changed').length === 1)
ok('editing does not spam the owner', got('ramesh', 'notification', 'review').length === 0)
let list = (await (await fetch(B + '/reviews/h3')).json()); ok(`average/count correct (${list.average} from ${list.count})`, list.count === 3 && Math.abs(list.average - 4) < 0.01)
ok('cannot review your own record', (await post('/reviews', { targetId: 'h3', rating: 5 }, T.ramesh)).status === 403)
ok('rating must be 1-5', (await post('/reviews', { targetId: 'h3', rating: 9 }, T.dipti)).status === 400)
ok('must be logged in', (await post('/reviews', { targetId: 'h3', rating: 5 })).status === 401)
ok('missing item 404', (await post('/reviews', { targetId: 'h999', rating: 5 }, T.dipti)).status === 404)
reset()
await post('/comments', { targetId: 'h3', text: 'Live comment from Dipti.' }, T.dipti); await wait(400)
ok('comment appears live for viewers', got('meera', 'comment:new').length === 1 && got('meera', 'comment:new')[0].p.comment.text.includes('Live comment'))
ok('owner notified of comment', got('ramesh', 'notification', 'comment').length === 1)
reset()
await post('/likes/toggle', { id: 'h3' }, T.dipti); await wait(400)
ok('owner notified of like', got('ramesh', 'notification', 'like').length === 1)
await post('/likes/toggle', { id: 'h3' }, T.dipti); await wait(400)
ok('unlike does not notify again', got('ramesh', 'notification', 'like').length === 1)
await post('/likes/toggle', { id: 'h3' }, T.ramesh); await wait(300)
ok('liking your own record notifies nobody', got('ramesh', 'notification', 'like').length === 1)
reset()
await post('/reports', { target: 'Mani Mandir', reason: 'Wrong location', detail: 'The marker is slightly north of the temple.' }); await wait(400)
ok('admin notified of a new report live', got('admin', 'notification', 'report').length === 1)

console.log('--- persisted too (not only live)')
const st = (await post('/me/state', null, T.ramesh, 'GET')).data
ok('notifications are saved in the database with links', st.notifications.some((n) => n.type === 'review' && n.link === '/heritage/old-stepwell-xyz'))
Object.values(socks).forEach((s) => s.close())
console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED')
process.exit(fails ? 1 : 0)
