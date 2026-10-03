import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Server-only Supabase client. Uses the secret (service-role) key, which
// bypasses Row Level Security — this module must never be imported from
// src/ (frontend) code, only from server/ and api/.
//
// `schema` lets tests point the client at the `test` Postgres schema
// (a separate copy of the same 4 tables) instead of `public`, so test
// runs never read or write real app data. Defaults to `public`.
//
// Typed as `SupabaseClient<any, any, any>` because the schema name is only
// known at runtime (not a literal type), which the library's default
// `"public"`-pinned generic can't express.
export function createSupabaseClient(schema: string = 'public'): SupabaseClient<any, any, any> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing SUPABASE_URL or SUPABASE_SECRET_KEY environment variables. ' +
      'Copy .env.example to .env.local and fill in your Supabase project values.'
    );
  }

  return createClient(url, key, {
    db: { schema },
    auth: { persistSession: false }
  });
}
