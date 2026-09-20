import React, { useState } from 'react';
import { X, Layers, ExternalLink, ZoomIn } from 'lucide-react';
import { STITCH_ASSETS } from '../data/initialData';

interface DesignReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesignReferenceModal: React.FC<DesignReferenceModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<keyof typeof STITCH_ASSETS>('overviewScreen');

  if (!isOpen) return null;

  const screens: { key: keyof typeof STITCH_ASSETS; label: string; desc: string }[] = [
    {
      key: 'overviewScreen',
      label: 'Overview Dashboard',
      desc: 'Top Header stats row, 45/35/20 category breakdown, severity distributions, and execution telemetry.'
    },
    {
      key: 'functionalTestsScreen',
      label: 'Functional Tests Suite',
      desc: 'Playwright execution telemetry, single vs batch workers, step-by-step test journey, and failure traces.'
    },
    {
      key: 'issuesLogScreen',
      label: 'Issues Log & JIRA',
      desc: 'Detected issues repository, multi-tier filters, export to CSV, and interactive JIRA markdown overlay.'
    },
    {
      key: 'contentScraperScreen',
      label: 'Content Scraper Runner',
      desc: 'Headless automated audit of saucedemo.com PLP and PDP across personas with 404 & price glitch checks.'
    },
    {
      key: 'reviewPinsScreen',
      label: 'Review Pins & Bookmarklet',
      desc: 'Interactive visual bug pin drop canvas and draggable bookmarklet installation tool.'
    },
    {
      key: 'logo',
      label: 'Mini QA Brand Logo',
      desc: 'High-contrast precision engineering brand identity for the platform.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-5xl bg-[#1E293B] border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-800/90">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Stitch Artifacts
                </span>
                <span className="text-xs text-slate-400 font-mono">Project #9853789691108117821</span>
              </div>
              <h3 className="text-base font-semibold text-white mt-0.5">Original Design System & Reference Screens</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex overflow-x-auto px-6 py-2.5 bg-slate-900/60 border-b border-slate-800 space-x-2 scrollbar-none">
          {screens.map(s => (
            <button
              key={s.key}
              onClick={() => setActiveTab(s.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === s.key 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <p className="max-w-2xl">{screens.find(s => s.key === activeTab)?.desc}</p>
            <a 
              href={STITCH_ASSETS[activeTab]} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 font-mono transition-colors"
            >
              <span>Open Raw Asset</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Image Container */}
          <div className="relative rounded-lg border border-slate-800 bg-[#0A0F1D] p-3 flex items-center justify-center min-h-[380px] overflow-hidden group">
            <img 
              src={STITCH_ASSETS[activeTab]} 
              alt={screens.find(s => s.key === activeTab)?.label}
              className="max-h-[60vh] max-w-full object-contain rounded shadow-lg transition-transform duration-200"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <a 
                href={STITCH_ASSETS[activeTab]} 
                target="_blank" 
                rel="noreferrer"
                className="p-2 rounded-lg bg-black/70 hover:bg-black/90 text-white backdrop-blur border border-white/20 flex items-center space-x-1 text-xs"
              >
                <ZoomIn className="w-4 h-4" />
                <span>Zoom</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-700 bg-slate-800/60 text-xs text-slate-400">
          <span>Stitch AI Design • Hotlinked High-Resolution Google UserContent</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
