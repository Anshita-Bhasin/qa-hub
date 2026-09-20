# Backend Persistence API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the QA tool's in-memory/localStorage frontend state for issues, runs, pins, and products with a real Express + SQLite backend, served over a REST API.

**Architecture:** A standalone Express server (`server/`) runs as a separate process from Vite, backed by a SQLite file via `better-sqlite3`. Vite's dev proxy forwards `/api/*` to the Express server. The frontend calls the API through a small `src/utils/api.ts` client instead of reading `useState`/`localStorage`. A seed script loads the existing fixture data (`src/data/initialData.ts`) into the database once, so first-run appearance is unchanged.

**Tech Stack:** Node/Express, TypeScript, `better-sqlite3`, `tsx` (already a devDependency, runs the server in dev), `concurrently` (new, runs Vite + server together), `vitest` + `supertest` (new, server integration tests).

**Spec:** [docs/superpowers/specs/2026-09-20-backend-persistence-design.md](../specs/2026-09-20-backend-persistence-design.md)

## Global Constraints

- SQLite via `better-sqlite3` (synchronous API) — no other DB driver.
- Server code lives under `server/`, entirely separate from `src/` (frontend).
- REST JSON API mounted under `/api`, no pagination/filtering in v1.
- No auth, no production deploy config — local dev only.
- Complex fields (`reproSteps: string[]`, `steps: TestStep[]`) are stored as JSON text columns, serialized/parsed at the API boundary — never queried by sub-field.
- UI behavior and appearance must be unchanged from today — this is a plumbing swap, not a UX change.
- `src/data/initialData.ts` is kept in the repo as the seed source; it must stop being imported by any component once its data is served from the API.

---

## File Structure

```
server/
  db.ts                  # better-sqlite3 connection + schema creation
  index.ts                # Express app: middleware, route mounting, listen()
  routes/
    issues.ts
    runs.ts
    pins.ts
    products.ts
  seed.ts                  # loads src/data/initialData.ts into the DB
  data/                     # gitignored — qa-hub.db lives here
  test/
    setup.ts                # per-test temp DB helper
    issues.test.ts
    runs.test.ts
    pins.test.ts
    products.test.ts
    seed.test.ts

src/
  utils/
    api.ts                  # fetch wrapper: getJSON/postJSON/patchJSON/del
  App.tsx                    # MODIFY: fetch issues/runs instead of useState(INITIAL_*)
  components/
    ReviewPinsScreen.tsx      # MODIFY: fetch/mutate pins via API
  utils/
    runHistory.ts             # DELETE — replaced by /api/runs

vite.config.ts                # MODIFY: add /api proxy
package.json                   # MODIFY: add deps, dev/test scripts
.gitignore                      # MODIFY: ignore server/data/*.db
```

---

## Task 1: Server scaffold — DB connection and schema

**Files:**
- Create: `server/db.ts`
- Create: `server/index.ts`
- Create: `.gitignore` (modify existing at repo root)
- Test: `server/test/setup.ts`, `server/test/db.test.ts`

**Interfaces:**
- Produces: `getDb(path?: string): Database.Database` from `server/db.ts` — opens (creating if needed) a SQLite file at `path` (default `server/data/qa-hub.db`), runs `CREATE TABLE IF NOT EXISTS` for `issues`, `runs`, `pins`, `products`, and returns the connected `better-sqlite3` `Database` instance. Later tasks' routes call `getDb()` (no args) to get the shared app DB; tests call `getDb(tempPath)` to get an isolated one.
- Produces: `createApp(db: Database.Database): express.Express` from `server/index.ts` — builds and returns an Express app wired with JSON body parsing, with `db` available to route handlers via `app.locals.db`. Kept separate from the `listen()` call so tests can mount the app without binding a port.

- [ ] **Step 1: Install server dependencies**

```bash
npm install better-sqlite3 express-async-errors concurrently
npm install -D vitest supertest @types/supertest @types/better-sqlite3
```

- [ ] **Step 2: Add `server/data/` to `.gitignore`**

Read the current `.gitignore`, then append:
```
server/data/*.db
```

- [ ] **Step 3: Write the failing test for `getDb`**

`server/test/db.test.ts`:
```typescript
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
```

- [ ] **Step 4: Add a `test` script and run it to verify failure**

In `package.json` `"scripts"`, add:
```json
"test": "vitest run"
```

