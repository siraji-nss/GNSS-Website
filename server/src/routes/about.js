import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

router.get('/', (req, res) => {
  const row = db.prepare('SELECT * FROM about_content WHERE id = 1').get();
  res.json(row || { id: 1, mission: '', vision: '', intro: '' });
});

router.put('/', requireAuth, (req, res) => {
  const { mission = '', vision = '', intro = '' } = req.body || {};
  db.prepare(
    `INSERT INTO about_content (id, mission, vision, intro) VALUES (1, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET mission = excluded.mission, vision = excluded.vision, intro = excluded.intro`
  ).run(mission, vision, intro);
  const row = db.prepare('SELECT * FROM about_content WHERE id = 1').get();
  res.json(row);
});

export default router;
