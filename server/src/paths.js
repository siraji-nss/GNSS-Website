import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

// DATA_DIR lets a persistent-disk host (e.g. Render Disks) point the database
// and uploaded files at a mounted volume. Defaults to local folders for dev.
const dataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : projectRoot;

export const dbPath = path.join(dataDir, 'data', 'globalnest.db');
export const uploadsDir = path.join(dataDir, 'uploads');

fs.mkdirSync(path.dirname(dbPath), { recursive: true });
fs.mkdirSync(uploadsDir, { recursive: true });
