import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

router.get('/', (req, res) => {
  const publishedOnly = req.query.all !== '1';
  const rows = publishedOnly
    ? db.prepare('SELECT * FROM blog_posts WHERE is_published = 1 ORDER BY published_at DESC').all()
    : db.prepare('SELECT * FROM blog_posts ORDER BY published_at DESC').all();
  res.json(rows);
});

router.get('/:slug', (req, res) => {
  const row = db.prepare('SELECT * FROM blog_posts WHERE slug = ?').get(req.params.slug);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

router.post('/', requireAuth, (req, res) => {
  const { title, excerpt, content, cover_image, author, is_published } = req.body || {};
  if (!title) return res.status(400).json({ error: 'Title required' });
  let slug = slugify(title);
  const exists = db.prepare('SELECT id FROM blog_posts WHERE slug = ?').get(slug);
  if (exists) slug = `${slug}-${Date.now()}`;
  const info = db
    .prepare(
      `INSERT INTO blog_posts (title, slug, excerpt, content, cover_image, author, is_published, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`
    )
    .run(title, slug, excerpt || '', content || '', cover_image || '', author || 'GlobalNest Team', is_published ? 1 : 0);
  const row = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(row);
});

router.put('/:id', requireAuth, (req, res) => {
  const existing = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const { title, excerpt, content, cover_image, author, is_published } = req.body || {};
  let slug = existing.slug;
  if (title && title !== existing.title) {
    slug = slugify(title);
    const clash = db.prepare('SELECT id FROM blog_posts WHERE slug = ? AND id != ?').get(slug, req.params.id);
    if (clash) slug = `${slug}-${Date.now()}`;
  }
  db.prepare(
    `UPDATE blog_posts SET title = ?, slug = ?, excerpt = ?, content = ?, cover_image = ?, author = ?, is_published = ?
     WHERE id = ?`
  ).run(
    title ?? existing.title,
    slug,
    excerpt ?? existing.excerpt,
    content ?? existing.content,
    cover_image ?? existing.cover_image,
    author ?? existing.author,
    is_published === undefined ? existing.is_published : (is_published ? 1 : 0),
    req.params.id
  );
  const row = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(req.params.id);
  res.json(row);
});

router.delete('/:id', requireAuth, (req, res) => {
  const info = db.prepare('DELETE FROM blog_posts WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

export default router;
