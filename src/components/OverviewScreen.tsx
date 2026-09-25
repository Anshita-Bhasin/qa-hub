import React, { useState } from 'react';
import { DetectedIssue, ExecutionRun, ScreenId, IssueStatus } from '../types';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ImageOff, 
  Activity, 
  PlaySquare, 
  ArrowRight, 
  Download, 
  Terminal,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface OverviewScreenProps {
  issues: DetectedIssue[];
  runs: ExecutionRun[];
  onNavigate: (screen: ScreenId) => void;
  onOpenTrace: (run?: ExecutionRun) => void;
  onOpenJiraModal: (issue: DetectedIssue) => void;
  onRunSwarm: () => void;
  isRunningSwarm: boolean;
}

export const OverviewScreen: React.FC<OverviewScreenProps> = ({
  issues,
  runs,
  onNavigate,
  onOpenTrace,
  onOpenJiraModal,
  onRunSwarm,
  isRunningSwarm,
}) => {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | IssueStatus>('all');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Status counts (always reflect the full set, used by the filter buttons themselves)
  const openCount = issues.filter(i => i.status === 'open').length;
  const inReviewCount = issues.filter(i => i.status === 'in_review').length;
  const fixedCount = issues.filter(i => i.status === 'fixed').length;
  const resolvedCount = issues.filter(i => i.status === 'resolved').length;

  // Issues after applying the status filter — drives the stats/chart below
  const filteredIssues = selectedStatusFilter === 'all'
    ? issues
    : issues.filter(i => i.status === selectedStatusFilter);

  const totalIssues = filteredIssues.length;
  const criticalCount = filteredIssues.filter(i => i.severity === 'critical').length;
  const highCount = filteredIssues.filter(i => i.severity === 'high').length;
  const mediumCount = filteredIssues.filter(i => i.severity === 'medium').length;
  const lowCount = filteredIssues.filter(i => i.severity === 'low').length;

  const brokenImagesCount = filteredIssues.filter(i =>
    i.title.toLowerCase().includes('image') ||
    i.description.toLowerCase().includes('image') ||
    i.title.includes('404')
  ).length;

  const passFailRate = '82.4%';

  // Donut chart segments: Scraper (45%), Functional (35%), Visual (20%)
  const categories = [
    {
      id: 'scraper',
      label: 'Content Scraper Issues',
      percentage: 45,
      color: '#64748B', // Slate
      count: 11,
      subtext: 'Broken Images, Zero Prices, Missing Descriptions, Duplicate Images'
    },
    {
      id: 'functional',
      label: 'Functional Failures',
      percentage: 35,
      color: '#DC2626', // Red
      count: 8,
      subtext: 'Cart Calculation, Checkout Step 2 block, Invalid Login'
    },
    {
      id: 'visual',
      label: 'Visual & Review Pins',
      percentage: 20,
      color: '#D97706', // Amber
      count: 5,
      subtext: 'Layout overlap, Missing alt text, Button misalignment'
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs uppercase tracking-wider text-emerald-700 font-semibold">
              Live QA Orchestration Active
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Overview Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Continuous Playwright automation telemetry & headless scraper audit for{' '}
            <span className="text-slate-700">saucedemo.com</span>
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => onNavigate('scraper')}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-700" />
            <span>Launch Scraper</span>
          </button>
          <button
            onClick={onRunSwarm}
            disabled={isRunningSwarm}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              isRunningSwarm
                ? 'bg-slate-300 text-slate-700 cursor-not-allowed'
                : 'bg-[#FFD21E] hover:bg-[#FFC107] text-slate-900 shadow-md shadow-slate-900/10'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isRunningSwarm ? 'animate-spin' : ''}`} />
            <span>{isRunningSwarm ? 'Running Swarm...' : 'Trigger Swarm Scan'}</span>
          </button>
        </div>
      </div>

      {/* Top Header stats row: 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Detected Issues */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden group hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase text-slate-500 tracking-wider">Total Detected Issues</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-slate-900">{totalIssues}</span>
            <span className="text-xs text-red-700 font-medium">+{openCount} open</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>{criticalCount} Critical • {highCount} High</span>
            <span className="text-[10px] text-slate-500">sqlite:///local.db</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-400 opacity-80"></div>
        </div>

        {/* Card 2: Pass/Fail Rate */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden group hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase text-slate-500 tracking-wider">Pass/Fail Rate</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-slate-900">{passFailRate}</span>
            <span className="text-xs text-emerald-700 font-medium">17/18 steps</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Problem User step failed</span>
            <span className="text-[10px] text-emerald-700">3 Passed</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 opacity-80"></div>
        </div>

        {/* Card 3: Broken Images Count */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden group hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase text-slate-500 tracking-wider">Broken Images Count</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <ImageOff className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-slate-900">{brokenImagesCount}</span>
            <span className="text-xs text-amber-700 font-medium">404 HTTP</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Dog/sloth asset collisions</span>
            <span className="text-[10px] text-amber-700">PLP & PDP</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500 opacity-80"></div>
        </div>

        {/* Card 4: Active Automated Runs */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden group hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase text-slate-500 tracking-wider">Active Automated Runs</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-slate-900">4</span>
            <span className="text-xs text-slate-700 font-medium">Playwright Idle</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Workers ready • 3 browsers</span>
            <span className="text-[10px] text-slate-700">60fps</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#FFD21E] opacity-80"></div>
        </div>
      </div>

      {/* Status Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white rounded-lg border border-slate-200">
        <span className="text-xs text-slate-500 px-3 uppercase">Filter by Status:</span>
        <button
          onClick={() => setSelectedStatusFilter('all')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            selectedStatusFilter === 'all'
              ? 'bg-[#FFD21E] text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
          }`}
        >
          All Issues ({issues.length})
        </button>
        <button
          onClick={() => setSelectedStatusFilter('open')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            selectedStatusFilter === 'open'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
          }`}
        >
          Open ({openCount})
        </button>
        <button
          onClick={() => setSelectedStatusFilter('in_review')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            selectedStatusFilter === 'in_review'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
          }`}
        >
          In Review ({inReviewCount})
        </button>
        <button
          onClick={() => setSelectedStatusFilter('fixed')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            selectedStatusFilter === 'fixed'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
          }`}
        >
          Fixed ({fixedCount})
        </button>
        <button
          onClick={() => setSelectedStatusFilter('resolved')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            selectedStatusFilter === 'resolved'
              ? 'bg-slate-700 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
          }`}
        >
          Resolved ({resolvedCount})
        </button>
      </div>

      {/* Central Visual Telemetry Section: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Visual Category Breakdown Chart & Legend */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Issue Category Breakdown</h2>
                <p className="text-xs text-slate-500">Distribution across scraper, functional tests, and visual pins</p>
              </div>
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                100% Normalized
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              {/* Donut Chart SVG */}
              <div className="sm:col-span-5 flex justify-center py-2 relative">
                <svg viewBox="0 0 160 160" className="w-40 h-40 transform -rotate-90 drop-shadow-md">
                  {/* SVG Circles with stroke-dasharray */}
                  {/* Total circumference for r=60 is 2 * PI * 60 = 376.99 */}
                  {/* 1. Scraper 45% -> 376.99 * 0.45 = 169.65 */}
                  <circle
                    cx="80"
                    cy="80"
                    r="60"
                    fill="transparent"
                    stroke="#64748B"
                    strokeWidth="22"
                    strokeDasharray="169.65 376.99"
                    strokeDashoffset="0"
                    className="transition-all duration-300 hover:opacity-85 cursor-pointer"
                    onMouseEnter={() => setHoveredCategory('scraper')}
                    onMouseLeave={() => setHoveredCategory(null)}
                  />
                  {/* 2. Functional 35% -> 376.99 * 0.35 = 131.95 */}
                  <circle
                    cx="80"
                    cy="80"
                    r="60"
                    fill="transparent"
                    stroke="#DC2626"
                    strokeWidth="22"
                    strokeDasharray="131.95 376.99"
                    strokeDashoffset="-169.65"
                    className="transition-all duration-300 hover:opacity-85 cursor-pointer"
                    onMouseEnter={() => setHoveredCategory('functional')}
                    onMouseLeave={() => setHoveredCategory(null)}
                  />
                  {/* 3. Visual 20% -> 376.99 * 0.20 = 75.4 */}
                  <circle
                    cx="80"
                    cy="80"
                    r="60"
                    fill="transparent"
                    stroke="#D97706"
                    strokeWidth="22"
                    strokeDasharray="75.4 376.99"
                    strokeDashoffset="-301.6"
                    className="transition-all duration-300 hover:opacity-85 cursor-pointer"
                    onMouseEnter={() => setHoveredCategory('visual')}
                    onMouseLeave={() => setHoveredCategory(null)}
                  />
                </svg>

                {/* Center text inside donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-bold text-slate-900">{totalIssues}</span>
                  <span className="text-[10px] uppercase text-slate-500">Total Bugs</span>
                </div>
              </div>

              {/* Interactive Legend and Data Cards */}
              <div className="sm:col-span-7 space-y-3">
                {categories.map((cat) => {
                  const isHovered = hoveredCategory === cat.id;
                  return (
                    <div
                      key={cat.id}
                      onMouseEnter={() => setHoveredCategory(cat.id)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      className={`p-3 rounded-lg border transition-all ${
                        isHovered
                          ? 'bg-slate-100 border-slate-300 shadow-sm'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span
                            className="w-3 h-3 rounded-sm flex-shrink-0"
                            style={{ backgroundColor: cat.color }}
                          ></span>
                          <span className="text-xs font-semibold text-slate-900">{cat.label}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-900">{cat.percentage}%</span>
                          <span className="text-[10px] text-slate-500">({cat.count} bugs)</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 pl-5 line-clamp-1">
                        {cat.subtext}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Severity Distribution Bar */}
          <div className="mt-5 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-700 font-medium">Severity Distribution Matrix</span>
              <span className="text-slate-500 text-[11px]">{totalIssues} Items Classified</span>
            </div>
            {/* Multi-segmented bar */}
            <div className="h-3 rounded-md bg-slate-100 overflow-hidden flex shadow-inner">
              {totalIssues > 0 && (
                <>
                  <div style={{ width: `${(criticalCount/totalIssues)*100}%` }} className="bg-red-400 h-full" title={`Critical: ${criticalCount}`} />
                  <div style={{ width: `${(highCount/totalIssues)*100}%` }} className="bg-amber-400 h-full" title={`High: ${highCount}`} />
                  <div style={{ width: `${(mediumCount/totalIssues)*100}%` }} className="bg-slate-400 h-full" title={`Medium: ${mediumCount}`} />
                  <div style={{ width: `${(lowCount/totalIssues)*100}%` }} className="bg-slate-300 h-full" title={`Low: ${lowCount}`} />
                </>
              )}
            </div>
            {/* Legend tags */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-red-400"></span>
                <span>Critical: {criticalCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>High: {highCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                <span>Medium: {mediumCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                <span>Low: {lowCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Quick Actions Card & Active Test Status */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          {/* Quick Actions Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900 mb-1">Quick Actions</h2>
            <p className="text-xs text-slate-500 mb-4">Trigger automated runs or export bug records directly to JIRA</p>

            <div className="space-y-2.5">
              <button
                onClick={onRunSwarm}
                disabled={isRunningSwarm}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-[#FFD21E] hover:bg-[#FFC107] text-slate-900 text-xs font-medium transition-all shadow-sm group"
              >
                <div className="flex items-center space-x-2.5">
                  <PlaySquare className="w-4 h-4 text-slate-700 group-hover:scale-110 transition-transform" />
                  <span>Trigger Full Swarm Scan</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-700" />
              </button>

              <button
                onClick={() => onNavigate('issues')}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition-colors group"
              >
                <div className="flex items-center space-x-2.5">
                  <Download className="w-4 h-4 text-slate-500 group-hover:text-slate-900 transition-colors" />
                  <span>Export JIRA Batch / CSV</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <button
                onClick={() => onOpenTrace()}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition-colors group"
              >
                <div className="flex items-center space-x-2.5">
                  <Terminal className="w-4 h-4 text-red-700 group-hover:scale-110 transition-transform" />
                  <span>View Playwright Failure Trace</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                  Line 42 Callout
                </span>
              </button>
            </div>
          </div>

          {/* Test Persona Matrix Widget */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs uppercase text-slate-500 tracking-wider">Active Test Personas</h3>
              <span className="text-[10px] text-slate-700">saucedemo.com</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-slate-100 border border-slate-200 flex items-center justify-between">
                <span className="text-slate-700">standard_user</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" title="Passing"></span>
              </div>
              <div className="p-2 rounded bg-slate-100 border border-slate-200 flex items-center justify-between">
                <span className="text-slate-700">problem_user</span>
                <span className="w-2 h-2 rounded-full bg-red-400" title="Failing: 404s + $0"></span>
              </div>
              <div className="p-2 rounded bg-slate-100 border border-slate-200 flex items-center justify-between">
                <span className="text-slate-700">perf_glitch</span>
                <span className="w-2 h-2 rounded-full bg-amber-400" title="Latency 5.2s"></span>
              </div>
              <div className="p-2 rounded bg-slate-100 border border-slate-200 flex items-center justify-between">
                <span className="text-slate-700">locked_out</span>
                <span className="w-2 h-2 rounded-full bg-slate-400" title="Auth verified"></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Test & Scrape Executions Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Recent Test & Scrape Executions</h2>
            <p className="text-xs text-slate-500">Live telemetry from Playwright runner & headless scraper agent</p>
          </div>
          <button
            onClick={() => onNavigate('tests')}
            className="text-xs text-slate-700 hover:text-slate-900 font-medium flex items-center space-x-1"
          >
            <span>View Full Suite</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white text-slate-500 uppercase text-[11px] border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Run ID</th>
                <th className="px-5 py-3">User Profile</th>
                <th className="px-5 py-3">Target Route</th>
                <th className="px-5 py-3">Findings Summary</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Duration</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {runs.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-5 py-3.5 text-slate-700 font-semibold">{r.id}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                      {r.persona}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-700">{r.targetRoute}</td>
                  <td className="px-5 py-3.5 text-slate-700 max-w-xs truncate">{r.findings}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      r.status === 'passed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      r.status === 'failed' ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {r.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">{r.duration}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => onOpenTrace(r)}
                      className="text-xs text-slate-500 hover:text-slate-900 underline"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
