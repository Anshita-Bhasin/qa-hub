import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import type { SupabaseClient } from '@supabase/supabase-js';
import { createSupabaseClient } from './supabaseClient';
import {
  INITIAL_ISSUES,
  INITIAL_PRODUCTS,
  PROBLEM_USER_PRODUCTS,
  INITIAL_PINS,
  INITIAL_RUNS
} from '../src/data/initialData';
import { fileURLToPath } from 'node:url';

export async function seed(
  supabase: SupabaseClient
): Promise<{ issues: number; products: number; pins: number; runs: number }> {
  const { count, error: countError } = await supabase
    .from('issues')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    throw new Error(`Failed to check existing issues before seeding: ${countError.message}`);
  }

  if (count && count > 0) {
    return { issues: 0, products: 0, pins: 0, runs: 0 };
  }

  const issueRows = INITIAL_ISSUES.map(issue => ({
    ...issue,
    reproSteps: JSON.stringify(issue.reproSteps),
    screenshotThumbnail: issue.screenshotThumbnail ?? null,
    stackTrace: issue.stackTrace ?? null
  }));

  const allProducts = [...INITIAL_PRODUCTS, ...PROBLEM_USER_PRODUCTS];
  const seenProductIds = new Set<number>();
  const productRows: any[] = [];
  for (const p of allProducts) {
    if (seenProductIds.has(p.id)) continue; // PROBLEM_USER_PRODUCTS may reuse ids; keep first occurrence
    seenProductIds.add(p.id);
    productRows.push({
      ...p,
      isBrokenImage: !!p.isBrokenImage,
      isDuplicateAsset: !!p.isDuplicateAsset,
      isPriceGlitch: !!p.isPriceGlitch,
      missingDescription: !!p.missingDescription,
      duplicateNote: p.duplicateNote ?? null
    });
  }

  const runRows = INITIAL_RUNS.map(r => ({ ...r, recordedAt: Date.now() }));

  const { error: issuesError } = await supabase.from('issues').insert(issueRows);
  if (issuesError) throw new Error(`Failed to seed issues: ${issuesError.message}`);

  const { error: productsError } = await supabase.from('products').upsert(productRows, { onConflict: 'id' });
  if (productsError) throw new Error(`Failed to seed products: ${productsError.message}`);

  const { error: pinsError } = await supabase.from('pins').insert(INITIAL_PINS);
  if (pinsError) throw new Error(`Failed to seed pins: ${pinsError.message}`);

  const { error: runsError } = await supabase.from('runs').insert(runRows);
  if (runsError) throw new Error(`Failed to seed runs: ${runsError.message}`);

  return {
    issues: issueRows.length,
    products: seenProductIds.size,
    pins: INITIAL_PINS.length,
    runs: INITIAL_RUNS.length
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const supabase = createSupabaseClient();
  const counts = await seed(supabase);
  console.log('Seed complete:', counts);
}
