# VirasatVault – Every Place Has a Past. Every Story Deserves a Future.

Full-stack project: **React + Vite** (client) · **Node.js + Express** (server) · **PostgreSQL** (database).

```
heritagehub-full/
  client/   React app (pages, components, context, api/client.js)
  server/   Express API (routes, middleware, db schema + seed)
  docker-compose.yml   optional PostgreSQL container
```

> **Going live?** Read **DEPLOYMENT.md** (step by step, free services) and **LAUNCH_CHECKLIST.md** first.
> Never use `db:setup` on a live database: it deletes everything. Use `db:init` once, then `db:migrate` for updates.

## What is new in this version (VirasatVault)
| Change | Details |
|---|---|
| **New name and message** | Site name **VirasatVault**, tagline *Every Place Has a Past. Every Story Deserves a Future.*, and the new description in the header, hero, footer, About page, page titles and share previews. New logo and favicon. |
| **Detailed content for every image** | Every photograph has a title, caption, a long description, "What to look for", "Why it matters", "How to document it", tags, place and credit. Open it with the **Photo details** button on any picture. The text lives in `client/src/data/imageDetails.js`. Contributor uploads get automatic details from their record. |
| **Photo viewer** | Full-screen viewer with Next / Previous (arrow keys), Esc to close, copy caption, open original, and links to the pages a photo appears on. Works on phones. |
| **Photo Gallery page** (`/gallery`) | All photographs with search and filters by subject, village and district. |
| **Built-in illustrations** | If a photograph cannot load (offline, blocked, expired link) an illustration of the same subject is shown instead of an empty box. |
| **Richer records** | All 14 sample heritage records now have three paragraphs of detail. |
| **Dark theme** | Moon / sun button in the header. Remembered between visits and follows the device setting by default. |
| **Listen** | A Listen button reads records, villages and stories aloud with the browser voice (hidden if the browser has none). |
| **Heritage Trail Planner** (`/trail`) | Pick places, find the ones **near you**, press **Best order** for the shortest sensible route, see distance and time, open the route in **Google Maps**, **print** the itinerary, or copy a link to share it. "Add to trail" also appears on every record and village. Saved in the browser. |
| **Add to Calendar** | Every event page has **Google Calendar** and **.ics** (Apple / Outlook) buttons, with a reminder one day before. |
| **Archive Insights** (`/insights`) | Live dashboard: totals, charts by category, village, period and type, the gaps the archive needs filled, records awaiting verification, a five-point completeness score per record, and the most appreciated records. |
| **Installable app + offline mode** | Install VirasatVault on a phone or computer ("Install the app" in the footer). Pages and records already opened keep working with no connection, with an offline notice. Photos from outside sources show built-in illustrations when offline. Built in `client/public/sw.js` (production build only). |
| **Back-to-top button**, hero and About rewrite, new pages in menus and footer. | |

Technical names (database `heritagehub`, user `hh`, admin demo email `admin@heritagehub.demo`) were left unchanged on purpose so existing setups keep working.

## 1. Requirements
- Node.js 18+
- PostgreSQL 14+ (or Docker, see below)

## 2. Database
**Option A: Docker** (no PostgreSQL install needed)
```bash
docker compose up -d
```
**Option B: installed PostgreSQL.** Create a user and database:
```sql
CREATE USER hh WITH PASSWORD 'hhpass';
CREATE DATABASE heritagehub OWNER hh;
```

## 3. Run the server
```bash
cd server
npm install
cp .env.example .env        # Windows: copy .env.example .env
npm run db:setup            # creates all tables and loads sample data
npm run dev                 # http://localhost:5000
```
Edit `.env` if your database user/password differ, and set `JWT_SECRET` to a long random string.

## 4. Run the client (second terminal)
```bash
cd client
npm install
npm run dev                 # http://localhost:5173
```
Vite forwards `/api` requests to the server, so no extra config is needed in development.

## Upgrading from the previous version (keep your existing data)
```bash
cd server
npm install
npm run db:migrate      # adds the new tables and the search extension; deletes nothing
cd ../client
npm install             # adds the map libraries
```
A fresh install does not need this: `npm run db:setup` already includes it.

### Upgrading to the real-time version
Run the same steps again: in `server` run `npm install` then `npm run db:migrate`, and in `client` run `npm install`. Restart both. No data is deleted.

