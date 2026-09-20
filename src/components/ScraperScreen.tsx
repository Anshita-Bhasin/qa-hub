import React, { useState } from 'react';
import { Persona, ProductItem, DetectedIssue } from '../types';
import { INITIAL_PRODUCTS, PROBLEM_USER_PRODUCTS, SAUCEDEMO_IMAGES } from '../data/initialData';
import { 
  SearchCode, 
  Play, 
  CheckSquare, 
  Square, 
  AlertCircle, 
  CheckCircle, 
  Layers, 
  Database, 
  ExternalLink, 
  Sparkles,
  ArrowRight,
  Filter,
  Check
} from 'lucide-react';

interface ScraperScreenProps {
  onSendAnomaliesToIssues: (newIssues: DetectedIssue[]) => void;
}

export const ScraperScreen: React.FC<ScraperScreenProps> = ({ onSendAnomaliesToIssues }) => {
  const [selectedPersona, setSelectedPersona] = useState<Persona>('problem_user');
  const [isScraping, setIsScraping] = useState(false);
  const [progress, setProgress] = useState(100);
  const [lastScrapeInfo, setLastScrapeInfo] = useState({
    time: '4 mins ago',
    duration: '3.4s',
    anomaliesFound: 6,
    persona: 'problem_user'
  });

  // Scope toggles
  const [check404, setCheck404] = useState(true);
  const [detectZeroPrices, setDetectZeroPrices] = useState(true);
  const [missingTitleDesc, setMissingTitleDesc] = useState(true);
  const [duplicateHash, setDuplicateHash] = useState(true);
  const [deepLinkVerify, setDeepLinkVerify] = useState(true);

  const [syncedToLog, setSyncedToLog] = useState(false);

  // Products to display based on selected persona
  const displayedProducts: ProductItem[] = selectedPersona === 'problem_user'
    ? PROBLEM_USER_PRODUCTS
    : INITIAL_PRODUCTS;

  // Run simulated scraper
  const handleRunScraper = () => {
    setIsScraping(true);
    setProgress(0);
    setSyncedToLog(false);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScraping(false);
          setLastScrapeInfo({
            time: 'Just now',
            duration: '2.8s',
            anomaliesFound: selectedPersona === 'problem_user' ? 6 : 0,
            persona: selectedPersona
          });
          return 100;
        }
        return prev + 25;
      });
    }, 450);
  };

  const handleSendAnomalies = () => {
    const anomalies: DetectedIssue[] = [
      {
        id: `scraped-${Date.now()}-1`,
        key: `MQA-${Math.floor(120 + Math.random() * 50)}`,
        title: `[Scraper] 404 Asset Detected on ${selectedPersona} inventory`,
        area: 'PLP',
        severity: 'critical',
        status: 'open',
        firstSeen: 'Just now',
        lastSeen: 'Just now',
        persona: selectedPersona,
        url: 'https://www.saucedemo.com/inventory.html',
        description: `Automated Playwright scraper flagged sl-404.jpg asset collision on ${selectedPersona}. HTTP status 404.`,
        reproSteps: [
          `1. Headless crawler launched for ${selectedPersona}.`,
          '2. Product card images parsed.',
          '3. 404 HTTP response registered.'
        ],
        expected: 'Valid product asset loaded.',
        actual: 'Sloth / 404 image placeholder.',
        screenshotThumbnail: SAUCEDEMO_IMAGES.sl404
      },
      {
        id: `scraped-${Date.now()}-2`,
        key: `MQA-${Math.floor(170 + Math.random() * 50)}`,
        title: `[Scraper] Zero price anomaly ($0.00) on Sauce Labs Fleece Jacket`,
        area: 'PDP',
        severity: 'critical',
        status: 'open',
        firstSeen: 'Just now',
        lastSeen: 'Just now',
        persona: selectedPersona,
        url: 'https://www.saucedemo.com/inventory-item.html?id=5',
        description: 'Product detail page scraper detected extracted price tag reading $0.00 instead of standard catalog rate $49.99.',
        reproSteps: [
          '1. Direct link to inventory-item.html?id=5.',
          '2. Scrape .inventory_details_price.'
        ],
        expected: '$49.99',
        actual: '$0.00'
      }
    ];

    onSendAnomaliesToIssues(anomalies);
    setSyncedToLog(true);
    setTimeout(() => setSyncedToLog(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Page Header */}
      <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">
              Automated Crawler
            </span>
            <span className="text-xs text-slate-400 font-mono">Headless Playwright Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Content & Asset Scraper - saucedemo.com
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Headless automated audit of Product Listing Pages (PLP) and Product Detail Pages (PDP) across test personas.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] font-mono text-slate-400 block">SQLite Storage:</span>
            <span className="text-xs font-mono text-emerald-400 font-medium">table: scraper_runs</span>
          </div>
        </div>
      </div>

      {/* Target Configuration & Run Panel */}
      <div className="bg-[#1E293B] border border-slate-700/80 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/70">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-white">Target Configuration & Scan Scope</span>
          </div>
          <span className="text-xs font-mono text-slate-400">Target: https://www.saucedemo.com</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* Persona selector (4 cols) */}
          <div className="lg:col-span-4 space-y-1.5">
            <label className="text-xs font-medium text-slate-300 block">
              Select Test Persona:
            </label>
            <div className="relative">
              <select
                value={selectedPersona}
                onChange={(e) => setSelectedPersona(e.target.value as Persona)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="problem_user">problem_user (404 assets + zero prices)</option>
                <option value="standard_user">standard_user (clean baseline)</option>
                <option value="visual_user">visual_user (visual layout glitches)</option>
                <option value="performance_glitch_user">performance_glitch_user (network lag)</option>
                <option value="error_user">error_user (form errors)</option>
                <option value="locked_out_user">locked_out_user (access blocked)</option>
              </select>
            </div>
            <span className="text-[11px] text-slate-400 block">
              {selectedPersona === 'problem_user' 
                ? '⚠️ Injects broken images and price calculations on item #4.' 
                : '✓ Baseline reference catalog.'}
            </span>
          </div>

          {/* Scope toggles (5 cols) */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => setCheck404(!check404)}
              className="flex items-center space-x-2 text-slate-300 hover:text-white text-left"
            >
              {check404 ? <CheckSquare className="w-4 h-4 text-blue-400" /> : <Square className="w-4 h-4 text-slate-500" />}
              <span>Check 404 / Broken Images</span>
            </button>
            <button
              onClick={() => setDetectZeroPrices(!detectZeroPrices)}
              className="flex items-center space-x-2 text-slate-300 hover:text-white text-left"
            >
              {detectZeroPrices ? <CheckSquare className="w-4 h-4 text-blue-400" /> : <Square className="w-4 h-4 text-slate-500" />}
              <span>Detect Zero / NaN ($0.00)</span>
            </button>
            <button
              onClick={() => setDuplicateHash(!duplicateHash)}
              className="flex items-center space-x-2 text-slate-300 hover:text-white text-left"
            >
              {duplicateHash ? <CheckSquare className="w-4 h-4 text-blue-400" /> : <Square className="w-4 h-4 text-slate-500" />}
              <span>Duplicate Asset Hash Match</span>
            </button>
            <button
              onClick={() => setDeepLinkVerify(!deepLinkVerify)}
              className="flex items-center space-x-2 text-slate-300 hover:text-white text-left"
            >
              {deepLinkVerify ? <CheckSquare className="w-4 h-4 text-blue-400" /> : <Square className="w-4 h-4 text-slate-500" />}
              <span>Deep Link PDP Verification</span>
            </button>
          </div>

          {/* Run button (3 cols) */}
          <div className="lg:col-span-3 flex flex-col justify-center">
            <button
              onClick={handleRunScraper}
              disabled={isScraping}
              className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium text-xs transition-all shadow-md ${
                isScraping 
                  ? 'bg-blue-600/60 text-blue-200 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/30'
              }`}
            >
              <Play className={`w-4 h-4 ${isScraping ? 'animate-spin' : ''}`} />
              <span>{isScraping ? 'Running Playwright...' : 'Run Scraper (Playwright)'}</span>
            </button>
            {isScraping && (
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                <div 
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* History bar */}
        <div className="pt-3 border-t border-slate-700/60 flex flex-wrap items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center space-x-2">
            <Database className="w-3.5 h-3.5 text-slate-500" />
            <span>
              Stored in local.db → table: <strong className="text-slate-300">scraper_runs</strong> (Last run: {lastScrapeInfo.time}, duration: {lastScrapeInfo.duration})
            </span>
          </div>
          <div className="flex items-center space-x-3 mt-1 sm:mt-0">
            <span className="text-amber-400">
              {lastScrapeInfo.anomaliesFound > 0 ? `⚠️ ${lastScrapeInfo.anomaliesFound} Anomalies Detected` : '✓ All Items Clean'}
            </span>
            {lastScrapeInfo.anomaliesFound > 0 && (
              <button
                onClick={handleSendAnomalies}
                className="flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300 font-medium underline"
              >
                {syncedToLog ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Synced to Issues Log!</span>
                  </>
                ) : (
                  <>
                    <span>Send Identified Anomalies to Issues Log</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Live Audit Results Matrix (Inventory inspection for selected persona) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">
              Live Audit Results Matrix: <span className="font-mono text-blue-400">{selectedPersona}</span>
            </h2>
            <p className="text-xs text-slate-400">
              Scraped product entities with asset verification, extracted prices, and deep links
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 px-2.5 py-1 rounded bg-slate-800 border border-slate-700">
            6 Items Scraped
          </span>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedProducts.map((prod) => (
            <div
              key={prod.id}
              className={`bg-[#1E293B] border rounded-xl overflow-hidden shadow-sm transition-all flex flex-col justify-between ${
                prod.status === 'critical'
                  ? 'border-red-500/50 shadow-red-950/20'
                  : 'border-slate-700/80 hover:border-slate-600'
              }`}
            >
              <div className="p-4 space-y-3">
                {/* Image & Status Tag */}
                <div className="relative rounded-lg overflow-hidden bg-slate-900 border border-slate-800 aspect-video flex items-center justify-center p-2">
                  <img
                    src={prod.imgUrl}
                    alt={prod.name}
                    className="h-full max-w-full object-contain"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // Fallback visual
                      (e.target as HTMLElement).setAttribute('src', SAUCEDEMO_IMAGES.sl404);
                    }}
                  />

                  {/* Overlay Badges */}
                  <div className="absolute top-2 left-2 flex flex-col space-y-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold border ${
                      prod.status === 'critical'
                        ? 'bg-red-900/90 text-red-200 border-red-500'
                        : 'bg-emerald-900/90 text-emerald-200 border-emerald-500'
                    }`}>
                      {prod.statusLabel}
                    </span>
                  </div>

                  {prod.isDuplicateAsset && (
                    <div className="absolute bottom-2 left-2 right-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-black/80 text-amber-300 border border-amber-500/40 block truncate">
                        ⚠️ Reused Asset: sl-404.jpg on #{prod.id}
                      </span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-white line-clamp-1">{prod.name}</h3>
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                      prod.isPriceGlitch 
                        ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse' 
                        : 'bg-slate-800 text-emerald-400 border-slate-700'
                    }`}>
                      {prod.extractedPriceStr}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400 mt-1">
                    <span>SKU #{prod.id}</span>
                    <span>•</span>
                    <span className="text-slate-400">{prod.location}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer with Deep Link */}
              <div className="px-4 py-2.5 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Deep link verification</span>
                <a
                  href={prod.deepLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                >
                  <span>PDP Link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
