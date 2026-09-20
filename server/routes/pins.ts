import { Router } from 'express';
import type { Database } from 'better-sqlite3';

const router = Router();

router.get('/', (req, res) => {
  const db: Database = req.app.locals.db;
  res.json(db.prepare('SELECT * FROM pins ORDER BY timestamp DESC').all());
});

router.post('/', (req, res) => {
  const db: Database = req.app.locals.db;
  try {
    db.prepare(`
      INSERT INTO pins (id, xPercent, yPercent, title, description, severity, pageUrl, elementSelector, timestamp, author, status)
      VALUES (@id, @xPercent, @yPercent, @title, @description, @severity, @pageUrl, @elementSelector, @timestamp, @author, @status)
    `).run(req.body);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
  res.status(201).json(req.body);
});

router.patch('/:id', (req, res) => {
  const db: Database = req.app.locals.db;
  const existing = db.prepare('SELECT * FROM pins WHERE id = ?').get(req.params.id);

  if (!existing) {
    return res.status(404).json({ error: `Pin ${req.params.id} not found` });
  }

  const updated = { ...existing, ...req.body };
  try {
    db.prepare(`
      UPDATE pins SET
        xPercent=@xPercent, yPercent=@yPercent, title=@title, description=@description,
        severity=@severity, pageUrl=@pageUrl, elementSelector=@elementSelector,
        timestamp=@timestamp, author=@author, status=@status
      WHERE id=@id
    `).run(updated);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }

  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const db: Database = req.app.locals.db;
  try {
    const result = db.prepare('DELETE FROM pins WHERE id = ?').run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: `Pin ${req.params.id} not found` });
    }

    res.status(204).send();
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

export default router;
