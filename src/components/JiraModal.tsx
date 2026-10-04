import React, { useState } from 'react';
import { DetectedIssue } from '../types';
import { postJSON } from '../utils/api';
import { X, Copy, Check, Download, FileText, Bug, ExternalLink, Loader2 } from 'lucide-react';

interface JiraModalProps {
  issue: DetectedIssue | null;
  onClose: () => void;
  onIssueLinkedToJira: (id: string, jiraKey: string, jiraUrl: string) => void;
}

export const JiraModal: React.FC<JiraModalProps> = ({ issue, onClose, onIssueLinkedToJira }) => {
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  if (!issue) return null;

  const jiraMarkdown = `h2. [BUG][${issue.area}] ${issue.title}

*Key:* ${issue.key}
*Target Environment:* [${issue.url}|${issue.url}]
*Persona:* {color:#3b82f6}*${issue.persona}*{color}
*Severity:* *${issue.severity.toUpperCase()}*
*Current Status:* ${issue.status.replace('_', ' ').toUpperCase()}

h3. Description
${issue.description}

h3. Steps to Reproduce
${issue.reproSteps.map(step => `# ${step}`).join('\n')}

h3. Expected Result
{color:green}${issue.expected}{color}

h3. Actual Result
{color:red}${issue.actual}{color}

${issue.stackTrace ? `h3. Stack Trace / Console Output
{code:javascript}
${issue.stackTrace}
{code}` : ''}

----
_Reported via QA Agent (Automated Playwright & Content Scraper Suite)_`;

  const handleCopy = () => {
    navigator.clipboard.writeText(jiraMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateInJira = () => {
    if (issue.jiraKey || creating) return;
    setCreating(true);
    setCreateError(null);
    postJSON<{ jiraKey: string; jiraUrl: string }>(`/api/jira/issues/${issue.id}`, {})
      .then(({ jiraKey, jiraUrl }) => {
        onIssueLinkedToJira(issue.id, jiraKey, jiraUrl);
      })
      .catch(err => setCreateError(err.message))
      .finally(() => setCreating(false));
  };

  const handleDownloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(issue, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${issue.key}_jira_export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
              <Bug className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {issue.key}
                </span>
                <span className="text-xs uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {issue.area}
                </span>
                <span className={`text-xs uppercase px-2 py-0.5 rounded border ${
                  issue.severity === 'critical' ? 'bg-red-50 text-red-700 border-red-200' :
                  issue.severity === 'high' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  {issue.severity}
                </span>
              </div>
              <h3 className="text-base font-medium text-slate-900 mt-1 line-clamp-1">{issue.title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* JIRA Preview Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Formatted JIRA Issue Markdown</span>
              </span>
              <span>Target: {issue.persona}</span>
            </div>
            <pre className="p-4 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 font-mono text-xs leading-relaxed whitespace-pre-wrap select-all max-h-72 overflow-y-auto">
              {jiraMarkdown}
            </pre>
          </div>

          {/* Quick Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block mb-1">Target Route:</span>
              <a
                href={issue.url}
                target="_blank"
                rel="noreferrer"
                className="text-slate-700 hover:underline flex items-center space-x-1 break-all"
              >
                <span>{issue.url}</span>
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </a>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Persona Context:</span>
              <span className="text-slate-700">{issue.persona}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Expected:</span>
              <span className="text-emerald-700 font-medium">{issue.expected}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Actual:</span>
              <span className="text-red-700 font-medium">{issue.actual}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadJson}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Download JSON Payload</span>
            </button>
            <button
              onClick={handleCopy}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all border ${
                copied
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'Copied!' : 'Copy Markdown'}</span>
            </button>
          </div>
          <div className="flex items-center space-x-3">
            {createError && <span className="text-xs text-red-600 max-w-xs text-right">{createError}</span>}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              Close
            </button>
            {issue.jiraKey ? (
              <a
                href={issue.jiraUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-medium bg-emerald-600 text-white shadow-sm"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View {issue.jiraKey} in JIRA</span>
              </a>
            ) : (
              <button
                onClick={handleCreateInJira}
                disabled={creating}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-medium transition-all bg-[#FFD21E] hover:bg-[#FFC107] text-slate-900 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bug className="w-4 h-4" />}
                <span>{creating ? 'Creating in JIRA…' : 'Create in JIRA'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
