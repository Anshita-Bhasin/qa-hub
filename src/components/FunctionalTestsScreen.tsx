import React, { useState } from 'react';
import { TestSuite, Persona } from '../types';
import { INITIAL_TEST_SUITES } from '../data/initialData';
import { 
  PlaySquare, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Terminal, 
  Layers, 
  RefreshCw,
  Cpu,
  Download,
  FileCode,
  Image as ImageIcon
} from 'lucide-react';

interface FunctionalTestsScreenProps {
  onOpenTraceModal: (title: string, error?: string, codeExcerpt?: string, screenshotThumbnail?: string) => void;
}

export const FunctionalTestsScreen: React.FC<FunctionalTestsScreenProps> = ({ onOpenTraceModal }) => {
  const [testSuites, setTestSuites] = useState<TestSuite[]>(INITIAL_TEST_SUITES);
  const [selectedBrowser, setSelectedBrowser] = useState<'chromium' | 'webkit' | 'firefox'>('chromium');
  const [userScope, setUserScope] = useState<'single' | 'batch'>('batch');
  const [isRunning, setIsRunning] = useState(false);
  const [activeSuiteIndex, setActiveSuiteIndex] = useState<number | null>(null);

  // Run tests simulation
  const handleRunTests = () => {
    setIsRunning(true);
    // Reset status to running
    setTestSuites(prev => prev.map(s => ({
      ...s,
      status: 'running',
      steps: s.steps.map(st => ({ ...st, status: 'running' }))
    })));

    // Simulate step by step completion
    setTimeout(() => {
      setTestSuites(prev => prev.map((s, idx) => {
        if (s.id === 'suite-2') {
          return {
            ...s,
            status: 'failed',
            steps: s.steps.map((st, sidx) => ({
              ...st,
              status: sidx === 3 ? 'failed' : 'passed'
            }))
          };
        }
        return {
          ...s,
          status: 'passed',
          steps: s.steps.map(st => ({ ...st, status: 'passed' }))
        };
      }));
      setIsRunning(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Top Header / Execution telemetry */}
      <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">
              E2E Test Runner
            </span>
            <span className="text-xs text-slate-400 font-mono">Playwright v1.42.1</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Functional Automation Suite
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Full checkout lifecycle, price calculations, and persona matrix validation on{' '}
            <span className="font-mono text-blue-400">saucedemo.com</span>
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRunTests}
            disabled={isRunning}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all shadow-md ${
              isRunning 
                ? 'bg-blue-600/50 text-blue-200 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/30'
            }`}
          >
            <Play className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Executing Playwright Tests...' : 'RUN Functional Tests'}</span>
          </button>
        </div>
      </div>

      {/* Configuration & Worker Telemetry Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Controls Card */}
        <div className="lg:col-span-8 bg-[#1E293B] border border-slate-700/80 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
          {/* Browser Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-slate-300">Browser:</span>
            <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-700">
              {(['chromium', 'webkit', 'firefox'] as const).map(b => (
                <button
                  key={b}
                  onClick={() => setSelectedBrowser(b)}
                  className={`px-2.5 py-1 rounded text-xs font-mono capitalize transition-colors ${
                    selectedBrowser === b ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* User Scope */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-slate-300">Scope:</span>
            <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-700">
              <button
                onClick={() => setUserScope('single')}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                  userScope === 'single' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Single User
              </button>
              <button
                onClick={() => setUserScope('batch')}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                  userScope === 'batch' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Batch (All 6 Users)
              </button>
            </div>
          </div>

          {/* Telemetry quick badges */}
          <div className="flex items-center space-x-3 text-xs font-mono text-slate-400">
            <span className="flex items-center space-x-1">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              <span>2 Workers</span>
            </span>
            <span>•</span>
            <span className="text-emerald-400">Headless Mode</span>
          </div>
        </div>

        {/* Summary Metric */}
        <div className="lg:col-span-4 bg-[#1E293B] border border-slate-700/80 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase text-slate-400 block">Suite Health</span>
            <div className="flex items-baseline space-x-2 mt-0.5">
              <span className="text-xl font-bold font-mono text-white">17 / 18</span>
              <span className="text-xs font-mono text-slate-400">Steps Passed</span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-red-500/20 text-red-300 border border-red-500/30">
            1 Failed Assertion
          </span>
        </div>
      </div>

      {/* Main Suite Breakdown */}
      <div className="space-y-4">
        {testSuites.map((suite, sIdx) => {
          const isFailed = suite.status === 'failed';
          const isPassed = suite.status === 'passed';
          const isRunningSuite = suite.status === 'running';

          return (
            <div
              key={suite.id}
              className={`bg-[#1E293B] border rounded-xl overflow-hidden shadow-sm transition-all ${
                isFailed 
                  ? 'border-red-500/60 shadow-red-950/20' 
                  : 'border-slate-700/80'
              }`}
            >
              {/* Suite Header */}
              <div className="p-4 bg-slate-800/60 border-b border-slate-700/70 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                    isFailed ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                    isPassed ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                    'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  }`}>
                    {isFailed ? <XCircle className="w-5 h-5" /> : 
                     isPassed ? <CheckCircle2 className="w-5 h-5" /> : 
                     <RefreshCw className="w-5 h-5 animate-spin" />}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-sm font-semibold text-white">{suite.name}</h2>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {suite.persona}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      {suite.steps.length} steps • duration: {(suite.totalDurationMs / 1000).toFixed(2)}s
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-1 rounded font-mono text-xs uppercase font-semibold border ${
                    isFailed ? 'bg-red-500/20 text-red-300 border-red-500/40' :
                    isPassed ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                    'bg-blue-500/20 text-blue-300 border-blue-500/40'
                  }`}>
                    {suite.status}
                  </span>
                </div>
              </div>

              {/* Step list */}
              <div className="p-4 space-y-2.5">
                {suite.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border text-xs font-mono transition-colors ${
                      step.status === 'failed'
                        ? 'bg-red-950/40 border-red-800 text-red-200'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        {step.status === 'failed' ? (
                          <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        )}
                        <span className={step.status === 'failed' ? 'font-semibold text-red-300' : 'text-slate-200'}>
                          {step.name}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">{step.durationMs}ms</span>
                    </div>

                    {/* If failed, show error excerpt and callout button */}
                    {step.status === 'failed' && (
                      <div className="mt-3 pt-3 border-t border-red-900/60 space-y-2 font-sans">
                        <div className="p-2.5 rounded bg-red-900/30 border border-red-800 text-xs font-mono text-red-300">
                          {step.error}
                        </div>

                        {step.codeExcerpt && (
                          <div className="space-y-1">
                            <span className="text-[11px] font-mono text-slate-400">Code assertion failure:</span>
                            <pre className="p-3 rounded bg-black/60 border border-slate-800 text-slate-300 font-mono text-xs overflow-x-auto whitespace-pre">
                              {step.codeExcerpt}
                            </pre>
                          </div>
                        )}

                        <div className="flex items-center space-x-2 pt-1">
                          <button
                            onClick={() => onOpenTraceModal(
                              step.name,
                              step.error,
                              step.codeExcerpt,
                              step.screenshotThumbnail
                            )}
                            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-sm transition-colors"
                          >
                            <Terminal className="w-3.5 h-3.5" />
                            <span>Inspect Trace Frame</span>
                          </button>

                          {step.screenshotThumbnail && (
                            <button
                              onClick={() => onOpenTraceModal(
                                'Failure Screenshot Capture',
                                step.error,
                                step.codeExcerpt,
                                step.screenshotThumbnail
                              )}
                              className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
                            >
                              <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                              <span>View Failure Thumbnail</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
