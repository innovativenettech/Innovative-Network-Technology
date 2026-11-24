import React from 'react';
import { ShieldAlert, Dna, Search, History, HelpCircle, Sparkles, RefreshCw } from 'lucide-react';

interface NavbarProps {
  currentTab: 'scan' | 'lookup' | 'history';
  setCurrentTab: (tab: 'scan' | 'lookup' | 'history') => void;
  historyCount: number;
  onOpenEducational: () => void;
  onResetScan?: () => void;
  isScanning: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  historyCount,
  onOpenEducational,
  onResetScan,
  isScanning,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => {
            setCurrentTab('scan');
            if (onResetScan) onResetScan();
          }}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-amber-500 to-emerald-500 p-[2px] transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-rose-400 group-hover:text-rose-300 transition-colors" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-white tracking-tight">ToxiScan</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
                Mammal Bio-Tox
              </span>
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block">
              Preservative Carcinogen &amp; Bioengineered Food Detection
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={() => setCurrentTab('scan')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center space-x-2 ${
              currentTab === 'scan'
                ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${isScanning ? 'animate-spin text-amber-400' : 'text-emerald-400'}`} />
            <span>Scan Label</span>
          </button>

          <button
            onClick={() => setCurrentTab('lookup')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center space-x-2 ${
              currentTab === 'lookup'
                ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Search className="w-4 h-4 text-sky-400" />
            <span>Ingredient Search</span>
          </button>

          <button
            onClick={() => setCurrentTab('history')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center space-x-2 relative ${
              currentTab === 'history'
                ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <History className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">Scans</span>
            {historyCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                {historyCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenEducational}
            title="Scientific Guide & Standards"
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors"
          >
            <HelpCircle className="w-5 h-5 text-amber-400" />
          </button>
        </div>
      </div>
    </header>
  );
};
