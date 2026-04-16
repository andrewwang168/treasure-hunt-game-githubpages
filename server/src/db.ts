import { createClient } from '@libsql/client';
import path from 'path';
import fs from 'fs';

function createDb() {
  const tursoUrl = process.env.TURSO_URL;
  if (tursoUrl) {
    // Production: Turso cloud database
    return createClient({
      url: tursoUrl,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  // Local development: file-based SQLite
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return createClient({
    url: `file:${path.join(dataDir, 'game.db')}`,
  });
}

export const db = createDb();

export async function initDb() {
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      score INTEGER NOT NULL,
      result TEXT NOT NULL CHECK(result IN ('win','tie','loss')),
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}
