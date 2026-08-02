import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import { cloudinaryStorage } from '../cloudinaryStorage.js';
import { requireAuth } from '../middleware/requireAuth.js';

const ALLOWED = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg']);

const storage = cloudinaryStorage({ folder: 'globalnest/site-images', resourceType: 'image' });

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED.has(ext)) return cb(new Error('Unsupported file type'));
    cb(null, true);
  },
});

const router = Router();

router.post('/', requireAuth, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.status(201).json({ url: req.file.path });
  });
});

export default router;
