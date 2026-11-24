import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CameraCapture } from './components/CameraCapture';
import { ScanResultView } from './components/ScanResultView';
import { QuickLookup } from './components/QuickLookup';
import { HistoryDrawer } from './components/HistoryDrawer';
import { EducationalModal } from './components/EducationalModal';
import { ScanResult } from './types/scanner';
import { AlertCircle, Edit3, KeyRound, CheckCircle2, Sparkles } from 'lucide-react';

function formatErrorMessage(raw: any): { message: string; isQuota: boolean } {
  if (!raw) {
    return {
      message: 'An error occurred during scanning. Please try again or paste ingredients directly.',
      isQuota: false,
    };
  }
  const str = typeof raw === 'string' ? raw : JSON.stringify(raw);
  if (
    str.includes('429') ||
    str.includes('RESOURCE_EXHAUSTED') ||
    str.includes('quota') ||
    str.includes('exceeded your current quota')
  ) {
    return {
      message:
        'Gemini API rate limit or quota exceeded on free tier. To increase quota, configure a billing-enabled API key in Settings > Secrets. You can also paste ingredient text directly for instant offline toxicology and bioengineered screening.',
      isQuota: true,
    };
  }
  try {
    const parsed = JSON.parse(str);
    if (parsed?.error?.message) {
      if (parsed.error.code === 429) {
        return {
          message:
            'Gemini API rate limit or quota exceeded on free tier. To increase quota, configure a billing-enabled API key in Settings > Secrets. You can also paste ingredient text directly for instant offline toxicology and bioengineered screening.',
          isQuota: true,
        };
      }
      return { message: parsed.error.message, isQuota: false };
    }
  } catch {
    //
  }
  return { message: str, isQuota: false };
}

