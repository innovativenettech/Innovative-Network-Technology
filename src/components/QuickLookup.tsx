import React, { useState } from 'react';
import { Search, ShieldAlert, Dna, ExternalLink, RefreshCw, AlertTriangle, CheckCircle2, BookOpen, Sparkles } from 'lucide-react';
import { KNOWN_MAMMAL_TOXINS_PRESERVATIVES } from '../data/preservativesDb';

export const QuickLookup: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const popularAdditives = [
    { label: 'BHA', query: 'BHA (Butylated Hydroxyanisole)' },
    { label: 'BHT', query: 'BHT (Butylated Hydroxytoluene)' },
    { label: 'Potassium Bromate', query: 'Potassium Bromate' },
    { label: 'Sodium Nitrite', query: 'Sodium Nitrite' },
    { label: 'TBHQ', query: 'TBHQ (Tertiary Butylhydroquinone)' },
    { label: 'Titanium Dioxide', query: 'Titanium Dioxide E171' },
    { label: 'Propylparaben', query: 'Propylparaben' },
    { label: 'Propyl Gallate', query: 'Propyl Gallate' },
    { label: 'Bioengineered Corn Syrup', query: 'Bioengineered Corn High Fructose Corn Syrup' },
  ];

  const handleSearch = async (queryText: string) => {
    if (!queryText.trim() || loading) return;
    setLoading(true);
    setErrorMsg(null);
    setSearchResult(null);

    try {
      const response = await fetch('/api/quick-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText.trim() }),
      });

      const data = await response.json();
      if (data.success && data.data) {
        setSearchResult({
          ...data.data,
          sources: data.sources || [],
        });
      } else {
        throw new Error(data.error || 'No records found');
      }
    } catch (err: any) {
      // Check local database
      const lower = queryText.toLowerCase();
      const localMatch = Object.entries(KNOWN_MAMMAL_TOXINS_PRESERVATIVES).find(
        ([key, val]) =>
          lower.includes(key) || val.synonyms.some((s) => lower.includes(s.toLowerCase()))
      );

      if (localMatch) {
        setSearchResult({
          ...localMatch[1],
          sources: [
            {
              title: 'National Toxicology Program Report on Carcinogens',
              uri: 'https://ntp.niehs.nih.gov/',
            },
          ],
        });
      } else {
        setErrorMsg(err.message || 'Unable to find toxicology records for this ingredient.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 sm:p-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold mb-3">
            <Search className="w-3.5 h-3.5" />
            <span>Preservative &amp; Additive Database</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Direct Ingredient &amp; Carcinogen Search
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Look up any preservative, additive, or food chemical to inspect peer-reviewed animal cancer studies, target organs in mammals, and bioengineered crop associations.
          </p>
        </div>

        {/* Search input form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(searchTerm);
          }}
          className="mt-6 flex flex-col sm:flex-row gap-3 max-w-3xl"
        >
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-zinc-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="e.g. BHA, Sodium Nitrite, Potassium Bromate, TBHQ, Propylparaben..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500 shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={!searchTerm.trim() || loading}
            className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm flex items-center justify-center space-x-2 transition-colors disabled:opacity-40 shadow-md"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Search Tox Databases</span>
          </button>
        </form>

        {/* Quick query tags */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-500">Popular Additives:</span>
          {popularAdditives.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setSearchTerm(item.query);
                handleSearch(item.query);
              }}
              className="text-xs px-2.5 py-1 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Search Result Card */}
      {searchResult && (
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 sm:p-8 space-y-6 shadow-xl animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
            <div>
              <div className="flex items-center space-x-3">
                <span className="font-extrabold text-2xl text-white">{searchResult.name}</span>
                {searchResult.isPreservative && (
                  <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-xs font-semibold border border-zinc-700">
                    Preservative
                  </span>
                )}
              </div>
              {searchResult.synonyms && searchResult.synonyms.length > 0 && (
                <p className="text-xs text-zinc-400 mt-1">
                  Synonyms &amp; E-numbers: {searchResult.synonyms.join(', ')}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <span
                className={`text-xs px-3 py-1 rounded-full font-bold border ${
                  searchResult.mammalCarcinogenRisk === 'High Risk'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                    : searchResult.mammalCarcinogenRisk === 'Moderate Risk'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                }`}
              >
                {searchResult.mammalCarcinogenRisk || 'Evaluated'}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-rose-400 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4" />
              <span>Mammalian Toxicology &amp; Cancer Bioassay Evidence</span>
            </h3>

            <p className="text-sm text-zinc-200 leading-relaxed bg-zinc-950 p-4 rounded-xl border border-zinc-800">
              {searchResult.summary}
            </p>

            {/* Animal Studies */}
            {searchResult.animalStudies && searchResult.animalStudies.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Documented Animal &amp; Rodent Studies:
                </span>
                <div className="space-y-2">
                  {searchResult.animalStudies.map((study: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 flex items-start space-x-2 leading-relaxed"
                    >
                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                      <span>{study}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Target Organs & Bioengineered Note */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {searchResult.targetOrgansMammals && searchResult.targetOrgansMammals.length > 0 && (
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Target Organs in Mammals
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {searchResult.targetOrgansMammals.map((organ: string, oIdx: number) => (
                      <span
                        key={oIdx}
                        className="px-2.5 py-1 rounded bg-zinc-900 text-rose-300 text-xs font-medium border border-zinc-700"
                      >
                        {organ}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {searchResult.saferAlternatives && searchResult.saferAlternatives.length > 0 && (
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Safer Natural Alternatives
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {searchResult.saferAlternatives.map((alt: string, aIdx: number) => (
                      <span
                        key={aIdx}
                        className="px-2.5 py-1 rounded bg-emerald-950/40 text-emerald-300 text-xs font-medium border border-emerald-800/40"
                      >
                        {alt}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Regulatory Status */}
            {searchResult.regulatoryStatus && (
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Regulatory Classifications
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
                    <span className="text-zinc-500 font-bold block text-[10px] uppercase">FDA (US)</span>
                    <span className="text-zinc-300 mt-1 block">{searchResult.regulatoryStatus.fda || 'Standard'}</span>
                  </div>
                  <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
                    <span className="text-zinc-500 font-bold block text-[10px] uppercase">EFSA (Europe)</span>
                    <span className="text-zinc-300 mt-1 block">{searchResult.regulatoryStatus.efsa || 'Reviewed'}</span>
                  </div>
                  <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
                    <span className="text-zinc-500 font-bold block text-[10px] uppercase">IARC / Prop 65</span>
                    <span className="text-zinc-300 mt-1 block">
                      {searchResult.regulatoryStatus.iarc || 'Unclassified'}{' '}
                      {searchResult.regulatoryStatus.prop65 ? '• CA Prop 65' : ''}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Sources */}
            {searchResult.sources && searchResult.sources.length > 0 && (
              <div className="pt-2">
                <span className="text-xs font-semibold text-zinc-400 block mb-2">
                  Scientific Sources &amp; Monographs:
                </span>
                <div className="flex flex-wrap gap-2">
                  {searchResult.sources.map((src: any, idx: number) => (
                    <a
                      key={idx}
                      href={src.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-xs text-sky-400 border border-zinc-800 transition-colors"
                    >
                      <span>{src.title}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
