import { describe, it, expect, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { getDb } from '../db';

describe('getDb', () => {
  const tempPaths: string[] = [];

  afterEach(() => {
    for (const p of tempPaths) {
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }
    tempPaths.length = 0;
  });

  function tempDbPath(): string {
    const p = path.join(os.tmpdir(), `qa-hub-test-${Date.now()}-${Math.random()}.db`);
    tempPaths.push(p);
    return p;
  }

  it('creates issues, runs, pins, products tables', () => {
    const db = getDb(tempDbPath());
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all()
      .map((row: any) => row.name);

    expect(tables).toEqual(expect.arrayContaining(['issues', 'runs', 'pins', 'products']));
    db.close();
  });

  it('is idempotent — opening the same file twice does not error', () => {
    const p = tempDbPath();
    const db1 = getDb(p);
    db1.close();
    const db2 = getDb(p);
    expect(db2.open).toBe(true);
    db2.close();
  });
});
