import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { rowsToObjects } from '../dbUtils.js';

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

  router.get('/', async (req, res) => {
    const result = await db.execute(`SELECT * FROM ${table} ORDER BY ${orderBy} ASC, id ASC`);
    res.json(rowsToObjects(result).map(serializeRow));
  });

  router.get('/:id', async (req, res) => {
    const result = await db.execute({ sql: `SELECT * FROM ${table} WHERE id = ?`, args: [req.params.id] });
    const row = rowsToObjects(result)[0];
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(serializeRow(row));
  });

  router.post('/', requireAuth, async (req, res) => {
    const data = prepareBody(req.body);
    const cols = Object.keys(data);
    if (cols.length === 0) return res.status(400).json({ error: 'No valid fields provided' });
    const placeholders = cols.map(() => '?').join(', ');
    const info = await db.execute({
      sql: `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders})`,
      args: cols.map((c) => data[c]),
    });
    const result = await db.execute({ sql: `SELECT * FROM ${table} WHERE id = ?`, args: [Number(info.lastInsertRowid)] });
    res.status(201).json(serializeRow(rowsToObjects(result)[0]));
  });

  router.put('/:id', requireAuth, async (req, res) => {
    const data = prepareBody(req.body);
    const cols = Object.keys(data);
    if (cols.length === 0) return res.status(400).json({ error: 'No valid fields provided' });
    const setClause = cols.map((c) => `${c} = ?`).join(', ');
    const info = await db.execute({
      sql: `UPDATE ${table} SET ${setClause} WHERE id = ?`,
      args: [...cols.map((c) => data[c]), req.params.id],
    });
    if (info.rowsAffected === 0) return res.status(404).json({ error: 'Not found' });
    const result = await db.execute({ sql: `SELECT * FROM ${table} WHERE id = ?`, args: [req.params.id] });
    res.json(serializeRow(rowsToObjects(result)[0]));
  });

  router.delete('/:id', requireAuth, async (req, res) => {
    const info = await db.execute({ sql: `DELETE FROM ${table} WHERE id = ?`, args: [req.params.id] });
    if (info.rowsAffected === 0) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  });

  return router;
}
