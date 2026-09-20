import React, { useEffect, useState } from 'react';
import { ExecutionRun } from '../types';
import { getJSON } from '../utils/api';
import { TrendingUp, Sparkles, Info } from 'lucide-react';

export const TrendsScreen: React.FC = () => {
  const [history, setHistory] = useState<ExecutionRun[]>([]);

  const loadHistory = () => {
    getJSON<ExecutionRun[]>('/api/runs').then(setHistory).catch(() => {
      // Load failure leaves history empty; empty-state UI below covers this.
    });
  };

  // Read run history from the server on mount, and again whenever the tab
  // regains focus (in case a run was triggered on another tab/window).
  useEffect(() => {
    loadHistory();
    const onFocus = () => loadHistory();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const totalRuns = history.length;
  const passedRuns = history.filter(r => r.status === 'passed').length;
  const failedRuns = history.filter(r => r.status === 'failed').length;
  const warningRuns = history.filter(r => r.status === 'warning').length;
  const passRate = totalRuns > 0 ? Math.round((passedRuns / totalRuns) * 100) : 0;

  // Oldest-first for the trend strip, capped to the most recent 20 runs
  const chronological = [...history].slice(0, 20).reverse();

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] uppercase bg-slate-100 text-slate-700 border border-slate-300 font-semibold">
              Run History
            </span>
            <span className="text-xs text-slate-500">Trends Across Swarm Scans</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Trends</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Tracks each real "Run Swarm" scan you trigger, persisted on the server.
          </p>
        </div>
      </div>

      {totalRuns === 0 ? (
        /* Empty state */
        <div className="bg-white border border-slate-200 rounded-xl p-10 shadow-sm text-center space-y-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 mx-auto">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-semibold text-slate-900">No run history yet</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Trends builds up from here forward. Go to the Overview page and click{' '}
            <span className="inline-flex items-center space-x-1 text-slate-700 font-medium">
              <Sparkles className="w-3 h-3" /><span>Trigger Swarm Scan</span>
            </span>{' '}
            a few times — each run is saved on the server, and this page will chart pass rate over time.
          </p>
        </div>
      ) : (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <span className="text-xs uppercase text-slate-500 tracking-wider">Total Runs Logged</span>
              <div className="mt-2 text-3xl font-bold text-slate-900">{totalRuns}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <span className="text-xs uppercase text-slate-500 tracking-wider">Pass Rate</span>
              <div className="mt-2 text-3xl font-bold text-slate-900">{passRate}%</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <span className="text-xs uppercase text-slate-500 tracking-wider">Passed</span>
              <div className="mt-2 text-3xl font-bold text-emerald-700">{passedRuns}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <span className="text-xs uppercase text-slate-500 tracking-wider">Failed</span>
              <div className="mt-2 text-3xl font-bold text-red-700">{failedRuns}</div>
            </div>
          </div>

          {/* Run-over-run trend strip */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-900">Run-over-Run Outcome</h2>
              <span className="text-[11px] text-slate-500">Oldest → Newest (last {chronological.length})</span>
            </div>
            <div className="flex items-end space-x-1.5 h-24">
              {chronological.map((run, idx) => {
                const color =
                  run.status === 'passed' ? 'bg-emerald-500' :
                  run.status === 'failed' ? 'bg-red-400' :
                  'bg-amber-400';
                const height = run.status === 'passed' ? '100%' : run.status === 'warning' ? '65%' : '40%';
                return (
                  <div
                    key={`${run.id}-${idx}`}
                    className="flex-1 flex flex-col items-center justify-end h-full group relative"
                    title={`${run.suiteName} — ${run.status.toUpperCase()} — ${run.timestamp}`}
                  >
                    <div className={`w-full rounded-t ${color}`} style={{ height }}></div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center space-x-4 mt-3 text-[11px] text-slate-500">
              <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span><span>Passed</span></span>
              <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-red-400"></span><span>Failed</span></span>
              <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-amber-400"></span><span>Warning</span></span>
            </div>
          </div>

          {/* Run log table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5">Run</th>
                    <th className="px-5 py-3.5">Suite</th>
                    <th className="px-5 py-3.5">Persona</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Duration</th>
                    <th className="px-5 py-3.5">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {history.map((run) => (
                    <tr key={run.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 text-slate-700 font-semibold whitespace-nowrap">{run.id}</td>
                      <td className="px-5 py-3 text-slate-900 max-w-xs truncate">{run.suiteName}</td>
                      <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{run.persona}</td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          run.status === 'passed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          run.status === 'failed' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {run.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{run.duration}</td>
                      <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{run.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Scope note */}
          <div className="flex items-start space-x-2 text-[11px] text-slate-500 px-1">
            <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>
              Currently tracks Swarm Scan runs only (triggered from Overview or the sidebar). Individual
              Playwright suite runs on the Functional Tests page aren't logged here yet. History is saved
              on the server and synced across devices/tabs.
            </span>
          </div>
        </>
      )}
    </div>
  );
};
