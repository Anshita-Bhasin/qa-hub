import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { createTestSupabaseClient } from './testClient';
import { createApp } from '../index';

describe('pins API', () => {
  const supabase = createTestSupabaseClient();
  let app: ReturnType<typeof createApp>;

  beforeEach(async () => {
    await supabase.from('pins').delete().neq('id', '');
    app = createApp(supabase);
  });

  afterEach(async () => {
    await supabase.from('pins').delete().neq('id', '');
  });

  const samplePin = {
    id: 'pin-test-1',
    xPercent: 50,
    yPercent: 50,
    title: 'Misaligned button',
    description: 'Button overshoots container',
    severity: 'medium',
    pageUrl: 'https://www.saucedemo.com/inventory.html',
    elementSelector: '#checkout',
    timestamp: 'Just now',
    author: 'Test Author',
    status: 'open'
  };

  it('creates and lists a pin', async () => {
    const createRes = await request(app).post('/api/pins').send(samplePin);
    expect(createRes.status).toBe(201);

    const listRes = await request(app).get('/api/pins');
    expect(listRes.body).toHaveLength(1);
    expect(listRes.body[0].title).toBe('Misaligned button');
  });

  it('updates a pin status via PATCH', async () => {
    await request(app).post('/api/pins').send(samplePin);
    const patchRes = await request(app).patch('/api/pins/pin-test-1').send({ status: 'resolved' });
    expect(patchRes.status).toBe(200);
    expect(patchRes.body.status).toBe('resolved');
  });

  it('deletes a pin', async () => {
    await request(app).post('/api/pins').send(samplePin);
    const delRes = await request(app).delete('/api/pins/pin-test-1');
    expect(delRes.status).toBe(204);

    const listRes = await request(app).get('/api/pins');
    expect(listRes.body).toHaveLength(0);
  });

  it('returns 404 deleting an unknown pin', async () => {
    const res = await request(app).delete('/api/pins/does-not-exist');
    expect(res.status).toBe(404);
  });
});
