import { NextResponse } from 'next/server';
import {
  breed,
  validateBreedingPair,
  calculateBreedingCost,
  Creature,
  DEFAULT_BREEDING_CONFIG,
  CreatureGenes,
  KNOWN_PARTS_CATALOG,
  encodeGenesToBigInt,
} from '@/lib/axie/geneticEngine';

// In-memory persistent mock database for testing and demonstration
// In production, this maps directly to PostgreSQL / Supabase
const CREATURES_STORE: Map<string, Creature> = new Map();
const USER_BALANCES: Map<string, { slp: number; axs: number }> = new Map();

// Helper to seed sample parents if store is empty
function ensureSampleParents() {
  if (CREATURES_STORE.size > 0) return;

  const defaultOwner = '0x71c828236f4c6e9381515712f5a04467d589d873';

  // Parent 1: Pure Beast
  const beastGenes: CreatureGenes = {
    class: 'Beast',
    classBinary: 0,
    pattern: 12,
    color: 4,
    eyes: {
      D: KNOWN_PARTS_CATALOG.find((p) => p.id === 'eyes-puppy')!,
      R1: KNOWN_PARTS_CATALOG.find((p) => p.id === 'eyes-puppy')!,
      R2: KNOWN_PARTS_CATALOG.find((p) => p.id === 'eyes-papi')!,
    },
    ears: {
      D: KNOWN_PARTS_CATALOG.find((p) => p.id === 'ears-nut-cracker')!,
      R1: KNOWN_PARTS_CATALOG.find((p) => p.id === 'ears-nut-cracker')!,
      R2: KNOWN_PARTS_CATALOG.find((p) => p.id === 'ears-clover')!,
    },
    mouth: {
      D: KNOWN_PARTS_CATALOG.find((p) => p.id === 'mouth-nut-cracker')!,
      R1: KNOWN_PARTS_CATALOG.find((p) => p.id === 'mouth-nut-cracker')!,
      R2: KNOWN_PARTS_CATALOG.find((p) => p.id === 'mouth-serious')!,
    },
    horn: {
      D: KNOWN_PARTS_CATALOG.find((p) => p.id === 'horn-imp')!,
      R1: KNOWN_PARTS_CATALOG.find((p) => p.id === 'horn-imp')!,
      R2: KNOWN_PARTS_CATALOG.find((p) => p.id === 'horn-cactus')!,
    },
    back: {
      D: KNOWN_PARTS_CATALOG.find((p) => p.id === 'back-ronin')!,
      R1: KNOWN_PARTS_CATALOG.find((p) => p.id === 'back-ronin')!,
      R2: KNOWN_PARTS_CATALOG.find((p) => p.id === 'back-pumpkin')!,
    },
    tail: {
      D: KNOWN_PARTS_CATALOG.find((p) => p.id === 'tail-rice')!,
      R1: KNOWN_PARTS_CATALOG.find((p) => p.id === 'tail-rice')!,
      R2: KNOWN_PARTS_CATALOG.find((p) => p.id === 'tail-carrot')!,
    },
    rawBigInt: '0x0',
  };
  beastGenes.rawBigInt = encodeGenesToBigInt(beastGenes);

  const sire: Creature = {
    id: '1001',
    name: 'Dual Blade Alpha Sire',
    ownerAddress: defaultOwner,
    class: 'Beast',
    genes: beastGenes,
    stats: { hp: 35, speed: 43, skill: 31, morale: 59 },
    breedCount: 1,
    maxBreedCount: 7,
    sireId: null,
    matronId: null,
    stage: 'ADULT',
    birthDate: '2026-01-15T00:00:00Z',
    image: '/axies/sprite_yellow_fluffy.png',
  };

  // Parent 2: Pure Plant Tank
  const plantGenes: CreatureGenes = {
    class: 'Plant',
    classBinary: 3,
    pattern: 5,
    color: 2,
    eyes: {
      D: KNOWN_PARTS_CATALOG.find((p) => p.id === 'eyes-papi')!,
      R1: KNOWN_PARTS_CATALOG.find((p) => p.id === 'eyes-papi')!,
      R2: KNOWN_PARTS_CATALOG.find((p) => p.id === 'eyes-bookworm')!,
    },
    ears: {
      D: KNOWN_PARTS_CATALOG.find((p) => p.id === 'ears-clover')!,
      R1: KNOWN_PARTS_CATALOG.find((p) => p.id === 'ears-clover')!,
      R2: KNOWN_PARTS_CATALOG.find((p) => p.id === 'ears-larva')!,
    },
    mouth: {
      D: KNOWN_PARTS_CATALOG.find((p) => p.id === 'mouth-serious')!,
      R1: KNOWN_PARTS_CATALOG.find((p) => p.id === 'mouth-serious')!,
      R2: KNOWN_PARTS_CATALOG.find((p) => p.id === 'mouth-pliers')!,
    },
    horn: {
      D: KNOWN_PARTS_CATALOG.find((p) => p.id === 'horn-cactus')!,
      R1: KNOWN_PARTS_CATALOG.find((p) => p.id === 'horn-cactus')!,
      R2: KNOWN_PARTS_CATALOG.find((p) => p.id === 'horn-leaf-bug')!,
    },
    back: {
      D: KNOWN_PARTS_CATALOG.find((p) => p.id === 'back-pumpkin')!,
      R1: KNOWN_PARTS_CATALOG.find((p) => p.id === 'back-pumpkin')!,
      R2: KNOWN_PARTS_CATALOG.find((p) => p.id === 'back-snail-shell')!,
    },
    tail: {
      D: KNOWN_PARTS_CATALOG.find((p) => p.id === 'tail-carrot')!,
      R1: KNOWN_PARTS_CATALOG.find((p) => p.id === 'tail-carrot')!,
      R2: KNOWN_PARTS_CATALOG.find((p) => p.id === 'tail-gravel-ant')!,
    },
    rawBigInt: '0x0',
  };
  plantGenes.rawBigInt = encodeGenesToBigInt(plantGenes);

  const matron: Creature = {
    id: '1002',
    name: 'Verdant Shield Matron',
    ownerAddress: defaultOwner,
    class: 'Plant',
    genes: plantGenes,
    stats: { hp: 61, speed: 31, skill: 31, morale: 41 },
    breedCount: 0,
    maxBreedCount: 7,
    sireId: null,
    matronId: null,
    stage: 'ADULT',
    birthDate: '2026-02-10T00:00:00Z',
    image: '/axies/sprite_blue_eyes_plant.png',
  };

  CREATURES_STORE.set(sire.id, sire);
  CREATURES_STORE.set(matron.id, matron);

  // Set default initial player balances
  USER_BALANCES.set(defaultOwner, {
    slp: 50000,
    axs: 25.0,
  });
}

