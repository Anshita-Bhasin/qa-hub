import { Router } from 'express';
import type { SupabaseClient } from '@supabase/supabase-js';

interface IssueRow {
  id: string;
  key: string;
  title: string;
  area: string;
  severity: string;
  status: string;
  firstSeen: string;
  lastSeen: string;
  persona: string;
  url: string;
  description: string;
  reproSteps: string; // JSON
  expected: string;
  actual: string;
  screenshotThumbnail: string | null;
  stackTrace: string | null;
}

function rowToIssue(row: IssueRow) {
  return { ...row, reproSteps: JSON.parse(row.reproSteps) };
}

const router = Router();

router.get('/', async (req, res) => {
  const supabase: SupabaseClient = req.app.locals.supabase;
  const { data, error } = await supabase.from('issues').select('*').order('firstSeen', { ascending: false });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json((data as IssueRow[]).map(rowToIssue));
});

router.post('/', async (req, res) => {
  const supabase: SupabaseClient = req.app.locals.supabase;
  const input = Array.isArray(req.body) ? req.body : [req.body];

  if (input.length === 0) {
    return res.status(400).json({ error: 'Request body must be an issue or a non-empty array of issues' });
  }

  const rows = input.map((issue: any) => ({
    ...issue,
    reproSteps: JSON.stringify(issue.reproSteps ?? []),
    screenshotThumbnail: issue.screenshotThumbnail ?? null,
    stackTrace: issue.stackTrace ?? null
  }));

  // Matches the previous SQLite `ON CONFLICT(id) DO NOTHING`: existing ids are
  // left untouched, not overwritten (idempotent re-sync from the frontend).
  const { error } = await supabase.from('issues').upsert(rows, { onConflict: 'id', ignoreDuplicates: true });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json(Array.isArray(req.body) ? input : input[0]);
});

router.patch('/:id', async (req, res) => {
  const supabase: SupabaseClient = req.app.locals.supabase;
  const { data: existing, error: fetchError } = await supabase
    .from('issues')
    .select('*')
    .eq('id', req.params.id)
    .maybeSingle();

  if (fetchError) {
    return res.status(400).json({ error: fetchError.message });
  }

  if (!existing) {
    return res.status(404).json({ error: `Issue ${req.params.id} not found` });
  }

  const updated = {
    ...existing,
    ...req.body,
    reproSteps: req.body.reproSteps ? JSON.stringify(req.body.reproSteps) : existing.reproSteps
  };

  const { error: updateError } = await supabase.from('issues').update(updated).eq('id', req.params.id);

  if (updateError) {
    return res.status(400).json({ error: updateError.message });
  }

  res.json(rowToIssue(updated as IssueRow));
});

export default router;
