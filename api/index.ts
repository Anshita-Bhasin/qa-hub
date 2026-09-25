// Vercel serverless entry point.
// Wraps the same Express app used for local dev (server/index.ts) so
// /api/* routes are served as a single serverless function on Vercel.
//
// NOTE: this still uses the SQLite-backed app (server/db.ts), which reads
// and writes a file under server/data/. On Vercel's serverless filesystem
// that directory is read-only except for /tmp, and /tmp is NOT persisted
// between invocations — so writes (new pins, issues, etc.) will appear to
// succeed but will not survive past the current request/lambda instance.
// This is fine for a first "does it deploy" smoke test, but real usage
// (e.g. the Pins feature persisting data) needs the Supabase-backed DB.
import { getDb } from '../server/db';
import { seed } from '../server/seed';
import { createApp } from '../server/index';

const db = getDb('/tmp/qa-hub.db');
seed(db);
const app = createApp(db);

export default app;
