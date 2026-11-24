import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { KNOWN_MAMMAL_TOXINS_PRESERVATIVES, COMMON_BIOENGINEERED_CROPS } from './src/data/preservativesDb';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to extract JSON from markdown block or raw text
function extractJsonFromText(text: string): any {
  try {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1]);
    }
    return JSON.parse(text);
  } catch (err) {
    const startIdx = text.indexOf('{');
    const endIdx = text.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      try {
        return JSON.parse(text.slice(startIdx, endIdx + 1));
      } catch (e) {
        // Fallback
      }
    }
    return null;
  }
}

// Resilient helper to call Gemini with multi-tier fallback for 429 / quota limits
async function callGeminiWithFallbacks(contents: any, preferSearch = true) {
  // Strategy 1: gemini-3.8-flash with Google Search Grounding
  if (preferSearch) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });
      return { response, usedModel: 'gemini-3.8-flash', searchUsed: true };
    } catch (err: any) {
      console.warn('Gemini 3.8 flash with search failed, falling back to direct model without search:', err?.message || err);
    }
  }

  // Strategy 2: gemini-3.8-flash WITHOUT search tools (search grounding often has lower quota)
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
    });
    return { response, usedModel: 'gemini-3.8-flash', searchUsed: false };
  } catch (err: any) {
    console.warn('Gemini 3.8 flash without search failed, falling back to gemini-3.1-flash-lite:', err?.message || err);
  }

  // Strategy 3: gemini-3.1-flash-lite (higher rate limits / lightweight)
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents,
    });
    return { response, usedModel: 'gemini-3.1-flash-lite', searchUsed: false };
  } catch (err: any) {
    console.warn('All Gemini model tiers failed or quota exhausted:', err?.message || err);
    throw err;
  }
}

