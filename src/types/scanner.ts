export interface CarcinogenPreservativeAlert {
  name: string;
  synonyms: string[];
  isPreservative: boolean;
  mammalCarcinogenRisk: 'High Risk' | 'Moderate Risk' | 'Suspected / Caution' | 'Low Risk' | 'None';
  evidenceLevel: 'Definitive Mammalian Carcinogen' | 'Anticipated / Probable Mammalian Carcinogen' | 'Possible / Equivocal in Animal Studies' | 'Limited / Contested' | 'Safe at Approved Levels';
  animalStudies: string[];
  targetOrgansMammals: string[];
  regulatoryStatus: {
    fda: string;
    efsa: string;
    iarc: string;
    prop65: boolean;
  };
  summary: string;
  saferAlternatives: string[];
}

export interface BioEngineeredAnalysis {
  status: 'Contains Bioengineered Ingredients' | 'Derived from Bioengineering' | 'Likely Contains Bioengineered Crops' | 'Non-GMO / Certified Non-Bioengineered' | 'Undetermined';
  detectedDisclosureBadgeOrText: boolean;
  disclosureTextFound?: string;
  beRiskIngredients: {
    name: string;
    cropSource: 'Corn' | 'Soy' | 'Canola' | 'Sugar Beet' | 'Cottonseed' | 'Alfalfa' | 'Microbial / Synthetic Bio' | 'Other';
    riskExplanation: string;
  }[];
  amsExplanation: string;
}

export interface IngredientItem {
  name: string;
  category: 'Preservative' | 'Sweetener' | 'Coloring' | 'Emulsifier' | 'Flavoring' | 'Whole Food' | 'Fats & Oils' | 'Nutrient' | 'Other';
  hazardTier: 'Severe' | 'High Concern' | 'Moderate Concern' | 'Low Concern' | 'Clean / Safe';
  isMammalCarcinogenConcern: boolean;
  isBioEngineeredConcern: boolean;
  function: string;
  details: string;
}

export interface GroundedSource {
  title: string;
  uri: string;
}

export interface ScanResult {
  id: string;
  timestamp: string;
  productName: string;
  brand: string;
  category: string;
  overallScore: number; // 0 - 100
  overallStatus: 'Critical Hazard' | 'High Concern' | 'Moderate Concern' | 'Low Concern' | 'Clean & Safe';
  rawIngredientsText: string;
  imageUrl?: string;
  parsedIngredients: IngredientItem[];
  preservativesAndCarcinogens: CarcinogenPreservativeAlert[];
  bioEngineeredAnalysis: BioEngineeredAnalysis;
  mammalianToxicitySummary: string;
  groundedSources: GroundedSource[];
  searchQueriesUsed?: string[];
  recommendations: string[];
}

export interface SampleProduct {
  id: string;
  title: string;
  brand: string;
  badge: string;
  description: string;
  ingredientsText: string;
  imageThumbnail: string;
}
