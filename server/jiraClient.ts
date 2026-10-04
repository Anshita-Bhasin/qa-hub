// Server-only Jira REST client. Uses a Jira Cloud API token (Basic auth via
// email + token), which must never be exposed to the frontend — this module
// must never be imported from src/ (frontend) code, only from server/ and api/.
//
// Mirrors the pattern in supabaseClient.ts: read config from process.env,
// throw a descriptive error if anything required is missing.

export interface JiraConfig {
  baseUrl: string;
  email: string;
  apiToken: string;
  projectKey: string;
}

export function getJiraConfig(): JiraConfig {
  const baseUrl = process.env.JIRA_BASE_URL;
  const email = process.env.JIRA_EMAIL;
  const apiToken = process.env.JIRA_API_TOKEN;
  const projectKey = process.env.JIRA_PROJECT_KEY;

  if (!baseUrl || !email || !apiToken || !projectKey) {
    throw new Error(
      'Missing JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN, or JIRA_PROJECT_KEY environment variables. ' +
      'Copy .env.example to .env.local and fill in your Jira site values.'
    );
  }

  return { baseUrl: baseUrl.replace(/\/+$/, ''), email, apiToken, projectKey };
}

// Minimal Atlassian Document Format (ADF) paragraph builder — enough for the
// plain-text sections we send (Jira's v3 create-issue API requires the
// `description` field in ADF, not plain markdown/wiki text).
function paragraph(text: string) {
  return { type: 'paragraph', content: text ? [{ type: 'text', text }] : [] };
}

function heading(text: string, level: 3 | 4 = 3) {
  return { type: 'heading', attrs: { level }, content: [{ type: 'text', text }] };
}

function bulletList(items: string[]) {
  return {
    type: 'bulletList',
    content: items.map(item => ({
      type: 'listItem',
      content: [paragraph(item)]
    }))
  };
}

function codeBlock(text: string) {
  return { type: 'codeBlock', content: [{ type: 'text', text }] };
}

export interface JiraIssueInput {
  title: string;
  area: string;
  severity: string;
  persona: string;
  url: string;
  description: string;
  reproSteps: string[];
  expected: string;
  actual: string;
  stackTrace?: string | null;
}

export function buildDescriptionADF(issue: JiraIssueInput) {
  const content: any[] = [
    paragraph(`Target environment: ${issue.url}`),
    paragraph(`Persona: ${issue.persona}`),
    heading('Description'),
    paragraph(issue.description),
    heading('Steps to Reproduce'),
    issue.reproSteps.length > 0 ? bulletList(issue.reproSteps) : paragraph('N/A'),
    heading('Expected Result'),
    paragraph(issue.expected),
    heading('Actual Result'),
    paragraph(issue.actual)
  ];

  if (issue.stackTrace) {
    content.push(heading('Stack Trace / Console Output'));
    content.push(codeBlock(issue.stackTrace));
  }

  content.push(paragraph('Reported via QA Agent (Automated Playwright & Content Scraper Suite)'));

  return { type: 'doc', version: 1, content };
}

// Maps our severity scale onto a reasonable default Jira priority name.
// Jira Cloud's default priority scheme uses these exact names.
function severityToPriority(severity: string): string {
  switch (severity) {
    case 'critical': return 'Highest';
    case 'high': return 'High';
    case 'medium': return 'Medium';
    case 'low': return 'Low';
    default: return 'Medium';
  }
}

export interface CreatedJiraIssue {
  key: string;
  url: string;
}

export async function createJiraBug(issue: JiraIssueInput): Promise<CreatedJiraIssue> {
  const config = getJiraConfig();
  const auth = Buffer.from(`${config.email}:${config.apiToken}`).toString('base64');

  const body = {
    fields: {
      project: { key: config.projectKey },
      issuetype: { name: 'Bug' },
      summary: `[${issue.area}] ${issue.title}`,
      description: buildDescriptionADF(issue),
      priority: { name: severityToPriority(issue.severity) },
      labels: ['qa-hub', issue.persona]
    }
  };

  const res = await fetch(`${config.baseUrl}/rest/api/3/issue`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Jira API error (${res.status}): ${text || res.statusText}`);
  }

  const data = await res.json() as { key: string };
  return { key: data.key, url: `${config.baseUrl}/browse/${data.key}` };
}
