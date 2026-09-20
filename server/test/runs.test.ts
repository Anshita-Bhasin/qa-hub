import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import request from 'supertest';
import { getDb } from '../db';
import { createApp } from '../index';

function tempDbPath(): string {
  return path.join(os.tmpdir(), `qa-hub-test-${Date.now()}-${Math.random()}.db`);
}

describe('runs API', () => {
  let dbPath: string;
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    dbPath = tempDbPath();
    const db = getDb(dbPath);
    app = createApp(db);
  });

  afterEach(() => {
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
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
