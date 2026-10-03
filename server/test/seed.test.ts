import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestSupabaseClient } from './testClient';
import { seed } from '../seed';

async function clearAllTables(supabase: ReturnType<typeof createTestSupabaseClient>) {
  await supabase.from('issues').delete().neq('id', '');
  await supabase.from('runs').delete().neq('id', '');
  await supabase.from('pins').delete().neq('id', '');
  await supabase.from('products').delete().neq('id', -1);
}

describe('seed', () => {
  const supabase = createTestSupabaseClient();

  beforeEach(async () => {
    await clearAllTables(supabase);
  });

  afterEach(async () => {
    await clearAllTables(supabase);
  });

  it('populates all four tables on an empty database', async () => {
    const counts = await seed(supabase);

    expect(counts.issues).toBeGreaterThan(0);
    expect(counts.pins).toBeGreaterThan(0);
    expect(counts.runs).toBeGreaterThan(0);
    expect(counts.products).toBeGreaterThan(0);

    const { count } = await supabase.from('issues').select('*', { count: 'exact', head: true });
    expect(count).toBe(counts.issues);
  });

  it('is a no-op when issues already has rows', async () => {
    await seed(supabase);
    const second = await seed(supabase);

    expect(second).toEqual({ issues: 0, products: 0, pins: 0, runs: 0 });
  });
});
