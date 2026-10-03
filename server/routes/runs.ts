import { Router } from 'express';
import type { SupabaseClient } from '@supabase/supabase-js';

const router = Router();

router.get('/', async (req, res) => {
  const supabase: SupabaseClient = req.app.locals.supabase;
  const { data, error } = await supabase.from('runs').select('*').order('recordedAt', { ascending: false });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

router.post('/', async (req, res) => {
  const supabase: SupabaseClient = req.app.locals.supabase;
  const run = { ...req.body, recordedAt: Date.now() };

  const { error } = await supabase.from('runs').insert(run);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json(run);
});

export default router;
