import React from 'react';
import { ScreenId } from '../types';
import { STITCH_ASSETS } from '../data/initialData';
import { 
  LayoutDashboard, 
  SearchCode, 
  PlaySquare, 
  Bug, 
  MapPin, 
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';

interface NavigationProps {
  currentScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  onOpenDesignReference: () => void;
  totalIssuesCount: number;
  openIssuesCount: number;
  onQuickRunAll: () => void;
  isRunningAny: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentScreen,
  onSelectScreen,
  onOpenDesignReference,
  totalIssuesCount,
  openIssuesCount,
  onQuickRunAll,
  isRunningAny,
}) => {
  const navItems: { id: ScreenId; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    {
      id: 'overview',
      label: 'Overview Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      id: 'scraper',
      label: 'Content Scraper',
      icon: <SearchCode className="w-4 h-4" />,
      badge: 'PLP/PDP'
    },
    {
      id: 'tests',
      label: 'Playwright Suites',
      icon: <PlaySquare className="w-4 h-4" />,
      badge: '4 Suites'
    },
    {
      id: 'issues',
      label: 'Issues & JIRA',
      icon: <Bug className="w-4 h-4" />,
      badge: openIssuesCount
    },
    {
      id: 'pins',
      label: 'Review Pins',
      icon: <MapPin className="w-4 h-4" />,
      badge: 'Live'
    }
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#0F172A]/95 backdrop-blur border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and App Title */}
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-md bg-blue-600/20 border border-blue-500/30 overflow-hidden shadow-sm">
              <img 
                src={STITCH_ASSETS.logo} 
                alt="Mini QA Logo" 
                className="w-7 h-7 object-contain"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Fallback to text icon if image fails
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="text-blue-400 font-mono font-bold text-sm select-none">QA</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-white tracking-tight text-base">Mini QA Platform</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">v2.4</span>
              </div>
              <div className="flex items-center space-x-1 text-xs text-slate-400">
                <span className="text-slate-400">Target:</span>
                <a 
                  href="https://www.saucedemo.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="font-mono text-slate-300 hover:text-blue-400 flex items-center space-x-0.5 group transition-colors"
                >
                  <span>saucedemo.com</span>
                  <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-blue-400" />
                </a>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
            {navItems.map((item) => {
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectScreen(item.id)}
                  id={`nav-tab-${item.id}`}
                  className={`relative flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono leading-tight ${
                      isActive 
                        ? 'bg-blue-700/80 text-blue-100' 
                        : 'bg-slate-800 text-slate-400 border border-slate-700/50'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right quick actions */}
          <div className="flex items-center space-x-2.5">
            {/* View Original Stitch Screens */}
            <button
              onClick={onOpenDesignReference}
              id="view-stitch-designs-btn"
              title="Inspect Stitch Design Artifacts & Original Screenshots"
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Stitch Screens</span>
            </button>

            {/* Quick Trigger Swarm */}
            <button
              onClick={onQuickRunAll}
              disabled={isRunningAny}
              id="trigger-swarm-scan-btn"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                isRunningAny
                  ? 'bg-blue-600/50 text-blue-200 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-600/30'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${isRunningAny ? 'animate-spin' : ''}`} />
              <span>{isRunningAny ? 'Running Swarm...' : 'Run Swarm'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto py-2 space-x-1 border-t border-slate-800/60 scrollbar-none">
          {navItems.map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectScreen(item.id)}
                className={`whitespace-nowrap flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-400 bg-slate-900'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