## Demo accounts (created by `db:setup`)
| Role | Email | Password |
|---|---|---|
| Reviewer (admin) | admin@heritagehub.demo | Admin@123 |
| Contributor | ramesh@example.com | Member@123 |

You can also create your own account on `/register`.

## Try the full flow (good for your viva)
1. Log in as **ramesh**, open **Contribute**, submit a record with a photo.
2. Log out, log in as **admin**, open **Admin → Contributions**, select it, press **Approve**.
3. The record is now a **Verified Heritage** page with a record number and QR code, visible in Explore and on the map. Ramesh gets a notification and +25 points.
4. Try Reject / Request changes: a note is required, and the contributor is notified.

## Features added in this version
| Feature | Where to find it |
|---|---|
| Real map (OpenStreetMap, zoom, clusters) | `/map`, and the map on home, village and record pages (needs internet for the map background) |
| Admin add / edit / delete | Admin → Villages, Heritage, Events, Oral histories |
| Real audio upload and playback | Admin → Oral histories (upload a file); playback on the village page and home page |
| Printable QR poster | A verified record page → "Printable poster" → Print or save as PDF |
| Edit and resubmit | Profile → a submission with "Changes Requested" → Edit and resubmit |
| Typo-tolerant search | Search icon (try "stepwel" or "Gondl") |
| Contributor leaderboard and public profiles | `/contributors` |
| Admin charts | Admin → Dashboard |
| Forgot password (demo) | Login → Forgot password. With no email service, the reset link appears on screen and in the server terminal. Set `NODE_ENV=production` to hide it, and send the link by email instead |

When you deploy, set `VITE_SITE_URL` in the client (for example `https://yoursite.com`) so QR codes and posters contain the public address.

## Real-time features (Socket.IO)
The browser keeps a live WebSocket connection to the server. When something happens, the server pushes it instantly, so nobody has to refresh.

| What happens | Who is told, live |
|---|---|
| Someone submits a contribution | Every admin gets a notification; the admin queue and dashboard numbers update by themselves |
| An admin approves a contribution | The author gets "approved"; everyone in that district gets "new heritage in your district"; every open page reloads its data so the new record appears |
| Admin rejects or asks for changes | The author is notified and their profile updates |
| Admin sends an announcement (Admin → Announcements) | All members, or one district, get it instantly |
| An event is 1 to 3 days away, starts today, or is on right now (multi-day events) | Members in that district, and anyone who saved the event, get a reminder (checked every 15 minutes, each kind sent once) |
| Someone reviews, comments on or likes a record | The record's owner is notified; everyone viewing that page sees new reviews and comments appear |
| Someone reports a problem | Admins are notified |

Every notification is also saved in PostgreSQL, so people who were offline still see it when they return. Clicking a notification opens the page it is about.

How it works (for your viva): `server/src/realtime.js` creates "rooms" (one per user, one for admins, one per page being viewed). `server/src/utils/notify.js` saves a notification and pushes it to the right room. `server/src/scheduler.js` runs the event reminders. In the client, `AppContext.jsx` holds the connection and `hooks/useRealtime.js` lets any page listen for events.

Check it yourself: with the server running, `npm run test:realtime` in `server` connects several users and verifies who receives what. (It adds sample data, so run `npm run db:setup` afterwards to reset.)

## API summary (all under `/api`)
| Area | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `POST /auth/google-demo` |
| Public | `GET /bootstrap`, `/villages[/:slug]`, `/heritage[/:slug]` (filters: category, district, village, verified, q), `/stories[/:slug]`, `/events[/:slug]`, `/oral-histories`, `/search?q=`, `/comments/:id` |
| Signed-in user | `GET /me/state`, `POST /bookmarks/toggle`, `POST /likes/toggle`, `POST /comments`, `POST /contributions` (multipart), `POST /reports`, notifications read endpoints |
| Admin only | `GET /admin/stats`, `/admin/analytics`, `/admin/contributions`, `PATCH /admin/contributions/:id`, `/admin/reports`, `PATCH /admin/reports/:id/resolve`, `/admin/users`, `POST /admin/upload`, and `POST/PUT/DELETE /admin/villages`, `/admin/heritage`, `/admin/events`, `/admin/oral-histories` |
| Contributors | `GET /contributors?district=`, `GET /contributors/:id` |
| Reviews | `GET /reviews/:id`, `POST /reviews`, `DELETE /reviews/:id` (id like `h3` for a record, `s1` for a story) |
| Announcements (admin) | `GET/POST /admin/broadcasts`, `POST /admin/reminders/run` |
| Password reset | `POST /auth/forgot-password`, `POST /auth/reset-password` |
| Resubmit | `PUT /contributions/:id` (multipart, owner only, only when changes were requested) |
| AI assistant | `POST /assistant` |