// ==========================================
// GET: PREVIEW BREEDING VALIDATION & COST
// ==========================================
export async function GET(request: Request) {
  ensureSampleParents();
  const { searchParams } = new URL(request.url);
  const sireId = searchParams.get('sireId');
  const matronId = searchParams.get('matronId');
  const owner = searchParams.get('owner') || '0x71c828236f4c6e9381515712f5a04467d589d873';

  // List all available adult creatures if no parameters
  if (!sireId && !matronId) {
    const list = Array.from(CREATURES_STORE.values());
    const balance = USER_BALANCES.get(owner) || { slp: 0, axs: 0 };
    return NextResponse.json({
      creatures: list,
      userWallet: balance,
      costTable: calculateBreedingCost(0, 0),
    });
  }

  const sire = sireId ? CREATURES_STORE.get(sireId) : null;
  const matron = matronId ? CREATURES_STORE.get(matronId) : null;

  if (!sire || !matron) {
    return NextResponse.json(
      { error: 'One or both parents could not be found in the registry.' },
      { status: 404 }
    );
  }

  const userBalance = USER_BALANCES.get(owner) || { slp: 0, axs: 0 };
  const validation = validateBreedingPair(sire, matron, userBalance, DEFAULT_BREEDING_CONFIG);

  return NextResponse.json({
    sire: { id: sire.id, name: sire.name, class: sire.class, breedCount: sire.breedCount },
    matron: { id: matron.id, name: matron.name, class: matron.class, breedCount: matron.breedCount },
    validation,
    walletBalance: userBalance,
  });
}

// ==========================================
// POST: EXECUTE BREEDING TRANSACTION
// ==========================================
export async function POST(request: Request) {
  ensureSampleParents();

  try {
    const body = await request.json();
    const { sireId, matronId, ownerAddress = '0x71c828236f4c6e9381515712f5a04467d589d873' } = body;

    if (!sireId || !matronId) {
      return NextResponse.json(
        { error: 'Both sireId and matronId are required to breed.' },
        { status: 400 }
      );
    }

    const sire = CREATURES_STORE.get(sireId);
    const matron = CREATURES_STORE.get(matronId);

    if (!sire || !matron) {
      return NextResponse.json(
        { error: 'Selected parent creatures not found in system.' },
        { status: 404 }
      );
    }

    // Check user balance
    let userWallet = USER_BALANCES.get(ownerAddress);
    if (!userWallet) {
      userWallet = { slp: 20000, axs: 10 };
      USER_BALANCES.set(ownerAddress, userWallet);
    }

    // 1. Validation Pre-Flight
    const validation = validateBreedingPair(sire, matron, userWallet, DEFAULT_BREEDING_CONFIG);
    if (!validation.canBreed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Breeding requirements not met',
          reasons: validation.reasons,
        },
        { status: 422 }
      );
    }

    // 2. Execute Genetic Algorithm
    const result = breed(sire, matron, DEFAULT_BREEDING_CONFIG, userWallet);

    // 3. Deduct Currency Balances atomically
    userWallet.slp -= result.totalCostPaid.slp;
    userWallet.axs -= result.totalCostPaid.axs;

    // 4. Increment Parent Breed Counts
    sire.breedCount += 1;
    matron.breedCount += 1;

    // 5. Store Offspring Egg into registry
    CREATURES_STORE.set(result.offspring.id, result.offspring);

    return NextResponse.json({
      success: true,
      message: 'Breeding completed! Offspring Egg produced.',
      offspring: result.offspring,
      genes256Bit: result.offspring.genes.rawBigInt,
      lineageCheck: result.lineageValidation,
      geneInheritanceAudit: result.geneBreakdown,
      feesDeducted: result.totalCostPaid,
      txHash: result.txHash,
      incubatingUntil: result.incubatingUntil,
      updatedParents: {
        sireBreedCount: `${sire.breedCount}/7`,
        matronBreedCount: `${matron.breedCount}/7`,
      },
      updatedWallet: userWallet,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Internal breeding failure',
      },
      { status: 500 }
    );
  }
}
