import { CarcinogenPreservativeAlert } from '../types/scanner';

export const KNOWN_MAMMAL_TOXINS_PRESERVATIVES: Record<string, CarcinogenPreservativeAlert> = {
  'bha': {
    name: 'BHA (Butylated Hydroxyanisole)',
    synonyms: ['E320', 'tert-butyl-4-hydroxyanisole', 'Butylated Hydroxyanisole'],
    isPreservative: true,
    mammalCarcinogenRisk: 'High Risk',
    evidenceLevel: 'Anticipated / Probable Mammalian Carcinogen',
    animalStudies: [
      'Induces benign and malignant forestomach tumors (squamous cell carcinomas) in male and female F344 rats and Syrian golden hamsters.',
      'Dietary feeding in rodents produced significant cell proliferation and DNA adduct formation in upper gastrointestinal tissues.',
      'NTP (National Toxicology Program) lists BHA as "reasonably anticipated to be a human carcinogen" based on sufficient evidence of carcinogenicity in experimental animals.'
    ],
    targetOrgansMammals: ['Forestomach', 'Liver', 'Thyroid gland'],
    regulatoryStatus: {
      fda: 'Allowed up to 0.02% (200 ppm) of fat/oil content.',
      efsa: 'Permitted with an ADI of 1.0 mg/kg bw/day, under continuous review.',
      iarc: 'Group 2B: Possibly carcinogenic to humans (sufficient animal evidence).',
      prop65: true,
    },
    summary: 'Widely used synthetic antioxidant preservative to keep oils and fats from rancidity. Multiple rodent bioassays demonstrate clear induction of forestomach carcinomas and epithelial hyperplasia.',
    saferAlternatives: ['Mixed Tocopherols (Vitamin E)', 'Rosemary Extract', 'Ascorbic Acid (Vitamin C)']
  },
  'bht': {
    name: 'BHT (Butylated Hydroxytoluene)',
    synonyms: ['E321', '2,6-di-tert-butyl-p-cresol', 'Dibutylhydroxytoluene'],
    isPreservative: true,
    mammalCarcinogenRisk: 'Moderate Risk',
    evidenceLevel: 'Possible / Equivocal in Animal Studies',
    animalStudies: [
      'Acts as a tumor promoter in liver and lung tissues in mice exposed to initiating carcinogens.',
      'High-dose chronic administration in Wistar rats causes hepatic hypertrophy, microsomal enzyme induction, and hemorrhaging at toxic thresholds.',
      'Some rodent studies suggest both promotional and paradoxically anticarcinogenic effects depending on dose and timing.'
    ],
    targetOrgansMammals: ['Liver', 'Lungs', 'Blood coagulation pathways'],
    regulatoryStatus: {
      fda: 'GRAS up to 0.02% of fat content.',
      efsa: 'ADI lowered to 0.25 mg/kg bw/day due to endocrine and hepatic concerns.',
      iarc: 'Group 3: Not classifiable as to human carcinogenicity, but animal tumor promotion documented.',
      prop65: false,
    },
    summary: 'Synthetic antioxidant preservative closely related to BHA. Rodent data indicates potent tumor promotion in hepatic and pulmonary tissues.',
    saferAlternatives: ['Green Tea Extract', 'Rosemary Extract', 'Citric Acid']
  },
  'potassium bromate': {
    name: 'Potassium Bromate',
    synonyms: ['E924', 'Bromic acid, potassium salt'],
    isPreservative: false,
    mammalCarcinogenRisk: 'High Risk',
    evidenceLevel: 'Definitive Mammalian Carcinogen',
    animalStudies: [
      'Causes renal cell tumors (adenomas and adenocarcinomas), thyroid follicular cell tumors, and peritoneal mesotheliomas in male Fischer 344 rats.',
      'Causes oxidative DNA damage (8-hydroxydeoxyguanosine) and chromosomal aberrations in mammalian kidneys and blood leukocytes.',
      'NTP and EPA classify bromate as a probable human carcinogen.'
    ],
    targetOrgansMammals: ['Kidneys (Renal cortex)', 'Thyroid', 'Peritoneum'],
    regulatoryStatus: {
      fda: 'Still permitted in flour processing in the US, but banned in California (AB 418 Food Safety Act).',
      efsa: 'Strictly banned in food throughout the European Union, Canada, UK, and China.',
      iarc: 'Group 2B: Possibly carcinogenic to humans (sufficient animal evidence).',
      prop65: true,
    },
    summary: 'Oxidizing dough conditioner and preservative used in commercial baking. One of the most documented animal renal carcinogens still permitted in US bread products.',
    saferAlternatives: ['Ascorbic Acid', 'Enzymatic dough conditioners', 'Unbleached flour']
  },
  'sodium nitrite': {
    name: 'Sodium Nitrite / Sodium Nitrate',
    synonyms: ['E250', 'E251', 'Potassium Nitrite', 'Curing Salt'],
    isPreservative: true,
    mammalCarcinogenRisk: 'High Risk',
    evidenceLevel: 'Anticipated / Probable Mammalian Carcinogen',
    animalStudies: [
      'In the acidic gastric environment of mammals, nitrites react with amines/amides to form N-nitrosamines (e.g., NDMA), which are potent multi-organ animal carcinogens.',
      'Direct rodent bioassays demonstrated increased incidence of forestomach papillomas and hematopoietic neoplasms when administered with amines.',
      'IARC epidemiological and animal evaluation confirmed ingested nitrate/nitrite under conditions that result in endogenous nitrosation is Group 2A.'
    ],
    targetOrgansMammals: ['Gastrointestinal tract (Stomach, Colon)', 'Liver', 'Esophagus'],
    regulatoryStatus: {
      fda: 'Regulated in cured meats (max 120-200 ppm combined with sodium erythorbate to reduce nitrosamines).',
      efsa: 'Reduced permitted residual limits in 2023 to minimize nitrosamine exposure.',
      iarc: 'Group 2A: Probably carcinogenic to humans (via endogenous nitrosation).',
      prop65: false,
    },
    summary: 'Primary antimicrobial preservative used against Clostridium botulinum in processed meats (bacon, sausages, deli meats). Readily transforms into carcinogenic N-nitrosocompounds in the mammalian gut.',
    saferAlternatives: ['Celery powder (natural nitrate, though caution still applies)', 'Cultured dextrose', 'Vacuum packaging / freezing']
  },
  'tbhq': {
    name: 'TBHQ (Tertiary Butylhydroquinone)',
    synonyms: ['E319', 'tert-Butylhydroquinone', 'Mono-tert-butylhydroquinone'],
    isPreservative: true,
    mammalCarcinogenRisk: 'Moderate Risk',
    evidenceLevel: 'Possible / Equivocal in Animal Studies',
    animalStudies: [
      'Produced forestomach precursors and papillomas at high dietary doses in rodent models.',
      'Reported to cause DNA strand breaks in mammalian cell culture and impairment of immune cell signaling (T-cell activation suppressed).',
      'Long-term rodent studies showed liver enlargement and neurobehavioral changes in offspring.'
    ],
    targetOrgansMammals: ['Immune System', 'Forestomach', 'Liver'],
    regulatoryStatus: {
      fda: 'Allowed up to 0.02% of oil/fat content.',
      efsa: 'Approved with ADI of 0.7 mg/kg bw/day, but restricted in infant food.',
      iarc: 'Not formally classified, but highlighted by European and US toxicological agencies for genotoxicity questions.',
      prop65: false,
    },
    summary: 'Synthetic antioxidant preservative common in vegetable oils, snack crackers, fast food fries, and frozen meals. Demonstrated immune disruption and glandular stomach hyperplasia in rodents.',
    saferAlternatives: ['Tocopherols', 'Polyphenol extracts', 'Cold-pressed virgin oils']
  },
  'propylparaben': {
    name: 'Propylparaben (Propyl p-hydroxybenzoate)',
    synonyms: ['E216', 'Propyl 4-hydroxybenzoate', 'Sodium propylparaben'],
    isPreservative: true,
    mammalCarcinogenRisk: 'High Risk',
    evidenceLevel: 'Possible / Equivocal in Animal Studies',
    animalStudies: [
      'Potent endocrine disruptor in male and female rodents; alters reproductive hormone levels and sperm count.',
      'Acts as an estrogen mimetic in mammalian models, stimulating estrogen-receptor-positive mammary tumor cell growth.',
      'Banned in California foods under the California Food Safety Act (effective 2027).'
    ],
    targetOrgansMammals: ['Endocrine system', 'Mammary tissue', 'Reproductive tract'],
    regulatoryStatus: {
      fda: 'Currently GRAS in food, though facing state-level bans and citizen petitions.',
      efsa: 'Withdrawn from permitted food additives in EU due to reproductive and endocrine toxicity.',
      iarc: 'Classified under endocrine disruptor evaluations.',
      prop65: false,
    },
    summary: 'Antimicrobial preservative previously common in baked goods, tortillas, and drink mixes. Banned in Europe due to endocrine disruption and stimulation of hormone-dependent cancer cells in mammals.',
    saferAlternatives: ['Sorbic acid', 'Calcium propionate', 'Lactic acid ferment']
  },
  'titanium dioxide': {
    name: 'Titanium Dioxide (E171)',
    synonyms: ['E171', 'TiO2', 'CI 77891'],
    isPreservative: false,
    mammalCarcinogenRisk: 'High Risk',
    evidenceLevel: 'Definitive Mammalian Carcinogen',
    animalStudies: [
      'Inhalation and oral nanoparticle ingestion in rodents demonstrated accumulation in Peyer\'s patches, liver, and spleen, leading to DNA damage.',
      'Chronic oral ingestion in rats caused precancerous colorectal lesions (microadenomas) and immune system impairment.',
      'EFSA concluded in 2021 that titanium dioxide nanoparticles can no longer be considered safe due to genotoxicity.'
    ],
    targetOrgansMammals: ['Colon / Rectum', 'Peyer\'s patches', 'Liver', 'Spleen'],
    regulatoryStatus: {
      fda: 'Permitted up to 1% by weight (currently petitioned for repeal). Banned in California (AB 418).',
      efsa: 'Completely banned in food in the EU since 2022 (Regulation EU 2022/63).',
      iarc: 'Group 2B: Possibly carcinogenic to humans.',
      prop65: true,
    },
    summary: 'Whitening and opacifying agent used in candies, coffee creamers, and sauces. Nanoparticles accumulate in mammalian gut tissues, inducing reactive oxygen species and intestinal microadenomas.',
    saferAlternatives: ['Calcium carbonate', 'Rice starch', 'Natural colorants']
  },
  'propyl gallate': {
    name: 'Propyl Gallate',
    synonyms: ['E310', 'Propyl 3,4,5-trihydroxybenzoate'],
    isPreservative: true,
    mammalCarcinogenRisk: 'Moderate Risk',
    evidenceLevel: 'Possible / Equivocal in Animal Studies',
    animalStudies: [
      'NTP 2-year bioassay in F344 rats showed equivocal evidence of carcinogenic activity, including thyroid and pancreatic tumors.',
      'Acts as a moderate xenoestrogen in mammalian cell cultures and animal hormone models.'
    ],
    targetOrgansMammals: ['Thyroid', 'Pancreas', 'Liver'],
    regulatoryStatus: {
      fda: 'Permitted up to 0.02% of fat content.',
      efsa: 'Permitted with an ADI of 0.5 mg/kg bw/day.',
      iarc: 'Not classified, but under continuous toxicology surveillance.',
      prop65: false,
    },
    summary: 'Synthetic antioxidant preservative often paired with BHA/BHT in meats, soup mixes, and gum. Equivocal cancer evidence in NTP rodent bioassays.',
    saferAlternatives: ['Ascorbyl palmitate', 'Mixed tocopherols']
  },
  'sodium benzoate': {
    name: 'Sodium Benzoate (with Ascorbic Acid)',
    synonyms: ['E211', 'Benzoate of soda'],
    isPreservative: true,
    mammalCarcinogenRisk: 'Moderate Risk',
    evidenceLevel: 'Anticipated / Probable Mammalian Carcinogen',
    animalStudies: [
      'When combined with Vitamin C (Ascorbic Acid) in beverages, reacts in the presence of heat/light to form Benzene, a known Group 1 human and mammalian leukemogen.',
      'Rodents exposed to benzene developed leukemia, lymphomas, and zymbal gland carcinomas.'
    ],
    targetOrgansMammals: ['Bone marrow (hematopoietic system)', 'Liver'],
    regulatoryStatus: {
      fda: 'Allowed up to 0.1% in foods; FDA monitors benzene levels in beverages to remain below 5 ppb.',
      efsa: 'Permitted with an ADI of 5 mg/kg bw/day.',
      iarc: 'Benzene is IARC Group 1 (Carcinogenic to humans). Pure benzoate is Group 3.',
      prop65: true,
    },
    summary: 'Widely used antifungal preservative in soft drinks, jams, and condiments. Poses severe mammalian cancer risk when formulated alongside Ascorbic Acid (Vitamin C), synthesizing carcinogenic Benzene.',
    saferAlternatives: ['Potassium sorbate', 'Citric acid', 'Aseptic packaging']
  }
};

