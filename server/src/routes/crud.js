import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/requireAuth.js';

// Generic CRUD router factory for simple content tables.
// fields: list of column names writable via the API (excludes id).
// jsonFields: subset of fields that should be JSON.stringify'd on write and JSON.parse'd on read.
// orderBy: column to sort GET-all results by.
export function crudRouter(table, fields, { jsonFields = [], orderBy = 'sort_order' } = {}) {
  const router = Router();

  function serializeRow(row) {
    if (!row) return row;
    const out = { ...row };
    for (const f of jsonFields) {
      if (typeof out[f] === 'string') {
        try { out[f] = JSON.parse(out[f]); } catch { out[f] = []; }
      }
    }
    return out;
  }

  function prepareBody(body) {
    const out = {};
    for (const f of fields) {
      if (!(f in body)) continue;
      out[f] = jsonFields.includes(f) ? JSON.stringify(body[f] ?? []) : body[f];
    }
    return out;
  }

  router.get('/', (req, res) => {
    const rows = db.prepare(`SELECT * FROM ${table} ORDER BY ${orderBy} ASC, id ASC`).all();
    res.json(rows.map(serializeRow));
  });

  router.get('/:id', (req, res) => {
    const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(serializeRow(row));
  });

  router.post('/', requireAuth, (req, res) => {
    const data = prepareBody(req.body);
    const cols = Object.keys(data);
    if (cols.length === 0) return res.status(400).json({ error: 'No valid fields provided' });
    const placeholders = cols.map(() => '?').join(', ');
    const stmt = db.prepare(`INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders})`);
    const info = stmt.run(...cols.map((c) => data[c]));
    const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(info.lastInsertRowid);
    res.status(201).json(serializeRow(row));
  });

  router.put('/:id', requireAuth, (req, res) => {
    const data = prepareBody(req.body);
    const cols = Object.keys(data);
    if (cols.length === 0) return res.status(400).json({ error: 'No valid fields provided' });
    const setClause = cols.map((c) => `${c} = ?`).join(', ');
    const stmt = db.prepare(`UPDATE ${table} SET ${setClause} WHERE id = ?`);
    const info = stmt.run(...cols.map((c) => data[c]), req.params.id);
    if (info.changes === 0) return res.status(404).json({ error: 'Not found' });
    const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id);
    res.json(serializeRow(row));
  });

  router.delete('/:id', requireAuth, (req, res) => {
    const info = db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(req.params.id);
    if (info.changes === 0) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  });

  return router;
}
