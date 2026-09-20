import { Router } from 'express';
import type { Database } from 'better-sqlite3';

const router = Router();

router.get('/', (req, res) => {
  const db: Database = req.app.locals.db;
  const rows = db.prepare('SELECT * FROM runs ORDER BY recordedAt DESC').all();
  res.json(rows);
});

router.post('/', (req, res) => {
  const db: Database = req.app.locals.db;
  const run = { ...req.body, recordedAt: Date.now() };

  try {
    db.prepare(`
      INSERT INTO runs (id, timestamp, persona, targetRoute, findings, status, duration, suiteName, recordedAt)
      VALUES (@id, @timestamp, @persona, @targetRoute, @findings, @status, @duration, @suiteName, @recordedAt)
    `).run(run);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }

  res.status(201).json(run);
});

export default router;
