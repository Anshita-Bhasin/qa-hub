import React from 'react';
import { ScreenId } from '../types';
import {
  LayoutDashboard,
  SearchCode,
  PlaySquare,
  Bug,
  MapPin,
  Sparkles,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

interface SidebarProps {
  currentScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  openIssuesCount: number;
  onQuickRunAll: () => void;
  isRunningAny: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  onSelectScreen,
  openIssuesCount,
  onQuickRunAll,
  isRunningAny,
}) => {
  const navItems: { id: ScreenId; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      id: 'scraper',
      label: 'Content Scraper',
      icon: <SearchCode className="w-4 h-4" />
    },
    {
      id: 'tests',
      label: 'Playwright Suites',
      icon: <PlaySquare className="w-4 h-4" />
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
      icon: <MapPin className="w-4 h-4" />
    },
    {
      id: 'trends',
      label: 'Trends',
      icon: <TrendingUp className="w-4 h-4" />
    }
  ];

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 h-screen sticky top-0 bg-[#F7F7F7] border-r border-slate-200">
      {/* Logo and App Title */}
      <div className="flex items-center space-x-2.5 px-5 py-5">
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-[#FFD21E]">
          <ShieldCheck className="w-4.5 h-4.5 text-slate-900" strokeWidth={2.25} />
        </div>
        <span className="font-semibold text-slate-900 tracking-tight text-sm">QA Agent</span>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectScreen(item.id)}
              id={`nav-tab-${item.id}`}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 border-l-2 ${
                isActive
                  ? 'bg-[#FFD21E]/15 border-[#FFD21E] text-slate-900'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {item.icon}
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] leading-tight font-semibold ${
                  isActive
                    ? 'bg-[#FFD21E] text-slate-900'
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Target info + quick action */}
      <div className="px-4 py-4 border-t border-slate-200 space-y-3">
        <div className="text-xs text-slate-500">
          <span className="block text-slate-400 mb-0.5">Target</span>
          <a
            href="https://www.saucedemo.com"
            target="_blank"
            rel="noreferrer"
            className="text-slate-700 hover:text-slate-900 transition-colors"
          >
            saucedemo.com
          </a>
        </div>
        <button
          onClick={onQuickRunAll}
          disabled={isRunningAny}
          id="trigger-swarm-scan-btn"
          className={`w-full flex items-center justify-center space-x-1.5 px-3 py-2 rounded-md text-xs font-semibold transition-all ${
            isRunningAny
              ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
              : 'bg-[#FFD21E] hover:bg-[#FFC107] text-slate-900 shadow-sm'
          }`}
        >
          <Sparkles className={`w-3.5 h-3.5 ${isRunningAny ? 'animate-spin' : ''}`} />
          <span>{isRunningAny ? 'Running Swarm...' : 'Run Swarm'}</span>
        </button>
      </div>
    </aside>
  );
};
