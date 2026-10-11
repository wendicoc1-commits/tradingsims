/**
 * @file geneticEngine.ts
 * @description Production-Grade Genetic Algorithm & Breeding Engine for Axie-like Monster Battlers.
 * Implements Mendelian Genetics (D 37.5%, R1 9.375%, R2 3.125%), 256-Bit Bitwise Gene Packing,
 * Pedigree Anti-Incest Validation, Exponential Cost Scaling, and Dynamic Stat Calculation.
 */

// ==========================================
// 1. DOMAIN TYPES & ENUMS
// ==========================================

export type CreatureClass =
  | 'Beast'
  | 'Plant'
  | 'Aquatic'
  | 'Bird'
  | 'Reptile'
  | 'Bug'
  | 'Mech'
  | 'Dusk'
  | 'Dawn';

export type BodyPartType = 'eyes' | 'ears' | 'mouth' | 'horn' | 'back' | 'tail';

/**
 * Official GTK2D special body types from unity-axie-gtk2d:
 * "body-normal", "body-bigyak", "body-curly", "body-fuzzy",
 * "body-spiky", "body-sumo", "body-wetdog", "body-frosty", "body-agamo"
 */
export type AxieBodyType =
  | 'bigyak'
  | 'curly'
  | 'frosty'
  | 'fuzzy'
  | 'nightmare'
  | 'normal'
  | 'spiky'
  | 'sumo'
  | 'wavy'
  | 'wetdog';

/**
 * Material Shaders & Variants for skin and body parts from unity-axie-gtk2d
 */
export type BodyMaterialType =
  | 'standard'
  | 'mystic'
  | 'bionic'
  | 'frost'
  | 'japan'
  | 'shadow';

export type GeneTier = 'D' | 'R1' | 'R2';

export type LifecycleStage = 'EGG' | 'LARVA' | 'ADULT';

export interface PartGene {
  id: string;
  name: string;
  class: CreatureClass;
  type: BodyPartType;
  binaryCode: number; // 0..1023 (10-bit integer)
  abilityCardId?: string;
}

export interface PartTiers {
  D: PartGene;   // Dominant allele (expressed physically)
  R1: PartGene;  // First Recessive allele
  R2: PartGene;  // Second Recessive allele
}

export interface CreatureGenes {
  class: CreatureClass;
  classBinary: number; // 4-bit representation
  pattern: number;     // 8-bit visual pattern
  color: number;       // 8-bit color index
  eyes: PartTiers;
  ears: PartTiers;
  mouth: PartTiers;
  horn: PartTiers;
  back: PartTiers;
  tail: PartTiers;
  rawBigInt: string;   // 256-bit hexadecimal string (e.g. 0x0000...)
}

export interface CreatureStats {
  hp: number;
  speed: number;
  skill: number;
  morale: number;
}

export interface Creature {
  id: string;
  name: string;
  ownerAddress: string;
  class: CreatureClass;
  genes: CreatureGenes;
  stats: CreatureStats;
  breedCount: number;
  maxBreedCount: number;
  sireId: string | null;   // Father ID
  matronId: string | null; // Mother ID
  stage: LifecycleStage;
  birthDate: string;
  hatchDate?: string;
  image?: string;
}

export interface BreedingCost {
  slp: number;
  axs: number;
  usdEquivalent: number;
}

export interface BreedingConfig {
  maxBreedCount: number;
  mutationRate: number; // e.g. 0.02 = 2% chance per part
  incubationHours: number; // default 120 hrs (5 days)
  slpUsdPrice: number;
  axsUsdPrice: number;
}

export interface BreedingValidation {
  canBreed: boolean;
  reasons: string[];
  cost: BreedingCost;
}

export interface InheritedGeneDetail {
  partType: BodyPartType;
  inheritedFrom: 'sire' | 'matron' | 'mutation';
  tier: 'D' | 'R1' | 'R2' | 'MUTATION';
  expressedGene: PartGene;
}

export interface BreedingResult {
  offspring: Creature;
  lineageValidation: 'PASSED';
  geneBreakdown: Record<BodyPartType, InheritedGeneDetail>;
  totalCostPaid: BreedingCost;
  txHash: string;
  incubatingUntil: string;
}

// ==========================================
// 2. CONSTANTS & SYSTEM TABLES
// ==========================================

export const DEFAULT_BREEDING_CONFIG: BreedingConfig = {
  maxBreedCount: 7,
  mutationRate: 0.02, // 2% mutation rate per allele
  incubationHours: 120, // 5 days
  slpUsdPrice: 0.0035,
  axsUsdPrice: 5.5,
};

