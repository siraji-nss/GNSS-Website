import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import db, { migrate } from './db.js';
import { rowsToObjects } from './dbUtils.js';
import authRoutes from './routes/auth.js';
import settingsRoutes from './routes/settings.js';
import aboutRoutes from './routes/about.js';
import blogRoutes from './routes/blog.js';
import inquiriesRoutes from './routes/inquiries.js';
import uploadRoutes from './routes/upload.js';
import { crudRouter } from './routes/crud.js';

const app = express();

// Trust the reverse proxy (Render/Railway) so req.protocol reflects the
// original https:// scheme instead of the http:// used internally.
app.set('trust proxy', 1);

const allowedOrigins = process.env.CLIENT_ORIGIN?.split(',').map((o) => o.trim()).filter(Boolean);
app.use(cors({ origin: allowedOrigins?.length ? allowedOrigins : '*' }));
app.use(express.json({ limit: '2mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/inquiries', inquiriesRoutes);
app.use('/api/upload', uploadRoutes);

app.use('/api/hero-slides', crudRouter('hero_slides', ['headline', 'subheadline', 'image_url', 'cta_label', 'cta_link', 'sort_order', 'is_active']));
app.use('/api/core-values', crudRouter('core_values', ['title', 'description', 'sort_order']));
app.use('/api/why-choose-pillars', crudRouter('why_choose_pillars', ['title', 'headline', 'description', 'sort_order']));
app.use('/api/target-countries', crudRouter('target_countries', ['name', 'slug', 'tagline', 'highlight', 'image_url', 'sort_order', 'is_active']));
app.use('/api/working-process-steps', crudRouter('working_process_steps', ['step_number', 'title', 'description', 'sort_order']));
app.use('/api/testimonials', crudRouter('testimonials', ['name', 'quote', 'country', 'image_url', 'sort_order']));
app.use(
  '/api/country-services',
  crudRouter(
    'country_services',
    [
      'country_name', 'slug', 'page_title', 'meta_description', 'hero_tagline', 'intro',
      'why_choose_points', 'requirements', 'process_steps', 'faqs',
      'processing_time', 'visa_fee', 'tuition_range', 'living_cost', 'extra_notes',
      'sort_order', 'is_published',
    ],
    { jsonFields: ['why_choose_points', 'requirements', 'process_steps', 'faqs'] }
  )
);

app.get('/api/country-services/slug/:slug', async (req, res) => {
  const result = await db.execute({ sql: 'SELECT * FROM country_services WHERE slug = ?', args: [req.params.slug] });
  const row = rowsToObjects(result)[0];
  if (!row) return res.status(404).json({ error: 'Not found' });
  const jsonFields = ['why_choose_points', 'requirements', 'process_steps', 'faqs'];
  for (const f of jsonFields) {
    try { row[f] = JSON.parse(row[f]); } catch { row[f] = []; }
  }
  res.json(row);
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

const port = process.env.PORT || 4000;

migrate()
  .then(() => {
    app.listen(port, () => {
      console.log(`GlobalNest API listening on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to migrate database:', err);
    process.exit(1);
  });