export default function App() {
  const [currentTab, setCurrentTab] = useState<'scan' | 'lookup' | 'history'>('scan');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgressText, setScanProgressText] = useState<string>('');
  const [currentResult, setCurrentResult] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [isEducationalOpen, setIsEducationalOpen] = useState<boolean>(false);
  const [forceOpenTextModal, setForceOpenTextModal] = useState<boolean>(false);

  // Load history from localStorage on startup
  useEffect(() => {
    try {
      const saved = localStorage.getItem('toxiscan_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to parse history:', e);
    }
  }, []);

  // Save history to localStorage
  const saveToHistory = (item: ScanResult) => {
    setHistory((prev) => {
      const filtered = prev.filter((h) => h.id !== item.id && h.productName !== item.productName);
      const updated = [item, ...filtered].slice(0, 50);
      try {
        localStorage.setItem('toxiscan_history', JSON.stringify(updated));
      } catch (err) {
        console.warn('Could not save to localStorage:', err);
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('toxiscan_history');
    } catch (err) {
      //
    }
  };

  const handleExportAllHistory = () => {
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `toxiscan-all-history-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Image Scan Handler
  const handleScanImage = async (base64: string, mimeType: string) => {
    setIsScanning(true);
    setErrorMessage(null);
    setNoticeMessage(null);
    setScanProgressText('Scanning package image & extracting ingredient panel...');

    const timer1 = setTimeout(() => {
      setScanProgressText('Grounding search with live toxicology databases & animal bioassays...');
    }, 2500);

    const timer2 = setTimeout(() => {
      setScanProgressText('Evaluating mammalian cancer risk (NTP, IARC) & USDA bioengineered status...');
    }, 6000);

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: mimeType,
        }),
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      const data = await response.json();
      if (data.success && data.result) {
        setCurrentResult(data.result);
        saveToHistory(data.result);
        setCurrentTab('scan');
        if (data.notice) {
          setNoticeMessage(data.notice);
        }
      } else if (data.needsTextPrompt || data.isQuotaExceeded) {
        setForceOpenTextModal(true);
        const { message } = formatErrorMessage(data.error);
        setErrorMessage(message);
      } else {
        const { message } = formatErrorMessage(data.error || 'Failed to analyze product. Please try another image.');
        setErrorMessage(message);
      }
    } catch (err: any) {
      console.error('Scan error:', err);
      const { message } = formatErrorMessage(err?.message || err);
      setErrorMessage(message);
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsScanning(false);
      setScanProgressText('');
    }
  };

  // Text Scan Handler
  const handleScanText = async (ingredientsText: string, productName?: string) => {
    setIsScanning(true);
    setErrorMessage(null);
    setNoticeMessage(null);
    setScanProgressText('Parsing ingredients & cross-referencing chemical databases...');

    const timer = setTimeout(() => {
      setScanProgressText('Grounding mammalian cancer studies & bioengineered crop lineage...');
    }, 2500);

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredientsText,
          productName,
        }),
      });

      clearTimeout(timer);

      const data = await response.json();
      if (data.success && data.result) {
        setCurrentResult(data.result);
        saveToHistory(data.result);
        setCurrentTab('scan');
        if (data.notice) {
          setNoticeMessage(data.notice);
        }
      } else {
        const { message } = formatErrorMessage(data.error || 'Failed to analyze ingredients.');
        setErrorMessage(message);
      }
    } catch (err: any) {
      console.error('Scan text error:', err);
      const { message } = formatErrorMessage(err?.message || err);
      setErrorMessage(message);
    } finally {
      clearTimeout(timer);
      setIsScanning(false);
      setScanProgressText('');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-rose-500/30 selection:text-white">
      {/* Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          setErrorMessage(null);
        }}
        historyCount={history.length}
        onOpenEducational={() => setIsEducationalOpen(true)}
        onResetScan={() => {
          setCurrentResult(null);
          setNoticeMessage(null);
        }}
        isScanning={isScanning}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Notice Banner */}
        {noticeMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs sm:text-sm flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
              <span>{noticeMessage}</span>
            </div>
            <button
              onClick={() => setNoticeMessage(null)}
              className="text-xs text-sky-400 hover:text-white underline ml-3"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">Status Notification</span>
                <span className="text-xs sm:text-sm leading-relaxed">{errorMessage}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
              <button
                onClick={() => {
                  setForceOpenTextModal(true);
                  setErrorMessage(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Enter Ingredients</span>
              </button>
              <button
                onClick={() => setErrorMessage(null)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-medium transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Tab 1: SCAN */}
        {currentTab === 'scan' && (
          <div>
            {currentResult ? (
              <ScanResultView
                result={currentResult}
                onReset={() => {
                  setCurrentResult(null);
                  setNoticeMessage(null);
                }}
              />
            ) : (
              <CameraCapture
                onScanImage={handleScanImage}
                onScanText={handleScanText}
                isScanning={isScanning}
                scanProgressText={scanProgressText}
                forceOpenTextModal={forceOpenTextModal}
                onCloseTextModal={() => setForceOpenTextModal(false)}
              />
            )}
          </div>
        )}

        {/* Tab 2: DIRECT LOOKUP */}
        {currentTab === 'lookup' && <QuickLookup />}

        {/* Tab 3: HISTORY */}
        {currentTab === 'history' && (
          <HistoryDrawer
            history={history}
            onSelectScan={(scan) => {
              setCurrentResult(scan);
              setCurrentTab('scan');
            }}
            onClearHistory={handleClearHistory}
            onExportAll={handleExportAllHistory}
          />
        )}
      </main>

      {/* Educational Guide Modal */}
      <EducationalModal
        isOpen={isEducationalOpen}
        onClose={() => setIsEducationalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/80 py-6 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-zinc-300">ToxiScan</span>
            <span>•</span>
            <span>Mammalian Carcinogen &amp; Bioengineered Food Detection System</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px] text-zinc-400">
            <span>Powered by Gemini 3.8 Flash &amp; Google Search Grounding</span>
            <span>•</span>
            <button
              onClick={() => setIsEducationalOpen(true)}
              className="hover:text-amber-400 transition-colors"
            >
              Scientific Sources Guide
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
