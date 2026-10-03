// Vitest setup file: loads SUPABASE_URL / SUPABASE_SECRET_KEY from .env.local
// before any test file runs, since vitest does not auto-load env files the
// way `tsx` scripts do via the explicit dotenv.config() calls in server/index.ts
// and server/seed.ts.
import dotenv from 'dotenv';
import { beforeAll } from 'vitest';
import { createTestSupabaseClient } from './testClient';

dotenv.config({ path: '.env.local' });

// Belt-and-suspenders: wipe the `test` schema's tables once before the whole
// suite starts. Each file's own beforeEach/afterEach handles intra-file
// isolation, but this guards against any leftover rows from a previous run
// that crashed, was interrupted, or raced across file/worker boundaries.
beforeAll(async () => {
  const supabase = createTestSupabaseClient();
  await supabase.from('issues').delete().neq('id', '');
  await supabase.from('runs').delete().neq('id', '');
  await supabase.from('pins').delete().neq('id', '');
  await supabase.from('products').delete().neq('id', -1);
});
