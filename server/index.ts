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
