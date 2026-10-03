import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createSupabaseClient } from '../supabaseClient';

describe('createSupabaseClient', () => {
  const originalUrl = process.env.SUPABASE_URL;
  const originalKey = process.env.SUPABASE_SECRET_KEY;

  afterEach(() => {
    process.env.SUPABASE_URL = originalUrl;
    process.env.SUPABASE_SECRET_KEY = originalKey;
  });

  it('throws a clear error when SUPABASE_URL is missing', () => {
    delete process.env.SUPABASE_URL;
    process.env.SUPABASE_SECRET_KEY = 'test-key';
    expect(() => createSupabaseClient()).toThrow(/SUPABASE_URL/);
  });

  it('throws a clear error when SUPABASE_SECRET_KEY is missing', () => {
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    delete process.env.SUPABASE_SECRET_KEY;
    expect(() => createSupabaseClient()).toThrow(/SUPABASE_SECRET_KEY/);
  });

  it('builds a client when both env vars are present', () => {
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_SECRET_KEY = 'test-key';
    expect(() => createSupabaseClient()).not.toThrow();
  });
});
