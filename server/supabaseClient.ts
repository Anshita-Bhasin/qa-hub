import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Server-only Supabase client. Uses the secret (service-role) key, which
// bypasses Row Level Security — this module must never be imported from
// src/ (frontend) code, only from server/ and api/.
//
// Credentials are read in one of two shapes:
//   1. SUPABASE_URL + SUPABASE_SECRET_KEY as two separate variables
//      (used locally via .env.local — see .env.example).
//   2. A single SUPABASE_CONFIG variable holding a JSON string:
//      {"url":"https://xxx.supabase.co","key":"..."}
//      This exists for hosts that only allow adding one environment
//      variable (e.g. a restricted Vercel plan/project) — both values
//      are packed into that one slot instead of split across two.
// If both forms are present, the two separate variables win.
function readCredentials(): { url: string; key: string } {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;

  if (url && key) {
    return { url, key };
  }

  const packed = process.env.SUPABASE_CONFIG;
  if (packed) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(packed);
    } catch {
      throw new Error(
        'SUPABASE_CONFIG is set but is not valid JSON. Expected: {"url":"https://xxx.supabase.co","key":"..."}'
      );
    }

    const { url: packedUrl, key: packedKey } = (parsed as { url?: unknown; key?: unknown }) ?? {};
    if (typeof packedUrl !== 'string' || typeof packedKey !== 'string' || !packedUrl || !packedKey) {
      throw new Error(
        'SUPABASE_CONFIG must be a JSON object with non-empty string "url" and "key" fields.'
      );
    }

    return { url: packedUrl, key: packedKey };
  }

  throw new Error(
    'Missing Supabase credentials. Set SUPABASE_URL + SUPABASE_SECRET_KEY, or a single ' +
    'SUPABASE_CONFIG variable as JSON: {"url":"...","key":"..."}. ' +
    'Copy .env.example to .env.local and fill in your Supabase project values for local dev.'
  );
}

// `schema` lets tests point the client at the `test` Postgres schema
// (a separate copy of the same 4 tables) instead of `public`, so test
// runs never read or write real app data. Defaults to `public`.
//
// Typed as `SupabaseClient<any, any, any>` because the schema name is only
// known at runtime (not a literal type), which the library's default
// `"public"`-pinned generic can't express.
export function createSupabaseClient(schema: string = 'public'): SupabaseClient<any, any, any> {
  const { url, key } = readCredentials();

  return createClient(url, key, {
    db: { schema },
    auth: { persistSession: false }
  });
}
