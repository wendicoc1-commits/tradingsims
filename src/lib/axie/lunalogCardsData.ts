/**
 * @file lunalogCardsData.ts
 * @description Official Lunalog Catalog & Axie Origins Battle Cards & Evolution Registry.
 * Maps body parts, special collections (Mystic, Japan, Xmas, Nightmare), and Stage 1 vs Stage 2 Evolution.
 */

export type PartCollectionType = 'normal' | 'mystic' | 'japan' | 'xmas' | 'summer' | 'nightmare';

export interface LunalogCardStage {
  energy: number;
  damage: number;
  shield: number;
  name: string;
  effect: string;
  badge?: string;
}

export interface LunalogPartInfo {
  id: string;
  partSlot: 'eyes' | 'ears' | 'mouth' | 'horn' | 'back' | 'tail';
  class: 'Beast' | 'Plant' | 'Aquatic' | 'Bird' | 'Bug' | 'Reptile';
  name: string;
  collection: PartCollectionType;
  stage1: LunalogCardStage;
  stage2: LunalogCardStage;
}

export const LUNALOG_PARTS_REGISTRY: Record<string, LunalogPartInfo> = {
  // ==========================================
  // BEAST PARTS
  // ==========================================
  'horn-nut-cracker': {
    id: 'horn-nut-cracker',
    partSlot: 'horn',
    class: 'Beast',
    name: 'Nut Cracker (Horn)',
    collection: 'normal',
    stage1: {
      energy: 1,
      damage: 105,
      shield: 30,
      name: 'Nut Crack',
      effect: 'Deals 120% damage when comboed with another Nut Cracker card.',
    },
    stage2: {
      energy: 1,
      damage: 125,
      shield: 40,
      name: 'Nut Crack (Lv.2 Evolved)',
      effect: 'Deals 135% damage when comboed with another Nut Cracker card. Retains 1 energy on lethal strike.',
      badge: '⭐ Evolved Mastery',
    },
  },
  'horn-dual-blade': {
    id: 'horn-dual-blade',
    partSlot: 'horn',
    class: 'Beast',
    name: 'Dual Blade',
    collection: 'normal',
    stage1: {
      energy: 1,
      damage: 130,
      shield: 20,
      name: 'Sinister Strike',
      effect: 'Deals 250% damage on critical strikes.',
    },
    stage2: {
      energy: 1,
      damage: 155,
      shield: 25,
      name: 'Sinister Strike (Lv.2 Evolved)',
      effect: 'Deals 275% damage on critical strikes. Gains +1 Morale stack upon activation.',
      badge: '⭐ Evolved Mastery',
    },
  },
  'horn-arco': {
    id: 'horn-arco',
    partSlot: 'horn',
    class: 'Beast',
    name: 'Arco (Acrobatic)',
    collection: 'normal',
    stage1: {
      energy: 1,
      damage: 100,
      shield: 50,
      name: 'Acrobatic',
      effect: 'Gain Speed+ for 2 rounds when attacking.',
    },
    stage2: {
      energy: 1,
      damage: 120,
      shield: 60,
      name: 'Acrobatic (Lv.2 Evolved)',
      effect: 'Gain Speed+ and Cleanse 1 negative status effect for 2 rounds.',
      badge: '⭐ Evolved Mastery',
    },
  },
  'mouth-nut-cracker': {
    id: 'mouth-nut-cracker',
    partSlot: 'mouth',
    class: 'Beast',
    name: 'Nut Cracker (Mouth)',
    collection: 'normal',
    stage1: {
      energy: 1,
      damage: 105,
      shield: 30,
      name: 'Nut Bite',
      effect: 'Deals 120% damage when comboed with another Nut Cracker card.',
    },
    stage2: {
      energy: 1,
      damage: 125,
      shield: 40,
      name: 'Nut Bite (Lv.2 Evolved)',
      effect: 'Deals 135% damage when comboed. Targets lowest HP enemy.',
      badge: '⭐ Evolved Mastery',
    },
  },
  'mouth-goda': {
    id: 'mouth-goda',
    partSlot: 'mouth',
    class: 'Beast',
    name: 'Goda',
    collection: 'normal',
    stage1: {
      energy: 1,
      damage: 80,
      shield: 40,
      name: 'Piercing Gaze',
      effect: 'Destroy 1 of your opponent’s Energy.',
    },
    stage2: {
      energy: 1,
      damage: 100,
      shield: 50,
      name: 'Piercing Gaze (Lv.2 Evolved)',
      effect: 'Destroy 1 enemy Energy and Steal 1 Energy if comboed with Beast card.',
      badge: '⭐ Evolved Mastery',
    },
  },
  'back-ronin': {
    id: 'back-ronin',
    partSlot: 'back',
    class: 'Beast',
    name: 'Ronin',
    collection: 'normal',
    stage1: {
      energy: 1,
      damage: 75,
      shield: 0,
      name: 'Single Combat',
      effect: 'Guaranteed critical strike when comboed with at least 2 other cards.',
    },
    stage2: {
      energy: 1,
      damage: 95,
      shield: 10,
      name: 'Single Combat (Lv.2 Evolved)',
      effect: 'Guaranteed critical strike and penetrates 20% enemy Shield.',
      badge: '⭐ Evolved Mastery',
    },
  },
  'back-hero': {
    id: 'back-hero',
    partSlot: 'back',
    class: 'Beast',
    name: 'Hero',
    collection: 'normal',
    stage1: {
      energy: 1,
      damage: 60,
      shield: 0,
      name: 'Heroic Reward',
      effect: 'Draw a card when attacking an Aquatic, Bird, or Dawn Axie.',
    },
    stage2: {
      energy: 1,
      damage: 80,
      shield: 15,
      name: 'Heroic Reward (Lv.2 Evolved)',
      effect: 'Draw 2 cards and gain 10 Morale when attacking class advantage.',
      badge: '⭐ Evolved Mastery',
    },
  },
  'tail-cottontail': {
    id: 'tail-cottontail',
    partSlot: 'tail',
    class: 'Beast',
    name: 'Cottontail',
    collection: 'normal',
    stage1: {
      energy: 0,
      damage: 0,
      shield: 0,
      name: 'Luna Absorb',
      effect: 'Gain 1 Energy instantly.',
    },
    stage2: {
      energy: 0,
      damage: 30,
      shield: 15,
      name: 'Luna Absorb (Lv.2 Evolved)',
      effect: 'Gain 1 Energy and remove 1 random debuff from this Axie.',
      badge: '⭐ Evolved Mastery',
    },
  },
  'tail-rice': {
    id: 'tail-rice',
    partSlot: 'tail',
    class: 'Beast',
    name: 'Rice',
    collection: 'normal',
    stage1: {
      energy: 1,
      damage: 80,
      shield: 10,
      name: 'Night Steal',
      effect: 'Steal 1 Energy from your opponent when comboed with another card.',
    },
    stage2: {
      energy: 1,
      damage: 100,
      shield: 20,
      name: 'Night Steal (Lv.2 Evolved)',
      effect: 'Steal 1 Energy and inflict Vulnerable for 2 rounds.',
      badge: '⭐ Evolved Mastery',
    },
  },

  // ==========================================
  // PLANT PARTS
  // ==========================================
  'horn-cactus': {
    id: 'horn-cactus',
    partSlot: 'horn',
    class: 'Plant',
    name: 'Cactus',
    collection: 'normal',
    stage1: {
      energy: 1,
      damage: 110,
      shield: 20,
      name: 'Prickly Trap',
      effect: 'Deals 120% damage if this Axie attacks last.',
    },
    stage2: {
      energy: 1,
      damage: 135,
      shield: 30,
      name: 'Prickly Trap (Lv.2 Evolved)',
      effect: 'Deals 140% damage if this Axie attacks last. Reflets 15% damage taken.',
      badge: '⭐ Evolved Mastery',
    },
  },
  'horn-rose-bud': {
    id: 'horn-rose-bud',
    partSlot: 'horn',
    class: 'Plant',
    name: 'Rose Bud',
    collection: 'normal',
    stage1: {
      energy: 1,
      damage: 0,
      shield: 40,
      name: 'Healing Aroma',
      effect: 'Heal this Axie for 120 HP.',
    },
    stage2: {
      energy: 1,
      damage: 25,
      shield: 60,
      name: 'Healing Aroma (Lv.2 Evolved)',
      effect: 'Heal this Axie for 160 HP and grant Cleanse.',
      badge: '⭐ Evolved Mastery',
    },
  },
  'mouth-serious': {
    id: 'mouth-serious',
    partSlot: 'mouth',
    class: 'Plant',
    name: 'Serious',
    collection: 'normal',
    stage1: {
      energy: 1,
      damage: 30,
      shield: 30,
      name: 'Vegetal Bite',
      effect: 'Steal 1 Energy from your opponent when comboed with another card.',
    },
    stage2: {
      energy: 1,
      damage: 50,
      shield: 45,
      name: 'Vegetal Bite (Lv.2 Evolved)',
      effect: 'Steal 1 Energy and heal 40 HP when comboed with another card.',
      badge: '⭐ Evolved Mastery',
    },
  },
  'mouth-zigzag': {
    id: 'mouth-zigzag',
    partSlot: 'mouth',
    class: 'Plant',
    name: 'Zigzag',
    collection: 'normal',
    stage1: {
      energy: 1,
      damage: 60,
      shield: 60,
      name: 'Drain Bite',
      effect: 'Heal this Axie for 100% of the damage dealt by this card.',
    },
    stage2: {
      energy: 1,
      damage: 85,
      shield: 75,
      name: 'Drain Bite (Lv.2 Evolved)',
      effect: 'Heal for 120% of damage dealt and gain Taunt for 1 turn.',
      badge: '⭐ Evolved Mastery',
    },
  },
  'back-pumpkin': {
    id: 'back-pumpkin',
    partSlot: 'back',
    class: 'Plant',
    name: 'Pumpkin',
    collection: 'normal',
    stage1: {
      energy: 1,
      damage: 0,
      shield: 110,
      name: 'October Treat',
      effect: 'Draw a card if this Axie’s shield doesn’t break this round.',
    },
    stage2: {
      energy: 1,
      damage: 15,
      shield: 140,
      name: 'October Treat (Lv.2 Evolved)',
      effect: 'Draw 2 cards and gain 20 bonus shield next turn if unbroken.',
      badge: '⭐ Evolved Mastery',
    },
  },
  'tail-carrot': {
    id: 'tail-carrot',
    partSlot: 'tail',
    class: 'Plant',
    name: 'Carrot',
    collection: 'normal',
    stage1: {
      energy: 1,
      damage: 70,
      shield: 40,
      name: 'Carrot Hammer',
      effect: 'Gain 1 Energy if this Axie’s shield breaks. Can only trigger once per round.',
    },
    stage2: {
      energy: 1,
      damage: 90,
      shield: 55,
      name: 'Carrot Hammer (Lv.2 Evolved)',
      effect: 'Gain 1 Energy and 30 bonus shield when shield breaks.',
      badge: '⭐ Evolved Mastery',
    },
  },

  // ==========================================
  // AQUATIC PARTS
  // ==========================================
  'horn-clamshell': {
    id: 'horn-clamshell',
    partSlot: 'horn',
    class: 'Aquatic',
    name: 'Clamshell',
    collection: 'normal',
    stage1: {
      energy: 1,
      damage: 110,
      shield: 40,
      name: 'Clam Slash',
      effect: 'Gain Attack+ when attacking Beast, Bug, or Mech Axies.',
    },
    stage2: {
      energy: 1,
      damage: 130,
      shield: 50,
      name: 'Clam Slash (Lv.2 Evolved)',
      effect: 'Gain Attack+ and Pierce 15% armor when attacking class advantage.',
      badge: '⭐ Evolved Mastery',
    },
  },
  'mouth-risky-fish': {
    id: 'mouth-risky-fish',
    partSlot: 'mouth',
    class: 'Aquatic',
    name: 'Risky Fish',
    collection: 'normal',
    stage1: {
      energy: 1,
      damage: 110,
      shield: 30,
      name: 'Fish Hook',
      effect: 'Gain Attack+ when attacking Plant, Reptile, or Dusk targets.',
    },
    stage2: {
      energy: 1,
      damage: 135,
      shield: 40,
      name: 'Fish Hook (Lv.2 Evolved)',
      effect: 'Gain Attack+ for 2 rounds and apply Bleed on target.',
      badge: '⭐ Evolved Mastery',
    },
  },
  'back-goldfish': {
    id: 'back-goldfish',
    partSlot: 'back',
    class: 'Aquatic',
    name: 'Goldfish',
    collection: 'normal',
    stage1: {
      energy: 1,
      damage: 110,
      shield: 20,
      name: 'Swift Escape',
      effect: 'Gain Speed+ for 2 rounds when attacked.',
    },
    stage2: {
      energy: 1,
      damage: 130,
      shield: 30,
      name: 'Swift Escape (Lv.2 Evolved)',
      effect: 'Gain Speed+ and 10% Dodge chance for 2 rounds when attacked.',
      badge: '⭐ Evolved Mastery',
    },
  },
  'tail-nimo': {
    id: 'tail-nimo',
    partSlot: 'tail',
    class: 'Aquatic',
    name: 'Nimo',
    collection: 'normal',
    stage1: {
      energy: 0,
      damage: 30,
      shield: 0,
      name: 'Tail Slap',
      effect: 'Gain 1 Energy when comboed with another card.',
    },
    stage2: {
      energy: 0,
      damage: 55,
      shield: 15,
      name: 'Tail Slap (Lv.2 Evolved)',
      effect: 'Gain 1 Energy and draw 1 card when comboed with another card.',
      badge: '⭐ Evolved Mastery',
    },
  },
  'tail-koi': {
    id: 'tail-koi',
    partSlot: 'tail',
    class: 'Aquatic',
    name: 'Koi',
    collection: 'normal',
    stage1: {
      energy: 1,
      damage: 110,
      shield: 30,
      name: 'Upstream Swim',
      effect: 'Gain Speed+ for two rounds when comboed with another Aquatic card.',
    },
    stage2: {
      energy: 1,
      damage: 135,
      shield: 40,
      name: 'Upstream Swim (Lv.2 Evolved)',
      effect: 'Gain Speed+ and ignore Target Lock when comboed.',
      badge: '⭐ Evolved Mastery',
    },
  },

  // ==========================================
  // SPECIAL COLLECTIONS: MYSTIC & NIGHTMARE
  // ==========================================
  'horn-buba-mystic': {
    id: 'horn-buba-mystic',
    partSlot: 'horn',
    class: 'Beast',
    name: 'Crystal Caltrop (Mystic Atia)',
    collection: 'mystic',
    stage1: {
      energy: 1,
      damage: 120,
      shield: 40,
      name: 'Atia Resonator',
      effect: 'Infuses entire team with +15% Critical Damage for 3 rounds.',
      badge: '💎 Mystic Atia Crystal',
    },
    stage2: {
      energy: 1,
      damage: 150,
      shield: 60,
      name: 'Atia Resonator Prime',
      effect: 'Infuses team with +25% Crit Damage and generates 1 Crystal Energy.',
      badge: '⭐💎 Evolved Mystic Prime',
    },
  },
  'horn-wings-of-nightmare': {
    id: 'horn-wings-of-nightmare',
    partSlot: 'horn',
    class: 'Reptile',
    name: 'Void Spire (Nightmare)',
    collection: 'nightmare',
    stage1: {
      energy: 1,
      damage: 115,
      shield: 45,
      name: 'Nightmare Gaze',
      effect: 'Inflicts Fear on target, causing their next card to miss.',
      badge: '👁️ Wings of Nightmare',
    },
    stage2: {
      energy: 1,
      damage: 145,
      shield: 65,
      name: 'Nightmare Gaze Void',
      effect: 'Inflicts Fear and steals 15% Max HP from all terrified enemies.',
      badge: '⭐👁️ Evolved Void Terror',
    },
  },
  'back-japan-hamaya': {
    id: 'back-japan-hamaya',
    partSlot: 'back',
    class: 'Bird',
    name: 'Hamaya (Japan Bionic)',
    collection: 'japan',
    stage1: {
      energy: 1,
      damage: 125,
      shield: 10,
      name: 'Spirit Arrow',
      effect: 'Bypasses enemy taunt and targets fastest opponent.',
      badge: '⛩️ Japan Traditional',
    },
    stage2: {
      energy: 1,
      damage: 150,
      shield: 25,
      name: 'Sacred Hamaya Arrow',
      effect: 'Bypasses taunt and dispels all positive buffs on target.',
      badge: '⭐⛩️ Evolved Sacred Arrow',
    },
  },
};

