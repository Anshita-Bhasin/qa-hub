import { Router } from 'express';
import type { SupabaseClient } from '@supabase/supabase-js';

const router = Router();

router.get('/', async (req, res) => {
  const supabase: SupabaseClient = req.app.locals.supabase;
  const { data, error } = await supabase.from('pins').select('*').order('timestamp', { ascending: false });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

router.post('/', async (req, res) => {
  const supabase: SupabaseClient = req.app.locals.supabase;
  const { error } = await supabase.from('pins').insert(req.body);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json(req.body);
});

router.patch('/:id', async (req, res) => {
  const supabase: SupabaseClient = req.app.locals.supabase;
  const { data: existing, error: fetchError } = await supabase
    .from('pins')
    .select('*')
    .eq('id', req.params.id)
    .maybeSingle();

  if (fetchError) {
    return res.status(400).json({ error: fetchError.message });
  }

  if (!existing) {
    return res.status(404).json({ error: `Pin ${req.params.id} not found` });
  }

  const updated = { ...existing, ...req.body };
  const { error: updateError } = await supabase.from('pins').update(updated).eq('id', req.params.id);

  if (updateError) {
    return res.status(400).json({ error: updateError.message });
  }

  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const supabase: SupabaseClient = req.app.locals.supabase;
  const { data: existing, error: fetchError } = await supabase
    .from('pins')
    .select('id')
    .eq('id', req.params.id)
    .maybeSingle();

  if (fetchError) {
    return res.status(400).json({ error: fetchError.message });
  }

  if (!existing) {
    return res.status(404).json({ error: `Pin ${req.params.id} not found` });
  }

  const { error: deleteError } = await supabase.from('pins').delete().eq('id', req.params.id);

  if (deleteError) {
    return res.status(400).json({ error: deleteError.message });
  }

  res.status(204).send();
});

export default router;