/**
 * Mendelian probability weight distribution per parent (Total = 1000 = 100.0%)
 * Sire:   D = 37.5%, R1 = 9.375%, R2 = 3.125% -> 50.0%
 * Matron: D = 37.5%, R1 = 9.375%, R2 = 3.125% -> 50.0%
 */
export const MENDELIAN_WEIGHTS = {
  SIRE_D: 375,
  SIRE_R1: 93.75,
  SIRE_R2: 31.25,
  MATRON_D: 375,
  MATRON_R1: 93.75,
  MATRON_R2: 31.25,
};

/**
 * Exponential SLP Cost Curve per Parent's Breed Count (Axie Classic Standard)
 */
export const BREED_SLP_COST_TABLE: number[] = [
  1800,  // 0 -> 1st breed
  2700,  // 1 -> 2nd breed
  4500,  // 2 -> 3rd breed
  7200,  // 3 -> 4th breed
  11700, // 4 -> 5th breed
  18900, // 5 -> 6th breed
  30600, // 6 -> 7th breed
];

export const BASE_AXS_FEE = 0.5; // 0.5 AXS per parent = 1.0 AXS total

/**
 * Class Baseline Stats (Each sums to 164 points)
 */
export const BASE_CLASS_STATS: Record<CreatureClass, CreatureStats> = {
  Plant:   { hp: 61, speed: 31, skill: 31, morale: 41 },
  Aquatic: { hp: 39, speed: 57, skill: 35, morale: 33 },
  Beast:   { hp: 31, speed: 41, skill: 31, morale: 61 },
  Bird:    { hp: 27, speed: 61, skill: 35, morale: 41 },
  Reptile: { hp: 53, speed: 41, skill: 31, morale: 39 },
  Bug:     { hp: 35, speed: 35, skill: 35, morale: 59 },
  Mech:    { hp: 38, speed: 49, skill: 41, morale: 36 },
  Dusk:    { hp: 47, speed: 46, skill: 27, morale: 44 },
  Dawn:    { hp: 37, speed: 45, skill: 39, morale: 43 },
};

/**
 * Stat Modifiers per Expressed Body Part Class (Each part gives 4 total stat points)
 */
export const PART_CLASS_STAT_MODIFIERS: Record<CreatureClass, Partial<CreatureStats>> = {
  Plant:   { hp: 3, morale: 1 },
  Aquatic: { speed: 3, hp: 1 },
  Beast:   { morale: 3, speed: 1 },
  Bird:    { speed: 3, morale: 1 },
  Reptile: { hp: 3, speed: 1 },
  Bug:     { morale: 3, hp: 1 },
  Mech:    { speed: 2, skill: 2 },
  Dusk:    { hp: 2, speed: 2 },
  Dawn:    { skill: 2, hp: 2 },
};

export const CLASS_BINARY_MAP: Record<CreatureClass, number> = {
  Beast: 0,
  Bug: 1,
  Bird: 2,
  Plant: 3,
  Aquatic: 4,
  Reptile: 5,
  Mech: 6,
  Dusk: 7,
  Dawn: 8,
};

export const BINARY_CLASS_MAP: Record<number, CreatureClass> = {
  0: 'Beast',
  1: 'Bug',
  2: 'Bird',
  3: 'Plant',
  4: 'Aquatic',
  5: 'Reptile',
  6: 'Mech',
  7: 'Dusk',
  8: 'Dawn',
};

