import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { signToken } from '../auth.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { rowsToObjects } from '../dbUtils.js';

const router = Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  const result = await db.execute({ sql: 'SELECT * FROM users WHERE username = ?', args: [username] });
  const user = rowsToObjects(result)[0];
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = signToken(user);
  res.json({ token, username: user.username });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ username: req.user.username });
});

router.post('/change-password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters' });
  }
  const result = await db.execute({ sql: 'SELECT * FROM users WHERE id = ?', args: [req.user.sub] });
  const user = rowsToObjects(result)[0];
  if (!user || !bcrypt.compareSync(currentPassword, user.password_hash)) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }
  const hash = bcrypt.hashSync(newPassword, 10);
  await db.execute({ sql: 'UPDATE users SET password_hash = ? WHERE id = ?', args: [hash, user.id] });
  res.json({ ok: true });
});

export default router;