## How it fits together (for explaining)
- **Database design:** `server/src/db/schema.sql`. Content tables (villages, heritage, stories, events, oral_histories) plus users, contributions, reports, bookmarks, likes, comments, notifications. List-like fields (gallery, timeline, sources) are JSONB columns.
- **Auth:** passwords hashed with bcrypt; login returns a JWT that the client sends as `Authorization: Bearer <token>`. `requireAuth` and `requireAdmin` middleware protect routes. Auth routes are rate-limited.
- **Validation:** every write is validated on the server with zod; the client validates too for friendly messages.
- **Verification workflow:** approving a contribution runs in one SQL **transaction**: it locks the row, creates the verified heritage record, awards points, notifies the contributor, and rolls everything back if any step fails.
- **Uploads:** multer saves images/audio/video to `server/uploads` (type and size limits) and the API serves them at `/uploads`.
- **Client data flow:** `main.jsx` loads `/api/bootstrap` once into `client/src/data/index.js`; user actions go through `AppContext` → `api/client.js`.

## Not production-ready yet (be honest in your viva)
- **Google sign-in** is a demo button (`/auth/google-demo`). Real use needs OAuth.
- **AI assistant** is rule-based over database records. Swap the `answer()` function in `server/src/routes/assistant.js` for a real model call.
- **Uploads** are stored on local disk; use Cloudinary or S3 for deployment.
- **Admin sections** Users and Categories are read-only overviews. Villages, Heritage, Events, Oral histories, Contributions and Reports are fully editable.
- **Password reset** has no email service; see the table above.
- Sample content is demonstration data, not verified history. Photos are loaded from URLs in `server/src/seed/data/images.js` (seed) so replace those with your own photos and run `npm run db:seed`.
- Search uses substring matching plus trigram similarity (`pg_trgm`) for typos. For much larger data, add `tsvector` full-text search.

## Deploying
Set `VITE_API_URL` (client), and `DATABASE_URL`, `JWT_SECRET`, `CLIENT_ORIGIN`, `PUBLIC_URL` (server). Build the client with `npm run build` and serve `client/dist` from any static host.


## Playlists
Members can group places, stories, events, villages and oral histories into named playlists.
- Add anything with the **Playlist** button on a record, story, event, village or recording; manage lists at `/playlists`.
- Reorder with the arrow buttons, rename, delete, and switch a list between **private** and **public**. Public lists open for anyone with the link (`/playlists/<code>`); the code is random, so private lists cannot be guessed.
- **Play all recordings** plays a playlist's oral histories one after another.
- Anyone logged in can **save a copy** of a public playlist; the owner is notified live.
- Limits: 30 playlists per member, 100 items per playlist. Check with `npm run test:playlists` in `server` (fresh `db:setup` first).

## Launch hardening (added for going live)
- **Production safety:** the server refuses to start with a weak `JWT_SECRET` or a non-https `PUBLIC_URL`; `db:init` and `db:seed` refuse to run on a database that is in production mode and already has tables.
- **Security:** security headers and content-security policy, rate limits (general, writes, per-account login, registration, resets), sessions invalidated after a password reset, uploads checked by real content, admin routes protected.
- **Moderation:** suspend/restore members, remove comments and reviews, report system, members can delete their own account.
- **Privacy and legal:** Terms and Privacy pages (templates), consent recorded at registration, "I have the right to share this" on every contribution.
- **Email:** password reset emails through any SMTP provider. **Photos:** Cloudinary when `CLOUDINARY_URL` is set (otherwise local disk).
- **Hosting:** the server can serve the built website itself (`SERVE_CLIENT=true`), with `/sitemap.xml` and `/robots.txt`. Includes `render.yaml` and a `Dockerfile`.
- **Admin:** `npm run create-admin -- email "Name"` makes the first reviewer account.

Checks you can run on a local test database (`npm run db:setup` first, server running): `npm run test:launch` (security, moderation, consent, uploads) and `npm run test:realtime` (live notifications). Both add sample data, so run `npm run db:setup` again afterwards.