// Curated Part Catalog for Mutations & Part Lookups
export const KNOWN_PARTS_CATALOG: PartGene[] = [
  // EYES
  { id: 'eyes-puppy', name: 'Puppy', class: 'Beast', type: 'eyes', binaryCode: 1 },
  { id: 'eyes-papi', name: 'Papi', class: 'Plant', type: 'eyes', binaryCode: 2 },
  { id: 'eyes-gero', name: 'Gero', class: 'Aquatic', type: 'eyes', binaryCode: 3 },
  { id: 'eyes-mavis', name: 'Mavis', class: 'Bird', type: 'eyes', binaryCode: 4 },
  { id: 'eyes-tricky', name: 'Tricky', class: 'Reptile', type: 'eyes', binaryCode: 5 },
  { id: 'eyes-bookworm', name: 'Bookworm', class: 'Bug', type: 'eyes', binaryCode: 6 },
  // EARS
  { id: 'ears-nut-cracker', name: 'Nut Cracker', class: 'Beast', type: 'ears', binaryCode: 11 },
  { id: 'ears-clover', name: 'Clover', class: 'Plant', type: 'ears', binaryCode: 12 },
  { id: 'ears-gill', name: 'Gill', class: 'Aquatic', type: 'ears', binaryCode: 13 },
  { id: 'ears-owl', name: 'Owl', class: 'Bird', type: 'ears', binaryCode: 14 },
  { id: 'ears-curved-spine', name: 'Curved Spine', class: 'Reptile', type: 'ears', binaryCode: 15 },
  { id: 'ears-larva', name: 'Larva', class: 'Bug', type: 'ears', binaryCode: 16 },
  // MOUTH
  { id: 'mouth-nut-cracker', name: 'Nut Cracker', class: 'Beast', type: 'mouth', binaryCode: 21 },
  { id: 'mouth-serious', name: 'Serious', class: 'Plant', type: 'mouth', binaryCode: 22 },
  { id: 'mouth-fish-hook', name: 'Fish Hook', class: 'Aquatic', type: 'mouth', binaryCode: 23 },
  { id: 'mouth-peace-maker', name: 'Peace Maker', class: 'Bird', type: 'mouth', binaryCode: 24 },
  { id: 'mouth-kotaro', name: 'Kotaro', class: 'Reptile', type: 'mouth', binaryCode: 25 },
  { id: 'mouth-pliers', name: 'Pliers', class: 'Bug', type: 'mouth', binaryCode: 26 },
  // HORN
  { id: 'horn-imp', name: 'Imp', class: 'Beast', type: 'horn', binaryCode: 31 },
  { id: 'horn-cactus', name: 'Cactus', class: 'Plant', type: 'horn', binaryCode: 32 },
  { id: 'horn-anemone', name: 'Anemone', class: 'Aquatic', type: 'horn', binaryCode: 33 },
  { id: 'horn-eggshell', name: 'Eggshell', class: 'Bird', type: 'horn', binaryCode: 34 },
  { id: 'horn-cerastes', name: 'Cerastes', class: 'Reptile', type: 'horn', binaryCode: 35 },
  { id: 'horn-leaf-bug', name: 'Leaf Bug', class: 'Bug', type: 'horn', binaryCode: 36 },
  // BACK
  { id: 'back-ronin', name: 'Ronin', class: 'Beast', type: 'back', binaryCode: 41 },
  { id: 'back-pumpkin', name: 'Pumpkin', class: 'Plant', type: 'back', binaryCode: 42 },
  { id: 'back-goldfish', name: 'Goldfish', class: 'Aquatic', type: 'back', binaryCode: 43 },
  { id: 'back-tri-feather', name: 'Tri Feather', class: 'Bird', type: 'back', binaryCode: 44 },
  { id: 'back-tri-spikes', name: 'Tri Spikes', class: 'Reptile', type: 'back', binaryCode: 45 },
  { id: 'back-snail-shell', name: 'Snail Shell', class: 'Bug', type: 'back', binaryCode: 46 },
  // TAIL
  { id: 'tail-rice', name: 'Rice', class: 'Beast', type: 'tail', binaryCode: 51 },
  { id: 'tail-carrot', name: 'Carrot', class: 'Plant', type: 'tail', binaryCode: 52 },
  { id: 'tail-nimo', name: 'Nimo', class: 'Aquatic', type: 'tail', binaryCode: 53 },
  { id: 'tail-postfight', name: 'Postfight', class: 'Bird', type: 'tail', binaryCode: 54 },
  { id: 'tail-iguana', name: 'Iguana', class: 'Reptile', type: 'tail', binaryCode: 55 },
  { id: 'tail-gravel-ant', name: 'Gravel Ant', class: 'Bug', type: 'tail', binaryCode: 56 },
];

// ==========================================
// 3. GTK2D BODY TYPES & MATERIAL CATALOGS
// ==========================================

export interface BodyTypeDefinition {
  id: AxieBodyType;
  name: string;
  gtkMaterial: string; // Identifier from unity-axie-gtk2d (e.g. 'body-bigyak')
  description: string;
  icon: string;
  modifiers: { hp: number; speed: number; skill: number; morale: number };
}

