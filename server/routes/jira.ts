import { Router } from 'express';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createJiraBug } from '../jiraClient.js';

const router = Router();

// POST /api/jira/issues/:id — create a real Jira Bug from an existing issue
// row, then persist the returned key/url back onto that row so the "Create
// in JIRA" button can be disabled/relabeled afterward (idempotency guard
// lives in the frontend, keyed off issue.jiraKey being set).
router.post('/issues/:id', async (req, res) => {
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

  if (existing.jiraKey) {
    return res.status(409).json({ error: `Issue already linked to JIRA as ${existing.jiraKey}`, jiraKey: existing.jiraKey, jiraUrl: existing.jiraUrl });
  }

  let created;
  try {
    created = await createJiraBug({
      title: existing.title,
      area: existing.area,
      severity: existing.severity,
      persona: existing.persona,
      url: existing.url,
      description: existing.description,
      reproSteps: typeof existing.reproSteps === 'string' ? JSON.parse(existing.reproSteps) : existing.reproSteps,
      expected: existing.expected,
      actual: existing.actual,
      stackTrace: existing.stackTrace
    });
  } catch (err: any) {
    return res.status(502).json({ error: err.message || 'Failed to create JIRA issue' });
  }

  const { error: updateError } = await supabase
    .from('issues')
    .update({ jiraKey: created.key, jiraUrl: created.url })
    .eq('id', req.params.id);

  if (updateError) {
    // The Jira issue was created but we couldn't persist the link — surface
    // both facts so the UI can still show the created key to the user.
    return res.status(207).json({ jiraKey: created.key, jiraUrl: created.url, warning: `Created JIRA issue but failed to save link: ${updateError.message}` });
  }

  res.status(201).json({ jiraKey: created.key, jiraUrl: created.url });
});

export default router;
