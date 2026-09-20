import React, { useState } from 'react';
import { DetectedIssue, IssueSeverity, IssueStatus, IssueArea, Persona } from '../types';
import { 
  Bug, 
  Search, 
  Filter, 
  Download, 
  Copy, 
  ExternalLink, 
  Check, 
  AlertTriangle, 
  Database,
  FileSpreadsheet,
  Terminal,
  CheckCircle2,
  Trash2
} from 'lucide-react';

interface IssuesScreenProps {
  issues: DetectedIssue[];
  onUpdateIssueStatus: (id: string, newStatus: IssueStatus) => void;
  onOpenJiraModal: (issue: DetectedIssue) => void;
  onOpenTraceModal: (title: string, error?: string, codeExcerpt?: string, screenshotThumbnail?: string) => void;
}

export const IssuesScreen: React.FC<IssuesScreenProps> = ({
  issues,
  onUpdateIssueStatus,
  onOpenJiraModal,
  onOpenTraceModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [selectedPersona, setSelectedPersona] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Filter issues
  const filteredIssues = issues.filter(issue => {
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matches = 
        issue.key.toLowerCase().includes(q) ||
        issue.title.toLowerCase().includes(q) ||
        issue.description.toLowerCase().includes(q) ||
        issue.area.toLowerCase().includes(q);
      if (!matches) return false;
    }
    if (selectedSeverity !== 'all' && issue.severity !== selectedSeverity) return false;
    if (selectedArea !== 'all' && issue.area !== selectedArea) return false;
    if (selectedPersona !== 'all' && issue.persona !== selectedPersona) return false;
    if (selectedStatus !== 'all' && issue.status !== selectedStatus) return false;
    return true;
  });

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Key', 'Title', 'Area', 'Severity', 'Status', 'Persona', 'Target URL', 'Description', 'Expected', 'Actual'];
    const rows = filteredIssues.map(i => [
      i.key,
      `"${i.title.replace(/"/g, '""')}"`,
      i.area,
      i.severity,
      i.status,
      i.persona,
      i.url,
      `"${i.description.replace(/"/g, '""')}"`,
      `"${i.expected.replace(/"/g, '""')}"`,
      `"${i.actual.replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mini_qa_issues_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleQuickCopyJira = (issue: DetectedIssue) => {
    const text = `h2. [BUG][${issue.area}] ${issue.title}\n*Key:* ${issue.key}\n*Persona:* ${issue.persona}\n*Severity:* ${issue.severity.toUpperCase()}\n\n${issue.description}\n\n*Expected:* ${issue.expected}\n*Actual:* ${issue.actual}`;
    navigator.clipboard.writeText(text);
    setCopiedKey(issue.id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Header */}
      <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">
              JIRA Ready
            </span>
            <span className="text-xs text-slate-400 font-mono">Bug Tracking & Export Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Issues Log & JIRA Exporter
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Synchronized repository of anomalies identified by Playwright test suites, scraper crawler, and visual pins.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export to CSV</span>
          </button>

          {filteredIssues.length > 0 && (
            <button
              onClick={() => onOpenJiraModal(filteredIssues[0])}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/25 transition-all"
            >
              <Copy className="w-4 h-4" />
              <span>Preview JIRA Batch</span>
            </button>
          )}
        </div>
      </div>

      {/* Multi-tier Filter & Search Bar */}
      <div className="bg-[#1E293B] border border-slate-700/80 rounded-xl p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by key (MQA-101), title, area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Severity filter */}
          <div>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Area filter */}
          <div>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Areas</option>
              <option value="PLP">PLP (Catalog)</option>
              <option value="PDP">PDP (Details)</option>
              <option value="Checkout Flow">Checkout Flow</option>
              <option value="Auth">Auth / Login</option>
              <option value="Review Pin">Review Pin</option>
            </select>
          </div>

          {/* Status filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_review">In Review</option>
              <option value="fixed">Fixed</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <span>Showing {filteredIssues.length} of {issues.length} detected issues</span>
          {(searchQuery || selectedSeverity !== 'all' || selectedArea !== 'all' || selectedStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSeverity('all');
                setSelectedArea('all');
                setSelectedStatus('all');
              }}
              className="text-blue-400 hover:underline font-mono"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Issues Table */}
      <div className="bg-[#1E293B] border border-slate-700/80 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Key</th>
                <th className="px-5 py-3.5">Issue Summary</th>
                <th className="px-5 py-3.5">Area</th>
                <th className="px-5 py-3.5">Severity</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Persona</th>
                <th className="px-5 py-3.5">Last Seen</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredIssues.map((issue) => {
                const isCritical = issue.severity === 'critical';
                const isHigh = issue.severity === 'high';

                return (
                  <tr key={issue.id} className="hover:bg-slate-800/40 transition-colors group">
                    {/* Key */}
                    <td className="px-5 py-3.5 font-mono text-blue-400 font-semibold whitespace-nowrap">
                      {issue.key}
                    </td>

                    {/* Summary */}
                    <td className="px-5 py-3.5 max-w-sm">
                      <div 
                        onClick={() => onOpenJiraModal(issue)}
                        className="font-medium text-white group-hover:text-blue-300 transition-colors line-clamp-1 cursor-pointer"
                      >
                        {issue.title}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {issue.description}
                      </div>
                    </td>

                    {/* Area */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-slate-300">
                        {issue.area}
                      </span>
                    </td>

                    {/* Severity */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold border ${
                        isCritical ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                        isHigh ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                        'bg-blue-500/10 text-blue-400 border-blue-500/30'
                      }`}>
                        {issue.severity.toUpperCase()}
                      </span>
                    </td>

                    {/* Status Dropdown */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <select
                        value={issue.status}
                        onChange={(e) => onUpdateIssueStatus(issue.id, e.target.value as IssueStatus)}
                        className={`text-[11px] font-mono rounded px-2 py-1 border bg-slate-900 focus:outline-none ${
                          issue.status === 'open' ? 'text-red-300 border-red-800' :
                          issue.status === 'in_review' ? 'text-amber-300 border-amber-800' :
                          issue.status === 'fixed' ? 'text-emerald-300 border-emerald-800' :
                          'text-indigo-300 border-indigo-800'
                        }`}
                      >
                        <option value="open">Open</option>
                        <option value="in_review">In Review</option>
                        <option value="fixed">Fixed</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>

                    {/* Persona */}
                    <td className="px-5 py-3.5 whitespace-nowrap font-mono text-slate-400 text-[11px]">
                      {issue.persona}
                    </td>

                    {/* Last Seen */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-400 text-[11px] font-mono">
                      {issue.lastSeen}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-2">
                        {issue.stackTrace && (
                          <button
                            onClick={() => onOpenTraceModal(issue.title, issue.actual, issue.stackTrace, issue.screenshotThumbnail)}
                            title="Inspect Stack Trace Frame"
                            className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                          >
                            <Terminal className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleQuickCopyJira(issue)}
                          title="Copy JIRA Format"
                          className="p-1 rounded text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                        >
                          {copiedKey === issue.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => onOpenJiraModal(issue)}
                          className="text-xs text-blue-400 hover:underline font-mono"
                        >
                          JIRA
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Database Sync Status Footer */}
        <div className="px-5 py-3 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center space-x-2">
            <Database className="w-3.5 h-3.5 text-slate-500" />
            <span>sqlite:///mini_qa.db | Total records: {issues.length} | Synced</span>
          </div>
          <span className="text-emerald-400 flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Live Sync Active</span>
          </span>
        </div>
      </div>
    </div>
  );
};