export const BODY_TYPE_CATALOG: Record<AxieBodyType, BodyTypeDefinition> = {
  bigyak: {
    id: 'bigyak',
    name: 'Bigyak',
    gtkMaterial: 'body-bigyak',
    description: 'Bahu tebal berlapis mantel bulu lebat menjuntai, memberikan ketahanan HP superior.',
    icon: '🦬',
    modifiers: { hp: 4, speed: -2, skill: 0, morale: 1 },
  },
  curly: {
    id: 'curly',
    name: 'Curly',
    gtkMaterial: 'body-curly',
    description: 'Bulu wol melingkar rapat mirip awan domba yang elastis dan lincah.',
    icon: '🌀',
    modifiers: { hp: 0, speed: 2, skill: 2, morale: 0 },
  },
  frosty: {
    id: 'frosty',
    name: 'Frosty',
    gtkMaterial: 'body-frosty',
    description: 'Lapisan kristal salju abadi Arktik Lunacia bersyal rajut musim dingin.',
    icon: '❄️',
    modifiers: { hp: 3, speed: -1, skill: 2, morale: 0 },
  },
  fuzzy: {
    id: 'fuzzy',
    name: 'Fuzzy',
    gtkMaterial: 'body-fuzzy',
    description: 'Bulu kapas jabrik mengembang lembut ke segala arah, memicu Morale tinggi.',
    icon: '🧶',
    modifiers: { hp: -2, speed: 0, skill: 1, morale: 4 },
  },
  nightmare: {
    id: 'nightmare',
    name: 'Nightmare',
    gtkMaterial: 'body-nightmare',
    description: 'Tubuh hantu spektral bermata siklop raksasa dengan cakar mistis dari dimensi Dusk.',
    icon: '👁️',
    modifiers: { hp: -1, speed: 1, skill: 3, morale: 3 },
  },
  normal: {
    id: 'normal',
    name: 'Normal',
    gtkMaterial: 'body-normal',
    description: 'Siluet kacang polong klasik standar orisinal Lunacia yang 100% seimbang.',
    icon: '⚪',
    modifiers: { hp: 0, speed: 0, skill: 0, morale: 0 },
  },
  spiky: {
    id: 'spiky',
    name: 'Spiky',
    gtkMaterial: 'body-spiky',
    description: 'Karapas keras berduri tajam melengkung di punggung, memicu serangan kritikal.',
    icon: '🦔',
    modifiers: { hp: -1, speed: 1, skill: 3, morale: 2 },
  },
  sumo: {
    id: 'sumo',
    name: 'Sumo',
    gtkMaterial: 'body-sumo',
    description: 'Postur gempal raksasa super bulat masif bagai dinding pertahanan baja.',
    icon: '🛡️',
    modifiers: { hp: 5, speed: -3, skill: 0, morale: 2 },
  },
  wavy: {
    id: 'wavy',
    name: 'Wavy',
    gtkMaterial: 'body-wavy',
    description: 'Garis gelombang pusaran arus samudera dinamis berirama aliran air tenang.',
    icon: '🌊',
    modifiers: { hp: 1, speed: 3, skill: 1, morale: -1 },
  },
  wetdog: {
    id: 'wetdog',
    name: 'Wetdog',
    gtkMaterial: 'body-wetdog',
    description: 'Bulu basah kuyup menjuntai rendah ceper seperti anjing sehabis berenang.',
    icon: '🐕',
    modifiers: { hp: -1, speed: 4, skill: -1, morale: 1 },
  },
};

export interface BodyMaterialDefinition {
  id: BodyMaterialType;
  name: string;
  shaderTag: string;
  description: string;
  badge: string;
}

export const BODY_MATERIAL_CATALOG: Record<BodyMaterialType, BodyMaterialDefinition> = {
  standard: {
    id: 'standard',
    name: 'Standard Matte',
    shaderTag: 'Axie2D/Standard',
    description: 'Tekstur warna alami beresolusi tinggi standar Lunacia.',
    badge: 'bg-zinc-800 text-zinc-300',
  },
  mystic: {
    id: 'mystic',
    name: 'Mystic Prismatic',
    shaderTag: 'Axie2D/MysticFoil',
    description: 'Lapisan aurora prismatik berkilau mistis dengan rona magis.',
    badge: 'bg-purple-900/60 text-purple-300 border border-purple-500/40',
  },
  bionic: {
    id: 'bionic',
    name: 'Bionic Cyber Chrome',
    shaderTag: 'Axie2D/MetallicAlloy',
    description: 'Pelat paduan logam titanium krom tahan benturan.',
    badge: 'bg-cyan-900/60 text-cyan-300 border border-cyan-500/40',
  },
  frost: {
    id: 'frost',
    name: 'Sub-Zero Frost',
    shaderTag: 'Axie2D/GlacialGlass',
    description: 'Kristal es tembus pandang dengan kilauan beku musim dingin.',
    badge: 'bg-blue-900/60 text-blue-300 border border-blue-400/40',
  },
  japan: {
    id: 'japan',
    name: 'Origin Japan Lacquer',
    shaderTag: 'Axie2D/JapanGoldInlay',
    description: 'Pernis tradisional emas bertatahkan motif kelopak sakura.',
    badge: 'bg-rose-900/60 text-rose-300 border border-rose-500/40',
  },
  shadow: {
    id: 'shadow',
    name: 'Void Shadow Veil',
    shaderTag: 'Axie2D/DarkMatterShade',
    description: 'Aura kabut kegelapan malam dari kedalaman dimensi Dusk.',
    badge: 'bg-indigo-900/60 text-indigo-300 border border-indigo-500/40',
  },
};

