import React from 'react';
import { History, Trash2, ArrowRight, ShieldAlert, Dna, Download, ExternalLink } from 'lucide-react';
import { ScanResult } from '../types/scanner';

interface HistoryDrawerProps {
  history: ScanResult[];
  onSelectScan: (scan: ScanResult) => void;
  onClearHistory: () => void;
  onExportAll: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  history,
  onSelectScan,
  onClearHistory,
  onExportAll,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Critical Hazard':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'High Concern':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'Moderate Concern':
        return 'text-yellow-300 bg-yellow-500/10 border-yellow-500/30';
      case 'Low Concern':
        return 'text-blue-300 bg-blue-500/10 border-blue-500/30';
      default:
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold mb-2">
            <History className="w-3.5 h-3.5" />
            <span>Saved Scans &amp; Product Reports</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Scan History ({history.length})
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Re-examine toxicology reports, carcinogen alerts, and BE status for past scanned products.
          </p>
        </div>

        {history.length > 0 && (
          <div className="flex items-center space-x-3">
            <button
              onClick={onExportAll}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 font-medium flex items-center space-x-2 border border-zinc-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>Export All (JSON)</span>
            </button>
            <button
              onClick={onClearHistory}
              className="px-3.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-xs text-rose-300 font-medium flex items-center space-x-2 border border-rose-800/40 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </div>

      {history.length === 0 ? (
        <div className="rounded-2xl bg-zinc-900/40 border border-zinc-800 p-12 text-center">
          <History className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-zinc-300">No Past Scans Yet</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Scan a food package with your camera or test one of the sample products to start building your personal food safety archive.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {history.map((scan) => (
            <div
              key={scan.id}
              onClick={() => onSelectScan(scan)}
              className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/70 transition-all cursor-pointer flex flex-col justify-between group space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wider block">
                      {scan.brand || 'Food Product'}
                    </span>
                    <h4 className="font-bold text-base text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                      {scan.productName}
                    </h4>
                  </div>

                  <div className="flex flex-col items-end">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(
                        scan.overallStatus
                      )}`}
                    >
                      {scan.overallStatus}
                    </span>
                    <span className="text-xs font-black text-zinc-300 mt-1">
                      {scan.overallScore}/100
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-zinc-800/80 text-xs">
                  <div className="flex items-center space-x-2 text-zinc-400">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>
                      Preservatives flagged:{' '}
                      <span className="text-white font-medium">
                        {scan.preservativesAndCarcinogens?.length || 0}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-zinc-400">
                    <Dna className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="truncate">
                      BE Status:{' '}
                      <span className="text-white font-medium">
                        {scan.bioEngineeredAnalysis?.status || 'Unknown'}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-zinc-800 text-xs text-zinc-500 group-hover:text-zinc-400">
                <span>{new Date(scan.timestamp).toLocaleString()}</span>
                <span className="inline-flex items-center text-amber-400 font-medium group-hover:translate-x-1 transition-transform">
                  View Full Report <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
