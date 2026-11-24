import { SampleProduct } from '../types/scanner';

export const SAMPLE_PRODUCTS: SampleProduct[] = [
  {
    id: 'sample-cured-bacon',
    title: 'Hickory Smoked Cured Bacon & Breakfast Sausages',
    brand: 'Traditional Meats Co.',
    badge: 'High Preservative & BE Concern',
    description: 'Contains Sodium Nitrite preservative linked to N-nitrosamine carcinogens in rodents, plus high fructose corn syrup from BE corn.',
    ingredientsText: 'Pork, Water, Salt, Sugar, High Fructose Corn Syrup, Sodium Phosphates, Sodium Erythorbate, Flavorings, Sodium Nitrite (Preservative), BHA, BHT added with Citric Acid to protect flavor.',
    imageThumbnail: '🥓'
  },
  {
    id: 'sample-potato-chips',
    title: 'Flavored Crunchy Potato Chips & Snack Bites',
    brand: 'MegaSnack Brands',
    badge: 'TBHQ & BE Soy/Corn Detected',
    description: 'Preserved with TBHQ (Tertiary Butylhydroquinone) and fried in bioengineered canola and cottonseed oil, contains BE soy lecithin.',
    ingredientsText: 'Potatoes, Vegetable Oil (Contains one or more of: Canola Oil, Corn Oil, Cottonseed Oil), Salt, Dextrose, Monosodium Glutamate, Whey, Corn Starch, Onion Powder, Soy Lecithin, TBHQ (Antioxidant Preservative), Yellow 6 Lake, Red 40.',
    imageThumbnail: '🍟'
  },
  {
    id: 'sample-breakfast-cereal',
    title: 'Crunchy Frosted Toasted Oat & Corn Flakes',
    brand: 'Morning Crunch Inc.',
    badge: 'BHT Preservative & BE Disclosure',
    description: 'Features a USDA Bioengineered Food disclosure badge with BHT in packaging liner to prevent rancidity.',
    ingredientsText: 'Whole Grain Corn, Sugar, Corn Meal, Modified Corn Starch, Corn Syrup, Canola Oil, Salt, Brown Sugar Syrup, Bioengineered Sugar, Trisodium Phosphate, BHT added to packaging material to preserve freshness. Contains a Bioengineered Food Ingredient.',
    imageThumbnail: '🥣'
  },
  {
    id: 'sample-organic-clean',
    title: 'Artisan Organic Sprouted Seed & Rosemary Crackers',
    brand: 'Pure Botanical Harvest',
    badge: '100% Non-GMO & Naturally Preserved',
    description: 'USDA Organic and Non-GMO Project Verified. Uses organic rosemary extract instead of synthetic preservatives.',
    ingredientsText: 'Organic Sprouted Brown Rice, Organic Flax Seeds, Organic Quinoa, Organic Sesame Seeds, Organic Sunflower Oil, Sea Salt, Organic Rosemary Extract (Natural Antioxidant Preservative).',
    imageThumbnail: '🌿'
  }
];
