import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import { nanoid } from 'nanoid';
import ExcelJS from 'exceljs';
import db from '../db.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { uploadsDir } from '../paths.js';

const ALLOWED_DOC_TYPES = new Set(['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.doc', '.docx']);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${nanoid(12)}${path.extname(file.originalname).toLowerCase()}`),
});

const uploadDocument = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_DOC_TYPES.has(ext)) return cb(new Error('Unsupported file type. Please upload a PDF, Word document, or image.'));
    cb(null, true);
  },
});

const router = Router();

router.post('/', (req, res) => {
  uploadDocument.single('document')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });

    const { name, address, district, desired_country, phone, email, english_proficiency } = req.body || {};
    if (!name || !phone) return res.status(400).json({ error: 'Name and phone are required' });

    const proficiencyDocument = req.file ? `/uploads/${req.file.filename}` : '';

    const info = db
      .prepare(
        `INSERT INTO inquiries (name, address, district, desired_country, phone, email, english_proficiency, proficiency_document)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        name,
        address || '',
        district || 'Dhaka',
        desired_country || 'Australia',
        phone,
        email || '',
        english_proficiency || '',
        proficiencyDocument
      );
    res.status(201).json({ id: info.lastInsertRowid, ok: true });
  });
});

router.get('/', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM inquiries ORDER BY created_at DESC').all();
  res.json(rows);
});

router.patch('/:id/read', requireAuth, (req, res) => {
  const isRead = req.body?.is_read ? 1 : 0;
  const info = db.prepare('UPDATE inquiries SET is_read = ? WHERE id = ?').run(isRead, req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Not found' });
  const row = db.prepare('SELECT * FROM inquiries WHERE id = ?').get(req.params.id);
  res.json(row);
});

router.delete('/:id', requireAuth, (req, res) => {
  const info = db.prepare('DELETE FROM inquiries WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

router.get('/export/excel', requireAuth, async (req, res) => {
  const idsParam = req.query.ids ? String(req.query.ids).split(',').map((n) => Number(n)).filter(Boolean) : null;
  const rows = idsParam
    ? db
        .prepare(`SELECT * FROM inquiries WHERE id IN (${idsParam.map(() => '?').join(',')}) ORDER BY created_at DESC`)
        .all(...idsParam)
    : db.prepare('SELECT * FROM inquiries ORDER BY created_at DESC').all();

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'GlobalNest Study Solution';
  workbook.created = new Date();
  const sheet = workbook.addWorksheet('Inquiries');

  sheet.columns = [
    { header: 'ID', key: 'id', width: 6 },
    { header: 'Name', key: 'name', width: 24 },
    { header: 'Phone', key: 'phone', width: 18 },
    { header: 'Email', key: 'email', width: 26 },
    { header: 'Address', key: 'address', width: 30 },
    { header: 'District', key: 'district', width: 16 },
    { header: 'Desired Country', key: 'desired_country', width: 18 },
    { header: 'English Proficiency', key: 'english_proficiency', width: 20 },
    { header: 'Proficiency Document', key: 'proficiency_document', width: 34 },
    { header: 'Submitted At', key: 'created_at', width: 22 },
  ];
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF136AAA' } };
  sheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  });

  for (const row of rows) {
    const excelRow = sheet.addRow(row);
    if (row.proficiency_document) {
      const url = `${req.protocol}://${req.get('host')}${row.proficiency_document}`;
      const cell = excelRow.getCell('proficiency_document');
      cell.value = { text: 'View Document', hyperlink: url };
      cell.font = { color: { argb: 'FF136AAA' }, underline: true };
    }
  }

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="globalnest-inquiries-${Date.now()}.xlsx"`);
  await workbook.xlsx.write(res);
  res.end();
});

export default router;