// ==========================================
// 4. STAT & COST CALCULATORS
// ==========================================

/**
 * Calculates dynamic stats based on Class, 6 Dominant Body Parts, and GTK2D Body Type
 */
export function calculateCreatureStats(
  creatureClass: CreatureClass,
  expressedParts: Record<BodyPartType, PartGene>,
  bodyType: AxieBodyType = 'normal'
): CreatureStats {
  const base = { ...BASE_CLASS_STATS[creatureClass] };
  const partsArray = Object.values(expressedParts);

  for (const part of partsArray) {
    const mod = PART_CLASS_STAT_MODIFIERS[part.class] || {};
    base.hp += mod.hp || 0;
    base.speed += mod.speed || 0;
    base.skill += mod.skill || 0;
    base.morale += mod.morale || 0;
  }

  // Apply GTK2D Body Type Stat Modifiers
  const bodyMod = BODY_TYPE_CATALOG[bodyType]?.modifiers;
  if (bodyMod) {
    base.hp += bodyMod.hp;
    base.speed += bodyMod.speed;
    base.skill += bodyMod.skill;
    base.morale += bodyMod.morale;
  }

  return base;
}

/**
 * Backward compatibility alias for calculateCreatureStats
 */
export const calculateBaseStats = calculateCreatureStats;

/**
 * Calculates breeding fees (SLP + AXS) dynamically based on current breed counts
 */
export function calculateBreedingCost(
  sireBreedCount: number,
  matronBreedCount: number,
  config: BreedingConfig = DEFAULT_BREEDING_CONFIG
): BreedingCost {
  const sireSlp = BREED_SLP_COST_TABLE[Math.min(sireBreedCount, BREED_SLP_COST_TABLE.length - 1)] || 30600;
  const matronSlp = BREED_SLP_COST_TABLE[Math.min(matronBreedCount, BREED_SLP_COST_TABLE.length - 1)] || 30600;
  const totalSlp = sireSlp + matronSlp;
  const totalAxs = BASE_AXS_FEE * 2; // 1.0 AXS

  const usdEquivalent =
    totalSlp * config.slpUsdPrice + totalAxs * config.axsUsdPrice;

  return {
    slp: totalSlp,
    axs: totalAxs,
    usdEquivalent: Math.round(usdEquivalent * 100) / 100,
  };
}

// ==========================================
// 4. ANTI-ABUSE & INCEST PREVENTION
// ==========================================

/**
 * Validates breeding pair against:
 * 1. Self-breeding
 * 2. Breed count cap (7/7)
 * 3. Mature adult lifecycle check
 * 4. Incest rules: Parent-Offspring pairs, Full-siblings, Half-siblings
 */
