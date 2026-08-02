import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { rowsToObjects } from '../dbUtils.js';

const router = Router();

router.get('/', async (req, res) => {
  const result = await db.execute('SELECT * FROM about_content WHERE id = 1');
  const row = rowsToObjects(result)[0];
  res.json(row || { id: 1, mission: '', vision: '', intro: '' });
});

router.put('/', requireAuth, async (req, res) => {
  const { mission = '', vision = '', intro = '' } = req.body || {};
  await db.execute({
    sql: `INSERT INTO about_content (id, mission, vision, intro) VALUES (1, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET mission = excluded.mission, vision = excluded.vision, intro = excluded.intro`,
    args: [mission, vision, intro],
  });
  const result = await db.execute('SELECT * FROM about_content WHERE id = 1');
  res.json(rowsToObjects(result)[0]);
});

export default router;
