# Launch checklist

Tick everything before you tell anyone about the site.

## Content and honesty
- [ ] Production database was created with `db:init` and **not** with `db:setup` / `db:seed` (no demo accounts, no made-up records).
- [ ] You added real villages and records. Every record marked **Verified** has sources you checked.
- [ ] You replaced stock photos. The home page category tiles use the pictures listed in `client/src/data/images.js`; point them at your own photographs (upload them in the admin panel, or Cloudinary) before launch. Stock photo links are placeholders and some may not load.
- [ ] You own, or have permission for, every photo and recording on the site.

## Legal pages (needed because visitors upload content)
- [ ] `VITE_CONTACT_EMAIL` is set to a real mailbox you check.
- [ ] You read **Terms of Use** and **Privacy Policy** (they are templates), added the "last updated" dates, and ideally had a lawyer or your institution review them.
- [ ] You know how you will answer a copyright complaint or a removal request (admin can delete any record, comment or review).

## Security (all built in; confirm the settings)
- [ ] `JWT_SECRET` is a long random value (the server refuses to start otherwise).
- [ ] `PUBLIC_URL` starts with `https://` and the site opens with the padlock.
- [ ] `ENABLE_DEMO_LOGIN` is **not** set (the fake "Continue with Google" button is switched off in production).
- [ ] You can log in as admin and the demo accounts (`admin@heritagehub.demo`, `ramesh@example.com`) do **not** exist.
- [ ] `.env` files are not in GitHub.
- [ ] Your admin password is long and unique.

Built in: passwords are hashed; logins are rate-limited; sessions end when a password is reset; every write is validated on the server; uploads are checked by their real content and size; security headers and a content-security policy are on; members can be suspended; the admin can remove comments and reviews; members can delete their own account.

## Working features (test on the live address)
- [ ] Register with a new email, accept the terms, log in, log out.
- [ ] Forgot password email arrives and works.
- [ ] Submit a contribution with a photo; approve it as admin; it appears publicly; the contributor is notified live.
- [ ] Upload an oral history recording in the admin panel and play it.
- [ ] Open a verified record **on the live domain**, print its poster, and scan the QR code with a phone.
- [ ] The map shows markers and the background map tiles load.
- [ ] Open the site on a phone and check the menu, a record page and the contribute form.

## Operations
- [ ] Uptime monitor on `/api/health`.
- [ ] You know where your backups are and how to restore one.
- [ ] Sitemap submitted to Google Search Console.
- [ ] Someone besides you can log in as a second admin (create with `npm run create-admin`).

## Known limits (not blockers, but good to know)
- Logins use a token stored in the browser. This is standard for this kind of site, and the security headers reduce the risk, but it is a trade-off compared with cookie-only sessions.
- There is no email verification when registering, and no two-factor login.
- The map background comes from OpenStreetMap's public tile servers; if the site becomes busy, use a tile provider with an account.
- The AI assistant matches keywords in your records; it is not a language model.
