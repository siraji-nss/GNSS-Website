# Deploying GlobalNest Study Solution

Split deploy, **entirely on free tiers**: **frontend on Vercel**, **backend
on Render**, **database on Turso**, **file storage on Cloudinary**.

The backend doesn't use local disk for anything anymore — the database lives
on Turso (a hosted, SQLite-compatible database) and uploaded images/
documents go straight to Cloudinary. That's what makes Render's free web
service tier viable here: with no persistent disk requirement, there's
nothing for a redeploy or restart to wipe.

## 1. Database → Turso

1. Sign up at [turso.tech](https://turso.tech) (free, no card required).
2. Create a database (any name/region).
3. From its dashboard page, grab:
   - **Database URL** (starts with `libsql://...`)
   - An **Auth Token** (create one if not shown by default)

## 2. File storage → Cloudinary

1. Sign up at [cloudinary.com](https://cloudinary.com) (free).
2. Your dashboard home page shows, right at the top:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

## 3. Backend → Render

1. Push this repo to GitHub (Render deploys from a Git repo).
2. On [render.com](https://render.com), **New → Web Service**, connect the
   repo.
3. Configure:
   - **Root Directory**: `server`
   - **Instance Type**: Free
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start` (this runs the seed script, then the
     server — the seed is safe to re-run on every boot, see `server/src/seed.js`)
4. **Environment variables** (Render dashboard → Environment) — copy from
   `server/.env.example`:
   - `JWT_SECRET` — generate one: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - `ADMIN_USERNAME`, `ADMIN_PASSWORD` — real production admin credentials
   - `CLIENT_ORIGIN` — your Vercel URL once you have it (step 4 below); can
     update this after the first deploy
   - `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` — from step 1
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` —
     from step 2
   - `PORT` — leave unset; Render sets this automatically
5. Deploy. Note the resulting URL, e.g. `https://gnss-website.onrender.com`.

## 4. Frontend → Vercel

1. On [vercel.com](https://vercel.com), **New Project**, import the same repo.
2. Configure:
   - **Root Directory**: `client`
   - **Framework Preset**: Vite (auto-detected)
   - Build/output settings: leave as detected (`npm run build`, `dist`)
3. **Environment variable**:
   - `VITE_API_URL` = the Render URL from step 3, e.g.
     `https://gnss-website.onrender.com` (no trailing slash)
4. Deploy. Note the resulting URL, e.g. `https://globalnest.vercel.app`.

`client/vercel.json` already includes the SPA rewrite rule so client-side
routes (`/services/malta`, `/admin`, etc.) don't 404 on refresh.

## 5. Connect the two

Go back to Render → your service → Environment, and set `CLIENT_ORIGIN` to
your real Vercel URL (and any custom domain you add later), comma-separated
if more than one:

```
CLIENT_ORIGIN=https://globalnest.vercel.app,https://www.globalneststudysolution.com
```

Redeploy the backend for this to take effect. Without it, the browser will
block API requests from the Vercel frontend (CORS).

## 6. After first deploy

- Visit `https://<your-vercel-url>/admin/login`, sign in with the
  `ADMIN_USERNAME`/`ADMIN_PASSWORD` you set in Render, and **immediately
  change the password** via Admin → Change Password.
- Fill in real values in Admin → Site Settings (contact info, social links)
  if you haven't already.
- Replace the placeholder testimonials via Admin → Testimonials.

## Notes / limitations

- **Render's free tier sleeps** after ~15 minutes of inactivity — the first
  request after idle can take 30–60s to wake up. That's the one real
  tradeoff of staying on free; upgrading to a paid instance later removes
  it and needs no other changes.
- **Turso and Cloudinary free tiers** are generous for a small business
  site (Turso: 500+ databases, ~9GB storage; Cloudinary: 25 monthly
  credits, roughly thousands of images at this site's scale) — no
  particular usage warning needed at this site's expected traffic.
- **Custom domains** can be attached to Vercel (frontend) and Render
  (backend) independently — just keep `CLIENT_ORIGIN` and `VITE_API_URL` in
  sync with whatever domains you end up using.
- **Backups**: Turso supports point-in-time recovery/branching on its own;
  for extra safety you can also export the database periodically via the
  Turso CLI (`turso db shell <db-name> .dump`).
