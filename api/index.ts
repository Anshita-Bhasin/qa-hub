// Vercel serverless entry point.
// Wraps the same Express app used for local dev (server/index.ts) so
// /api/* routes are served as a single serverless function on Vercel.
//
// Persistence is handled by Supabase (Postgres) over the network via
// server/supabaseClient.ts — unlike the earlier SQLite-backed version,
// there is no local/tmp filesystem dependency here, so writes persist
// correctly across invocations and lambda instances.
import { createSupabaseClient } from '../server/supabaseClient.js';
import { seed } from '../server/seed.js';
import { createApp } from '../server/index.js';

const supabase = createSupabaseClient();
await seed(supabase);
const app = createApp(supabase);

export default app;
