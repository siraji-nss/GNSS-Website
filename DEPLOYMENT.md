# Deploying GlobalNest Study Solution

Split deploy: **frontend on Vercel**, **backend on Render**. The backend
needs a persistent disk for its SQLite database and uploaded images/
documents, which Vercel's serverless functions can't provide — Render (or
Railway) can.

## 1. Backend → Render

1. Push this repo to GitHub (Render deploys from a Git repo).
2. On [render.com](https://render.com), **New → Web Service**, connect the
   repo.
3. Configure:
   - **Root Directory**: `server`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start` (this runs the seed script, then the
     server — the seed is safe to re-run on every boot, see `server/src/seed.js`)
4. **Environment variables** (Render dashboard → Environment) — copy from
   `server/.env.example`:
   - `JWT_SECRET` — generate a real one: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - `ADMIN_USERNAME`, `ADMIN_PASSWORD` — real production admin credentials
   - `CLIENT_ORIGIN` — your Vercel URL once you have it (step 2); can update
     this after the first deploy
   - `DATA_DIR` — `/var/data` (see disk setup below)
   - `PORT` — leave unset; Render sets this automatically
5. **Add a persistent disk** (Render dashboard → your service → Disks):
   - Mount path: `/var/data`
   - Size: 1 GB is plenty to start
   - This is what makes `DATA_DIR=/var/data` durable across deploys/restarts
     — without it, the database and uploaded files reset on every deploy.
6. Deploy. Note the resulting URL, e.g. `https://globalnest-api.onrender.com`.

## 2. Frontend → Vercel

1. On [vercel.com](https://vercel.com), **New Project**, import the same repo.
2. Configure:
   - **Root Directory**: `client`
   - **Framework Preset**: Vite (auto-detected)
   - Build/output settings: leave as detected (`npm run build`, `dist`)
3. **Environment variable**:
   - `VITE_API_URL` = the Render URL from step 1, e.g.
     `https://globalnest-api.onrender.com` (no trailing slash)
4. Deploy. Note the resulting URL, e.g. `https://globalnest.vercel.app`.

`client/vercel.json` already includes the SPA rewrite rule so client-side
routes (`/services/malta`, `/admin`, etc.) don't 404 on refresh.

## 3. Connect the two

Go back to Render → your service → Environment, and set `CLIENT_ORIGIN` to
your real Vercel URL (and any custom domain you add later), comma-separated
if more than one:

```
CLIENT_ORIGIN=https://globalnest.vercel.app,https://www.globalneststudysolution.com
```

Redeploy the backend for this to take effect. Without it, the browser will
block API requests from the Vercel frontend (CORS).

## 4. After first deploy

- Visit `https://<your-vercel-url>/admin/login`, sign in with the
  `ADMIN_USERNAME`/`ADMIN_PASSWORD` you set in Render, and **immediately
  change the password** via Admin → Change Password.
- Fill in real values in Admin → Site Settings (contact info, social links)
  if you haven't already.
- Replace the placeholder testimonials via Admin → Testimonials.

## Notes / limitations

- **Free tiers sleep.** Render's free web service tier spins down after
  inactivity — the first request after idle can take 30–60s to wake up. For
  a live business site, use a paid instance (~$7/mo) to avoid that delay
  and to unlock persistent disks (required either way for this app).
- **Custom domains** can be attached to both Vercel (frontend) and Render
  (backend) independently — just keep `CLIENT_ORIGIN` and `VITE_API_URL` in
  sync with whatever domains you end up using.
- **Backups**: Render Disks aren't automatically backed up on the free/basic
  tier. Since `server/data/globalnest.db` holds all site content and student
  inquiries, periodically download it (Render Shell → the disk is at
  `/var/data`) or upgrade to a plan with automated disk snapshots.
