import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

// Only used as a local-dev fallback database — production sets
// TURSO_DATABASE_URL instead, which points at a real hosted database that
// survives redeploys (see db.js).
export const localDbPath = path.join(projectRoot, 'data', 'globalnest.db');
fs.mkdirSync(path.dirname(localDbPath), { recursive: true });