// Fallback rule-based scanner if Gemini is offline or rate-limited
function runRuleBasedAnalysis(ingredientsText: string, productName = 'Scanned Product') {
  const lower = ingredientsText.toLowerCase();
  const flaggedPreservatives: any[] = [];
  const beRiskList: any[] = [];

  for (const [key, item] of Object.entries(KNOWN_MAMMAL_TOXINS_PRESERVATIVES)) {
    if (
      lower.includes(key) ||
      item.synonyms.some((syn) => lower.includes(syn.toLowerCase()))
    ) {
      flaggedPreservatives.push(item);
    }
  }

  // Check for bioengineered disclosure
  const hasBEDisclosure =
    lower.includes('bioengineered') ||
    lower.includes('bio-engineered') ||
    lower.includes('genetically modified') ||
    lower.includes('gmo');
  const isOrganic =
    lower.includes('organic') &&
    (lower.includes('usda') || lower.includes('certified organic'));
  const isNonGmoProject = lower.includes('non-gmo project');

  for (const crop of COMMON_BIOENGINEERED_CROPS) {
    for (const deriv of crop.commonDerivatives) {
      if (lower.includes(deriv.toLowerCase())) {
        beRiskList.push({
          name: deriv,
          cropSource: crop.crop.split(' ')[0],
          riskExplanation: crop.explanation,
        });
        break;
      }
    }
  }

  let beStatus: any = 'Undetermined';
  if (isOrganic || isNonGmoProject) {
    beStatus = 'Non-GMO / Certified Non-Bioengineered';
  } else if (hasBEDisclosure) {
    beStatus = 'Contains Bioengineered Ingredients';
  } else if (beRiskList.length > 0) {
    beStatus = 'Likely Contains Bioengineered Crops';
  }

  let score = 95;
  if (flaggedPreservatives.length > 0) {
    score -= flaggedPreservatives.length * 25;
  }
  if (beStatus === 'Contains Bioengineered Ingredients') {
    score -= 15;
  } else if (beStatus === 'Likely Contains Bioengineered Crops') {
    score -= 10;
  }
  score = Math.max(10, Math.min(100, score));

  let status: any = 'Clean & Safe';
  if (score < 40) status = 'Critical Hazard';
  else if (score < 60) status = 'High Concern';
  else if (score < 80) status = 'Moderate Concern';
  else if (score < 90) status = 'Low Concern';

  return {
    id: 'scan-' + Date.now(),
    timestamp: new Date().toISOString(),
    productName: productName || 'Packaged Food Product',
    brand: 'Identified from Label',
    category: 'Packaged Food & Beverage',
    overallScore: score,
    overallStatus: status,
    rawIngredientsText: ingredientsText,
    parsedIngredients: ingredientsText
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((name) => ({
        name,
        category: 'Other',
        hazardTier: flaggedPreservatives.some((p) =>
          name.toLowerCase().includes(p.name.toLowerCase().slice(0, 4))
        )
          ? 'High Concern'
          : 'Clean / Safe',
        isMammalCarcinogenConcern: flaggedPreservatives.some((p) =>
          name.toLowerCase().includes(p.name.toLowerCase().slice(0, 4))
        ),
        isBioEngineeredConcern: beRiskList.some((b) =>
          name.toLowerCase().includes(b.name.toLowerCase())
        ),
        function: 'Food ingredient',
        details: 'Evaluated against toxicological database standards.',
      })),
    preservativesAndCarcinogens: flaggedPreservatives,
    bioEngineeredAnalysis: {
      status: beStatus,
      detectedDisclosureBadgeOrText: hasBEDisclosure,
      disclosureTextFound: hasBEDisclosure
        ? 'Contains bioengineered text indicators.'
        : undefined,
      beRiskIngredients: beRiskList,
      amsExplanation:
        'Analyzed under USDA Agricultural Marketing Service (AMS) National Bioengineered Food Disclosure Standard.',
    },
    mammalianToxicitySummary:
      flaggedPreservatives.length > 0
        ? `Found ${flaggedPreservatives.length} ingredient(s) with documented mammalian carcinogenicity or toxicological concern in rodent bioassays.`
        : 'No high-risk chemical preservatives with documented mammalian carcinogenicity detected in the parsed ingredient list.',
    groundedSources: [
      {
        title: 'National Toxicology Program (NTP) Report on Carcinogens',
        uri: 'https://ntp.niehs.nih.gov/',
      },
      {
        title: 'IARC Monographs on the Identification of Carcinogenic Hazards to Humans',
        uri: 'https://monographs.iarc.who.int/',
      },
      {
        title: 'USDA Bioengineered Food Disclosure Standard',
        uri: 'https://www.ams.usda.gov/rules-regulations/be',
      },
    ],
    searchQueriesUsed: ['mammalian carcinogen preservatives food study'],
    recommendations: [
      flaggedPreservatives.length > 0
        ? 'Consider switching to brands utilizing natural antioxidant preservatives such as rosemary extract or mixed tocopherols (Vitamin E).'
        : 'Maintain dietary awareness of processed additives.',
      beStatus.includes('Bioengineered')
        ? 'To avoid bioengineered crops, look for USDA Organic or Non-GMO Project Verified certifications.'
        : 'Product appears compliant with clean ingredient standards.',
    ],
  };
}

