import bcrypt from 'bcryptjs'
import { pool } from '../db/pool.js'
import { config } from '../config.js'
import { villages } from './data/villages.js'
import { heritage } from './data/heritage.js'
import { stories } from './data/stories.js'
import { events } from './data/events.js'
import { oralHistories } from './data/oralHistories.js'
import { seedContributions, seedReports, seedNotifications } from './data/admin.js'

const json = JSON.stringify
if (config.isProd && !process.argv.includes('--force')) {
  console.error('Refusing to load demo data into a production database. It contains sample accounts with known passwords and made-up records.\nCreate your first admin with: npm run create-admin')
  await pool.end()
  process.exit(1)
}
const client = await pool.connect()

try {
  await client.query('BEGIN')
  await client.query('TRUNCATE notifications, comments, likes, bookmarks, reports, contributions, oral_histories, events, stories, heritage, villages, users RESTART IDENTITY CASCADE')

  // Users. Demo passwords are printed at the end; change them for any real deployment.
  const adminHash = await bcrypt.hash('Admin@123', 10)
  const memberHash = await bcrypt.hash('Member@123', 10)
  const userRows = [
    ['Archive Admin', 'admin@heritagehub.demo', adminHash, 'Rajkot', 'Rajkot', 'admin', 0],
    ['Ramesh Vaghela', 'ramesh@example.com', memberHash, 'Dhoraji', 'Rajkot', 'member', 340],
    ['Meera Joshi', 'meera@example.com', memberHash, 'Gondal', 'Rajkot', 'member', 140],
    ['Bhavna Solanki', 'bhavna@example.com', memberHash, 'Jetpur', 'Rajkot', 'member', 60],
    ['Kishan Zala', 'kishan@example.com', memberHash, 'Wankaner', 'Morbi', 'member', 260],
    ['Dipti Raval', 'dipti@example.com', memberHash, 'Morbi', 'Morbi', 'member', 50],
  ]
  const userId = {}
  for (const u of userRows) {
    const { rows: [r] } = await client.query('INSERT INTO users (name,email,password_hash,village,district,role,points) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id', u)
    userId[u[0]] = r.id
  }

  const villageId = {}
  for (const v of villages) {
    const { rows: [r] } = await client.query(
      `INSERT INTO villages (slug,name,district,region,image,gallery,summary,intro,lat,lng,people,foods,festivals)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id`,
      [v.slug, v.name, v.district, v.region, v.image, json(v.gallery), v.summary, json(v.intro), v.lat, v.lng, json(v.people), json(v.foods), json(v.festivals)])
    villageId[v.slug] = r.id
  }

  for (const h of heritage) {
    await client.query(
      `INSERT INTO heritage (slug,record_no,title,category,type,htype,village_id,district,period,year_label,image,gallery,lat,lng,summary,description,significance,timeline,sources,contributor_name,verified,likes_base)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)`,
      [h.slug, h.recordNo, h.title, h.category, h.type, h.htype, villageId[h.village], h.district, h.period, h.yearLabel, h.image, json(h.gallery), h.lat, h.lng,
        h.summary, json(h.description), h.significance, json(h.timeline), json(h.sources), h.contributor, h.verified, h.likes])
  }

  for (const s of stories) {
    await client.query(
      `INSERT INTO stories (slug,title,category,explore,village_id,district,contributor_name,read_time,published_on,image,featured,likes_base,excerpt,body)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
      [s.slug, s.title, s.category, s.explore, villageId[s.village], s.district, s.contributor, s.readTime, s.date, s.image, !!s.featured, s.likes, s.excerpt, json(s.body)])
  }

  for (const e of events) {
    await client.query(
      `INSERT INTO events (slug,name,category,event_date,end_date,village_id,location,district,image,description,schedule,entry)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [e.slug, e.name, e.category, e.date, e.endDate ?? null, villageId[e.village], e.location, e.district, e.image, e.description, json(e.schedule), e.entry])
  }

  for (const o of oralHistories) {
    await client.query('INSERT INTO oral_histories (title,speaker,village_id,duration,description) VALUES ($1,$2,$3,$4,$5)',
      [o.title, o.speaker, villageId[o.village], o.duration, o.description])
  }

  // Contributions from other people wait in the review queue; Ramesh's "changes requested" one is linked to his account.
  for (const c of seedContributions) {
    await client.query(
      `INSERT INTO contributions (user_id,contributor_name,title,category,village,district,period,description,images,sources,reference,extra,status,admin_note,submitted_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
      [userId[c.contributor] ?? null, c.contributor, c.title, c.category, c.village, c.district, c.period, c.description, json(c.images), c.sources, c.reference, c.extra, c.status, c.adminNote || null, c.submitted])
  }
  await client.query("INSERT INTO contribution_history (contribution_id, actor, status, note) VALUES (3, 'reviewer', 'Changes Requested', $1)", ['Please add dates and the notebook’s page references.'])
  // A few already-approved contributions so Ramesh's profile shows real history.
  for (const [title, village] of [['Stepwell Steps at Dusk', 'Dhoraji'], ['Evening Prayers at the Old Gateway', 'Dhoraji'], ['Names Painted on the Bazaar Wall', 'Dhoraji'], ['Oral History: The Story of Our Village', 'Dhoraji']]) {
    await client.query(
      `INSERT INTO contributions (user_id,contributor_name,title,category,village,district,period,description,sources,status,submitted_at)
       VALUES ($1,'Ramesh Vaghela',$2,'Historical Places',$3,'Rajkot','Living tradition',$4,'Field notes','Approved','2026-08-01')`,
      [userId['Ramesh Vaghela'], title, village, 'Approved sample contribution used to demonstrate contributor history on the profile page.'])
  }

  for (const r of seedReports) {
    await client.query('INSERT INTO reports (user_id,reporter_name,target,reason,detail,status,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [userId[r.reporter] ?? null, r.reporter, r.target, r.reason, r.detail, r.status, r.date])
  }

  for (const n of seedNotifications) {
    await client.query('INSERT INTO notifications (user_id,type,text,read,created_at) VALUES ($1,$2,$3,$4,$5)', [userId['Ramesh Vaghela'], n.type, n.text, n.read, n.time])
  }

  // Record owners (so reviews/comments/likes can notify them) and a few sample reviews.
  await client.query("UPDATE heritage h SET user_id = u.id FROM users u WHERE h.user_id IS NULL AND u.role = 'member' AND u.name = h.contributor_name")
  await client.query(`INSERT INTO reviews (target_id, user_id, author, rating, text) VALUES
    ('h3', $1, 'Meera Joshi', 5, 'A quiet, beautiful place. The elders'' stories about it are worth recording.'),
    ('h3', $2, 'Kishan Zala', 4, 'Well documented. I would like to see the inscription photographed.'),
    ('h1', $3, 'Ramesh Vaghela', 5, 'The carved balconies are the best part of the old town.')`,
    [userId['Meera Joshi'], userId['Kishan Zala'], userId['Ramesh Vaghela']])

  // Sample playlists for Ramesh: one public (shareable), one private.
  const { rows: [pl1] } = await client.query("INSERT INTO playlists (user_id, title, description, is_public, share_code) VALUES ($1,'Gondal in a day','A walking route through the old town: palaces, a museum, and where to eat.', true, 'gondalday') RETURNING id", [userId['Ramesh Vaghela']])
  for (const [i, id] of ['h1', 'h2', 'h8', 'h10', 'h13'].entries()) await client.query('INSERT INTO playlist_items (playlist_id, item_id, position) VALUES ($1,$2,$3)', [pl1.id, id, i + 1])
  const { rows: [pl2] } = await client.query("INSERT INTO playlists (user_id, title, description, is_public, share_code) VALUES ($1,'Voices to listen to','Oral histories and stories I want to revisit.', false, 'voices001') RETURNING id", [userId['Ramesh Vaghela']])
  for (const [i, id] of ['o1', 'o2', 'o3', 's1'].entries()) await client.query('INSERT INTO playlist_items (playlist_id, item_id, position) VALUES ($1,$2,$3)', [pl2.id, id, i + 1])

  const h3 = 'h3'
  await client.query('INSERT INTO comments (target_id,user_id,author,text,created_at) VALUES ($1,NULL,$2,$3,$4),($1,$5,$6,$7,$8)', [
    h3, 'Hetal Gohil', 'My grandmother used to talk about the third landing. Can we add a photograph there?', '2026-09-18T10:00:00Z',
    userId['Kishan Zala'], 'Kishan Zala', 'The pillar inscription looks like it may be later than the steps. Worth checking.', '2026-09-21T10:00:00Z'])
  await client.query("INSERT INTO likes (user_id, item_id) VALUES ($1,'s1')", [userId['Ramesh Vaghela']])
  await client.query("INSERT INTO bookmarks (user_id,item_type,item_id) VALUES ($1,'places','h3'),($1,'stories','s1')", [userId['Ramesh Vaghela']])

  await client.query('COMMIT')
  console.log('Seed complete.\n  Admin:  admin@heritagehub.demo / Admin@123\n  Member: ramesh@example.com / Member@123')
} catch (err) {
  await client.query('ROLLBACK')
  console.error('Seed failed:', err)
  process.exitCode = 1
} finally {
  client.release()
  await pool.end()
}