/**
 * Helper to resolve part card info by class and slot
 */
export function getLunalogPart(partSlot: string, axieClass: string): LunalogPartInfo {
  // Try exact slot and class matching
  const found = Object.values(LUNALOG_PARTS_REGISTRY).find(
    (p) => p.partSlot === partSlot && p.class.toLowerCase() === axieClass.toLowerCase()
  );

  if (found) return found;

  // Generic fallback card generator
  return {
    id: `${partSlot}-${axieClass.toLowerCase()}`,
    partSlot: partSlot as any,
    class: (['Beast', 'Plant', 'Aquatic', 'Bird', 'Bug', 'Reptile'].includes(axieClass)
      ? axieClass
      : 'Beast') as any,
    name: `${axieClass} ${partSlot.toUpperCase()}`,
    collection: 'normal',
    stage1: {
      energy: 1,
      damage: 90,
      shield: 40,
      name: `${axieClass} Strike`,
      effect: `Standard combat action for ${axieClass} ${partSlot}.`,
    },
    stage2: {
      energy: 1,
      damage: 115,
      shield: 55,
      name: `${axieClass} Strike (Lv.2 Evolved)`,
      effect: `Enhanced Stage 2 power with bonus stats and increased synergy.`,
      badge: '⭐ Evolved Mastery',
    },
  };
}
