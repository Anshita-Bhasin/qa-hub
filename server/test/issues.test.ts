import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import request from 'supertest';
import { getDb } from '../db';
import { createApp } from '../index';
import issuesRouter from '../routes/issues';

function tempDbPath(): string {
  return path.join(os.tmpdir(), `qa-hub-test-${Date.now()}-${Math.random()}.db`);
}

describe('issues API', () => {
  let dbPath: string;
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    dbPath = tempDbPath();
    const db = getDb(dbPath);
    app = createApp(db);
    app.use('/api/issues', issuesRouter);
  });

  afterEach(() => {
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  });

  const sampleIssue = {
    id: 'iss-test-1',
    key: 'MQA-901',
    title: 'Broken image on PLP',
    area: 'PLP',
    severity: 'critical',
    status: 'open',
    firstSeen: 'Just now',
    lastSeen: 'Just now',
    persona: 'problem_user',
    url: 'https://www.saucedemo.com/inventory.html',
    description: 'Image 404s',
    reproSteps: ['Login as problem_user', 'Visit inventory page'],
    expected: 'Image loads',
    actual: 'Image 404s'
  };

  it('starts with an empty list', async () => {
    const res = await request(app).get('/api/issues');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('creates and lists a single issue', async () => {
    const createRes = await request(app).post('/api/issues').send(sampleIssue);
    expect(createRes.status).toBe(201);
    expect(createRes.body.id).toBe('iss-test-1');
    expect(createRes.body.reproSteps).toEqual(sampleIssue.reproSteps);

    const listRes = await request(app).get('/api/issues');
    expect(listRes.status).toBe(200);
    expect(listRes.body).toHaveLength(1);
    expect(listRes.body[0].title).toBe('Broken image on PLP');
  });

  it('creates multiple issues from an array', async () => {
    const second = { ...sampleIssue, id: 'iss-test-2', key: 'MQA-902' };
    const res = await request(app).post('/api/issues').send([sampleIssue, second]);
    expect(res.status).toBe(201);
    expect(res.body).toHaveLength(2);

    const listRes = await request(app).get('/api/issues');
    expect(listRes.body).toHaveLength(2);
  });

  it('updates status via PATCH', async () => {
    await request(app).post('/api/issues').send(sampleIssue);
    const patchRes = await request(app)
      .patch('/api/issues/iss-test-1')
      .send({ status: 'fixed', lastSeen: 'Just now' });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.status).toBe('fixed');

    const listRes = await request(app).get('/api/issues');
    expect(listRes.body[0].status).toBe('fixed');
  });

  it('returns 404 patching an unknown id', async () => {
    const res = await request(app).patch('/api/issues/does-not-exist').send({ status: 'fixed' });
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });
});
