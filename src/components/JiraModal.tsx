import React, { useState } from 'react';
import { DetectedIssue } from '../types';
import { X, Copy, Check, Download, FileText, Bug, ExternalLink } from 'lucide-react';

interface JiraModalProps {
  issue: DetectedIssue | null;
  onClose: () => void;
}

export const JiraModal: React.FC<JiraModalProps> = ({ issue, onClose }) => {
  const [copied, setCopied] = useState(false);

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
_Reported via Mini QA Platform (Automated Playwright & Content Scraper Suite)_`;

  const handleCopy = () => {
    navigator.clipboard.writeText(jiraMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-3xl bg-[#1E293B] border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-800/60">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Bug className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {issue.key}
                </span>
                <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-slate-700/60 text-slate-300">
                  {issue.area}
                </span>
                <span className={`text-xs font-mono uppercase px-2 py-0.5 rounded border ${
                  issue.severity === 'critical' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                  issue.severity === 'high' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                  'bg-blue-500/20 text-blue-300 border-blue-500/30'
                }`}>
                  {issue.severity}
                </span>
              </div>
              <h3 className="text-base font-medium text-white mt-1 line-clamp-1">{issue.title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* JIRA Preview Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span className="flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>Formatted JIRA Issue Markdown</span>
              </span>
              <span>Target: {issue.persona}</span>
            </div>
            <pre className="p-4 rounded-lg bg-[#0F172A] border border-slate-800 text-slate-200 font-mono text-xs leading-relaxed whitespace-pre-wrap select-all max-h-72 overflow-y-auto">
              {jiraMarkdown}
            </pre>
          </div>

          {/* Quick Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-lg bg-slate-800/40 border border-slate-700/40 text-xs">
            <div>
              <span className="text-slate-400 block mb-1">Target Route:</span>
              <a 
                href={issue.url} 
                target="_blank" 
                rel="noreferrer"
                className="text-blue-400 hover:underline flex items-center space-x-1 font-mono break-all"
              >
                <span>{issue.url}</span>
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </a>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Persona Context:</span>
              <span className="font-mono text-slate-200">{issue.persona}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Expected:</span>
              <span className="text-emerald-400 font-medium">{issue.expected}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Actual:</span>
              <span className="text-red-400 font-medium">{issue.actual}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700 bg-slate-800/60">
          <button
            onClick={handleDownloadJson}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-700/50 hover:bg-slate-700 border border-slate-600/60 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Download JSON Payload</span>
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleCopy}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                copied 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-500/25'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy JIRA Markdown'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
