import React, { useState } from 'react';
import {
  ShieldAlert,
  Dna,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Info,
  Layers,
  FlaskConical,
  BookOpen,
  MessageSquare,
  ArrowLeft,
  Share2,
  Download,
  Search,
  Filter,
  Check,
  Zap,
} from 'lucide-react';
import { ScanResult, IngredientItem, CarcinogenPreservativeAlert } from '../types/scanner';
import { FollowUpChat } from './FollowUpChat';

interface ScanResultViewProps {
  result: ScanResult;
  onReset: () => void;
}

export const ScanResultView: React.FC<ScanResultViewProps> = ({ result, onReset }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'ingredients' | 'studies' | 'sources' | 'ask'>(
    'overview'
  );
  const [ingredientFilter, setIngredientFilter] = useState<'all' | 'flagged' | 'be'>('all');
  const [ingredientSearch, setIngredientSearch] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Status Colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Critical Hazard':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/40';
      case 'High Concern':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/40';
      case 'Moderate Concern':
        return 'bg-yellow-500/10 text-yellow-300 border-yellow-500/40';
      case 'Low Concern':
        return 'bg-blue-500/10 text-blue-300 border-blue-500/40';
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40';
    }
  };

  const getScoreBg = (score: number) => {
    if (score < 40) return 'text-rose-500 border-rose-500/40 bg-rose-500/10';
    if (score < 70) return 'text-amber-400 border-amber-400/40 bg-amber-400/10';
    return 'text-emerald-400 border-emerald-400/40 bg-emerald-400/10';
  };

  const getEvidenceBadge = (level: string) => {
    switch (level) {
      case 'Definitive Mammalian Carcinogen':
        return 'bg-rose-600 text-white border-rose-700';
      case 'Anticipated / Probable Mammalian Carcinogen':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/50';
      case 'Possible / Equivocal in Animal Studies':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  const filteredIngredients = result.parsedIngredients.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(ingredientSearch.toLowerCase());
    if (!matchesSearch) return false;
    if (ingredientFilter === 'flagged') return item.isMammalCarcinogenConcern;
    if (ingredientFilter === 'be') return item.isBioEngineeredConcern;
    return true;
  });

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `toxiscan-${result.productName.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `ToxiScan Report for ${result.productName}: Safety Score ${result.overallScore}/100. Preservatives: ${result.preservativesAndCarcinogens.map((p) => p.name).join(', ') || 'None flagged'}. BE Status: ${result.bioEngineeredAnalysis.status}`
      );
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <button
                onClick={onReset}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                title="Scan another product"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <span className="text-xs uppercase tracking-wider font-semibold text-zinc-500">
                {result.category || 'Food & Grocery'}
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${getStatusColor(
                  result.overallStatus
                )}`}
              >
                {result.overallStatus}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {result.productName}
            </h1>
            <p className="text-sm text-zinc-400">
              Brand: <span className="text-zinc-200 font-medium">{result.brand}</span> • Scanned on{' '}
              {new Date(result.timestamp).toLocaleDateString()}
            </p>
          </div>

          {/* Score & Actions */}
          <div className="flex items-center space-x-4">
            <div
              className={`w-24 h-24 rounded-2xl border-2 flex flex-col items-center justify-center p-2 shadow-inner ${getScoreBg(
                result.overallScore
              )}`}
            >
              <span className="text-3xl font-black">{result.overallScore}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider">Score / 100</span>
            </div>

            <div className="flex flex-col space-y-2">
              <button
                onClick={handleShare}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 hover:text-white font-medium flex items-center space-x-2 border border-zinc-700 transition-colors"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied Summary' : 'Share'}</span>
              </button>
              <button
                onClick={handleExportJson}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 hover:text-white font-medium flex items-center space-x-2 border border-zinc-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-sky-400" />
                <span>Export Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-6 pt-4 border-t border-zinc-800 flex flex-wrap gap-2 text-xs sm:text-sm font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${
              activeTab === 'overview'
                ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Hazard Summary</span>
          </button>

          <button
            onClick={() => setActiveTab('ingredients')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${
              activeTab === 'ingredients'
                ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>All Ingredients ({result.parsedIngredients.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('studies')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${
              activeTab === 'studies'
                ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <FlaskConical className="w-4 h-4 text-amber-400" />
            <span>Mammal Studies &amp; Tox</span>
          </button>

          <button
            onClick={() => setActiveTab('sources')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${
              activeTab === 'sources'
                ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <BookOpen className="w-4 h-4 text-sky-400" />
            <span>Internet Sources ({result.groundedSources.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ask')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${
              activeTab === 'ask'
                ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-purple-400" />
            <span>Ask Toxicologist AI</span>
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Two Core Spotlight Cards: Carcinogens & BE Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Preservative & Mammalian Carcinogen Card */}
            <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">Mammalian Carcinogen Preservatives</h2>
                      <p className="text-xs text-zinc-400">Chemical additives linked to cancer in rodents/mammals</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                      result.preservativesAndCarcinogens.length > 0
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/40'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40'
                    }`}
                  >
                    {result.preservativesAndCarcinogens.length} Detected
                  </span>
                </div>

                {result.preservativesAndCarcinogens.length === 0 ? (
                  <div className="p-6 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-center my-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    <h4 className="text-sm font-semibold text-emerald-300">No High-Risk Preservatives Flagged</h4>
                    <p className="text-xs text-zinc-400 mt-1">
                      Did not detect high-concern preservatives with established mammalian carcinogen records like BHA, BHT, Potassium Bromate, or Sodium Nitrite.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 my-4">
                    {result.preservativesAndCarcinogens.map((preservative, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-zinc-950/70 border border-rose-900/30 hover:border-rose-700/50 transition-all space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-bold text-sm text-white text-rose-300">
                              {preservative.name}
                            </span>
                            {preservative.synonyms && preservative.synonyms.length > 0 && (
                              <span className="text-[11px] text-zinc-500 ml-2">
                                ({preservative.synonyms.join(', ')})
                              </span>
                            )}
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getEvidenceBadge(
                              preservative.evidenceLevel
                            )}`}
                          >
                            {preservative.evidenceLevel}
                          </span>
                        </div>

                        <p className="text-xs text-zinc-300 leading-relaxed">
                          {preservative.summary}
                        </p>

                        {/* Mammal Target Organs & Animal Studies Highlight */}
                        {preservative.targetOrgansMammals && preservative.targetOrgansMammals.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="text-[11px] text-zinc-400">Mammal Target Organs:</span>
                            {preservative.targetOrgansMammals.map((organ, oIdx) => (
                              <span
                                key={oIdx}
                                className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-rose-300 border border-zinc-700"
                              >
                                {organ}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Regulatory Badges */}
                        <div className="flex flex-wrap items-center gap-2 pt-2 text-[10px] text-zinc-400 border-t border-zinc-800/80">
                          {preservative.regulatoryStatus?.iarc && (
                            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700">
                              IARC: {preservative.regulatoryStatus.iarc}
                            </span>
                          )}
                          {preservative.regulatoryStatus?.prop65 && (
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold">
                              CA Prop 65 Listed
                            </span>
                          )}
                          {preservative.regulatoryStatus?.efsa && (
                            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700">
                              EFSA: {preservative.regulatoryStatus.efsa}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-zinc-800 text-xs text-zinc-400 flex items-center justify-between">
                <span>Verified with NIH NTP &amp; IARC Monographs</span>
                <button
                  onClick={() => setActiveTab('studies')}
                  className="text-amber-400 hover:underline font-medium inline-flex items-center"
                >
                  View Animal Bioassays →
                </button>
              </div>
            </div>

            {/* Bio-Engineered (BE) Food Card */}
            <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
                      <Dna className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">Bio-Engineered (BE) / GMO Status</h2>
                      <p className="text-xs text-zinc-400">USDA AMS National Disclosure Standard check</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                      result.bioEngineeredAnalysis.status.includes('Contains') ||
                      result.bioEngineeredAnalysis.status.includes('Derived')
                        ? 'bg-purple-500/15 text-purple-300 border-purple-500/40'
                        : result.bioEngineeredAnalysis.status.includes('Non-GMO')
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/40'
                    }`}
                  >
                    {result.bioEngineeredAnalysis.status}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-3 my-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">BE Disclosure Badge/Text:</span>
                    <span
                      className={`font-semibold ${
                        result.bioEngineeredAnalysis.detectedDisclosureBadgeOrText
                          ? 'text-purple-300'
                          : 'text-zinc-500'
                      }`}
                    >
                      {result.bioEngineeredAnalysis.detectedDisclosureBadgeOrText
                        ? 'Confirmed on Label'
                        : 'None explicitly detected'}
                    </span>
                  </div>

                  {result.bioEngineeredAnalysis.disclosureTextFound && (
                    <div className="p-2.5 rounded bg-purple-950/30 border border-purple-800/40 text-xs text-purple-200 font-mono">
                      "{result.bioEngineeredAnalysis.disclosureTextFound}"
                    </div>
                  )}

                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {result.bioEngineeredAnalysis.amsExplanation}
                  </p>

                  {result.bioEngineeredAnalysis.beRiskIngredients &&
                    result.bioEngineeredAnalysis.beRiskIngredients.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-zinc-800">
                        <span className="text-xs font-semibold text-zinc-200 block">
                          Identified High-Risk Bioengineered Crop Derivatives:
                        </span>
                        <div className="space-y-1.5">
                          {result.bioEngineeredAnalysis.beRiskIngredients.map((item, bIdx) => (
                            <div
                              key={bIdx}
                              className="p-2 rounded bg-zinc-900 border border-zinc-800 text-xs flex items-start justify-between"
                            >
                              <div>
                                <span className="font-semibold text-white">{item.name}</span>
                                <p className="text-[11px] text-zinc-400 mt-0.5">{item.riskExplanation}</p>
                              </div>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-purple-300 border border-zinc-700 whitespace-nowrap ml-2">
                                Crop: {item.cropSource}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800 text-xs text-zinc-400 flex items-center justify-between">
                <span>USDA AMS BE Standard Regulated</span>
                <span className="text-purple-400 text-xs">Organic / Non-GMO Project exempt</span>
              </div>
            </div>
          </div>

          {/* Mammalian Toxicity Synthesis Paragraph */}
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-3">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <FlaskConical className="w-5 h-5 text-amber-400" />
              <span>Scientific Synthesis &amp; Mammal Health Impact</span>
            </h3>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {result.mammalianToxicitySummary}
            </p>

            {/* Recommendations */}
            {result.recommendations && result.recommendations.length > 0 && (
              <div className="pt-4 border-t border-zinc-800 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Toxicologist Recommendations
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {result.recommendations.map((rec, rIdx) => (
                    <div
                      key={rIdx}
                      className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-xs text-zinc-300 flex items-start space-x-2"
                    >
                      <Zap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: INGREDIENTS TABLE */}
      {activeTab === 'ingredients' && (
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">Full Ingredient Decomposition</h3>
              <p className="text-xs text-zinc-400">Classified by toxicity tier, functional role, and BE status</p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search ingredient..."
                  value={ingredientSearch}
                  onChange={(e) => setIngredientSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex rounded-lg bg-zinc-950 p-1 border border-zinc-800 text-xs">
                <button
                  onClick={() => setIngredientFilter('all')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    ingredientFilter === 'all' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400'
                  }`}
                >
                  All ({result.parsedIngredients.length})
                </button>
                <button
                  onClick={() => setIngredientFilter('flagged')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    ingredientFilter === 'flagged' ? 'bg-rose-900/40 text-rose-300 font-medium' : 'text-zinc-400'
                  }`}
                >
                  Carcinogen Risk
                </button>
                <button
                  onClick={() => setIngredientFilter('be')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    ingredientFilter === 'be' ? 'bg-purple-900/40 text-purple-300 font-medium' : 'text-zinc-400'
                  }`}
                >
                  BE Crop Risk
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/80 text-zinc-400 uppercase font-semibold text-[10px] tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Ingredient Name</th>
                  <th className="py-3 px-4">Function</th>
                  <th className="py-3 px-4">Hazard Tier</th>
                  <th className="py-3 px-4">Mammal Carcinogen Alert</th>
                  <th className="py-3 px-4">BE / GMO Risk</th>
                  <th className="py-3 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredIngredients.map((item, idx) => (
                  <tr key={idx} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">
                      {item.name}
                    </td>
                    <td className="py-3 px-4 text-zinc-400">{item.function || item.category}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          item.hazardTier === 'Severe' || item.hazardTier === 'High Concern'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : item.hazardTier === 'Moderate Concern'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {item.hazardTier}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {item.isMammalCarcinogenConcern ? (
                        <span className="inline-flex items-center space-x-1 text-rose-400 font-bold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Flagged</span>
                        </span>
                      ) : (
                        <span className="text-zinc-500">None</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {item.isBioEngineeredConcern ? (
                        <span className="inline-flex items-center space-x-1 text-purple-400 font-semibold">
                          <Dna className="w-3.5 h-3.5" />
                          <span>High BE Risk</span>
                        </span>
                      ) : (
                        <span className="text-zinc-500">Low / None</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-zinc-400 max-w-xs">{item.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-4 border-t border-zinc-800">
            <details className="text-xs text-zinc-400 cursor-pointer">
              <summary className="font-semibold text-zinc-300 hover:text-white">
                View Raw Extracted Ingredient Label Text
              </summary>
              <div className="mt-2 p-3 rounded-lg bg-zinc-950 font-mono text-[11px] text-zinc-300 border border-zinc-800">
                {result.rawIngredientsText}
              </div>
            </details>
          </div>
        </div>
      )}

      {/* TAB 3: ANIMAL STUDIES & TOXICOLOGY */}
      {activeTab === 'studies' && (
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <FlaskConical className="w-5 h-5 text-amber-400" />
              <span>Mammalian Carcinogen Bioassays &amp; Animal Research</span>
            </h3>
            <p className="text-xs text-zinc-400">
              In-vivo rodent (rat/mouse) bioassays, tumor formation, and organ toxicology documented for detected preservatives.
            </p>
          </div>

          {result.preservativesAndCarcinogens.length === 0 ? (
            <div className="p-8 rounded-xl bg-zinc-950 border border-zinc-800 text-center text-zinc-400 text-sm">
              No harmful mammalian carcinogens detected in this product.
            </div>
          ) : (
            <div className="space-y-6">
              {result.preservativesAndCarcinogens.map((preservative, idx) => (
                <div
                  key={idx}
                  className="rounded-xl bg-zinc-950 border border-zinc-800 p-5 space-y-4 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                    <div>
                      <h4 className="text-base font-bold text-white text-rose-300">{preservative.name}</h4>
                      <p className="text-xs text-zinc-400">
                        {preservative.isPreservative ? 'Chemical Preservative / Antioxidant' : 'Food Additive'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${getEvidenceBadge(preservative.evidenceLevel)}`}>
                        {preservative.evidenceLevel}
                      </span>
                    </div>
                  </div>

                  {/* Animal Studies List */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      Documented Animal &amp; Mammal Studies
                    </span>
                    <ul className="space-y-2">
                      {preservative.animalStudies.map((study, sIdx) => (
                        <li
                          key={sIdx}
                          className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-300 flex items-start space-x-2 leading-relaxed"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-1.5" />
                          <span>{study}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Target Organs & Alternatives Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1">
                      <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                        Mammal Target Organs
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {preservative.targetOrgansMammals.map((organ, oIdx) => (
                          <span
                            key={oIdx}
                            className="px-2 py-0.5 rounded bg-zinc-800 text-rose-300 text-xs border border-zinc-700"
                          >
                            {organ}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1">
                      <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                        Safer Natural Alternatives
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {preservative.saferAlternatives?.map((alt, aIdx) => (
                          <span
                            key={aIdx}
                            className="px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 text-xs border border-emerald-800/40"
                          >
                            {alt}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: INTERNET GROUNDED SOURCES */}
      {activeTab === 'sources' && (
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-sky-400" />
              <span>Live Internet Grounded Citations</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Web sources and scientific repositories retrieved via live Google Search grounding during analysis:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {result.groundedSources.map((source, sIdx) => (
              <a
                key={sIdx}
                href={source.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-sky-500/50 hover:bg-zinc-800/50 transition-all flex items-start justify-between group"
              >
                <div className="space-y-1 pr-2">
                  <h4 className="text-xs font-semibold text-white group-hover:text-sky-300 transition-colors line-clamp-2">
                    {source.title}
                  </h4>
                  <span className="text-[11px] text-zinc-500 truncate block font-mono">
                    {source.uri}
                  </span>
                </div>
                <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-sky-400 shrink-0 mt-0.5 transition-colors" />
              </a>
            ))}
          </div>

          {result.searchQueriesUsed && result.searchQueriesUsed.length > 0 && (
            <div className="pt-4 border-t border-zinc-800">
              <span className="text-xs font-semibold text-zinc-400 block mb-2">
                Automated Internet Search Queries Executed:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {result.searchQueriesUsed.map((query, qIdx) => (
                  <span
                    key={qIdx}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-950 text-zinc-300 border border-zinc-800 font-mono"
                  >
                    "{query}"
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: ASK TOXICOLOGIST AI */}
      {activeTab === 'ask' && (
        <FollowUpChat scanResult={result} />
      )}
    </div>
  );
};
