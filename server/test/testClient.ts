import { createSupabaseClient } from '../supabaseClient';

// All server tests run against the `test` Postgres schema in the same
// Supabase project — a separate copy of the 4 tables (see supabase/schema.sql
// for the public-schema version; the `test` schema is created by the
// `create_test_schema_qa_hub_tables` migration). This keeps tests from ever
// reading or writing real app data in `public`.
export function createTestSupabaseClient() {
  return createSupabaseClient('test');
}