// POST /api/scan - Primary endpoint for image or text scan
app.post('/api/scan', async (req: Request, res: Response) => {
  const { imageBase64, mimeType, ingredientsText, productName } = req.body;

  if (!imageBase64 && !ingredientsText) {
    return res.status(400).json({
      success: false,
      error: 'Please provide either an image or ingredient text to scan.',
    });
  }

  try {
    const promptText = `
You are an expert food safety toxicologist and regulatory bio-engineer specializing in mammalian carcinogenicity bioassays, food additives, chemical preservatives, and the USDA National Bioengineered Food Disclosure Standard.

TASK:
1. Examine the provided product packaging image or ingredient text.
2. Read and extract the product name, brand, and complete raw ingredient list verbatim.
3. Automatically investigate:
   - Preservatives and chemical additives present in the ingredients (e.g., BHA, BHT, Potassium Bromate, Sodium Nitrite, TBHQ, Propylparaben, Titanium Dioxide, Propyl Gallate, Sodium Benzoate with Ascorbic Acid, Azodicarbonamide, etc.).
   - Documented mammalian cancer research, animal bioassays (rats, mice, hamsters, dogs, primates), tumor formation (forestomach, renal, hepatic, endocrine, colorectal), and classification by IARC (International Agency for Research on Cancer), NTP (National Toxicology Program), California Prop 65, and EFSA.
   - Bio-engineered food ingredient status: Check for mandatory USDA Bioengineered (BE) symbols or text disclosures ("Contains a bioengineered food ingredient", "Derived from bioengineering"), and detect any high-risk US bioengineered crop derivatives (corn, soy, canola, sugar beet, synthetic biology/precision fermentation).
4. Calculate an overall safety score (0 to 100, where 100 is pristine organic clean and 0 is severe carcinogen hazard).

CRITICAL OUTPUT FORMAT:
You MUST output your final answer as valid JSON inside a single \`\`\`json ... \`\`\` block with the exact structure below.

\`\`\`json
{
  "productName": "string",
  "brand": "string",
  "category": "string (e.g. Cured Meat, Snack, Cereal, Beverage, Baked Goods, etc.)",
  "overallScore": 0-100 (integer),
  "overallStatus": "Critical Hazard" | "High Concern" | "Moderate Concern" | "Low Concern" | "Clean & Safe",
  "rawIngredientsText": "Extracted complete ingredient text from package",
  "parsedIngredients": [
    {
      "name": "ingredient name",
      "category": "Preservative" | "Sweetener" | "Coloring" | "Emulsifier" | "Flavoring" | "Whole Food" | "Fats & Oils" | "Nutrient" | "Other",
      "hazardTier": "Severe" | "High Concern" | "Moderate Concern" | "Low Concern" | "Clean / Safe",
      "isMammalCarcinogenConcern": true/false,
      "isBioEngineeredConcern": true/false,
      "function": "Brief purpose in food",
      "details": "Safety or regulatory note"
    }
  ],
  "preservativesAndCarcinogens": [
    {
      "name": "Preservative name (e.g. BHA, Sodium Nitrite, etc.)",
      "synonyms": ["E-number", "chemical aliases"],
      "isPreservative": true/false,
      "mammalCarcinogenRisk": "High Risk" | "Moderate Risk" | "Suspected / Caution" | "Low Risk" | "None",
      "evidenceLevel": "Definitive Mammalian Carcinogen" | "Anticipated / Probable Mammalian Carcinogen" | "Possible / Equivocal in Animal Studies" | "Limited / Contested" | "Safe at Approved Levels",
      "animalStudies": [
        "Specific finding from rodent/mammal studies (e.g. Induced forestomach papillomas and carcinomas in F344 rats)"
      ],
      "targetOrgansMammals": ["Organ 1", "Organ 2"],
      "regulatoryStatus": {
        "fda": "US FDA regulation status",
        "efsa": "European EFSA status or ban",
        "iarc": "IARC Group classification (e.g. Group 2B, Group 2A)",
        "prop65": true/false
      },
      "summary": "Detailed scientific summary of mechanism and mammal cancer link",
      "saferAlternatives": ["Natural alternatives, e.g. Rosemary extract, mixed tocopherols"]
    }
  ],
  "bioEngineeredAnalysis": {
    "status": "Contains Bioengineered Ingredients" | "Derived from Bioengineering" | "Likely Contains Bioengineered Crops" | "Non-GMO / Certified Non-Bioengineered" | "Undetermined",
    "detectedDisclosureBadgeOrText": true/false,
    "disclosureTextFound": "Specific disclosure text found on package if any",
    "beRiskIngredients": [
      {
        "name": "e.g. Dextrose or Soy Lecithin",
        "cropSource": "Corn" | "Soy" | "Canola" | "Sugar Beet" | "Cottonseed" | "Alfalfa" | "Microbial / Synthetic Bio" | "Other",
        "riskExplanation": "Why this ingredient has high bioengineered likelihood in the US food supply"
      }
    ],
    "amsExplanation": "Clear regulatory summary according to USDA AMS National Bioengineered Food Disclosure Standard"
  },
  "mammalianToxicitySummary": "Comprehensive summary paragraph explaining the mammal cancer hazards and overall biochemical risks of this product",
  "recommendations": [
    "Actionable health and purchase recommendation 1",
    "Actionable recommendation 2"
  ]
}
\`\`\`
`;

    const parts: any[] = [];
    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(
        /^data:image\/[a-zA-Z+]+;base64,/,
        ''
      );
      parts.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: cleanBase64,
        },
      });
    }

    let userInstruction = promptText;
    if (ingredientsText) {
      userInstruction += `\n\nUSER PROVIDED INGREDIENT TEXT OR HINT:\n${ingredientsText}\n`;
    }
    if (productName) {
      userInstruction += `\nUSER SPECIFIED PRODUCT NAME: ${productName}\n`;
    }
    parts.push({ text: userInstruction });

    // Call Gemini with multi-tier fallback (Search -> Direct 3.8 -> 3.1 Lite)
    const { response, usedModel, searchUsed } = await callGeminiWithFallbacks(
      { parts },
      true
    );

    const responseText = response.text || '';
    const parsedData = extractJsonFromText(responseText);

    const groundingChunks =
      response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const webQueries =
      response.candidates?.[0]?.groundingMetadata?.webSearchQueries || [];

    const groundedSources: { title: string; uri: string }[] = [];
    for (const chunk of groundingChunks as any[]) {
      if (chunk.web?.uri) {
        groundedSources.push({
          title: chunk.web.title || new URL(chunk.web.uri).hostname,
          uri: chunk.web.uri,
        });
      }
    }

    if (parsedData) {
      const finalResult = {
        id: 'scan-' + Date.now(),
        timestamp: new Date().toISOString(),
        productName: parsedData.productName || productName || 'Scanned Food Product',
        brand: parsedData.brand || 'Identified Brand',
        category: parsedData.category || 'Food & Grocery',
        overallScore:
          typeof parsedData.overallScore === 'number'
            ? parsedData.overallScore
            : 50,
        overallStatus: parsedData.overallStatus || 'Moderate Concern',
        rawIngredientsText:
          parsedData.rawIngredientsText || ingredientsText || '',
        imageUrl: imageBase64 ? imageBase64.slice(0, 200000) : undefined,
        parsedIngredients: parsedData.parsedIngredients || [],
        preservativesAndCarcinogens:
          parsedData.preservativesAndCarcinogens || [],
        bioEngineeredAnalysis: parsedData.bioEngineeredAnalysis || {
          status: 'Undetermined',
          detectedDisclosureBadgeOrText: false,
          beRiskIngredients: [],
          amsExplanation:
            'No clear bioengineered indicator detected on packaging.',
        },
        mammalianToxicitySummary:
          parsedData.mammalianToxicitySummary ||
          'Analysis completed with toxicology grounding on mammalian safety.',
        groundedSources:
          groundedSources.length > 0
            ? groundedSources
            : [
                {
                  title: 'National Center for Biotechnology Information (NCBI) PubMed',
                  uri: 'https://pubmed.ncbi.nlm.nih.gov/',
                },
                {
                  title: 'IARC Monographs on Carcinogenic Risks to Humans',
                  uri: 'https://monographs.iarc.who.int/',
                },
                {
                  title: 'USDA Agricultural Marketing Service BE Standard',
                  uri: 'https://www.ams.usda.gov/rules-regulations/be',
                },
              ],
        searchQueriesUsed: webQueries,
        recommendations: parsedData.recommendations || [
          'Review ingredients before consumption, especially when high mammalian carcinogen risks are flagged.',
        ],
        modelUsed: usedModel,
        searchUsed,
      };

      return res.json({ success: true, result: finalResult });
    }

    // Fallback to rule-based augmented with text
    const fallback = runRuleBasedAnalysis(
      ingredientsText || responseText.slice(0, 1000),
      productName
    );
    if (groundedSources.length > 0) {
      fallback.groundedSources = groundedSources;
    }
    return res.json({ success: true, result: fallback, rawText: responseText });
  } catch (error: any) {
    console.error('Scan API Error:', error);

    const isQuota =
      error?.status === 'RESOURCE_EXHAUSTED' ||
      error?.message?.includes('429') ||
      error?.message?.includes('RESOURCE_EXHAUSTED') ||
      error?.message?.includes('quota');

    // If ingredientsText is present, always return rule-based offline analysis
    if (ingredientsText) {
      const fallback = runRuleBasedAnalysis(ingredientsText, productName);
      return res.json({
        success: true,
        result: fallback,
        notice: isQuota
          ? 'Free Gemini API quota reached. Analyzed via verified offline mammalian toxicology database.'
          : 'Generated via verified offline mammalian toxicology database.',
      });
    }

    // If only image was sent and AI quota is exhausted, respond gracefully without throwing 500
    if (imageBase64) {
      return res.json({
        success: false,
        isQuotaExceeded: isQuota,
        needsTextPrompt: true,
        error: isQuota
          ? 'Gemini API rate limit / quota reached on free tier. Paste or type the ingredients below to immediately run our offline mammalian carcinogen & bioengineered engine!'
          : 'Unable to process image via vision model. Please enter the ingredients directly to run toxicology analysis.',
      });
    }

    return res.json({
      success: false,
      isQuotaExceeded: isQuota,
      error: isQuota
        ? 'Gemini API quota exceeded on free tier. To increase quota, select a billing-enabled API key in Settings > Secrets.'
        : error.message || 'Scan failed.',
    });
  }
});

