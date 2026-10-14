# How to run VirasatVault (step by step)

You need two things installed once: **Node.js 18 or newer** (https://nodejs.org) and **PostgreSQL 14 or newer** (https://www.postgresql.org/download) or Docker.

## 1. Database (pick ONE)

**A. Docker (easiest, nothing else to install):**
```bash
docker compose up -d
```
Then use this database address in step 2: `postgres://hh:hhpass@localhost:5432/heritagehub`
(If it does not connect, open `docker-compose.yml` and use the user and password written there.)

**B. PostgreSQL installed on your computer.** Open "SQL Shell (psql)" and run:
```sql
CREATE USER hh WITH PASSWORD 'hhpass';
CREATE DATABASE heritagehub OWNER hh;
```
Database address: `postgres://hh:hhpass@localhost:5432/heritagehub`

## 2. Start the server (first terminal)
```bash
cd server
npm install
cp .env.example .env          # Windows: copy .env.example .env
```
Open `server/.env` in a text editor and set:
```
DATABASE_URL=postgres://hh:hhpass@localhost:5432/heritagehub
JWT_SECRET=any-long-random-text-at-least-32-characters-long
```
Then:
```bash
npm run db:setup              # creates the tables and loads the sample data
npm run dev                   # server on http://localhost:5000
```

## 3. Start the website (second terminal)
```bash
cd client
npm install
npm run dev                   # website on http://localhost:5173
```
Open **http://localhost:5173** in your browser.

## 4. Log in
| Role | Email | Password |
|---|---|---|
| Reviewer (admin) | admin@heritagehub.demo | Admin@123 |
| Member | ramesh@example.com | Member@123 |

## 5. Where to see the new features
- **Detailed image content:** open any record, village, story or event, click **Photo details** on a picture. Or open **Gallery** in the menu.
- **Dark theme:** moon icon in the top bar.  **Listen:** button on records, villages and stories.
- **Trail Planner:** `/trail` (or "Add to trail" on any record).  **Archive Insights:** `/insights`.  **Add to calendar:** open any event.
- **Offline / install:** these only work in the production build (see "Run as one site" below), open http://localhost:5000, then use the browser's Install option.
  The browser only allows installing on `localhost` or an `https` address.

## Run as one site (like production)
```bash
npm run build                 # in the project root: builds the website
cd server
# in .env add:  SERVE_CLIENT=true
npm start                     # everything on http://localhost:5000
```

## Common problems
| Problem | Fix |
|---|---|
| `ECONNREFUSED 127.0.0.1:5432` | PostgreSQL is not running. Start it (or `docker compose up -d`). |
| `password authentication failed` | The user or password in `DATABASE_URL` does not match step 1. |
| "VirasatVault could not load" in the browser | The server (step 2) is not running. |
| Pictures show drawings instead of photos | No internet. Photos load from Unsplash; the drawings are the built-in fallback. Everything else works offline except map tiles. |
| Want to reset the sample data | `cd server && npm run db:setup` (this deletes everything in that database). |
| Never run `db:setup` on a live site | It wipes the data. Read DEPLOYMENT.md. |

Optional checks (server running, fresh `db:setup`, wait a minute between them): `npm run test:launch`, `npm run test:playlists`, `npm run test:realtime` in `server`. Restart the server after `db:setup` before `test:realtime`.
