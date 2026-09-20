import { Router } from 'express';
import type { Database } from 'better-sqlite3';

interface IssueRow {
  id: string;
  key: string;
  title: string;
  area: string;
  severity: string;
  status: string;
  firstSeen: string;
  lastSeen: string;
  persona: string;
  url: string;
  description: string;
  reproSteps: string; // JSON
  expected: string;
  actual: string;
  screenshotThumbnail: string | null;
  stackTrace: string | null;
}

function rowToIssue(row: IssueRow) {
  return { ...row, reproSteps: JSON.parse(row.reproSteps) };
}

const router = Router();

router.get('/', (req, res) => {
  const db: Database = req.app.locals.db;
  const rows = db.prepare('SELECT * FROM issues ORDER BY firstSeen DESC').all() as IssueRow[];
  res.json(rows.map(rowToIssue));
});

router.post('/', (req, res) => {
  const db: Database = req.app.locals.db;
  const input = Array.isArray(req.body) ? req.body : [req.body];

  if (input.length === 0) {
    return res.status(400).json({ error: 'Request body must be an issue or a non-empty array of issues' });
  }

  const insert = db.prepare(`
    INSERT INTO issues
      (id, key, title, area, severity, status, firstSeen, lastSeen, persona, url, description, reproSteps, expected, actual, screenshotThumbnail, stackTrace)
    VALUES
      (@id, @key, @title, @area, @severity, @status, @firstSeen, @lastSeen, @persona, @url, @description, @reproSteps, @expected, @actual, @screenshotThumbnail, @stackTrace)
    ON CONFLICT(id) DO NOTHING
  `);

  const insertMany = db.transaction((issues: any[]) => {
    for (const issue of issues) {
      insert.run({
        ...issue,
        reproSteps: JSON.stringify(issue.reproSteps ?? []),
        screenshotThumbnail: issue.screenshotThumbnail ?? null,
        stackTrace: issue.stackTrace ?? null
      });
    }
  });

  try {
    insertMany(input);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }

  res.status(201).json(Array.isArray(req.body) ? input : input[0]);
});

router.patch('/:id', (req, res) => {
  const db: Database = req.app.locals.db;
  const existing = db.prepare('SELECT * FROM issues WHERE id = ?').get(req.params.id) as IssueRow | undefined;

  if (!existing) {
    return res.status(404).json({ error: `Issue ${req.params.id} not found` });
  }

  const updated = {
    ...existing,
    ...req.body,
    reproSteps: req.body.reproSteps ? JSON.stringify(req.body.reproSteps) : existing.reproSteps
  };

  db.prepare(`
    UPDATE issues SET
      key=@key, title=@title, area=@area, severity=@severity, status=@status,
      firstSeen=@firstSeen, lastSeen=@lastSeen, persona=@persona, url=@url,
      description=@description, reproSteps=@reproSteps, expected=@expected,
      actual=@actual, screenshotThumbnail=@screenshotThumbnail, stackTrace=@stackTrace
    WHERE id=@id
  `).run(updated);

  res.json(rowToIssue(updated as IssueRow));
});

export default router;