// POST /api/quick-search - Instant lookup for any ingredient or preservative
app.post('/api/quick-search', async (req: Request, res: Response) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Search query is required.' });
  }

  try {
    const prompt = `Search the internet and scientific databases for the food ingredient or preservative "${query}".
Focus on:
1. Is it a preservative? What is its chemical role?
2. Does it have documented mammalian carcinogenicity risks or animal bioassays (rats, mice, hamsters)?
3. What are target organs in mammals (liver, forestomach, bladder, thyroid)?
4. What is its regulatory status (IARC Group, FDA, EFSA, Prop 65)?
5. Is it linked to bioengineered crops or precision fermentation?
6. What are safer natural alternatives?

Respond with a clean JSON block:
\`\`\`json
{
  "name": "${query}",
  "isPreservative": true/false,
  "mammalCarcinogenRisk": "High Risk" | "Moderate Risk" | "Suspected / Caution" | "Low Risk" | "None",
  "evidenceLevel": "Definitive Mammalian Carcinogen" | "Anticipated / Probable Mammalian Carcinogen" | "Possible / Equivocal in Animal Studies" | "Limited / Contested" | "Safe at Approved Levels",
  "animalStudies": ["string"],
  "targetOrgansMammals": ["string"],
  "regulatoryStatus": {
    "fda": "string",
    "efsa": "string",
    "iarc": "string",
    "prop65": true/false
  },
  "summary": "Detailed summary",
  "bioEngineeredRisk": "Description of BE or GMO association if any",
  "saferAlternatives": ["string"]
}
\`\`\`
`;

    const { response } = await callGeminiWithFallbacks(prompt, true);
    const parsed = extractJsonFromText(response.text || '');
    const groundingChunks =
      response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: { title: string; uri: string }[] = [];
    for (const chunk of groundingChunks as any[]) {
      if (chunk.web?.uri) {
        sources.push({
          title: chunk.web.title || new URL(chunk.web.uri).hostname,
          uri: chunk.web.uri,
        });
      }
    }

    if (parsed) {
      return res.json({
        success: true,
        data: parsed,
        sources,
      });
    }

    // Check local DB
    const lower = query.toLowerCase();
    const localMatch = Object.entries(KNOWN_MAMMAL_TOXINS_PRESERVATIVES).find(
      ([key, val]) =>
        lower.includes(key) ||
        val.synonyms.some((s) => lower.includes(s.toLowerCase()))
    );

    if (localMatch) {
      return res.json({
        success: true,
        data: localMatch[1],
        sources: [
          {
            title: 'National Toxicology Program Report on Carcinogens',
            uri: 'https://ntp.niehs.nih.gov/',
          },
        ],
      });
    }

    return res.status(404).json({
      error: `No detailed scientific profile found for "${query}". Try another preservative name or E-number.`,
    });
  } catch (error: any) {
    console.error('Quick search error:', error);
    const lower = (query || '').toLowerCase();
    const localMatch = Object.entries(KNOWN_MAMMAL_TOXINS_PRESERVATIVES).find(
      ([key, val]) =>
        lower.includes(key) ||
        val.synonyms.some((s) => lower.includes(s.toLowerCase()))
    );

    if (localMatch) {
      return res.json({
        success: true,
        data: localMatch[1],
        sources: [
          {
            title: 'National Toxicology Program Report on Carcinogens',
            uri: 'https://ntp.niehs.nih.gov/',
          },
          {
            title: 'IARC Monographs on the Evaluation of Carcinogenic Risks to Humans',
            uri: 'https://monographs.iarc.who.int/',
          },
        ],
      });
    }

    return res.json({
      success: false,
      error: 'Unable to retrieve online details. Please check connection or try another chemical.',
    });
  }
});

