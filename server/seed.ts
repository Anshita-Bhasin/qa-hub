import type { Database } from 'better-sqlite3';
import { getDb } from './db';
import {
  INITIAL_ISSUES,
  INITIAL_PRODUCTS,
  PROBLEM_USER_PRODUCTS,
  INITIAL_PINS,
  INITIAL_RUNS
} from '../src/data/initialData';
import { fileURLToPath } from 'node:url';

export function seed(db: Database): { issues: number; products: number; pins: number; runs: number } {
  const existing = db.prepare('SELECT COUNT(*) as n FROM issues').get() as { n: number };
  if (existing.n > 0) {
    return { issues: 0, products: 0, pins: 0, runs: 0 };
  }

  const insertIssue = db.prepare(`
    INSERT INTO issues
      (id, key, title, area, severity, status, firstSeen, lastSeen, persona, url, description, reproSteps, expected, actual, screenshotThumbnail, stackTrace)
    VALUES
      (@id, @key, @title, @area, @severity, @status, @firstSeen, @lastSeen, @persona, @url, @description, @reproSteps, @expected, @actual, @screenshotThumbnail, @stackTrace)
  `);

  const insertProduct = db.prepare(`
    INSERT INTO products
      (id, name, price, extractedPriceStr, imgUrl, isBrokenImage, isDuplicateAsset, duplicateNote, isPriceGlitch, missingDescription, location, deepLink, status, statusLabel)
    VALUES
      (@id, @name, @price, @extractedPriceStr, @imgUrl, @isBrokenImage, @isDuplicateAsset, @duplicateNote, @isPriceGlitch, @missingDescription, @location, @deepLink, @status, @statusLabel)
    ON CONFLICT(id) DO UPDATE SET name=excluded.name
  `);

  const insertPin = db.prepare(`
    INSERT INTO pins (id, xPercent, yPercent, title, description, severity, pageUrl, elementSelector, timestamp, author, status)
    VALUES (@id, @xPercent, @yPercent, @title, @description, @severity, @pageUrl, @elementSelector, @timestamp, @author, @status)
  `);

  const insertRun = db.prepare(`
    INSERT INTO runs (id, timestamp, persona, targetRoute, findings, status, duration, suiteName, recordedAt)
    VALUES (@id, @timestamp, @persona, @targetRoute, @findings, @status, @duration, @suiteName, @recordedAt)
  `);

  const run = db.transaction(() => {
    for (const issue of INITIAL_ISSUES) {
      insertIssue.run({
        ...issue,
        reproSteps: JSON.stringify(issue.reproSteps),
        screenshotThumbnail: issue.screenshotThumbnail ?? null,
        stackTrace: issue.stackTrace ?? null
      });
    }

    const allProducts = [...INITIAL_PRODUCTS, ...PROBLEM_USER_PRODUCTS];
    const seenProductIds = new Set<number>();
    for (const p of allProducts) {
      if (seenProductIds.has(p.id)) continue; // PROBLEM_USER_PRODUCTS may reuse ids; keep first occurrence
      seenProductIds.add(p.id);
      insertProduct.run({
        ...p,
        isBrokenImage: p.isBrokenImage ? 1 : 0,
        isDuplicateAsset: p.isDuplicateAsset ? 1 : 0,
        isPriceGlitch: p.isPriceGlitch ? 1 : 0,
        missingDescription: p.missingDescription ? 1 : 0,
        duplicateNote: p.duplicateNote ?? null
      });
    }

    for (const pin of INITIAL_PINS) {
      insertPin.run(pin);
    }

    for (const r of INITIAL_RUNS) {
      insertRun.run({ ...r, recordedAt: Date.now() });
    }

    return {
      issues: INITIAL_ISSUES.length,
      products: seenProductIds.size,
      pins: INITIAL_PINS.length,
      runs: INITIAL_RUNS.length
    };
  });

  return run();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const db = getDb();
  const counts = seed(db);
  console.log('Seed complete:', counts);
}
