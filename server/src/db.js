import { createClient } from '@libsql/client';
import { localDbPath } from './paths.js';

const url = process.env.TURSO_DATABASE_URL || `file:${localDbPath}`;
const authToken = process.env.TURSO_AUTH_TOKEN;

export const db = authToken ? createClient({ url, authToken }) : createClient({ url });

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS hero_slides (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    headline TEXT NOT NULL,
    subheadline TEXT,
    image_url TEXT,
    cta_label TEXT,
    cta_link TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1
  )`,
  `CREATE TABLE IF NOT EXISTS about_content (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    mission TEXT,
    vision TEXT,
    intro TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS core_values (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS why_choose_pillars (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    headline TEXT,
    description TEXT,
    sort_order INTEGER DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS target_countries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    tagline TEXT,
    highlight TEXT,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1
  )`,
  `CREATE TABLE IF NOT EXISTS working_process_steps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    step_number INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS country_services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    country_name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    page_title TEXT,
    meta_description TEXT,
    hero_tagline TEXT,
    intro TEXT,
    why_choose_points TEXT,
    requirements TEXT,
    process_steps TEXT,
    faqs TEXT,
    processing_time TEXT,
    visa_fee TEXT,
    tuition_range TEXT,
    living_cost TEXT,
    extra_notes TEXT,
    sort_order INTEGER DEFAULT 0,
    is_published INTEGER DEFAULT 1
  )`,
  `CREATE TABLE IF NOT EXISTS testimonials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    quote TEXT NOT NULL,
    country TEXT,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS blog_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT,
    cover_image TEXT,
    author TEXT,
    is_published INTEGER DEFAULT 1,
    published_at TEXT DEFAULT (datetime('now')),
    created_at TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT,
    district TEXT,
    desired_country TEXT,
    phone TEXT,
    email TEXT,
    english_proficiency TEXT,
    proficiency_document TEXT,
    is_read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  )`,
];

export async function migrate() {
  for (const statement of SCHEMA_STATEMENTS) {
    await db.execute(statement);
  }

  const inquiryColumns = (await db.execute('PRAGMA table_info(inquiries)')).rows.map((c) => c.name);
  if (!inquiryColumns.includes('proficiency_document')) {
    await db.execute('ALTER TABLE inquiries ADD COLUMN proficiency_document TEXT');
  }
  if (!inquiryColumns.includes('is_read')) {
    await db.execute('ALTER TABLE inquiries ADD COLUMN is_read INTEGER DEFAULT 0');
  }
}

export default db;
