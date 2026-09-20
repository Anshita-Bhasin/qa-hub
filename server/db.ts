import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_DB_PATH = path.resolve(__dirname, 'data', 'qa-hub.db');

export function getDb(dbPath: string = DEFAULT_DB_PATH): Database.Database {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS issues (
      id TEXT PRIMARY KEY,
      key TEXT NOT NULL,
      title TEXT NOT NULL,
      area TEXT NOT NULL,
      severity TEXT NOT NULL,
      status TEXT NOT NULL,
      firstSeen TEXT NOT NULL,
      lastSeen TEXT NOT NULL,
      persona TEXT NOT NULL,
      url TEXT NOT NULL,
      description TEXT NOT NULL,
      reproSteps TEXT NOT NULL,
      expected TEXT NOT NULL,
      actual TEXT NOT NULL,
      screenshotThumbnail TEXT,
      stackTrace TEXT
    );

    CREATE TABLE IF NOT EXISTS runs (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      persona TEXT NOT NULL,
      targetRoute TEXT NOT NULL,
      findings TEXT NOT NULL,
      status TEXT NOT NULL,
      duration TEXT NOT NULL,
      suiteName TEXT NOT NULL,
      recordedAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS pins (
      id TEXT PRIMARY KEY,
      xPercent REAL NOT NULL,
      yPercent REAL NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      severity TEXT NOT NULL,
      pageUrl TEXT NOT NULL,
      elementSelector TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      author TEXT NOT NULL,
      status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      extractedPriceStr TEXT NOT NULL,
      imgUrl TEXT NOT NULL,
      isBrokenImage INTEGER NOT NULL,
      isDuplicateAsset INTEGER NOT NULL,
      duplicateNote TEXT,
      isPriceGlitch INTEGER NOT NULL,
      missingDescription INTEGER NOT NULL,
      location TEXT NOT NULL,
      deepLink TEXT NOT NULL,
      status TEXT NOT NULL,
      statusLabel TEXT NOT NULL
    );
  `);

  return db;
}
