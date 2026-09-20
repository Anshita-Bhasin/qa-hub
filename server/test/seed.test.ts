import { describe, it, expect, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { getDb } from '../db';
import { seed } from '../seed';

function tempDbPath(): string {
  return path.join(os.tmpdir(), `qa-hub-test-${Date.now()}-${Math.random()}.db`);
}

describe('seed', () => {
  let dbPath: string;

  afterEach(() => {
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  });

  it('populates all four tables on an empty database', () => {
    dbPath = tempDbPath();
    const db = getDb(dbPath);
    const counts = seed(db);

    expect(counts.issues).toBeGreaterThan(0);
    expect(counts.pins).toBeGreaterThan(0);
    expect(counts.runs).toBeGreaterThan(0);
    expect(counts.products).toBeGreaterThan(0);

    const issueRows = db.prepare('SELECT COUNT(*) as n FROM issues').get() as { n: number };
    expect(issueRows.n).toBe(counts.issues);
  });

  it('is a no-op when issues already has rows', () => {
    dbPath = tempDbPath();
    const db = getDb(dbPath);
    seed(db);
    const second = seed(db);

    expect(second).toEqual({ issues: 0, products: 0, pins: 0, runs: 0 });

    const issueRows = db.prepare('SELECT COUNT(*) as n FROM issues').get() as { n: number };
    const firstCount = seed(getDb(tempDbPath())).issues; // fresh db, same fixture data
    expect(issueRows.n).toBe(firstCount);
  });
});
