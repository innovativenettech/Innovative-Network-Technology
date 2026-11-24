import React from 'react';
import { X, ShieldAlert, Dna, FlaskConical, AlertTriangle, BookOpen, CheckCircle2 } from 'lucide-react';

interface EducationalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EducationalModal: React.FC<EducationalModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="pr-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Scientific Guide &amp; Regulatory Standards</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Understanding Mammalian Carcinogens &amp; Bio-Engineered Foods
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">
            A primer on toxicological animal bioassays, carcinogenic preservatives, and USDA bioengineered disclosures.
          </p>
        </div>

        <div className="mt-6 space-y-6 text-xs sm:text-sm text-zinc-300">
          {/* Section 1: Mammalian Carcinogens */}
          <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
            <div className="flex items-center space-x-2 text-rose-400 font-bold">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-base text-white">1. What is a Mammalian Carcinogen?</h3>
            </div>
            <p className="leading-relaxed text-zinc-300">
              Toxicologists assess chemical safety primarily using 2-year chronic rodent bioassays (Fischer 344 rats, B6C3F1 mice, and Syrian hamsters). In these standardized protocols (administered by the NIH National Toxicology Program and IARC):
            </p>
            <ul className="space-y-2 pl-2">
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-2" />
                <span>
                  <strong className="text-white">BHA (Butylated Hydroxyanisole):</strong> Documented to induce forestomach papillomas and squamous cell carcinomas in rodents. Listed on California Prop 65 as a known carcinogen.
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-2" />
                <span>
                  <strong className="text-white">Sodium Nitrite (E250):</strong> In the mammalian digestive tract, nitrites combine with secondary amines in meat to form carcinogenic N-nitrosamines (such as NDMA), classified by IARC as Group 2A (Probable Carcinogen).
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-2" />
                <span>
                  <strong className="text-white">Potassium Bromate (E924):</strong> Causes renal cortical adenocarcinomas and thyroid follicular tumors in rats. Banned in the European Union, Canada, UK, and California (AB 418), yet still permitted by the US FDA.
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-2" />
                <span>
                  <strong className="text-white">Titanium Dioxide (E171):</strong> Nanoparticles cross the intestinal epithelial barrier in mammals, causing colorectal microadenomas and genotoxicity. Banned in all foods across the EU since 2022.
                </span>
              </li>
            </ul>
          </div>

          {/* Section 2: Bioengineered Foods */}
          <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
            <div className="flex items-center space-x-2 text-purple-400 font-bold">
              <Dna className="w-5 h-5" />
              <h3 className="text-base text-white">2. USDA Bioengineered (BE) Food Disclosure Standard</h3>
            </div>
            <p className="leading-relaxed text-zinc-300">
              Effective January 1, 2022, the USDA Agricultural Marketing Service (AMS) mandates disclosure for food products containing detectable genetic material that has been modified through in vitro recombinant deoxyribonucleic acid (rDNA) techniques:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                <h4 className="font-bold text-white text-xs mb-1">Standard BE Disclosures</h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Manufacturers must display the circular green USDA "Bioengineered" symbol, or state "Contains a bioengineered food ingredient", or provide a digital QR code link.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                <h4 className="font-bold text-white text-xs mb-1">High-Risk US GMO Crops</h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Over 92% of US corn, 95% of soy, 95% of canola, and 99% of sugar beets are bioengineered. Ingredients like dextrose, maltodextrin, high fructose corn syrup, and soy lecithin frequently derive from BE crops.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Natural Clean Alternatives */}
          <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold">
              <CheckCircle2 className="w-5 h-5" />
              <h3 className="text-base text-white">3. Safer &amp; Non-Carcinogenic Alternatives</h3>
            </div>
            <p className="leading-relaxed text-zinc-300">
              Clean-label food producers replace synthetic preservatives with natural botanicals and physical preservation methods:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
              <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-800/30 text-emerald-300">
                <strong>Rosemary Extract</strong>
                <p className="text-[11px] text-zinc-400 mt-0.5">Potent antioxidant carnosic acid protects fats naturally.</p>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-800/30 text-emerald-300">
                <strong>Mixed Tocopherols</strong>
                <p className="text-[11px] text-zinc-400 mt-0.5">Natural Vitamin E isomers prevent lipid oxidation.</p>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-800/30 text-emerald-300">
                <strong>USDA Organic Certification</strong>
                <p className="text-[11px] text-zinc-400 mt-0.5">Strictly prohibits synthetic carcinogens and GMO/BE ingredients.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
