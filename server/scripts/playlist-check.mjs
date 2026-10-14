// Run with the server up on a freshly seeded database:  npm run test:playlists
import { io } from 'socket.io-client'
const B = 'http://localhost:5000/api'
const req = async (path, { method = 'GET', body, token } = {}) => {
  const r = await fetch(B + path, { method, headers: { ...(body ? { 'content-type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined })
  return { status: r.status, data: await r.json().catch(() => null) }
}
let fails = 0
const ok = (label, cond) => { console.log((cond ? 'PASS ' : 'FAIL ') + label); if (!cond) fails++ }
const tok = async (e, p = 'Member@123') => (await req('/auth/login', { method: 'POST', body: { email: e, password: p } })).data.token
const R = await tok('ramesh@example.com'), M = await tok('meera@example.com')

console.log('--- my playlists')
let mine = (await req('/playlists', { token: R })).data
ok('Ramesh has the 2 seeded playlists', mine.length === 2 && mine.find((p) => p.code === 'gondalday').itemIds.join() === 'h1,h2,h8,h10,h13')
ok('login required to list', (await req('/playlists')).status === 401)
let r = await req('/playlists', { method: 'POST', token: R, body: { title: 'Temples to visit', description: 'Weekend plan', isPublic: false } })
ok('create a playlist', r.status === 201 && r.data.code.length >= 8 && r.data.itemIds.length === 0)
const pl = r.data
ok('empty name rejected', (await req('/playlists', { method: 'POST', token: R, body: { title: '  ' } })).status === 400)

console.log('--- adding, ordering, removing')
for (const id of ['h5', 'h7', 'e1', 'o1', 'v-gondal', 's2']) r = await req(`/playlists/${pl.id}/items`, { method: 'POST', token: R, body: { itemId: id } })
ok('items added in order, all kinds (record, event, oral, village, story)', r.data.itemIds.join() === 'h5,h7,e1,o1,v-gondal,s2')
r = await req(`/playlists/${pl.id}/items`, { method: 'POST', token: R, body: { itemId: 'h5' } }); ok('adding the same item twice does nothing', r.data.itemIds.length === 6)
ok('item that does not exist rejected (404)', (await req(`/playlists/${pl.id}/items`, { method: 'POST', token: R, body: { itemId: 'h9999' } })).status === 404)
ok('malformed item id rejected (400)', (await req(`/playlists/${pl.id}/items`, { method: 'POST', token: R, body: { itemId: 'drop table' } })).status === 400)
r = await req(`/playlists/${pl.id}/order`, { method: 'PUT', token: R, body: { itemIds: ['s2', 'v-gondal', 'o1', 'e1', 'h7', 'h5'] } })
ok('reorder', r.status === 200 && (await req('/playlists', { token: R })).data.find((p) => p.id === pl.id).itemIds.join() === 's2,v-gondal,o1,e1,h7,h5')
ok('reorder with a missing item rejected', (await req(`/playlists/${pl.id}/order`, { method: 'PUT', token: R, body: { itemIds: ['s2', 'h5'] } })).status === 400)
r = await req(`/playlists/${pl.id}/items/o1`, { method: 'DELETE', token: R }); ok('remove an item, rest stay in order', r.data.itemIds.join() === 's2,v-gondal,e1,h7,h5')

console.log('--- privacy and ownership')
ok('private list: owner can open by link', (await req(`/playlists/shared/${pl.code}`, { token: R })).data?.isOwner === true)
ok('private list: stranger gets 404', (await req(`/playlists/shared/${pl.code}`, { token: M })).status === 404)
ok('private list: visitor gets 404', (await req(`/playlists/shared/${pl.code}`)).status === 404)
ok("another member cannot edit it (404)", (await req(`/playlists/${pl.id}`, { method: 'PATCH', token: M, body: { title: 'hacked' } })).status === 404)
ok("another member cannot add items (404)", (await req(`/playlists/${pl.id}/items`, { method: 'POST', token: M, body: { itemId: 'h1' } })).status === 404)
ok("another member cannot delete it (404)", (await req(`/playlists/${pl.id}`, { method: 'DELETE', token: M })).status === 404)
r = await req('/playlists/shared/gondalday'); ok('public list opens for a visitor with owner name, not owner', r.status === 200 && r.data.owner === 'Ramesh Vaghela' && r.data.isOwner === false && r.data.itemIds.length === 5)
r = await req(`/playlists/${pl.id}`, { method: 'PATCH', token: R, body: { isPublic: true, title: 'Temples to visit (shared)' } })
ok('making it public works', r.data.isPublic && (await req(`/playlists/shared/${pl.code}`)).status === 200)
await req(`/playlists/${pl.id}`, { method: 'PATCH', token: R, body: { isPublic: false } })
ok('making it private again hides it', (await req(`/playlists/shared/${pl.code}`)).status === 404)

console.log('--- saving a copy (and the owner is told live)')
const sock = io('http://localhost:5000', { auth: { token: R } }); const got = []
sock.on('notification', (n) => got.push(n)); await new Promise((res) => sock.on('connect', res))
r = await req('/playlists/shared/gondalday/copy', { method: 'POST', token: M })
ok('Meera saved a copy: private, same items, same order', r.status === 201 && r.data.isPublic === false && r.data.itemIds.join() === 'h1,h2,h8,h10,h13' && r.data.code !== 'gondalday')
await new Promise((res) => setTimeout(res, 500))
ok('Ramesh got a live "playlist" notification linking to it', got.some((n) => n.type === 'playlist' && n.link === '/playlists/gondalday' && n.text.includes('Meera Joshi')))
ok('copying your own playlist rejected', (await req('/playlists/shared/gondalday/copy', { method: 'POST', token: R })).status === 400)
ok('copying a private playlist rejected (404)', (await req(`/playlists/shared/${pl.code}/copy`, { method: 'POST', token: M })).status === 404)
sock.close()

console.log('--- limits')
let last
for (let i = 0; i < 30; i++) last = await req('/playlists', { method: 'POST', token: M, body: { title: `List ${i}` } })
ok('a member cannot exceed 30 playlists (409)', last.status === 409)
const big = (await req('/playlists', { method: 'POST', token: R, body: { title: 'Big' } })).data
for (const id of [...Array(5).keys()].map((n) => `h${n + 1}`)) await req(`/playlists/${big.id}/items`, { method: 'POST', token: R, body: { itemId: id } })
ok('deleting a playlist removes it and its items', (await req(`/playlists/${big.id}`, { method: 'DELETE', token: R })).status === 200 && !(await req('/playlists', { token: R })).data.some((p) => p.id === big.id))

console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED')
process.exit(fails ? 1 : 0)
