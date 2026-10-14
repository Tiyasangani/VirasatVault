# Launching VirasatVault on the internet

This guide takes you from your computer to a public website, one small step at a time.
Everything below has a free option. Total time: about 1 to 2 hours the first time.

**What you will set up**

| Part | Service (free plan) | What it does |
|---|---|---|
| Code storage | GitHub | Holds your project so the host can read it |
| Database | Neon | Your PostgreSQL database online |
| Website + server | Render | Runs VirasatVault and gives it an https address |
| Photos and audio | Cloudinary | Keeps uploaded files safe (Render's disk is wiped on restart) |
| Email | Brevo | Sends password-reset emails |
| Your own address (optional) | Any domain seller | `yourname.com` instead of `yourapp.onrender.com` |

The site and the server run together as **one** service, so there is nothing to connect between them.

---

## Step 1. Put the project on GitHub
1. Create a free account at **github.com**, then click **New repository**. Name it `heritagehub`, keep it **Private**, click **Create**.
2. Install **Git** from git-scm.com.
3. In your project folder (the one that contains `client` and `server`), open a terminal and run:
   ```
   git init
   git add .
   git commit -m "VirasatVault"
   git branch -M main
   git remote add origin https://github.com/YOUR-NAME/heritagehub.git
   git push -u origin main
   ```
   Passwords and `.env` files are never uploaded (they are in `.gitignore`). Check on github.com that there is no `.env` file in the repository.

## Step 2. Create the database (Neon)
1. Sign up at **neon.tech** and click **Create project**. Pick the region nearest your visitors (for India choose Singapore or Mumbai if offered).
2. On the project page click **Connect** and copy the **connection string**. It looks like `postgresql://user:password@ep-xxxx.neon.tech/neondb?sslmode=require`. Keep it private.

## Step 3. Create the tables and your admin login
Do this once, from your own computer, in the project folder. Replace the connection string with yours.

**Windows PowerShell**
```
$env:NODE_ENV="production"
$env:DATABASE_SSL="true"
$env:DATABASE_URL="postgresql://user:password@ep-xxxx.neon.tech/neondb?sslmode=require"
npm --prefix server install
npm run db:init
npm run create-admin -- you@yourmail.com "Your Name"
```
**Mac / Linux**
```
export NODE_ENV=production DATABASE_SSL=true DATABASE_URL="postgresql://..."
npm --prefix server install
npm run db:init
npm run create-admin -- you@yourmail.com "Your Name"
```
The last command asks you to choose an admin password (10+ characters, with a number). **This is your reviewer login for the live site.**

> The live database starts **empty on purpose**. The demo data contains made-up records and accounts with known passwords, so the setup refuses to load it in production. You will add real content from the admin panel.
> `db:init` also refuses to run a second time on a database that already has tables, so you cannot wipe your live site by accident.

## Step 4. Photo storage (Cloudinary)
1. Sign up at **cloudinary.com** (free).
2. On the dashboard click **API Keys** (or "Go to API Keys") and copy the **API environment variable**. It looks like `cloudinary://123456789:abcDEF@yourcloudname`.
3. You will paste it into Render as `CLOUDINARY_URL` in Step 6.

## Step 5. Email (Brevo)
1. Sign up at **brevo.com** (free, about 300 emails a day).
2. Go to **SMTP & API** and create an **SMTP key**. Note these four values: server `smtp-relay.brevo.com`, port `587`, your login (shown on that page), and the key.
3. Under **Senders**, add and verify the email address you want emails to come from.

## Step 6. Launch on Render
1. Sign up at **render.com** with GitHub.
2. Click **New** then **Blueprint**, choose your `heritagehub` repository, and continue. Render reads `render.yaml`.
3. Fill in the values it asks for:

| Name | Value |
|---|---|
| `DATABASE_URL` | The Neon connection string from Step 2 |
| `PUBLIC_URL` and `SITE_URL` | Your address with https, e.g. `https://heritagehub.onrender.com` (the exact name is shown on the Render page; you can fix it after the first deploy) |
| `CLOUDINARY_URL` | From Step 4 |
| `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` | From Step 5 (`SMTP_PORT` is already 587) |
| `MAIL_FROM` | `VirasatVault <the-email-you-verified>` |
| `VITE_CONTACT_EMAIL` | The email people can write to about the site (shown on Terms and Privacy) |

4. Click **Apply**. The first build takes 5 to 10 minutes. When it says **Live**, open the address.
5. If you guessed the address wrong in `PUBLIC_URL` / `SITE_URL`, correct both in **Environment**, save, and let Render redeploy.

## Step 7. First checks on the live site
1. Open your address. You should see the VirasatVault home page (it will look empty until you add content).
2. Log in with the admin email and password from Step 3. You land in the admin area.
3. **Admin, Villages, Add village.** Add your first village (name, district, coordinates, short summary, a paragraph or two). Upload a photo using the **Upload** button.
4. **Admin, Heritage, Add heritage record.** Tick **Verified Heritage** only when you have checked the sources.
5. Open the public site and confirm the village and record appear, and the QR code on the record opens the right page when scanned with a phone.
6. Log out, click **Forgot password**, and confirm the email arrives and the reset link works.
7. Create a normal member account from another browser and submit a contribution with a photo. Approve it from the admin area.

## Step 8. Use your own domain (optional)
1. Buy a domain from any seller.
2. In Render open your service, **Settings, Custom Domains, Add**, and enter it. Render shows the DNS records to create at your domain seller. Https is set up automatically.
3. Change `PUBLIC_URL` and `SITE_URL` to `https://yourdomain.com` and redeploy. QR codes and posters use whatever address the page is opened on, so open each record **on the live domain** before printing a QR code.

## Step 9. After launch
- **Monitoring:** create a free monitor at **uptimerobot.com** for `https://yourdomain.com/api/health`. It also keeps a free Render service from falling asleep.
- **Backups:** Neon keeps recent history on its free plan. For your own copy, run occasionally: `pg_dump "YOUR_CONNECTION_STRING" > backup.sql`. Also download your Cloudinary media periodically.
- **Updating the site:** change the code, then `git add . && git commit -m "update" && git push`. Render redeploys by itself. If the update includes database changes, run `npm run db:migrate` from your computer (with the same variables as Step 3) **before or right after** pushing. It never deletes data.
- **If a secret leaks:** change the value in Render. Changing `JWT_SECRET` logs everyone out.
- **Search engines:** your site publishes `/sitemap.xml` and `/robots.txt`. Submit the sitemap in Google Search Console.

## Free-plan limits to know about
- A free Render service **sleeps after 15 minutes without visitors**, so the first visit afterwards takes about 30 to 60 seconds. The uptime monitor above avoids this; a paid plan removes it.
- Free databases have storage limits; check them as the archive grows.
- Live updates (notifications) reconnect automatically after the server wakes up.

## Using Docker instead
A `Dockerfile` is included (it builds the website and the server into one image). Run it on any host that supports containers with the same environment variables listed in `server/.env.production.example`. It is untested in this project, so try it on a small test host first.
