import { Router } from 'express';
import type { SupabaseClient } from '@supabase/supabase-js';

const router = Router();

router.get('/', async (req, res) => {
  const supabase: SupabaseClient = req.app.locals.supabase;
  const { data, error } = await supabase.from('products').select('*').order('id', { ascending: true });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  // Postgres returns real booleans already (unlike SQLite's 0/1 integers),
  // so no coercion is needed here — kept as a passthrough for clarity.
  res.json(data);
});

router.post('/', async (req, res) => {
  const supabase: SupabaseClient = req.app.locals.supabase;
  const input = Array.isArray(req.body) ? req.body : [req.body];

  if (input.length === 0) {
    return res.status(400).json({ error: 'Request body must be a product or a non-empty array of products' });
  }

  const rows = input.map((p: any) => ({
    ...p,
    isBrokenImage: !!p.isBrokenImage,
    isDuplicateAsset: !!p.isDuplicateAsset,
    isPriceGlitch: !!p.isPriceGlitch,
    missingDescription: !!p.missingDescription,
    duplicateNote: p.duplicateNote ?? null
  }));

  // Matches the previous SQLite `ON CONFLICT(id) DO UPDATE`: existing ids are overwritten.
  const { error } = await supabase.from('products').upsert(rows, { onConflict: 'id' });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json(Array.isArray(req.body) ? input : input[0]);
});

export default router;