export function validateBreedingPair(
  sire: Creature,
  matron: Creature,
  userCurrencies?: { slp: number; axs: number },
  config: BreedingConfig = DEFAULT_BREEDING_CONFIG
): BreedingValidation {
  const reasons: string[] = [];
  const cost = calculateBreedingCost(sire.breedCount, matron.breedCount, config);

  // 1. Same individual check
  if (sire.id === matron.id) {
    reasons.push('A creature cannot breed with itself (Autogamy forbidden).');
  }

  // 2. Lifecycle Stage
  if (sire.stage !== 'ADULT') {
    reasons.push(`Sire #${sire.id} is in ${sire.stage} stage and not mature enough to breed.`);
  }
  if (matron.stage !== 'ADULT') {
    reasons.push(`Matron #${matron.id} is in ${matron.stage} stage and not mature enough to breed.`);
  }

  // 3. Breed Count Limits
  if (sire.breedCount >= config.maxBreedCount) {
    reasons.push(`Sire #${sire.id} has reached maximum breed cap (${sire.breedCount}/${config.maxBreedCount}).`);
  }
  if (matron.breedCount >= config.maxBreedCount) {
    reasons.push(`Matron #${matron.id} has reached maximum breed cap (${matron.breedCount}/${config.maxBreedCount}).`);
  }

  // 4. Parent-Child incest prevention
  if (sire.id === matron.sireId || sire.id === matron.matronId) {
    reasons.push(`Parent-Offspring breeding violation: Sire #${sire.id} is a biological parent of Matron #${matron.id}.`);
  }
  if (matron.id === sire.sireId || matron.id === sire.matronId) {
    reasons.push(`Parent-Offspring breeding violation: Matron #${matron.id} is a biological parent of Sire #${sire.id}.`);
  }

  // 5. Sibling incest prevention (Shared Sire or Matron)
  const shareSire = sire.sireId !== null && matron.sireId !== null && sire.sireId === matron.sireId;
  const shareMatron = sire.matronId !== null && matron.matronId !== null && sire.matronId === matron.matronId;
  const crossSireMatron =
    (sire.sireId !== null && sire.sireId === matron.matronId) ||
    (sire.matronId !== null && sire.matronId === matron.sireId);

  if (shareSire || shareMatron || crossSireMatron) {
    reasons.push(
      `Sibling breeding violation: Creatures #${sire.id} and #${matron.id} share ancestral lineage.`
    );
  }

  // 6. Currency Balance Check (if provided)
  if (userCurrencies) {
    if (userCurrencies.slp < cost.slp) {
      reasons.push(`Insufficient SLP balance. Required: ${cost.slp}, Available: ${userCurrencies.slp}.`);
    }
    if (userCurrencies.axs < cost.axs) {
      reasons.push(`Insufficient AXS balance. Required: ${cost.axs}, Available: ${userCurrencies.axs}.`);
    }
  }

  return {
    canBreed: reasons.length === 0,
    reasons,
    cost,
  };
}

// ==========================================
// 5. 256-BIT GENE ENCODER / DECODER
// ==========================================

/**
 * Packs 6 parts × 3 gene tiers + class + pattern + color into a 256-bit BigInt
 * Bit allocation:
 * [255..252] Class (4 bits)
 * [251..244] Pattern (8 bits)
 * [243..236] Color (8 bits)
 * [235..204] Eyes (32 bits: D: 12b, R1: 10b, R2: 10b)
 * [203..172] Ears (32 bits)
 * [171..140] Mouth (32 bits)
 * [139..108] Horn (32 bits)
 * [107..76]  Back (32 bits)
 * [75..44]   Tail (32 bits)
 * [43..0]    Reserved (44 bits)
 */
export function encodeGenesToBigInt(genes: CreatureGenes): string {
  let bitmask = BigInt(0);

  // Class (4 bits)
  const classVal = BigInt(CLASS_BINARY_MAP[genes.class] ?? 0);
  bitmask |= (classVal & BigInt(0x0f)) << BigInt(252);

  // Pattern (8 bits)
  bitmask |= (BigInt(genes.pattern) & BigInt(0xff)) << BigInt(244);

  // Color (8 bits)
  bitmask |= (BigInt(genes.color) & BigInt(0xff)) << BigInt(236);

  // Helper to pack 3 tiers of a part into 32 bits
  const packPart = (tiers: PartTiers): bigint => {
    const dVal = BigInt(tiers.D.binaryCode) & BigInt(0x0fff);   // 12 bits
    const r1Val = BigInt(tiers.R1.binaryCode) & BigInt(0x03ff); // 10 bits
    const r2Val = BigInt(tiers.R2.binaryCode) & BigInt(0x03ff); // 10 bits
    return (dVal << BigInt(20)) | (r1Val << BigInt(10)) | r2Val;
  };

  bitmask |= packPart(genes.eyes) << BigInt(204);
  bitmask |= packPart(genes.ears) << BigInt(172);
  bitmask |= packPart(genes.mouth) << BigInt(140);
  bitmask |= packPart(genes.horn) << BigInt(108);
  bitmask |= packPart(genes.back) << BigInt(76);
  bitmask |= packPart(genes.tail) << BigInt(44);

  // Format as standard 64-char hex string with 0x prefix
  const hex = bitmask.toString(16).padStart(64, '0');
  return `0x${hex}`;
}

/**
 * Decodes a 256-bit BigInt hexadecimal string back into CreatureGenes
 */
