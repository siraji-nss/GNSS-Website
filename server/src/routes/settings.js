import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { rowsToObjects } from '../dbUtils.js';

const router = Router();

async function loadSettings() {
  const result = await db.execute('SELECT key, value FROM site_settings');
  const settings = {};
  for (const row of rowsToObjects(result)) {
    try { settings[row.key] = JSON.parse(row.value); } catch { settings[row.key] = row.value; }
  }
  return settings;
}

router.get('/', async (req, res) => {
  res.json(await loadSettings());
});

router.put('/', requireAuth, async (req, res) => {
  const body = req.body || {};
  for (const [key, value] of Object.entries(body)) {
    await db.execute({
      sql: 'INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
      args: [key, JSON.stringify(value)],
    });
  }
  res.json(await loadSettings());
});

export default router;
