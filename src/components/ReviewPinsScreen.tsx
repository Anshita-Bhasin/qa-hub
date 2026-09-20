import React, { useState } from 'react';
import { ReviewPin, IssueSeverity, DetectedIssue } from '../types';
import { SAUCEDEMO_IMAGES } from '../data/initialData';
import { getJSON, postJSON, patchJSON } from '../utils/api';
import { 
  MapPin, 
  Bookmark, 
  Copy, 
  Check, 
  Plus, 
  ExternalLink, 
  Sparkles, 
  CheckCircle, 
  Trash2, 
  MousePointer,
  Layers,
  AlertCircle
} from 'lucide-react';

interface ReviewPinsScreenProps {
  onSyncPinsToIssues: (newIssues: DetectedIssue[]) => void;
}

export const ReviewPinsScreen: React.FC<ReviewPinsScreenProps> = ({ onSyncPinsToIssues }) => {
  const [pins, setPins] = useState<ReviewPin[]>([]);

  React.useEffect(() => {
    getJSON<ReviewPin[]>('/api/pins').then(setPins).catch(() => {
      // Load failure leaves pins empty; existing empty-state UI (if any) covers this.
    });
  }, []);
  const [selectedPinId, setSelectedPinId] = useState<string | null>('pin-1');
  const [copiedBookmarklet, setCopiedBookmarklet] = useState(false);
  const [isAddingPin, setIsAddingPin] = useState(false);
  const [newPinCoords, setNewPinCoords] = useState<{ x: number; y: number } | null>(null);
  const [newPinTitle, setNewPinTitle] = useState('');
  const [newPinDesc, setNewPinDesc] = useState('');
  const [newPinSeverity, setNewPinSeverity] = useState<IssueSeverity>('high');
  const [syncedMessage, setSyncedMessage] = useState<string | null>(null);

  const bookmarkletCode = `javascript:(function(){if(window.__QA_AGENT_LOADED)return;window.__QA_AGENT_LOADED=true;const bar=document.createElement('div');bar.innerHTML='<div style="position:fixed;top:12px;right:12px;z-index:999999;background:#0F172A;color:#fff;border:1px solid #3B82F6;border-radius:8px;padding:10px 14px;font-family:sans-serif;font-size:12px;box-shadow:0 10px 25px rgba(0,0,0,0.5);display:flex;align-items:center;gap:8px">📍 <strong>QA Agent Pin Tool Active</strong>: Click any element to annotate</div>';document.body.appendChild(bar);})();`;

  const handleCopyBookmarklet = () => {
    navigator.clipboard.writeText(bookmarkletCode);
    setCopiedBookmarklet(true);
    setTimeout(() => setCopiedBookmarklet(false), 2000);
  };

  const handleViewportClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPercent = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const yPercent = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    setNewPinCoords({ x: xPercent, y: yPercent });
    setIsAddingPin(true);
  };

  const handleCreatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPinCoords || !newPinTitle.trim()) return;

    const newPin: ReviewPin = {
      id: `pin-${Date.now()}`,
      xPercent: newPinCoords.x,
      yPercent: newPinCoords.y,
      title: newPinTitle,
      description: newPinDesc || 'Visual inspection note',
      severity: newPinSeverity,
      pageUrl: 'https://www.saucedemo.com/inventory.html',
      elementSelector: `div.inventory_container (x: ${newPinCoords.x}%, y: ${newPinCoords.y}%)`,
      timestamp: 'Just now',
      author: 'You (Reviewer)',
      status: 'open'
    };

    postJSON<ReviewPin>('/api/pins', newPin)
      .then(created => setPins(prev => [created, ...prev]))
      .catch(() => {
        // Keep existing form-reset behavior even if the request fails silently for v1;
        // errors surface via the shared toast pattern in later screens if added.
      });
    setSelectedPinId(newPin.id);
    setIsAddingPin(false);
    setNewPinCoords(null);
    setNewPinTitle('');
    setNewPinDesc('');
  };

  const handleSyncToIssues = () => {
    const newIssues: DetectedIssue[] = pins.map(p => ({
      id: `pin-iss-${p.id}`,
      key: `PIN-${Math.floor(100 + Math.random() * 899)}`,
      title: `[Review Pin] ${p.title}`,
      area: 'Review Pin',
      severity: p.severity,
      status: p.status,
      firstSeen: p.timestamp,
      lastSeen: 'Just now',
      persona: 'visual_user',
      url: p.pageUrl,
      description: p.description,
      reproSteps: [
        '1. Navigate to target URL.',
        `2. Element at selector: ${p.elementSelector}.`,
        '3. Verify visual alignment / asset presentation.'
      ],
      expected: 'Flawless visual layout adhering to design specifications.',
      actual: p.description,
      screenshotThumbnail: SAUCEDEMO_IMAGES.sl404
    }));

    onSyncPinsToIssues(newIssues);
    setSyncedMessage('Synced pins to Issues Repository!');
    setTimeout(() => setSyncedMessage(null), 3000);
  };

  const selectedPin = pins.find(p => p.id === selectedPinId) || pins[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] uppercase bg-slate-100 text-slate-700 border border-slate-300 font-semibold">
              Visual QA
            </span>
            <span className="text-xs text-slate-500">DOM Pin Annotator</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Visual Review Pins & Live Inspection Bookmarklet
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Drop visual feedback pins directly on target web pages (saucedemo.com) and synchronize with QA issues database.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleSyncToIssues}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#FFD21E] hover:bg-[#FFC107] text-slate-900 shadow-md shadow-slate-900/20 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Sync All Pins to Issues</span>
          </button>
        </div>
      </div>

      {syncedMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-medium text-emerald-700 flex items-center space-x-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-700" />
          <span>{syncedMessage}</span>
        </div>
      )}

      {/* Bookmarklet Installation Panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bookmark className="w-4 h-4 text-amber-700" />
            <h2 className="text-sm font-semibold text-slate-900">Interactive Bookmarklet Installer</h2>
          </div>
          <span className="text-xs text-slate-500">Zero Extension Required</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          <div className="lg:col-span-8 text-xs text-slate-700 space-y-2">
            <p>
              Drag this draggable bookmarklet directly to your browser's Bookmarks bar, or copy the code:
            </p>
            <div className="flex flex-wrap items-center gap-3">
              {/* Draggable Anchor */}
              <a
                href={bookmarkletCode}
                onClick={(e) => e.preventDefault()}
                title="Drag me to your Bookmarks bar!"
                className="cursor-grab active:cursor-grabbing px-3.5 py-2 rounded-lg bg-[#FFD21E] hover:bg-[#FFC107] text-slate-900 text-xs font-semibold shadow-sm border border-slate-300 flex items-center space-x-2 select-none"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>📍 QA Agent Pin Tool</span>
              </a>

              <button
                onClick={handleCopyBookmarklet}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-medium transition-colors"
              >
                {copiedBookmarklet ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedBookmarklet ? 'Copied Code!' : 'Copy Bookmarklet Code'}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 p-3 bg-slate-100 rounded-lg border border-slate-200 text-[11px] text-slate-500 space-y-1">
            <div className="font-semibold text-slate-700">How to use on saucedemo.com:</div>
            <div>1. Navigate to saucedemo.com in a new tab.</div>
            <div>2. Click <strong>QA Agent Pin Tool</strong> in bookmarks.</div>
            <div>3. Click any broken image or misaligned button to drop pins!</div>
          </div>
        </div>
      </div>

      {/* Main Interactive Canvas Section: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Simulated saucedemo.com Viewport with Pin Drops */}
        <div className="lg:col-span-8 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center space-x-2">
              <MousePointer className="w-3.5 h-3.5 text-slate-500" />
              <span>Simulated Target Viewport: click anywhere on page to drop a pin</span>
            </div>
            <span>https://www.saucedemo.com/inventory.html</span>
          </div>

          {/* Simulated Browser Window Frame */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl">
            {/* Browser top chrome */}
            <div className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b border-slate-700">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              </div>
              <div className="px-3 py-1 bg-slate-900 rounded-md text-[11px] font-mono text-slate-300 border border-slate-700/60 max-w-sm w-full text-center truncate">
                https://www.saucedemo.com/inventory.html
              </div>
              <span className="text-[10px] font-mono text-blue-400">Viewport: 1280x800</span>
            </div>

            {/* Clickable Viewport Canvas */}
            <div
              onClick={handleViewportClick}
              className="relative bg-[#0F172A] p-5 min-h-[460px] cursor-crosshair select-none overflow-hidden"
            >
              {/* Simulated saucedemo PLP content */}
              <div className="space-y-5 opacity-90 pointer-events-none">
                {/* Saucedemo Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-white tracking-widest text-sm uppercase">Swag Labs</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
                    <span>Cart (1)</span>
                    <span>Menu ☰</span>
                  </div>
                </div>

                {/* Subtitle bar */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">Products</span>
                  <span className="text-[10px] font-mono text-slate-400">Sort: Name (A to Z)</span>
                </div>

                {/* Simulated product cards */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Card 1 */}
                  <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700 space-y-2">
                    <div className="h-24 bg-slate-900 rounded flex items-center justify-center">
                      <img 
                        src={SAUCEDEMO_IMAGES.backpack} 
                        alt="Backpack" 
                        className="h-20 object-contain"
                        referrerPolicy="no-referrer" 
                      />
                    </div>
                    <div className="text-xs font-semibold text-white">Sauce Labs Backpack</div>
                    <div className="text-[10px] text-slate-400">$29.99</div>
                  </div>

                  {/* Card 2 - Flawed card */}
                  <div className="p-3 rounded-lg bg-slate-800/60 border border-red-500/50 space-y-2 relative">
                    <div className="h-24 bg-slate-900 rounded flex items-center justify-center overflow-hidden">
                      <img 
                        src={SAUCEDEMO_IMAGES.sl404} 
                        alt="Sloth 404" 
                        className="h-20 object-contain" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="text-xs font-semibold text-white">Sauce Labs Fleece Jacket</div>
                    <div className="text-[10px] text-red-400 font-mono">$0.00 (Glitch)</div>
                  </div>
                </div>
              </div>

              {/* Render Dropped Visual Pins on Viewport */}
              {pins.map((pin, idx) => {
                const isSelected = selectedPinId === pin.id;
                return (
                  <div
                    key={pin.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPinId(pin.id);
                    }}
                    style={{ left: `${pin.xPercent}%`, top: `${pin.yPercent}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                  >
                    <div className={`relative flex items-center justify-center transition-transform duration-150 ${
                      isSelected ? 'scale-125' : 'hover:scale-110'
                    }`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-xs shadow-lg border-2 ${
                        pin.severity === 'critical' ? 'bg-red-600 text-white border-red-300 ring-2 ring-red-400' :
                        pin.severity === 'high' ? 'bg-amber-500 text-black border-amber-200' :
                        'bg-blue-600 text-white border-blue-200'
                      }`}>
                        #{idx + 1}
                      </div>
                      {/* Pulse animation ring */}
                      <span className={`absolute w-full h-full rounded-full animate-ping opacity-30 ${
                        pin.severity === 'critical' ? 'bg-red-400' : 'bg-blue-400'
                      }`}></span>
                    </div>

                    {/* Tooltip on hover */}
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:block whitespace-nowrap px-2 py-1 rounded bg-black/90 text-[10px] text-white font-mono border border-slate-700 shadow-xl pointer-events-none z-30">
                      {pin.title}
                    </div>
                  </div>
                );
              })}

              {/* Add Pin Popover dialog when user clicks canvas */}
              {isAddingPin && newPinCoords && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{ left: `${Math.min(newPinCoords.x, 70)}%`, top: `${Math.min(newPinCoords.y, 65)}%` }}
                  className="absolute z-30 w-72 bg-white border border-slate-300 rounded-xl p-4 shadow-2xl text-xs space-y-3 animate-in zoom-in-95 duration-150"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="font-semibold text-slate-900 flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-700" />
                      <span>Drop Review Pin</span>
                    </span>
                    <button
                      onClick={() => setIsAddingPin(false)}
                      className="text-slate-500 hover:text-slate-900"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleCreatePin} className="space-y-2.5">
                    <div>
                      <label className="text-[11px] text-slate-700 block mb-1">Issue Title:</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Sloth image replacement"
                        value={newPinTitle}
                        onChange={(e) => setNewPinTitle(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-700 block mb-1">Notes / Description:</label>
                      <textarea
                        rows={2}
                        placeholder="Expected jacket, found 404 placeholder..."
                        value={newPinDesc}
                        onChange={(e) => setNewPinDesc(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-700 block mb-1">Severity:</label>
                      <select
                        value={newPinSeverity}
                        onChange={(e) => setNewPinSeverity(e.target.value as IssueSeverity)}
                        className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs text-slate-900 focus:outline-none"
                      >
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>

                    <div className="flex justify-end space-x-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsAddingPin(false)}
                        className="px-2.5 py-1 rounded text-slate-500 hover:text-slate-900"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 rounded bg-[#FFD21E] hover:bg-[#FFC107] text-slate-900 font-medium shadow-sm"
                      >
                        Save Pin
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Selected Pin Inspector & Active Pins List */}
        <div className="lg:col-span-4 space-y-4">
          {/* Selected Pin Inspector */}
          {selectedPin ? (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                    selectedPin.severity === 'critical' ? 'bg-red-50 text-red-700 border-red-200' :
                    selectedPin.severity === 'high' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-slate-100 text-slate-700 border-slate-300'
                  }`}>
                    {selectedPin.severity}
                  </span>
                  <span className="text-xs text-slate-500">{selectedPin.timestamp}</span>
                </div>
                <span className="text-xs text-slate-500">By: {selectedPin.author}</span>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900">{selectedPin.title}</h3>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed">{selectedPin.description}</p>
              </div>

              <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-[11px] font-mono space-y-1">
                <div className="text-slate-500">Selector:</div>
                <div className="text-slate-700 break-all">{selectedPin.elementSelector}</div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500">Status: {selectedPin.status.toUpperCase()}</span>
                <button
                  onClick={() => {
                    patchJSON<ReviewPin>(`/api/pins/${selectedPin.id}`, { status: 'resolved' })
                      .then(updated => setPins(prev => prev.map(p => p.id === updated.id ? updated : p)))
                      .catch(() => {
                        // Silent failure for v1; status remains unchanged in the UI.
                      });
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-emerald-700 border border-slate-200 transition-colors"
                >
                  Mark Resolved
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-center text-xs text-slate-500">
              Click a pin on the viewport to inspect details
            </div>
          )}

          {/* Active Review Pins List */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-semibold text-slate-900">Active Visual Pins ({pins.length})</span>
              <span className="text-[11px] text-slate-500">Click to focus</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {pins.map((p, idx) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPinId(p.id)}
                  className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                    selectedPinId === p.id
                      ? 'bg-slate-100 border-slate-300 text-slate-900'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium line-clamp-1">#{idx + 1} {p.title}</span>
                    <span className={`text-[10px] uppercase px-1.5 py-0.2 rounded border ${
                      p.severity === 'critical' ? 'text-red-700 border-red-200' : 'text-amber-700 border-amber-200'
                    }`}>
                      {p.severity}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                    <span>{p.timestamp}</span>
                    <span>{p.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
