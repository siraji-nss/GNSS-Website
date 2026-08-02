import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import ExcelJS from 'exceljs';
import db from '../db.js';
import { cloudinaryStorage } from '../cloudinaryStorage.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { rowsToObjects } from '../dbUtils.js';

const ALLOWED_DOC_TYPES = new Set(['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.doc', '.docx']);

const storage = cloudinaryStorage({ folder: 'globalnest/inquiry-documents', resourceType: 'auto' });

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
  uploadDocument.single('document')(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });

    const { name, address, district, desired_country, phone, email, english_proficiency } = req.body || {};
    if (!name || !phone) return res.status(400).json({ error: 'Name and phone are required' });

    const proficiencyDocument = req.file ? req.file.path : '';

    const info = await db.execute({
      sql: `INSERT INTO inquiries (name, address, district, desired_country, phone, email, english_proficiency, proficiency_document)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        name,
        address || '',
        district || 'Dhaka',
        desired_country || 'Australia',
        phone,
        email || '',
        english_proficiency || '',
        proficiencyDocument,
      ],
    });
    res.status(201).json({ id: Number(info.lastInsertRowid), ok: true });
  });
});

router.get('/', requireAuth, async (req, res) => {
  const result = await db.execute('SELECT * FROM inquiries ORDER BY created_at DESC');
  res.json(rowsToObjects(result));
});

router.patch('/:id/read', requireAuth, async (req, res) => {
  const isRead = req.body?.is_read ? 1 : 0;
  const info = await db.execute({ sql: 'UPDATE inquiries SET is_read = ? WHERE id = ?', args: [isRead, req.params.id] });
  if (info.rowsAffected === 0) return res.status(404).json({ error: 'Not found' });
  const result = await db.execute({ sql: 'SELECT * FROM inquiries WHERE id = ?', args: [req.params.id] });
  res.json(rowsToObjects(result)[0]);
});

router.delete('/:id', requireAuth, async (req, res) => {
  const info = await db.execute({ sql: 'DELETE FROM inquiries WHERE id = ?', args: [req.params.id] });
  if (info.rowsAffected === 0) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

router.get('/export/excel', requireAuth, async (req, res) => {
  const idsParam = req.query.ids ? String(req.query.ids).split(',').map((n) => Number(n)).filter(Boolean) : null;
  const result = idsParam
    ? await db.execute({
        sql: `SELECT * FROM inquiries WHERE id IN (${idsParam.map(() => '?').join(',')}) ORDER BY created_at DESC`,
        args: idsParam,
      })
    : await db.execute('SELECT * FROM inquiries ORDER BY created_at DESC');
  const rows = rowsToObjects(result);

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
      const cell = excelRow.getCell('proficiency_document');
      cell.value = { text: 'View Document', hyperlink: row.proficiency_document };
      cell.font = { color: { argb: 'FF136AAA' }, underline: true };
    }
  }

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="globalnest-inquiries-${Date.now()}.xlsx"`);
  await workbook.xlsx.write(res);
  res.end();
});

export default router;
