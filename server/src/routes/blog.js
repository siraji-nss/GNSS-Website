import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { rowsToObjects } from '../dbUtils.js';

const router = Router();

function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

router.get('/', async (req, res) => {
  const publishedOnly = req.query.all !== '1';
  const result = publishedOnly
    ? await db.execute('SELECT * FROM blog_posts WHERE is_published = 1 ORDER BY published_at DESC')
    : await db.execute('SELECT * FROM blog_posts ORDER BY published_at DESC');
  res.json(rowsToObjects(result));
});

router.get('/:slug', async (req, res) => {
  const result = await db.execute({ sql: 'SELECT * FROM blog_posts WHERE slug = ?', args: [req.params.slug] });
  const row = rowsToObjects(result)[0];
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

router.post('/', requireAuth, async (req, res) => {
  const { title, excerpt, content, cover_image, author, is_published } = req.body || {};
  if (!title) return res.status(400).json({ error: 'Title required' });
  let slug = slugify(title);
  const exists = rowsToObjects(await db.execute({ sql: 'SELECT id FROM blog_posts WHERE slug = ?', args: [slug] }))[0];
  if (exists) slug = `${slug}-${Date.now()}`;
  const info = await db.execute({
    sql: `INSERT INTO blog_posts (title, slug, excerpt, content, cover_image, author, is_published, published_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    args: [title, slug, excerpt || '', content || '', cover_image || '', author || 'GlobalNest Team', is_published ? 1 : 0],
  });
  const result = await db.execute({ sql: 'SELECT * FROM blog_posts WHERE id = ?', args: [Number(info.lastInsertRowid)] });
  res.status(201).json(rowsToObjects(result)[0]);
});

router.put('/:id', requireAuth, async (req, res) => {
  const existing = rowsToObjects(await db.execute({ sql: 'SELECT * FROM blog_posts WHERE id = ?', args: [req.params.id] }))[0];
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const { title, excerpt, content, cover_image, author, is_published } = req.body || {};
  let slug = existing.slug;
  if (title && title !== existing.title) {
    slug = slugify(title);
    const clash = rowsToObjects(
      await db.execute({ sql: 'SELECT id FROM blog_posts WHERE slug = ? AND id != ?', args: [slug, req.params.id] })
    )[0];
    if (clash) slug = `${slug}-${Date.now()}`;
  }
  await db.execute({
    sql: `UPDATE blog_posts SET title = ?, slug = ?, excerpt = ?, content = ?, cover_image = ?, author = ?, is_published = ?
          WHERE id = ?`,
    args: [
      title ?? existing.title,
      slug,
      excerpt ?? existing.excerpt,
      content ?? existing.content,
      cover_image ?? existing.cover_image,
      author ?? existing.author,
      is_published === undefined ? existing.is_published : (is_published ? 1 : 0),
      req.params.id,
    ],
  });
  const result = await db.execute({ sql: 'SELECT * FROM blog_posts WHERE id = ?', args: [req.params.id] });
  res.json(rowsToObjects(result)[0]);
});

router.delete('/:id', requireAuth, async (req, res) => {
  const info = await db.execute({ sql: 'DELETE FROM blog_posts WHERE id = ?', args: [req.params.id] });
  if (info.rowsAffected === 0) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

export default router;