export const COMMON_BIOENGINEERED_CROPS = [
  {
    crop: 'Corn (Field Corn / Maize)',
    prevalenceUS: '>92%',
    commonDerivatives: ['High Fructose Corn Syrup (HFCS)', 'Corn Starch', 'Dextrose', 'Maltodextrin', 'Corn Syrup Solids', 'Modified Corn Starch', 'Corn Oil', 'Zea mays'],
    explanation: 'Over 92% of US corn crops are genetically engineered for herbicide tolerance (glyphosate/glufosinate) or Bt insect resistance (USDA ERS).'
  },
  {
    crop: 'Soybeans (Glycine max)',
    prevalenceUS: '>95%',
    commonDerivatives: ['Soy Lecithin', 'Soy Protein Isolate', 'Hydrolyzed Soy Protein', 'Soybean Oil', 'Textured Vegetable Protein (TVP)', 'Soy Flour', 'Tocopherols (soy-derived)'],
    explanation: 'Over 95% of US soybeans are bioengineered for herbicide resistance.'
  },
  {
    crop: 'Canola (Rapeseed)',
    prevalenceUS: '>95%',
    commonDerivatives: ['Canola Oil', 'Rapeseed Oil', 'Hydrogenated Canola Oil'],
    explanation: 'Nearly all commercial canola grown in North America is genetically engineered.'
  },
  {
    crop: 'Sugar Beets',
    prevalenceUS: '>99%',
    commonDerivatives: ['Sugar', 'Beet Sugar', 'Invert Sugar', 'Molasses (beet)'],
    explanation: 'Unless specified as 100% Pure Cane Sugar or Organic Sugar, white granulated sugar in processed foods commonly derives from bioengineered sugar beets.'
  },
  {
    crop: 'Cottonseed',
    prevalenceUS: '>95%',
    commonDerivatives: ['Cottonseed Oil', 'Hydrogenated Cottonseed Oil'],
    explanation: 'Commonly used in potato chips and commercial frying shortenings.'
  },
  {
    crop: 'Synthetic Biology / Precision Fermentation',
    prevalenceUS: 'Rapidly Growing',
    commonDerivatives: ['Non-animal Whey Protein', 'Bioengineered Heme (leghemoglobin)', 'Fermented Flavors', 'Bioengineered Yeast Extracts'],
    explanation: 'Genetically engineered micro-organisms used to synthesize dairy proteins, flavor molecules, or heme.'
  }
];
