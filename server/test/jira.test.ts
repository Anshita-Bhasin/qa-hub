import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import { createTestSupabaseClient } from './testClient';

// Mock the Jira client module before importing createApp, since routes/jira.ts
// imports createJiraBug at module-load time. vi.mock is hoisted above imports
// by vitest, so this replaces the real (network-calling) implementation for
// every test in this file.
vi.mock('../jiraClient.js', () => ({
  createJiraBug: vi.fn()
}));

const { createApp } = await import('../index.js');
const jiraClient = await import('../jiraClient.js');

describe('jira API', () => {
  const supabase = createTestSupabaseClient();
  let app: ReturnType<typeof createApp>;

  const sampleIssue = {
    id: 'iss-jira-test-1',
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

  beforeEach(async () => {
    await supabase.from('issues').delete().neq('id', '');
    app = createApp(supabase);
  });

  afterEach(async () => {
    await supabase.from('issues').delete().neq('id', '');
    vi.restoreAllMocks();
  });

  it('creates a JIRA issue and persists the key/url onto the issue row', async () => {
    await request(app).post('/api/issues').send(sampleIssue);

    const createSpy = vi.spyOn(jiraClient, 'createJiraBug').mockResolvedValue({
      key: 'KAN-42',
      url: 'https://anshitabhasin.atlassian.net/browse/KAN-42'
    });

    const res = await request(app).post('/api/jira/issues/iss-jira-test-1').send({});
    expect(res.status).toBe(201);
    expect(res.body.jiraKey).toBe('KAN-42');
    expect(res.body.jiraUrl).toBe('https://anshitabhasin.atlassian.net/browse/KAN-42');
    expect(createSpy).toHaveBeenCalledTimes(1);

    const listRes = await request(app).get('/api/issues');
    expect(listRes.body[0].jiraKey).toBe('KAN-42');
    expect(listRes.body[0].jiraUrl).toBe('https://anshitabhasin.atlassian.net/browse/KAN-42');
  });

  it('returns 404 for an unknown issue id', async () => {
    const res = await request(app).post('/api/jira/issues/does-not-exist').send({});
    expect(res.status).toBe(404);
  });

  it('returns 409 and does not call JIRA again when the issue is already linked', async () => {
    await request(app).post('/api/issues').send(sampleIssue);
    const createSpy = vi.spyOn(jiraClient, 'createJiraBug').mockResolvedValue({
      key: 'KAN-42',
      url: 'https://anshitabhasin.atlassian.net/browse/KAN-42'
    });

    await request(app).post('/api/jira/issues/iss-jira-test-1').send({});
    const secondRes = await request(app).post('/api/jira/issues/iss-jira-test-1').send({});

    expect(secondRes.status).toBe(409);
    expect(secondRes.body.jiraKey).toBe('KAN-42');
    expect(createSpy).toHaveBeenCalledTimes(1);
  });

  it('returns 502 when the JIRA API call fails', async () => {
    await request(app).post('/api/issues').send(sampleIssue);
    vi.spyOn(jiraClient, 'createJiraBug').mockRejectedValue(new Error('Jira API error (401): Unauthorized'));

    const res = await request(app).post('/api/jira/issues/iss-jira-test-1').send({});
    expect(res.status).toBe(502);
    expect(res.body.error).toContain('Unauthorized');

    const listRes = await request(app).get('/api/issues');
    expect(listRes.body[0].jiraKey).toBeFalsy();
  });
});
