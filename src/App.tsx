import React, { useState } from 'react';
import { ScreenId, DetectedIssue, ExecutionRun, IssueStatus } from './types';
import { INITIAL_ISSUES, INITIAL_RUNS, STITCH_ASSETS } from './data/initialData';
import { Navigation } from './components/Navigation';
import { OverviewScreen } from './components/OverviewScreen';
import { ScraperScreen } from './components/ScraperScreen';
import { FunctionalTestsScreen } from './components/FunctionalTestsScreen';
import { IssuesScreen } from './components/IssuesScreen';
import { ReviewPinsScreen } from './components/ReviewPinsScreen';
import { JiraModal } from './components/JiraModal';
import { TraceModal } from './components/TraceModal';
import { DesignReferenceModal } from './components/DesignReferenceModal';

export function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('overview');
  const [issues, setIssues] = useState<DetectedIssue[]>(INITIAL_ISSUES);
  const [runs, setRuns] = useState<ExecutionRun[]>(INITIAL_RUNS);

  // Modals state
  const [selectedJiraIssue, setSelectedJiraIssue] = useState<DetectedIssue | null>(null);
  const [isTraceModalOpen, setIsTraceModalOpen] = useState(false);
  const [traceModalData, setTraceModalData] = useState<{
    title: string;
    suiteName?: string;
    stepName?: string;
    error?: string;
    codeExcerpt?: string;
    screenshotThumbnail?: string;
  }>({
    title: 'Playwright Assertion Failure',
    suiteName: 'Checkout Step Two - Problem User Price Glitch',
    stepName: 'Step 4: Assert subtotal matches item price'
  });
  const [isDesignRefOpen, setIsDesignRefOpen] = useState(false);
  const [isRunningSwarm, setIsRunningSwarm] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  // Status updates
  const handleUpdateIssueStatus = (id: string, newStatus: IssueStatus) => {
    setIssues(prev => prev.map(issue => 
      issue.id === id ? { ...issue, status: newStatus, lastSeen: 'Just now' } : issue
    ));
    showToast(`Issue status updated to ${newStatus.toUpperCase()}`);
  };

  // Add newly scraped anomalies to issues list
  const handleAddScrapedIssues = (newIssues: DetectedIssue[]) => {
    setIssues(prev => [...newIssues, ...prev]);
    showToast(`Added ${newIssues.length} scraped anomalies to Issues Repository!`);
  };

  // Open Trace Modal with custom parameters
  const handleOpenTrace = (
    title = 'Playwright Assertion Failure',
    error = 'AssertionError: expected subtotal "$49.99" but received "$0.00"',
    codeExcerpt = `39:  await page.waitForSelector('.summary_subtotal_label');
40:  const subtotal = await page.locator('.summary_subtotal_label').innerText();
41:  console.log('Telemetry capture subtotal: ' + subtotal);
42:> expect(subtotal).toContain('$49.99'); 
     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
     Error: Value mismatch.
     - Expected: "$49.99"
     + Received: "Item total: $0.00"
43:  await page.click('[data-test="finish"]');`,
    screenshotThumbnail?: string
  ) => {
    setTraceModalData({
      title,
      error,
      codeExcerpt,
      screenshotThumbnail: screenshotThumbnail || 'https://www.saucedemo.com/assets/sl-404-Cq1a9k9X.jpg'
    });
    setIsTraceModalOpen(true);
  };

  // Swarm Scan simulation
  const handleRunSwarm = () => {
    setIsRunningSwarm(true);
    showToast('Triggered full Playwright Swarm & Scraper Scan on saucedemo.com...');

    setTimeout(() => {
      setIsRunningSwarm(false);
      const newRun: ExecutionRun = {
        id: `run-${Math.floor(900 + Math.random() * 90)}`,
        timestamp: 'Just now',
        persona: 'problem_user',
        targetRoute: '/checkout-step-two.html',
        findings: 'Automated Swarm identified 404 image collisions & $0.00 price anomalies',
        status: 'failed',
        duration: '1.42s',
        suiteName: 'Full Swarm Verification'
      };
      setRuns(prev => [newRun, ...prev.slice(0, 5)]);
      showToast('Swarm Scan Complete! 24 total issues synchronized.');
    }, 2000);
  };

  const openIssuesCount = issues.filter(i => i.status === 'open').length;

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Toast notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium text-xs shadow-2xl border border-blue-400/40 flex items-center space-x-2 animate-in slide-in-from-bottom-5">
          <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
          <span>{notification}</span>
        </div>
      )}

      {/* Main Top Navigation Header */}
      <Navigation
        currentScreen={currentScreen}
        onSelectScreen={setCurrentScreen}
        onOpenDesignReference={() => setIsDesignRefOpen(true)}
        totalIssuesCount={issues.length}
        openIssuesCount={openIssuesCount}
        onQuickRunAll={handleRunSwarm}
        isRunningAny={isRunningSwarm}
      />

      {/* Main Screen Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentScreen === 'overview' && (
          <OverviewScreen
            issues={issues}
            runs={runs}
            onNavigate={setCurrentScreen}
            onOpenTrace={(run) => handleOpenTrace(
              run ? `Trace: ${run.suiteName}` : 'Playwright Failure Trace',
              run?.findings
            )}
            onOpenJiraModal={(issue) => setSelectedJiraIssue(issue)}
            onRunSwarm={handleRunSwarm}
            isRunningSwarm={isRunningSwarm}
          />
        )}

        {currentScreen === 'scraper' && (
          <ScraperScreen
            onSendAnomaliesToIssues={handleAddScrapedIssues}
          />
        )}

        {currentScreen === 'tests' && (
          <FunctionalTestsScreen
            onOpenTraceModal={(title, error, codeExcerpt, screenshotThumbnail) => 
              handleOpenTrace(title, error, codeExcerpt, screenshotThumbnail)
            }
          />
        )}

        {currentScreen === 'issues' && (
          <IssuesScreen
            issues={issues}
            onUpdateIssueStatus={handleUpdateIssueStatus}
            onOpenJiraModal={(issue) => setSelectedJiraIssue(issue)}
            onOpenTraceModal={(title, error, codeExcerpt, screenshotThumbnail) =>
              handleOpenTrace(title, error, codeExcerpt, screenshotThumbnail)
            }
          />
        )}

        {currentScreen === 'pins' && (
          <ReviewPinsScreen
            onSyncPinsToIssues={handleAddScrapedIssues}
          />
        )}
      </main>

      {/* Footer bar */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-900/40 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center space-x-2 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Mini QA Platform • Precision Engineering Interface</span>
          </div>
          <div className="flex items-center space-x-4 font-mono text-[11px]">
            <span>Target: saucedemo.com</span>
            <span>Playwright 1.42</span>
            <span>SQLite Local DB</span>
          </div>
        </div>
      </footer>

      {/* JIRA Export / Markdown Modal */}
      <JiraModal
        issue={selectedJiraIssue}
        onClose={() => setSelectedJiraIssue(null)}
      />

      {/* Playwright Failure Trace / Code Excerpt Modal */}
      <TraceModal
        isOpen={isTraceModalOpen}
        onClose={() => setIsTraceModalOpen(false)}
        title={traceModalData.title}
        suiteName={traceModalData.suiteName}
        stepName={traceModalData.stepName}
        error={traceModalData.error}
        codeExcerpt={traceModalData.codeExcerpt}
        screenshotThumbnail={traceModalData.screenshotThumbnail}
      />

      {/* Original Stitch Design Reference Modal (Hotlinked Google UserContent) */}
      <DesignReferenceModal
        isOpen={isDesignRefOpen}
        onClose={() => setIsDesignRefOpen(false)}
      />
    </div>
  );
}
export default App;