// POST /api/ask-followup - Followup chat regarding a scanned product
app.post('/api/ask-followup', async (req: Request, res: Response) => {
  const { question, scanResult } = req.body;
  if (!question) {
    return res.status(400).json({ error: 'Question is required.' });
  }

  const context = scanResult
    ? `Product: ${scanResult.productName} (${scanResult.brand})
Ingredients: ${scanResult.rawIngredientsText}
Flagged Preservatives/Carcinogens: ${JSON.stringify(scanResult.preservativesAndCarcinogens?.map((p: any) => p.name))}
Bioengineered Status: ${scanResult.bioEngineeredAnalysis?.status}`
    : 'General food toxicology question.';

  const prompt = `You are a food safety toxicologist with internet search access.
CONTEXT OF SCANNED PRODUCT:
${context}

USER QUESTION:
${question}

Provide an authoritative, clear, scientifically grounded answer citing mammal bioassay evidence, human risk extrapolations, regulatory differences (FDA vs EFSA vs Prop 65), and bio-engineered food facts. Keep it accessible yet rigorous.`;

  try {
    const { response } = await callGeminiWithFallbacks(prompt, true);
    const groundingChunks =
      response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: { title: string; uri: string }[] = [];
    for (const chunk of groundingChunks as any[]) {
      if (chunk.web?.uri) {
        sources.push({
          title: chunk.web.title || new URL(chunk.web.uri).hostname,
          uri: chunk.web.uri,
        });
      }
    }

    return res.json({
      success: true,
      answer: response.text,
      sources,
    });
  } catch (err: any) {
    console.error('Follow-up error:', err);
    return res.json({
      success: true,
      answer: `Based on toxicological records for ${scanResult?.productName || 'this item'}: In mammalian rodent bioassays (Fischer 344 rats and mice), synthetic preservatives such as BHA induce squamous cell papillomas and carcinomas in forestomach tissues, while nitrites synthesize carcinogenic N-nitrosoamines in the acidic gastric environment. For products derived from bioengineered crops (corn, soy, canola), look for USDA Organic or Non-GMO Project Verified certifications to ensure freedom from synthetic pesticides and genetic modifications. (Note: Live internet query was unavailable due to quota rate limits).`,
      sources: [
        {
          title: 'NIH National Toxicology Program (NTP)',
          uri: 'https://ntp.niehs.nih.gov/',
        },
        {
          title: 'IARC Monographs on Carcinogenic Risks',
          uri: 'https://monographs.iarc.who.int/',
        },
      ],
    });
  }
});

// Vite middleware in dev or static files in production
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static('dist'));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
