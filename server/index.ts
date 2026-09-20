import express from 'express';
import 'express-async-errors';
import { fileURLToPath } from 'node:url';
import type { Database } from 'better-sqlite3';
import { getDb } from './db';
import issuesRouter from './routes/issues';
import runsRouter from './routes/runs';
import pinsRouter from './routes/pins';
import productsRouter from './routes/products';

export function createApp(db: Database): express.Express {
  const app = express();
  app.use(express.json());
  app.locals.db = db;

  app.use('/api/issues', issuesRouter);
  app.use('/api/runs', runsRouter);
  app.use('/api/pins', pinsRouter);
  app.use('/api/products', productsRouter);

  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}

// ESM equivalent of `require.main === module`: only start listening when this
// file is executed directly (e.g. `tsx server/index.ts`), not when imported
// (e.g. from test files calling `createApp`).
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isMain) {
  const db = getDb();
  const app = createApp(db);
  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  app.listen(port, () => {
    console.log(`QA Hub server listening on http://localhost:${port}`);
  });
}
