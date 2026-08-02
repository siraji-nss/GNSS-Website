# GlobalNest Study Solution — Website + Admin CMS

Full-stack site for GlobalNest Study Solution: a public marketing site plus a
password-protected admin panel that can edit, add, or delete every piece of
content on the site, and view/export student inquiry form responses to Excel.

## Stack

- **server/** — Node.js + Express API, SQLite database (Node's built-in
  `node:sqlite`, no native build tools required), JWT admin auth, image
  uploads, Excel export (`exceljs`).
- **client/** — React + Vite. One app serving both the public site and the
  `/admin` panel (client-side routed, protected by a login).

## First-time setup

```bash
# 1. Backend
cd server
npm install
npm run seed      # creates the admin user + seeds initial site content
npm run dev        # starts API on http://localhost:4000

# 2. Frontend (separate terminal)
cd client
npm install
npm run dev        # starts site on http://localhost:5173
```

Visit **http://localhost:5173** for the public site and
**http://localhost:5173/admin/login** for the admin panel.

## Default admin login

Set in `server/.env`:

- Username: `admin`
- Password: `GlobalNest@2026`

**Change this password immediately after first login** via
Admin → Change Password, and change `JWT_SECRET` in `server/.env` before
deploying anywhere public.

## What's editable from the Admin panel

- Homepage hero slides
- About page (mission, vision, intro) + Core Values
- Why Choose Us (four pillars)
- Target country cards (homepage/services grid)
- Country service pages (Australia, South Korea, Malaysia, Malta, UK, New
  Zealand, Finland) — requirements, process steps, FAQs, fees, tuition/living
  cost, all fully custom per country
- Working process steps
- Testimonials
- Blog posts
- Site settings: contact phone/email/address, WhatsApp, social links,
  taglines, legal disclaimers
- Student inquiry form responses, with **Export to Excel**

## Content still marked as placeholder — replace before launch

- **Testimonials**: two sample entries explicitly say "Replace this with a
  real success story." Real student testimonials should go in via Admin →
  Testimonials before launch — do not present placeholder quotes as real.
- **Contact details** (phone, WhatsApp, email, office address) in Admin →
  Site Settings are placeholders.
- **UK, New Zealand, Finland** service pages are stubs ("guidance is being
  finalized") since the source requirements doc only detailed Australia,
  South Korea, Malaysia, and Malta. Fill these in via Admin → Country Service
  Pages when ready.

## Logo assets

The original `Global-nest-17.ai`/`.png`/`.jpg` only had the icon stacked
above the wordmark. Since editing `.ai` files requires Adobe Illustrator
(not available here), the icon and wordmark were extracted from the
high-resolution PNG and recomposed into a side-by-side lockup instead —
pixel-accurate to the original artwork, not redrawn. Both light and dark
variants live in `client/public/brand/`:

- `logo-horizontal-dark.png` — dark wordmark, for light backgrounds (navbar)
- `logo-horizontal-light.png` — white wordmark, for dark backgrounds (footer,
  admin sidebar, login screen)
- `icon.png` / `icon-*.png` / `favicon-32.png` / `apple-touch-icon.png` —
  icon-only crops used for the favicon

If you'd rather have a true vector (.ai/.svg) side-by-side lockup, that step
still needs to happen in Illustrator directly from the source file.

## Theme

Colors were sampled directly from the logo artwork:

- `#136AAA` deep blue (headings, primary buttons)
- `#2589D2` mid blue
- `#39C1F0` sky blue (gradient highlight)
- `#C9A24B` gold accent (paired against the blues for an elevated, elegant
  feel — used for dividers, badges, and secondary CTAs)
- Warm cream background (`#FAF8F3`) instead of stark white, dark navy
  (`#0B2A44`) for footer/hero sections

Fonts: **Playfair Display** (headings) + **Inter** (body), loaded from
Google Fonts in `client/index.html`.

## Project structure

```
server/
  src/
    db.js              # SQLite schema
    seed.js             # admin user + initial content from requirements doc
    auth.js, middleware/requireAuth.js
    routes/
      crud.js            # generic CRUD factory used by most content routes
      auth.js, settings.js, about.js, blog.js, inquiries.js, upload.js
    index.js            # Express app + route wiring
  uploads/              # uploaded images (served at /uploads)
  data/globalnest.db    # SQLite database file

client/
  src/
    api/client.js        # fetch wrapper + auth token handling
    context/              # AuthContext, SiteSettingsContext
    components/           # Navbar, Footer, InquiryForm, WhatsAppButton, PublicLayout
    pages/                 # public site pages
    admin/                 # admin panel (layout, login, per-section editors)
    styles/                # theme.css, public.css, admin.css
  public/brand/           # logo + favicon assets
```

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for the full step-by-step guide —
frontend on Vercel, backend on Render (needs a persistent disk for the
SQLite database and uploaded images/documents, which is why the backend
can't run as Vercel serverless functions as-is).
