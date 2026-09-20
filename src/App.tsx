import React, { useState } from 'react';
import { ScreenId, DetectedIssue, ExecutionRun, IssueStatus } from './types';
import { getJSON, postJSON, patchJSON } from './utils/api';
import { Sidebar } from './components/Sidebar';
import { OverviewScreen } from './components/OverviewScreen';
import { ScraperScreen } from './components/ScraperScreen';
import { FunctionalTestsScreen } from './components/FunctionalTestsScreen';
import { IssuesScreen } from './components/IssuesScreen';
import { ReviewPinsScreen } from './components/ReviewPinsScreen';
import { TrendsScreen } from './components/TrendsScreen';
import { JiraModal } from './components/JiraModal';
import { TraceModal } from './components/TraceModal';

export function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('overview');
  const [issues, setIssues] = useState<DetectedIssue[]>([]);
  const [runs, setRuns] = useState<ExecutionRun[]>([]);

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
  const [isRunningSwarm, setIsRunningSwarm] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  React.useEffect(() => {
    getJSON<DetectedIssue[]>('/api/issues').then(setIssues).catch(err => showToast(`Failed to load issues: ${err.message}`));
    getJSON<ExecutionRun[]>('/api/runs').then(setRuns).catch(err => showToast(`Failed to load runs: ${err.message}`));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Status updates
  const handleUpdateIssueStatus = (id: string, newStatus: IssueStatus) => {
    patchJSON<DetectedIssue>(`/api/issues/${id}`, { status: newStatus, lastSeen: 'Just now' })
      .then(updated => {
        setIssues(prev => prev.map(issue => (issue.id === id ? updated : issue)));
        showToast(`Issue status updated to ${newStatus.toUpperCase()}`);
      })
      .catch(err => showToast(`Failed to update issue: ${err.message}`));
  };

  // Add newly scraped anomalies to issues list
  const handleAddScrapedIssues = (newIssues: DetectedIssue[]) => {
    postJSON<DetectedIssue[]>('/api/issues', newIssues)
      .then(created => {
        setIssues(prev => [...created, ...prev]);
        showToast(`Added ${created.length} scraped anomalies to Issues Repository!`);
      })
      .catch(err => showToast(`Failed to add issues: ${err.message}`));
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
      postJSON<ExecutionRun>('/api/runs', newRun)
        .then(created => {
          setRuns(prev => [created, ...prev.slice(0, 5)]);
          showToast('Swarm Scan Complete! 24 total issues synchronized.');
        })
        .catch(err => showToast(`Failed to record run: ${err.message}`));
    }, 2000);
  };

  const openIssuesCount = issues.filter(i => i.status === 'open').length;

  return (
    <div className="min-h-screen bg-white text-slate-900 flex font-sans selection:bg-[#FFD21E] selection:text-slate-900">
      {/* Toast notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-lg bg-slate-900 text-white font-medium text-sm shadow-lg flex items-center space-x-2 animate-in slide-in-from-bottom-5">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{notification}</span>
        </div>
      )}

      {/* Left Sidebar Navigation */}
      <Sidebar
        currentScreen={currentScreen}
        onSelectScreen={setCurrentScreen}
        openIssuesCount={openIssuesCount}
        onQuickRunAll={handleRunSwarm}
        isRunningAny={isRunningSwarm}
      />

      {/* Main Screen Content Viewport */}
      <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-10 py-8">
        <div className="max-w-6xl mx-auto">
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

          {currentScreen === 'trends' && <TrendsScreen />}
        </div>
      </main>

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
    </div>
  );
}
export default App;