export function decodeBigIntToGenes(hexString: string): {
  creatureClass: CreatureClass;
  pattern: number;
  color: number;
  partCodes: Record<BodyPartType, { D: number; R1: number; R2: number }>;
} {
  const cleanHex = hexString.startsWith('0x') ? hexString.slice(2) : hexString;
  const bitmask = BigInt(`0x${cleanHex}`);

  const classCode = Number((bitmask >> BigInt(252)) & BigInt(0x0f));
  const pattern = Number((bitmask >> BigInt(244)) & BigInt(0xff));
  const color = Number((bitmask >> BigInt(236)) & BigInt(0xff));

  const unpackPart = (shift: bigint) => {
    const partMask = (bitmask >> shift) & BigInt(0xffffffff);
    return {
      D: Number((partMask >> BigInt(20)) & BigInt(0x0fff)),
      R1: Number((partMask >> BigInt(10)) & BigInt(0x03ff)),
      R2: Number(partMask & BigInt(0x03ff)),
    };
  };

  return {
    creatureClass: BINARY_CLASS_MAP[classCode] || 'Plant',
    pattern,
    color,
    partCodes: {
      eyes: unpackPart(BigInt(204)),
      ears: unpackPart(BigInt(172)),
      mouth: unpackPart(BigInt(140)),
      horn: unpackPart(BigInt(108)),
      back: unpackPart(BigInt(76)),
      tail: unpackPart(BigInt(44)),
    },
  };
}

// ==========================================
// 6. GENETIC ROLL ENGINE (MENDELIAN)
// ==========================================

function getRandomPartBySlot(partType: BodyPartType, preferredClass?: CreatureClass): PartGene {
  const matched = KNOWN_PARTS_CATALOG.filter(
    (p) => p.type === partType && (!preferredClass || p.class === preferredClass)
  );
  if (matched.length > 0) {
    return matched[Math.floor(Math.random() * matched.length)];
  }
  const fallback = KNOWN_PARTS_CATALOG.filter((p) => p.type === partType);
  return fallback[Math.floor(Math.random() * fallback.length)];
}

/**
 * Rolls one gene allele from parents' pool using exact Mendelian probability:
 * Sire D (37.5%), Sire R1 (9.375%), Sire R2 (3.125%)
 * Matron D (37.5%), Matron R1 (9.375%), Matron R2 (3.125%)
 */
function rollSingleAllele(
  partType: BodyPartType,
  sirePart: PartTiers,
  matronPart: PartTiers,
  mutationRate: number
): { gene: PartGene; source: 'sire' | 'matron' | 'mutation'; tier: 'D' | 'R1' | 'R2' | 'MUTATION' } {
  // 1. Mutation Check
  if (Math.random() < mutationRate) {
    const mutated = getRandomPartBySlot(partType);
    return { gene: mutated, source: 'mutation', tier: 'MUTATION' };
  }

  // 2. Mendelian Roll (0 to 1000)
  const roll = Math.random() * 1000;

  if (roll < 375) {
    return { gene: sirePart.D, source: 'sire', tier: 'D' };
  } else if (roll < 468.75) {
    return { gene: sirePart.R1, source: 'sire', tier: 'R1' };
  } else if (roll < 500) {
    return { gene: sirePart.R2, source: 'sire', tier: 'R2' };
  } else if (roll < 875) {
    return { gene: matronPart.D, source: 'matron', tier: 'D' };
  } else if (roll < 968.75) {
    return { gene: matronPart.R1, source: 'matron', tier: 'R1' };
  } else {
    return { gene: matronPart.R2, source: 'matron', tier: 'R2' };
  }
}

/**
 * Rolls complete PartTiers (D, R1, R2) for a body part of the offspring
 */
function rollPartTiers(
  partType: BodyPartType,
  sirePart: PartTiers,
  matronPart: PartTiers,
  mutationRate: number
): { tiers: PartTiers; expressedDetail: InheritedGeneDetail } {
  // Roll Dominant (D) allele
  const dResult = rollSingleAllele(partType, sirePart, matronPart, mutationRate);

  // Roll R1 and R2 with slightly elevated mutation fallback
  const r1Result = rollSingleAllele(partType, sirePart, matronPart, mutationRate);
  const r2Result = rollSingleAllele(partType, sirePart, matronPart, mutationRate);

  return {
    tiers: {
      D: dResult.gene,
      R1: r1Result.gene,
      R2: r2Result.gene,
    },
    expressedDetail: {
      partType,
      inheritedFrom: dResult.source,
      tier: dResult.tier,
      expressedGene: dResult.gene,
    },
  };
}

/**
 * Rolls offspring class: 50% chance Sire class, 50% chance Matron class.
 * Rare cross-breed mutation produces Dawn/Dusk/Mech if conditions are met.
 */
