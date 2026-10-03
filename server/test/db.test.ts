import { describe, it, expect, afterEach } from 'vitest';
import { createSupabaseClient } from '../supabaseClient';

describe('createSupabaseClient', () => {
  const original = {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
    SUPABASE_CONFIG: process.env.SUPABASE_CONFIG
  };

  afterEach(() => {
    process.env.SUPABASE_URL = original.SUPABASE_URL;
    process.env.SUPABASE_SECRET_KEY = original.SUPABASE_SECRET_KEY;
    process.env.SUPABASE_CONFIG = original.SUPABASE_CONFIG;
  });

  it('throws a clear error when no credentials are set at all', () => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SECRET_KEY;
    delete process.env.SUPABASE_CONFIG;
    expect(() => createSupabaseClient()).toThrow(/Missing Supabase credentials/);
  });

  it('builds a client when SUPABASE_URL + SUPABASE_SECRET_KEY are both present', () => {
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_SECRET_KEY = 'test-key';
    delete process.env.SUPABASE_CONFIG;
    expect(() => createSupabaseClient()).not.toThrow();
  });

  it('falls back to SUPABASE_CONFIG when the two separate vars are not both set', () => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SECRET_KEY;
    process.env.SUPABASE_CONFIG = JSON.stringify({ url: 'https://example.supabase.co', key: 'test-key' });
    expect(() => createSupabaseClient()).not.toThrow();
  });

  it('throws a clear error when SUPABASE_CONFIG is not valid JSON', () => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SECRET_KEY;
    process.env.SUPABASE_CONFIG = 'not-json';
    expect(() => createSupabaseClient()).toThrow(/not valid JSON/);
  });

  it('throws a clear error when SUPABASE_CONFIG is missing url or key fields', () => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SECRET_KEY;
    process.env.SUPABASE_CONFIG = JSON.stringify({ url: 'https://example.supabase.co' });
    expect(() => createSupabaseClient()).toThrow(/non-empty string "url" and "key"/);
  });

  it('prefers the two separate vars over SUPABASE_CONFIG when both are present', () => {
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_SECRET_KEY = 'test-key';
    process.env.SUPABASE_CONFIG = 'not-json'; // would throw if this were parsed
    expect(() => createSupabaseClient()).not.toThrow();
  });
});
