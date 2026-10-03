import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { createTestSupabaseClient } from './testClient';
import { createApp } from '../index';

describe('runs API', () => {
  const supabase = createTestSupabaseClient();
  let app: ReturnType<typeof createApp>;

  beforeEach(async () => {
    await supabase.from('runs').delete().neq('id', '');
    app = createApp(supabase);
  });

  afterEach(async () => {
    await supabase.from('runs').delete().neq('id', '');
  });

  const sampleRun = {
    id: 'run-test-1',
    timestamp: 'Just now',
    persona: 'problem_user',
    targetRoute: '/checkout-step-two.html',
    findings: 'Price glitch found',
    status: 'failed',
    duration: '1.42s',
    suiteName: 'Full Swarm Verification'
  };

  it('starts with an empty list', async () => {
    const res = await request(app).get('/api/runs');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('creates a run and stamps recordedAt', async () => {
    const res = await request(app).post('/api/runs').send(sampleRun);
    expect(res.status).toBe(201);
    expect(res.body.id).toBe('run-test-1');
    expect(typeof res.body.recordedAt).toBe('number');
  });

  it('lists runs newest first', async () => {
    await request(app).post('/api/runs').send(sampleRun);
    await new Promise(r => setTimeout(r, 5));
    await request(app).post('/api/runs').send({ ...sampleRun, id: 'run-test-2' });

    const res = await request(app).get('/api/runs');
    expect(res.body).toHaveLength(2);
    expect(res.body[0].id).toBe('run-test-2');
    expect(res.body[1].id).toBe('run-test-1');
  });
});