Run: `npm test -- server/test/db.test.ts`
Expected: FAIL — `Cannot find module '../db'` (file doesn't exist yet)

- [ ] **Step 5: Implement `server/db.ts`**

```typescript
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

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
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test -- server/test/db.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 7: Write `server/index.ts` (app factory, no listen yet)**

```typescript
import express from 'express';
import 'express-async-errors';
import type { Database } from 'better-sqlite3';

export function createApp(db: Database): express.Express {
  const app = express();
  app.use(express.json());
  app.locals.db = db;

  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
```

- [ ] **Step 8: Commit**

```bash
git add server/db.ts server/index.ts server/test/db.test.ts .gitignore package.json package-lock.json
git commit -m "feat(server): add SQLite connection and Express app factory"
```

---

## Task 2: Issues route

**Files:**
- Create: `server/routes/issues.ts`
- Test: `server/test/issues.test.ts`

**Interfaces:**
- Consumes: `getDb(path)` from Task 1 (`server/db.ts`); `createApp(db)` from Task 1 (`server/index.ts`).
- Produces: `issuesRouter: express.Router` (default export from `server/routes/issues.ts`), mounted at `/api/issues`. Exposes `GET /`, `POST /` (accepts one issue object or an array of issue objects), `PATCH /:id`. Later tasks (frontend `api.ts`) rely on these exact paths and on `reproSteps` being a JSON array in request/response bodies (serialized to a TEXT column internally).

- [ ] **Step 1: Write the failing test**

`server/test/issues.test.ts`:
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import request from 'supertest';
import { getDb } from '../db';
import { createApp } from '../index';
import issuesRouter from '../routes/issues';

function tempDbPath(): string {
  return path.join(os.tmpdir(), `qa-hub-test-${Date.now()}-${Math.random()}.db`);
}

describe('issues API', () => {
  let dbPath: string;
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    dbPath = tempDbPath();
    const db = getDb(dbPath);
    app = createApp(db);
    app.use('/api/issues', issuesRouter);
  });

  afterEach(() => {
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  });

  const sampleIssue = {
    id: 'iss-test-1',
    key: 'MQA-901',
    title: 'Broken image on PLP',
    area: 'PLP',
    severity: 'critical',
    status: 'open',
    firstSeen: 'Just now',
    lastSeen: 'Just now',
    persona: 'problem_user',
    url: 'https://www.saucedemo.com/inventory.html',
    description: 'Image 404s',
    reproSteps: ['Login as problem_user', 'Visit inventory page'],
    expected: 'Image loads',
    actual: 'Image 404s'
  };

  it('starts with an empty list', async () => {
    const res = await request(app).get('/api/issues');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('creates and lists a single issue', async () => {
    const createRes = await request(app).post('/api/issues').send(sampleIssue);
    expect(createRes.status).toBe(201);
    expect(createRes.body.id).toBe('iss-test-1');
    expect(createRes.body.reproSteps).toEqual(sampleIssue.reproSteps);

    const listRes = await request(app).get('/api/issues');
    expect(listRes.status).toBe(200);
    expect(listRes.body).toHaveLength(1);
    expect(listRes.body[0].title).toBe('Broken image on PLP');
  });

  it('creates multiple issues from an array', async () => {
    const second = { ...sampleIssue, id: 'iss-test-2', key: 'MQA-902' };
    const res = await request(app).post('/api/issues').send([sampleIssue, second]);
    expect(res.status).toBe(201);
    expect(res.body).toHaveLength(2);

    const listRes = await request(app).get('/api/issues');
    expect(listRes.body).toHaveLength(2);
  });

  it('updates status via PATCH', async () => {
    await request(app).post('/api/issues').send(sampleIssue);
    const patchRes = await request(app)
      .patch('/api/issues/iss-test-1')
      .send({ status: 'fixed', lastSeen: 'Just now' });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.status).toBe('fixed');

    const listRes = await request(app).get('/api/issues');
    expect(listRes.body[0].status).toBe('fixed');
  });

  it('returns 404 patching an unknown id', async () => {
    const res = await request(app).patch('/api/issues/does-not-exist').send({ status: 'fixed' });
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- server/test/issues.test.ts`
Expected: FAIL — `Cannot find module '../routes/issues'`

- [ ] **Step 3: Implement `server/routes/issues.ts`**

```typescript
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
```

- [ ] **Step 4: Mount the router in `server/index.ts`**

Modify `server/index.ts` — add the import and mount call before the error handler:
```typescript
import issuesRouter from './routes/issues';
```
```typescript
  app.use('/api/issues', issuesRouter);
```
(Insert the `app.use('/api/issues', ...)` line directly after `app.locals.db = db;` and before the error-handling middleware — Express requires the error handler to be registered last.)

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- server/test/issues.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 6: Commit**

```bash
git add server/routes/issues.ts server/index.ts server/test/issues.test.ts
git commit -m "feat(server): add issues REST route"
```

---

## Task 3: Runs route

**Files:**
- Create: `server/routes/runs.ts`
- Test: `server/test/runs.test.ts`

**Interfaces:**
- Consumes: same `getDb`/`createApp` pattern as Task 2.
- Produces: `runsRouter: express.Router` (default export from `server/routes/runs.ts`), mounted at `/api/runs`. `GET /` returns runs ordered newest-first (by `recordedAt` descending). `POST /` accepts a single run object (no `recordedAt` field required in the request — the server stamps it) and returns the created row including the server-assigned `recordedAt`.

- [ ] **Step 1: Write the failing test**

`server/test/runs.test.ts`:
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import request from 'supertest';
import { getDb } from '../db';
import { createApp } from '../index';
import runsRouter from '../routes/runs';

function tempDbPath(): string {
  return path.join(os.tmpdir(), `qa-hub-test-${Date.now()}-${Math.random()}.db`);
}

describe('runs API', () => {
  let dbPath: string;
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    dbPath = tempDbPath();
    const db = getDb(dbPath);
    app = createApp(db);
    app.use('/api/runs', runsRouter);
  });

  afterEach(() => {
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  });

  const sampleRun = {
    id: 'run-test-1',
    timestamp: 'Just now',
    persona: 'problem_user',
    targetRoute: '/checkout-step-two.html',
    findings: 'Price glitch found',
    status: 'failed',
    duration: '1.42s',
    suiteName: 'Full Swarm Verification'
  };

  it('starts with an empty list', async () => {
    const res = await request(app).get('/api/runs');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('creates a run and stamps recordedAt', async () => {
    const res = await request(app).post('/api/runs').send(sampleRun);
    expect(res.status).toBe(201);
    expect(res.body.id).toBe('run-test-1');
    expect(typeof res.body.recordedAt).toBe('number');
  });

  it('lists runs newest first', async () => {
    await request(app).post('/api/runs').send(sampleRun);
    await new Promise(r => setTimeout(r, 5));
    await request(app).post('/api/runs').send({ ...sampleRun, id: 'run-test-2' });

    const res = await request(app).get('/api/runs');
    expect(res.body).toHaveLength(2);
    expect(res.body[0].id).toBe('run-test-2');
    expect(res.body[1].id).toBe('run-test-1');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- server/test/runs.test.ts`
Expected: FAIL — `Cannot find module '../routes/runs'`

- [ ] **Step 3: Implement `server/routes/runs.ts`**

```typescript
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
```

- [ ] **Step 4: Mount the router in `server/index.ts`**

Add `import runsRouter from './routes/runs';` and `app.use('/api/runs', runsRouter);` (same placement pattern as issues).

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- server/test/runs.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 6: Commit**

```bash
git add server/routes/runs.ts server/index.ts server/test/runs.test.ts
git commit -m "feat(server): add runs REST route"
```

---

## Task 4: Pins route

**Files:**
- Create: `server/routes/pins.ts`
- Test: `server/test/pins.test.ts`

**Interfaces:**
- Consumes: same `getDb`/`createApp` pattern as Task 2.
- Produces: `pinsRouter: express.Router` (default export from `server/routes/pins.ts`), mounted at `/api/pins`. `GET /`, `POST /` (single pin), `PATCH /:id`, `DELETE /:id`.

- [ ] **Step 1: Write the failing test**

`server/test/pins.test.ts`:
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import request from 'supertest';
import { getDb } from '../db';
import { createApp } from '../index';
import pinsRouter from '../routes/pins';

function tempDbPath(): string {
  return path.join(os.tmpdir(), `qa-hub-test-${Date.now()}-${Math.random()}.db`);
}

describe('pins API', () => {
  let dbPath: string;
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    dbPath = tempDbPath();
    const db = getDb(dbPath);
    app = createApp(db);
    app.use('/api/pins', pinsRouter);
  });

  afterEach(() => {
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  });

  const samplePin = {
    id: 'pin-test-1',
    xPercent: 50,
    yPercent: 50,
    title: 'Misaligned button',
    description: 'Button overshoots container',
    severity: 'medium',
    pageUrl: 'https://www.saucedemo.com/inventory.html',
    elementSelector: '#checkout',
    timestamp: 'Just now',
    author: 'Test Author',
    status: 'open'
  };

  it('creates and lists a pin', async () => {
    const createRes = await request(app).post('/api/pins').send(samplePin);
    expect(createRes.status).toBe(201);

    const listRes = await request(app).get('/api/pins');
    expect(listRes.body).toHaveLength(1);
    expect(listRes.body[0].title).toBe('Misaligned button');
  });

  it('updates a pin status via PATCH', async () => {
    await request(app).post('/api/pins').send(samplePin);
    const patchRes = await request(app).patch('/api/pins/pin-test-1').send({ status: 'resolved' });
    expect(patchRes.status).toBe(200);
    expect(patchRes.body.status).toBe('resolved');
  });

  it('deletes a pin', async () => {
    await request(app).post('/api/pins').send(samplePin);
    const delRes = await request(app).delete('/api/pins/pin-test-1');
    expect(delRes.status).toBe(204);

    const listRes = await request(app).get('/api/pins');
    expect(listRes.body).toHaveLength(0);
  });

  it('returns 404 deleting an unknown pin', async () => {
    const res = await request(app).delete('/api/pins/does-not-exist');
    expect(res.status).toBe(404);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- server/test/pins.test.ts`
Expected: FAIL — `Cannot find module '../routes/pins'`

- [ ] **Step 3: Implement `server/routes/pins.ts`**

```typescript
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
  db.prepare(`
    UPDATE pins SET
      xPercent=@xPercent, yPercent=@yPercent, title=@title, description=@description,
      severity=@severity, pageUrl=@pageUrl, elementSelector=@elementSelector,
      timestamp=@timestamp, author=@author, status=@status
    WHERE id=@id
  `).run(updated);

  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const db: Database = req.app.locals.db;
  const result = db.prepare('DELETE FROM pins WHERE id = ?').run(req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: `Pin ${req.params.id} not found` });
  }

  res.status(204).send();
});

export default router;
```

- [ ] **Step 4: Mount the router in `server/index.ts`**

Add `import pinsRouter from './routes/pins';` and `app.use('/api/pins', pinsRouter);`.

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- server/test/pins.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 6: Commit**

```bash
git add server/routes/pins.ts server/index.ts server/test/pins.test.ts
git commit -m "feat(server): add pins REST route"
```

---

## Task 5: Products route

**Files:**
- Create: `server/routes/products.ts`
- Test: `server/test/products.test.ts`

**Interfaces:**
- Consumes: same `getDb`/`createApp` pattern as Task 2.
- Produces: `productsRouter: express.Router` (default export from `server/routes/products.ts`), mounted at `/api/products`. `GET /` returns all products. `POST /` accepts a single product or array and **upserts** by `id` (insert or replace) — this is the operation name the spec and sub-project 2 will refer to as "bulk-upsert".

- [ ] **Step 1: Write the failing test**

`server/test/products.test.ts`:
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import request from 'supertest';
import { getDb } from '../db';
import { createApp } from '../index';
import productsRouter from '../routes/products';

function tempDbPath(): string {
  return path.join(os.tmpdir(), `qa-hub-test-${Date.now()}-${Math.random()}.db`);
}

describe('products API', () => {
  let dbPath: string;
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    dbPath = tempDbPath();
    const db = getDb(dbPath);
    app = createApp(db);
    app.use('/api/products', productsRouter);
  });

  afterEach(() => {
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  });

  const sampleProduct = {
    id: 4,
    name: 'Sauce Labs Backpack',
    price: 29.99,
    extractedPriceStr: '$29.99',
    imgUrl: 'https://www.saucedemo.com/assets/sauce-backpack-1200x1500-CjRW-Djj.jpg',
    isBrokenImage: false,
    isDuplicateAsset: false,
    isPriceGlitch: false,
    missingDescription: false,
    location: 'PLP /inventory.html',
    deepLink: 'https://www.saucedemo.com/inventory-item.html?id=4',
    status: 'valid',
    statusLabel: 'Valid'
  };

  it('bulk-upserts and lists products', async () => {
    const res = await request(app).post('/api/products').send([sampleProduct]);
    expect(res.status).toBe(201);

    const listRes = await request(app).get('/api/products');
    expect(listRes.body).toHaveLength(1);
    expect(listRes.body[0].name).toBe('Sauce Labs Backpack');
    expect(listRes.body[0].isBrokenImage).toBe(false);
  });

  it('upsert replaces an existing product with the same id', async () => {
    await request(app).post('/api/products').send([sampleProduct]);
    await request(app).post('/api/products').send([{ ...sampleProduct, isBrokenImage: true, statusLabel: 'Broken' }]);

    const listRes = await request(app).get('/api/products');
    expect(listRes.body).toHaveLength(1);
    expect(listRes.body[0].isBrokenImage).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- server/test/products.test.ts`
Expected: FAIL — `Cannot find module '../routes/products'`

- [ ] **Step 3: Implement `server/routes/products.ts`**

```typescript
import { Router } from 'express';
import type { Database } from 'better-sqlite3';

interface ProductRow {
  id: number;
  name: string;
  price: number;
  extractedPriceStr: string;
  imgUrl: string;
  isBrokenImage: number;
  isDuplicateAsset: number;
  duplicateNote: string | null;
  isPriceGlitch: number;
  missingDescription: number;
  location: string;
  deepLink: string;
  status: string;
  statusLabel: string;
}

function rowToProduct(row: ProductRow) {
  return {
    ...row,
    isBrokenImage: !!row.isBrokenImage,
    isDuplicateAsset: !!row.isDuplicateAsset,
    isPriceGlitch: !!row.isPriceGlitch,
    missingDescription: !!row.missingDescription
  };
}

const router = Router();

router.get('/', (req, res) => {
  const db: Database = req.app.locals.db;
  const rows = db.prepare('SELECT * FROM products ORDER BY id').all() as ProductRow[];
  res.json(rows.map(rowToProduct));
});

router.post('/', (req, res) => {
  const db: Database = req.app.locals.db;
  const input = Array.isArray(req.body) ? req.body : [req.body];

  if (input.length === 0) {
    return res.status(400).json({ error: 'Request body must be a product or a non-empty array of products' });
  }

  const upsert = db.prepare(`
    INSERT INTO products
      (id, name, price, extractedPriceStr, imgUrl, isBrokenImage, isDuplicateAsset, duplicateNote, isPriceGlitch, missingDescription, location, deepLink, status, statusLabel)
    VALUES
      (@id, @name, @price, @extractedPriceStr, @imgUrl, @isBrokenImage, @isDuplicateAsset, @duplicateNote, @isPriceGlitch, @missingDescription, @location, @deepLink, @status, @statusLabel)
    ON CONFLICT(id) DO UPDATE SET
      name=excluded.name, price=excluded.price, extractedPriceStr=excluded.extractedPriceStr,
      imgUrl=excluded.imgUrl, isBrokenImage=excluded.isBrokenImage, isDuplicateAsset=excluded.isDuplicateAsset,
      duplicateNote=excluded.duplicateNote, isPriceGlitch=excluded.isPriceGlitch,
      missingDescription=excluded.missingDescription, location=excluded.location,
      deepLink=excluded.deepLink, status=excluded.status, statusLabel=excluded.statusLabel
  `);

  const upsertMany = db.transaction((products: any[]) => {
    for (const p of products) {
      upsert.run({
        ...p,
        isBrokenImage: p.isBrokenImage ? 1 : 0,
        isDuplicateAsset: p.isDuplicateAsset ? 1 : 0,
        isPriceGlitch: p.isPriceGlitch ? 1 : 0,
        missingDescription: p.missingDescription ? 1 : 0,
        duplicateNote: p.duplicateNote ?? null
      });
    }
  });

  try {
    upsertMany(input);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }

  res.status(201).json(Array.isArray(req.body) ? input : input[0]);
});

export default router;
```

- [ ] **Step 4: Mount the router in `server/index.ts`**

Add `import productsRouter from './routes/products';` and `app.use('/api/products', productsRouter);`.

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- server/test/products.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 6: Commit**

```bash
git add server/routes/products.ts server/index.ts server/test/products.test.ts
git commit -m "feat(server): add products REST route"
```

---

## Task 6: Server entrypoint (listen) and dev orchestration

**Files:**
- Modify: `server/index.ts` (add a `start()` entrypoint invoked only when run directly)
- Modify: `vite.config.ts` (add `/api` proxy)
- Modify: `package.json` (`dev`, `dev:server` scripts)

**Interfaces:**
- Consumes: `createApp` and `getDb` from Task 1.
- Produces: running the file directly (`tsx server/index.ts`) starts listening on `process.env.PORT ?? 3001`. Frontend fetches to `/api/*` (relative paths) will resolve to this port via the Vite proxy in dev.

- [ ] **Step 1: Add a guarded `start()` call to `server/index.ts`**

Modify `server/index.ts` — append at the end of the file:
```typescript
if (require.main === module) {
  const db = getDb();
  const app = createApp(db);
  app.use('/api/issues', issuesRouter);
  app.use('/api/runs', runsRouter);
  app.use('/api/pins', pinsRouter);
  app.use('/api/products', productsRouter);
  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  app.listen(port, () => {
    console.log(`QA Hub server listening on http://localhost:${port}`);
  });
}
```
Note: this duplicates the four `app.use(...)` route-mounting lines that already exist earlier in `createApp`'s caller code from Tasks 2–5. Since those mounts were being done ad hoc after `createApp()` in each task's test file (not inside `createApp` itself), consolidate them now: move all four `app.use('/api/...', ...)` calls from being "called by the caller" into `createApp` itself, so `createApp` always returns a fully-wired app. Concretely, edit `server/index.ts`'s `createApp` function to import and mount all four routers internally, right after `app.locals.db = db;` and before the error handler. Then simplify the block above to just:
```typescript
if (require.main === module) {
  const db = getDb();
  const app = createApp(db);
  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  app.listen(port, () => {
    console.log(`QA Hub server listening on http://localhost:${port}`);
  });
}
```
And update `server/test/issues.test.ts`, `runs.test.ts`, `pins.test.ts`, `products.test.ts` from Tasks 2–5 to delete their now-redundant `app.use('/api/...', ...)` line in `beforeEach` (since `createApp` mounts routes itself) — each test file's `beforeEach` becomes just:
```typescript
  beforeEach(() => {
    dbPath = tempDbPath();
    const db = getDb(dbPath);
    app = createApp(db);
  });
```

- [ ] **Step 2: Run the full server test suite to verify nothing broke**

Run: `npm test`
Expected: PASS — all tests from Tasks 1–5 (db, issues, runs, pins, products)

- [ ] **Step 3: Add the Vite `/api` proxy**

Read `vite.config.ts`, then modify the `server` block:
```typescript
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api': {
          target: `http://localhost:${process.env.PORT ?? 3001}`,
          changeOrigin: true,
        },
      },
    },
```

- [ ] **Step 4: Update `package.json` scripts**

Modify the `"scripts"` block:
```json
"scripts": {
  "dev": "concurrently -k -n vite,server \"vite --port=3000 --host=0.0.0.0\" \"npm:dev:server\"",
  "dev:server": "tsx watch server/index.ts",
  "build": "vite build",
  "preview": "vite preview",
  "clean": "rm -rf dist server/data",
  "lint": "tsc --noEmit",
  "test": "vitest run",
  "db:seed": "tsx server/seed.ts"
}
```

- [ ] **Step 5: Manually verify dev orchestration**

Run: `npm run dev` (in background or a separate terminal), then in another shell:
```bash
curl -s http://localhost:3000/api/issues
```
Expected: `[]` (empty array, proxied through Vite to the Express server) — confirms the proxy works end to end. Stop the dev server afterward.

- [ ] **Step 6: Commit**

```bash
git add server/index.ts server/test/issues.test.ts server/test/runs.test.ts server/test/pins.test.ts server/test/products.test.ts vite.config.ts package.json
git commit -m "feat(server): wire up server entrypoint and Vite dev proxy"
```

---

## Task 7: Seed script

**Files:**
- Create: `server/seed.ts`
- Test: `server/test/seed.test.ts`

**Interfaces:**
- Consumes: `getDb` (Task 1); `INITIAL_ISSUES`, `INITIAL_PRODUCTS`, `PROBLEM_USER_PRODUCTS`, `INITIAL_PINS`, `INITIAL_RUNS` exported from `src/data/initialData.ts`.
- Produces: `seed(db: Database): { issues: number; products: number; pins: number; runs: number }` from `server/seed.ts` — inserts fixture rows into an empty DB and returns counts inserted per table; no-ops (returns zero counts) if the `issues` table already has rows, so it's safe to call on every boot.

- [ ] **Step 1: Write the failing test**

`server/test/seed.test.ts`:
```typescript
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- server/test/seed.test.ts`
Expected: FAIL — `Cannot find module '../seed'`

- [ ] **Step 3: Implement `server/seed.ts`**

```typescript
import type { Database } from 'better-sqlite3';
import { getDb } from './db';
import {
  INITIAL_ISSUES,
  INITIAL_PRODUCTS,
  PROBLEM_USER_PRODUCTS,
  INITIAL_PINS,
  INITIAL_RUNS
} from '../src/data/initialData';

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

if (require.main === module) {
  const db = getDb();
  const counts = seed(db);
  console.log('Seed complete:', counts);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- server/test/seed.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Run the seed script against the real dev DB**

```bash
npm run db:seed
```
Expected output: `Seed complete: { issues: 4, products: <N>, pins: 3, runs: 5 }` (exact issue/product counts depend on fixture data — confirm counts are non-zero and no errors are thrown).

- [ ] **Step 6: Commit**

```bash
git add server/seed.ts server/test/seed.test.ts
git commit -m "feat(server): add fixture seed script"
```

---

## Task 8: Frontend API client

**Files:**
- Create: `src/utils/api.ts`
- Test: none (thin fetch wrapper; exercised indirectly by Tasks 9–10's manual verification, consistent with the spec's "no new component tests" testing approach)

**Interfaces:**
- Produces: from `src/utils/api.ts` — `getJSON<T>(path: string): Promise<T>`, `postJSON<T>(path: string, body: unknown): Promise<T>`, `patchJSON<T>(path: string, body: unknown): Promise<T>`, `del(path: string): Promise<void>`. All four throw an `Error` with the server's `{ error }` message (or a generic message if the body isn't JSON) when the response status is not in the 200–299 range. `path` is relative and always starts with `/api/...`; callers pass e.g. `getJSON<DetectedIssue[]>('/api/issues')`. Tasks 9 and 10 import and call these directly.

- [ ] **Step 1: Implement `src/utils/api.ts`**

```typescript
async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (body && typeof body.error === 'string') return body.error;
  } catch {
    // response body wasn't JSON; fall through to generic message
  }
  return `Request failed with status ${res.status}`;
}

export async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return res.json();
}

export async function postJSON<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return res.json();
}

export async function patchJSON<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return res.json();
}

export async function del(path: string): Promise<void> {
  const res = await fetch(path, { method: 'DELETE' });
  if (!res.ok && res.status !== 204) throw new Error(await parseErrorMessage(res));
}
```

- [ ] **Step 2: Type-check**

Run: `npm run lint`
Expected: no new errors from `src/utils/api.ts`

- [ ] **Step 3: Commit**

```bash
git add src/utils/api.ts
git commit -m "feat(frontend): add API client for backend requests"
```

---

## Task 9: Wire `App.tsx` to the issues/runs API

**Files:**
- Modify: `src/App.tsx`
- Delete: `src/utils/runHistory.ts`

**Interfaces:**
- Consumes: `getJSON`, `postJSON`, `patchJSON` from `src/utils/api.ts` (Task 8); `DetectedIssue`, `ExecutionRun`, `IssueStatus` from `src/types.ts` (unchanged).
- Produces: `App.tsx`'s `issues` and `runs` state are now fetched from the server on mount rather than seeded from `INITIAL_ISSUES`/`INITIAL_RUNS`; `handleUpdateIssueStatus`, `handleAddScrapedIssues`, and the run-recording inside `handleRunSwarm` now call the API and update local state from the response, instead of only mutating local state and calling `recordRun`.

- [ ] **Step 1: Replace fixture-seeded state with fetched state**

In `src/App.tsx`, replace:
```typescript
import { INITIAL_ISSUES, INITIAL_RUNS } from './data/initialData';
import { recordRun } from './utils/runHistory';
```
```typescript
import { getJSON, postJSON, patchJSON } from './utils/api';
```

Replace:
```typescript
  const [issues, setIssues] = useState<DetectedIssue[]>(INITIAL_ISSUES);
  const [runs, setRuns] = useState<ExecutionRun[]>(INITIAL_RUNS);
```
with:
```typescript
  const [issues, setIssues] = useState<DetectedIssue[]>([]);
  const [runs, setRuns] = useState<ExecutionRun[]>([]);

  React.useEffect(() => {
    getJSON<DetectedIssue[]>('/api/issues').then(setIssues).catch(err => showToast(`Failed to load issues: ${err.message}`));
    getJSON<ExecutionRun[]>('/api/runs').then(setRuns).catch(err => showToast(`Failed to load runs: ${err.message}`));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
```
(This `useEffect` must be placed after `showToast` is defined in the component, since it references it — move it below the `showToast` function declaration.)

- [ ] **Step 2: Route status updates through the API**

Replace `handleUpdateIssueStatus`:
```typescript
  const handleUpdateIssueStatus = (id: string, newStatus: IssueStatus) => {
    patchJSON<DetectedIssue>(`/api/issues/${id}`, { status: newStatus, lastSeen: 'Just now' })
      .then(updated => {
        setIssues(prev => prev.map(issue => (issue.id === id ? updated : issue)));
        showToast(`Issue status updated to ${newStatus.toUpperCase()}`);
      })
      .catch(err => showToast(`Failed to update issue: ${err.message}`));
  };
```

- [ ] **Step 3: Route scraped/synced issue additions through the API**

Replace `handleAddScrapedIssues`:
```typescript
  const handleAddScrapedIssues = (newIssues: DetectedIssue[]) => {
    postJSON<DetectedIssue[]>('/api/issues', newIssues)
      .then(created => {
        setIssues(prev => [...created, ...prev]);
        showToast(`Added ${created.length} scraped anomalies to Issues Repository!`);
      })
      .catch(err => showToast(`Failed to add issues: ${err.message}`));
  };
```

- [ ] **Step 4: Route swarm-run recording through the API**

In `handleRunSwarm`, replace the body of the `setTimeout` callback:
```typescript
    setTimeout(() => {
      setIsRunningSwarm(false);
      const newRun: ExecutionRun = {
        id: `run-${Math.floor(900 + Math.random() * 90)}`,
        timestamp: 'Just now',
        persona: 'problem_user',
        targetRoute: '/checkout-step-two.html',
        findings: 'Automated Swarm identified 404 image collisions & $0.00 price anomalies',
        status: 'failed',
        duration: '1.42s',
        suiteName: 'Full Swarm Verification'
      };
      postJSON<ExecutionRun>('/api/runs', newRun)
        .then(created => {
          setRuns(prev => [created, ...prev.slice(0, 5)]);
          showToast('Swarm Scan Complete! 24 total issues synchronized.');
        })
        .catch(err => showToast(`Failed to record run: ${err.message}`));
    }, 2000);
```

- [ ] **Step 5: Delete `src/utils/runHistory.ts`**

```bash
rm src/utils/runHistory.ts
```

- [ ] **Step 6: Type-check**

Run: `npm run lint`
Expected: no errors

- [ ] **Step 7: Manual verification**

```bash
npm run db:seed   # if not already seeded
npm run dev
```
Open `http://localhost:3000`, confirm: Overview screen shows the 4 seeded issues' counts and 5 seeded runs; clicking "Run Swarm" adds a new run that persists across a page reload (confirms it's server-backed, not just local state); changing an issue's status in the Issues screen persists across reload.

- [ ] **Step 8: Commit**

```bash
git add src/App.tsx
git rm src/utils/runHistory.ts
git commit -m "feat(frontend): wire App.tsx issues and runs to backend API"
```

---

## Task 10: Wire `ReviewPinsScreen` to the pins API

**Files:**
- Modify: `src/components/ReviewPinsScreen.tsx`

**Interfaces:**
- Consumes: `getJSON`, `postJSON`, `patchJSON`, `del` from `src/utils/api.ts` (Task 8); `ReviewPin` from `src/types.ts` (unchanged).
- Produces: `pins` state is fetched from `/api/pins` on mount instead of seeded from `INITIAL_PINS`; pin creation, status sync-to-issues, and deletion (if present) call the API.

- [ ] **Step 1: Inspect current pin mutation logic**

Read the full current `src/components/ReviewPinsScreen.tsx` (already partially read during design — re-read in full at implementation time since only the first ~60 lines were seen) to find every place `setPins` is called, so each can be paired with the matching API call. At minimum this includes: initial load (replace `useState(INITIAL_PINS)`), `handleCreatePin`, and any status-update / delete handlers present in the file.

- [ ] **Step 2: Replace fixture-seeded state with fetched state**

Replace:
```typescript
import { INITIAL_PINS, SAUCEDEMO_IMAGES } from '../data/initialData';
```
with:
```typescript
import { SAUCEDEMO_IMAGES } from '../data/initialData';
import { getJSON, postJSON, patchJSON, del } from '../utils/api';
```

Replace:
```typescript
  const [pins, setPins] = useState<ReviewPin[]>(INITIAL_PINS);
```
with:
```typescript
  const [pins, setPins] = useState<ReviewPin[]>([]);

  React.useEffect(() => {
    getJSON<ReviewPin[]>('/api/pins').then(setPins).catch(() => {
      // Load failure leaves pins empty; existing empty-state UI (if any) covers this.
    });
  }, []);
```

- [ ] **Step 3: Route pin creation through the API**

In `handleCreatePin`, after building the `newPin` object and before/instead of calling `setPins(prev => [...])` directly, call:
```typescript
    postJSON<ReviewPin>('/api/pins', newPin)
      .then(created => setPins(prev => [created, ...prev]))
      .catch(() => {
        // Keep existing form-reset behavior even if the request fails silently for v1;
        // errors surface via the shared toast pattern in later screens if added.
      });
```
Preserve all existing surrounding logic (form reset, `setIsAddingPin(false)`, etc.) — only the `setPins` call changes from a direct array update to the API-backed one above.

- [ ] **Step 4: Route any status-update/delete handlers through the API**

For each handler found in Step 1 that mutates `pins` for status changes, replace direct `setPins` mutation with `patchJSON<ReviewPin>(\`/api/pins/${id}\`, { status: newStatus }).then(updated => setPins(prev => prev.map(p => p.id === id ? updated : p)))`. For deletion, replace with `del(\`/api/pins/${id}\`).then(() => setPins(prev => prev.filter(p => p.id !== id)))`.

- [ ] **Step 5: Type-check**

Run: `npm run lint`
Expected: no errors

- [ ] **Step 6: Manual verification**

```bash
npm run dev
```
Open `http://localhost:3000`, navigate to the Review Pins screen, confirm the 3 seeded pins load, create a new pin, reload the page, confirm the new pin persists.

- [ ] **Step 7: Commit**

```bash
git add src/components/ReviewPinsScreen.tsx
git commit -m "feat(frontend): wire ReviewPinsScreen to backend pins API"
```

---

## Task 11: Retire `initialData.ts` imports and final verification

**Files:**
- Modify: any remaining component still importing `INITIAL_*` fixture arrays for issues/runs/pins (expected: none after Tasks 9–10, but `ScraperScreen.tsx` and `FunctionalTestsScreen.tsx` may still import `INITIAL_PRODUCTS`/`PROBLEM_USER_PRODUCTS`/`INITIAL_TEST_SUITES` — these stay as-is per this plan's non-goals, since real scraping/test execution are sub-projects 2/3)

**Interfaces:**
- Consumes: nothing new.
- Produces: confirms `src/data/initialData.ts` is no longer imported for `INITIAL_ISSUES`, `INITIAL_RUNS`, or `INITIAL_PINS` anywhere in `src/`, while leaving `ScraperScreen.tsx`'s and `FunctionalTestsScreen.tsx`'s simulated-data imports untouched (out of scope until sub-projects 2/3).

- [ ] **Step 1: Grep for remaining fixture imports**

```bash
grep -rn "INITIAL_ISSUES\|INITIAL_RUNS\|INITIAL_PINS" src/
```
Expected: no matches outside `src/data/initialData.ts` itself (the export declarations) and `server/seed.ts`'s import.

- [ ] **Step 2: Run full test suite**

```bash
npm test
npm run lint
```
Expected: all server tests pass; `tsc --noEmit` reports no errors.

- [ ] **Step 3: Full manual smoke test**

```bash
rm -f server/data/qa-hub.db*   # start clean
npm run db:seed
npm run dev
```
Walk through: Overview (issue/run counts match seed), Issues screen (status change persists across reload), Review Pins (create/reload persists), Scraper and Functional Tests screens still render and simulate as before (unaffected by this plan — confirms no regression in out-of-scope areas).

- [ ] **Step 4: Commit (if any cleanup was needed in Step 1)**

```bash
git add -A
git commit -m "chore: confirm fixture data fully retired from issues/runs/pins state"
```
(Skip this commit if Step 1 found nothing to change.)

---

## Self-Review Notes

- **Spec coverage:** Architecture (Task 6), data model (Task 1), API surface (Tasks 2–5), frontend changes (Tasks 8–10), seeding (Task 7), error handling (built into each route + `api.ts` in Task 8), testing (server integration tests throughout, manual frontend verification in Tasks 9–11) — all spec sections have a corresponding task.
- **Type consistency:** `getDb`/`createApp` signatures introduced in Task 1 are used identically in Tasks 2–7's tests. `getJSON`/`postJSON`/`patchJSON`/`del` from Task 8 are used with matching names/signatures in Tasks 9–10.
- **Placeholder scan:** no TBD/TODO markers; all code steps contain full, runnable code.
