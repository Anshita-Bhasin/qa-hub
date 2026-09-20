import React from 'react';
import { X, Terminal, AlertTriangle, Image as ImageIcon, Copy, Check } from 'lucide-react';

interface TraceModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  suiteName?: string;
  stepName?: string;
  error?: string;
  codeExcerpt?: string;
  screenshotThumbnail?: string;
}

export const TraceModal: React.FC<TraceModalProps> = ({
  isOpen,
  onClose,
  title,
  suiteName = 'Checkout Step Two - Problem User Price Glitch',
  stepName = 'Step 4: Assert subtotal matches item price',
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
  screenshotThumbnail
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(`${error}\n\n${codeExcerpt}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-3xl bg-[#1E293B] border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 uppercase">
                  Playwright Trace
                </span>
                <span className="text-xs text-slate-400 font-mono">{suiteName}</span>
              </div>
              <h3 className="text-base font-medium text-white mt-0.5">{title || stepName}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm">
          {/* Error Banner */}
          <div className="p-3.5 rounded-lg bg-red-950/40 border border-red-900/60 flex items-start space-x-3">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <div className="font-semibold text-red-300 font-mono">{error}</div>
              <div className="text-red-400/80 mt-1">
                Execution halted during assertion frame on Chromium worker #2.
              </div>
            </div>
          </div>

          {/* Code Excerpt Viewport */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-mono">
              <span>Failed Execution Frame: checkout.spec.ts:42:15</span>
              <span>Worker: Chromium Headless</span>
            </div>
            <pre className="p-4 rounded-lg bg-[#0A0F1D] border border-slate-800 text-slate-200 font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre">
              {codeExcerpt}
            </pre>
          </div>

          {/* Screenshot capture */}
          {screenshotThumbnail && (
            <div>
              <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-1.5 font-mono">
                <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                <span>Playwright Failure Screenshot Artifact:</span>
              </div>
              <div className="rounded-lg overflow-hidden border border-slate-700/60 bg-black/40 p-2 flex items-center justify-center">
                <img 
                  src={screenshotThumbnail} 
                  alt="Failure screenshot"
                  className="max-h-56 object-contain rounded border border-slate-800"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700 bg-slate-800/60">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-700 text-slate-200 hover:text-white transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Trace' : 'Copy Trace'}</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