function rollOffspringClass(sireClass: CreatureClass, matronClass: CreatureClass): CreatureClass {
  // Pure class match
  if (sireClass === matronClass) return sireClass;

  // Secret archetype fusion rules
  const set = new Set([sireClass, matronClass]);
  const roll = Math.random();

  if (set.has('Beast') && set.has('Bug') && roll < 0.33) return 'Mech';
  if (set.has('Reptile') && set.has('Plant') && roll < 0.33) return 'Dusk';
  if (set.has('Bird') && set.has('Aquatic') && roll < 0.33) return 'Dawn';

  // Standard 50/50 inheritance
  return Math.random() < 0.5 ? sireClass : matronClass;
}

// ==========================================
// 7. CORE BREEDING ENGINE FUNCTION
// ==========================================

/**
 * Executes full breeding transaction logic:
 * 1. Validates compatibility, breed counts, and lineage.
 * 2. Rolls Mendelian genetic inheritance for 6 body parts.
 * 3. Encodes 256-bit genetic binary hash.
 * 4. Computes dynamic creature base stats.
 * 5. Generates Egg state with incubation timer.
 */
export function breed(
  sire: Creature,
  matron: Creature,
  config: BreedingConfig = DEFAULT_BREEDING_CONFIG,
  userCurrencies?: { slp: number; axs: number }
): BreedingResult {
  // 1. Strict Validation
  const validation = validateBreedingPair(sire, matron, userCurrencies, config);
  if (!validation.canBreed) {
    throw new Error(`Breeding failed validation:\n- ${validation.reasons.join('\n- ')}`);
  }

  // 2. Class Inheritance
  const offspringClass = rollOffspringClass(sire.class, matron.class);

  // 3. Roll 6 Body Parts (D, R1, R2)
  const partTypes: BodyPartType[] = ['eyes', 'ears', 'mouth', 'horn', 'back', 'tail'];
  const generatedParts: Partial<Record<BodyPartType, PartTiers>> = {};
  const geneBreakdown: Partial<Record<BodyPartType, InheritedGeneDetail>> = {};
  const expressedParts: Partial<Record<BodyPartType, PartGene>> = {};

  for (const slot of partTypes) {
    const { tiers, expressedDetail } = rollPartTiers(
      slot,
      sire.genes[slot],
      matron.genes[slot],
      config.mutationRate
    );
    generatedParts[slot] = tiers;
    geneBreakdown[slot] = expressedDetail;
    expressedParts[slot] = tiers.D;
  }

  // 4. Pattern and Color genetics
  const pattern = Math.random() < 0.5 ? sire.genes.pattern : matron.genes.pattern;
  const color = Math.random() < 0.5 ? sire.genes.color : matron.genes.color;

  // 5. Construct Offspring Genes
  const fullGenes: CreatureGenes = {
    class: offspringClass,
    classBinary: CLASS_BINARY_MAP[offspringClass] || 0,
    pattern,
    color,
    eyes: generatedParts.eyes!,
    ears: generatedParts.ears!,
    mouth: generatedParts.mouth!,
    horn: generatedParts.horn!,
    back: generatedParts.back!,
    tail: generatedParts.tail!,
    rawBigInt: '0x0',
  };

  // 6. Encode to 256-Bit Hex BigInt
  fullGenes.rawBigInt = encodeGenesToBigInt(fullGenes);

  // 7. Calculate Dynamic Stats
  const dynamicStats = calculateCreatureStats(
    offspringClass,
    expressedParts as Record<BodyPartType, PartGene>
  );

  // 8. Timestamps & Lifecycle
  const now = new Date();
  const incubationMs = config.incubationHours * 60 * 60 * 1000;
  const hatchDate = new Date(now.getTime() + incubationMs).toISOString();
  const offspringId = `${Date.now()}${Math.floor(Math.random() * 1000)}`;

  // 9. Construct New Creature Object
  const offspring: Creature = {
    id: offspringId,
    name: `Lunacia Egg #${offspringId.slice(-4)}`,
    ownerAddress: sire.ownerAddress,
    class: offspringClass,
    genes: fullGenes,
    stats: dynamicStats,
    breedCount: 0,
    maxBreedCount: config.maxBreedCount,
    sireId: sire.id,
    matronId: matron.id,
    stage: 'EGG',
    birthDate: now.toISOString(),
    hatchDate,
    image: '/axies/egg_mystic.png',
  };

  // Generate simulated Web3 transaction hash
  const txHash = `0x${Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('')}`;

  return {
    offspring,
    lineageValidation: 'PASSED',
    geneBreakdown: geneBreakdown as Record<BodyPartType, InheritedGeneDetail>,
    totalCostPaid: validation.cost,
    txHash,
    incubatingUntil: hatchDate,
  };
}
