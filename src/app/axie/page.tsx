'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import AxieAvatar from '@/components/axie/AxieAvatar';
import AxieModularAssembler, { AxieAppearanceConfig } from '@/components/axie/AxieModularAssembler';
import AxieBodyTypeThumbnail from '@/components/axie/AxieBodyTypeThumbnail';
import {
  Shield,
  Zap,
  Sword,
  Sparkles,
  ExternalLink,
  RotateCcw,
  Volume2,
  VolumeX,
  Plus,
  Play,
  Flame,
  Award,
  Layers,
  Search,
  Filter,
  Dna,
  Heart,
  Clock,
  CheckCircle2,
  AlertOctagon,
  X,
  RefreshCw,
} from 'lucide-react';
import {
  breed,
  validateBreedingPair,
  calculateBreedingCost,
  Creature,
  DEFAULT_BREEDING_CONFIG,
  PartGene,
  KNOWN_PARTS_CATALOG,
  encodeGenesToBigInt,
  CreatureGenes,
  CreatureClass,
  BodyPartType,
  AxieBodyType,
  BodyMaterialType,
  BODY_TYPE_CATALOG,
  BODY_MATERIAL_CATALOG,
  CLASS_BINARY_MAP,
  BreedingResult,
  BASE_CLASS_STATS,
  calculateCreatureStats,
} from '@/lib/axie/geneticEngine';

interface AxiePart {
  id: string;
  name: string;
  class: string;
  type: string;
}

interface AxieStats {
  hp: number;
  speed: number;
  skill: number;
  morale: number;
}

interface AxieItem {
  id: string;
  name: string;
  class: string;
  image: string;
  priceUsd: number;
  priceEth: number;
  breedCount: number;
  stats: AxieStats;
  parts: AxiePart[];
  bodyType?: AxieBodyType;
  bodyTypeName?: string;
  gtkMaterial?: string;
  bodyMaterial?: BodyMaterialType;
  bodyMaterialName?: string;
}

interface BattleCard {
  id: string;
  class: string;
  name: string;
  part: string;
  cost: number;
  attack: number;
  shield: number;
  effect?: 'STEAL_ENERGY' | 'GAIN_ENERGY' | 'AUTO_CRIT' | 'SPEED_BUFF' | 'HEAL';
  desc: string;
}

interface FighterAxie {
  id: string;
  name: string;
  class: string;
  position: 'FRONT' | 'MID' | 'BACK';
  side: 'PLAYER' | 'ENEMY';
  maxHp: number;
  hp: number;
  shield: number;
  speed: number;
  skill: number;
  morale: number;
  image: string;
  cards: BattleCard[];
}

const CLASS_THEMES: Record<string, { bg: string; text: string; border: string; badge: string; strongAgainst: string }> = {
  Plant: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/40', badge: 'bg-emerald-500 text-black', strongAgainst: 'Aquatic' },
  Beast: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/40', badge: 'bg-amber-500 text-black', strongAgainst: 'Plant' },
  Aquatic: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/40', badge: 'bg-cyan-500 text-black', strongAgainst: 'Beast' },
  Bird: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/40', badge: 'bg-pink-500 text-black', strongAgainst: 'Beast' },
  Reptile: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/40', badge: 'bg-purple-500 text-black', strongAgainst: 'Aquatic' },
  Bug: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/40', badge: 'bg-red-500 text-black', strongAgainst: 'Plant' },
  Mech: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/40', badge: 'bg-blue-400 text-black', strongAgainst: 'Plant' },
  Dusk: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/40', badge: 'bg-indigo-500 text-white', strongAgainst: 'Aquatic' },
  Dawn: { bg: 'bg-amber-300/10', text: 'text-amber-300', border: 'border-amber-300/40', badge: 'bg-amber-300 text-black', strongAgainst: 'Beast' },
};

const CARDS_POOL: BattleCard[] = [
  { id: 'p_pumpkin', class: 'Plant', name: 'October Treat', part: 'Pumpkin (Back)', cost: 1, attack: 0, shield: 115, desc: 'Draw a card if shield not broken.' },
  { id: 'p_serious', class: 'Plant', name: 'Vegetal Bite', part: 'Serious (Mouth)', cost: 1, attack: 30, shield: 30, effect: 'STEAL_ENERGY', desc: 'Steals 1 Energy if comboed.' },
  { id: 'p_cactus', class: 'Plant', name: 'Prickly Trap', part: 'Cactus (Horn)', cost: 1, attack: 110, shield: 20, desc: 'Deals +20% damage if attacking last.' },
  { id: 'b_ronin', class: 'Beast', name: 'Single Combat', part: 'Ronin (Back)', cost: 1, attack: 75, shield: 0, effect: 'AUTO_CRIT', desc: 'Guaranteed Critical hit when comboed!' },
  { id: 'b_imp', class: 'Beast', name: 'Ivory Stab', part: 'Imp (Horn)', cost: 1, attack: 70, shield: 20, effect: 'GAIN_ENERGY', desc: 'Gain 1 Energy when your team crits.' },
  { id: 'b_nutmouth', class: 'Beast', name: 'Nut Crack', part: 'Nut Cracker (Mouth)', cost: 1, attack: 105, shield: 30, desc: 'Deals 120% bonus damage with Nut card.' },
  { id: 'a_fishhook', class: 'Aquatic', name: 'Risky Beast', part: 'Fish Hook (Mouth)', cost: 1, attack: 110, shield: 20, desc: 'Attack+ buff when attacking Plant.' },
  { id: 'a_goldfish', class: 'Aquatic', name: 'Swift Escape', part: 'Goldfish (Back)', cost: 1, attack: 110, shield: 20, effect: 'SPEED_BUFF', desc: 'Gain Speed+ buff when attacked.' },
  { id: 'a_nimo', class: 'Aquatic', name: 'Tail Slap', part: 'Nimo (Tail)', cost: 0, attack: 30, shield: 0, effect: 'GAIN_ENERGY', desc: 'Cost 0. Gain 1 Energy if comboed.' },
  { id: 'bird_littleowl', class: 'Bird', name: 'Dark Swoop', part: 'Little Owl (Mouth)', cost: 1, attack: 25, shield: 0, desc: 'Target fastest enemy (Backdoor).' },
  { id: 'bird_eggshell', class: 'Bird', name: 'Eggshell', part: 'Eggshell (Horn)', cost: 1, attack: 120, shield: 0, desc: 'Applies Aroma debuff to attract enemy hits.' },
];

export default function AxiePage() {
  const [activeTab, setActiveTab] = useState<'marketplace' | 'arena' | 'breeding' | 'generator'>('marketplace');
  const [genClass, setGenClass] = useState<CreatureClass>('Beast');
  const [genName, setGenName] = useState<string>('Crimson Solar Alpha Beast');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [customGeneTier, setCustomGeneTier] = useState<'D' | 'R1' | 'R2'>('D');
  const [genBodyType, setGenBodyType] = useState<AxieBodyType>('normal');
  const [genBodyMaterial, setGenBodyMaterial] = useState<BodyMaterialType>('standard');
  const [customSprite, setCustomSprite] = useState<string>('/axies/sprite_crimson_fury_beast.png');
  const [customParts, setCustomParts] = useState<{
    eyes: { D: PartGene; R1: PartGene; R2: PartGene };
    ears: { D: PartGene; R1: PartGene; R2: PartGene };
    mouth: { D: PartGene; R1: PartGene; R2: PartGene };
    horn: { D: PartGene; R1: PartGene; R2: PartGene };
    back: { D: PartGene; R1: PartGene; R2: PartGene };
    tail: { D: PartGene; R1: PartGene; R2: PartGene };
  }>(() => {
    const getInitPart = (type: BodyPartType, cls: CreatureClass) =>
      KNOWN_PARTS_CATALOG.find((p) => p.type === type && p.class === cls) ||
      KNOWN_PARTS_CATALOG.find((p) => p.type === type)!;
    return {
      eyes: { D: getInitPart('eyes', 'Beast'), R1: getInitPart('eyes', 'Beast'), R2: getInitPart('eyes', 'Beast') },
      ears: { D: getInitPart('ears', 'Beast'), R1: getInitPart('ears', 'Beast'), R2: getInitPart('ears', 'Beast') },
      mouth: { D: getInitPart('mouth', 'Beast'), R1: getInitPart('mouth', 'Beast'), R2: getInitPart('mouth', 'Beast') },
      horn: { D: getInitPart('horn', 'Beast'), R1: getInitPart('horn', 'Beast'), R2: getInitPart('horn', 'Beast') },
      back: { D: getInitPart('back', 'Beast'), R1: getInitPart('back', 'Beast'), R2: getInitPart('back', 'Beast') },
      tail: { D: getInitPart('tail', 'Beast'), R1: getInitPart('tail', 'Beast'), R2: getInitPart('tail', 'Beast') },
    };
  });
  const [sireAxie, setSireAxie] = useState<AxieItem | null>(null);
  const [matronAxie, setMatronAxie] = useState<AxieItem | null>(null);
  const [slpBalance, setSlpBalance] = useState<number>(50000);
  const [axsBalance, setAxsBalance] = useState<number>(25.0);
  const [isBreedingAnim, setIsBreedingAnim] = useState<boolean>(false);
  const [breedingModal, setBreedingModal] = useState<BreedingResult | null>(null);
  const [incubatingEggs, setIncubatingEggs] = useState<Array<{
    id: string;
    name: string;
    class: string;
    stage: 'EGG' | 'ADULT';
    hatchDate: string;
    genes256: string;
    stats: AxieStats;
    image: string;
    sireName: string;
    matronName: string;
    sireId: string;
    matronId: string;
  }>>([
    {
      id: 'egg-8910',
      name: 'Mystic Prismatic Egg #8910',
      class: 'Dawn',
      stage: 'EGG',
      hatchDate: '5 Hari Tersisa',
      genes256: '0x0010200100803004014060070200900a02c0c00d0380f0100441200000000000',
      stats: { hp: 46, speed: 44, skill: 39, morale: 42 },
      image: '/axies/sprite_zen_white_plant.png',
      sireName: 'Solaris Seraph',
      matronName: 'Verdant Lotus',
      sireId: '3819200',
      matronId: '8414341',
    },
  ]);
  const [axies, setAxies] = useState<AxieItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedArena, setSelectedArena] = useState<'pond' | 'night' | 'lotus' | 'gears' | 'amethyst' | 'canyon' | 'jungle' | 'shadow'>('pond');

  const ARENA_ENVIRONMENTS = [
    { id: 'pond', name: '🌸 Lunacia Pond (Day)', bg: '/axies/arena_lunacia_pond.png' },
    { id: 'shadow', name: '👁️ Mystic Shadow Portal', bg: '/axies/arena_shadow_portal.png' },
    { id: 'jungle', name: '🌿 Sunbeam Deep Jungle', bg: '/axies/arena_deep_jungle.png' },
    { id: 'night', name: '🌙 Bioluminescent Forest', bg: '/axies/arena_night_forest.png' },
    { id: 'lotus', name: '🪷 Sunlit Lotus Pond', bg: '/axies/arena_lotus_pond.png' },
    { id: 'gears', name: '⚙️ Steampunk Gear Factory', bg: '/axies/arena_steampunk_gears.png' },
    { id: 'amethyst', name: '🔮 Amethyst Crystal Cavern', bg: '/axies/arena_amethyst_cavern.png' },
    { id: 'canyon', name: '🏜️ Terracotta Canyon', bg: '/axies/arena_terracotta_canyon.png' },
  ];

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playSynthesizedSound = (type: 'card' | 'hit' | 'crit' | 'shield') => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;

      if (type === 'card') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'hit') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.15);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'crit') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(580, now);
        osc.frequency.setValueAtTime(900, now + 0.08);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'shield') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(650, now + 0.15);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      }
    } catch {
      // ignore
    }
  };

  // Fetch Marketplace Axies
  useEffect(() => {
    async function loadMarketplace() {
      setLoading(true);
      try {
        const res = await fetch(`/api/axie/marketplace?class=${selectedClass}&limit=32`);
        if (res.ok) {
          const data = await res.json();
          setAxies(data.axies || []);
        }
      } catch (err) {
        console.error('Error fetching marketplace', err);
      } finally {
        setLoading(false);
      }
    }
    loadMarketplace();
  }, [selectedClass]);

  // ARENA STATE
  const [round, setRound] = useState(1);
  const [playerEnergy, setPlayerEnergy] = useState(3);
  const [enemyEnergy, setEnemyEnergy] = useState(3);
  const [battlePhase, setBattlePhase] = useState<'SELECTION' | 'RESOLVING' | 'GAMEOVER'>('SELECTION');
  const [battleLog, setBattleLog] = useState<string>('Match started. Pick cards and click END TURN.');
  const [announcement, setAnnouncement] = useState<{ title: string; sub: string } | null>(null);

  // Default Player Team
  const [playerTeam, setPlayerTeam] = useState<FighterAxie[]>([
    {
      id: '9901003',
      name: 'Electric Cyan Moss Plant',
      class: 'Plant',
      position: 'FRONT',
      side: 'PLAYER',
      maxHp: 520,
      hp: 520,
      shield: 0,
      speed: 31,
      skill: 31,
      morale: 42,
      image: '/axies/sprite_blue_eyes_plant.png',
      cards: [CARDS_POOL[0], CARDS_POOL[1], CARDS_POOL[2], CARDS_POOL[1]],
    },
    {
      id: '9901001',
      name: 'Seraph Fluffy Sunbeam Beast',
      class: 'Beast',
      position: 'MID',
      side: 'PLAYER',
      maxHp: 380,
      hp: 380,
      shield: 0,
      speed: 45,
      skill: 34,
      morale: 59,
      image: '/axies/sprite_yellow_fluffy.png',
      cards: [CARDS_POOL[3], CARDS_POOL[4], CARDS_POOL[5], CARDS_POOL[3]],
    },
    {
      id: '12084089',
      name: 'Golden Crest Aqua',
      class: 'Aquatic',
      position: 'BACK',
      side: 'PLAYER',
      maxHp: 420,
      hp: 420,
      shield: 0,
      speed: 53,
      skill: 35,
      morale: 34,
      image: '/axies/sprite_aqua_crest.png',
      cards: [CARDS_POOL[6], CARDS_POOL[7], CARDS_POOL[8], CARDS_POOL[6]],
    },
  ]);

  // Opponent Team
  const [enemyTeam, setEnemyTeam] = useState<FighterAxie[]>([
    {
      id: '9901002',
      name: 'Verdant Cactus Brawler',
      class: 'Bug',
      position: 'FRONT',
      side: 'ENEMY',
      maxHp: 500,
      hp: 500,
      shield: 0,
      speed: 37,
      skill: 35,
      morale: 48,
      image: '/axies/sprite_green_brawler.png',
      cards: [CARDS_POOL[0], CARDS_POOL[2], CARDS_POOL[2]],
    },
    {
      id: '6409821',
      name: 'Cyber Mech Golem',
      class: 'Mech',
      position: 'MID',
      side: 'ENEMY',
      maxHp: 460,
      hp: 460,
      shield: 0,
      speed: 49,
      skill: 41,
      morale: 36,
      image: '/axies/sprite_mech_golem.png',
      cards: [CARDS_POOL[1], CARDS_POOL[3], CARDS_POOL[4]],
    },
    {
      id: '9901005',
      name: 'Zen White Lotus Dawn',
      class: 'Dawn',
      position: 'BACK',
      side: 'ENEMY',
      maxHp: 440,
      hp: 440,
      shield: 0,
      speed: 44,
      skill: 40,
      morale: 43,
      image: '/axies/sprite_zen_white_plant.png',
      cards: [CARDS_POOL[9], CARDS_POOL[10], CARDS_POOL[10]],
    },
  ]);

  interface HandCardItem extends BattleCard {
    ownerAxieId: string;
    uid: string;
  }
  const [playerHand, setPlayerHand] = useState<HandCardItem[]>([]);
  const [queuedCards, setQueuedCards] = useState<{ card: HandCardItem; axieId: string }[]>([]);

  // Initialize Cards Hand
  const drawCards = (count: number, currentTeam = playerTeam) => {
    const alive = currentTeam.filter((a) => a.hp > 0);
    if (alive.length === 0) return;

    const deckPool: HandCardItem[] = [];
    alive.forEach((a) => {
      a.cards.forEach((c) => {
        deckPool.push({ ...c, ownerAxieId: a.id, uid: Math.random().toString(36).substring(2, 9) });
      });
    });

    setPlayerHand((prev) => {
      const next = [...prev];
      for (let i = 0; i < count; i++) {
        if (next.length >= 9) break;
        const randomCard = deckPool[Math.floor(Math.random() * deckPool.length)];
        if (randomCard) next.push({ ...randomCard, uid: Math.random().toString(36).substring(2, 9) });
      }
      return next;
    });
  };

  const resetMatch = () => {
    setRound(1);
    setPlayerEnergy(3);
    setEnemyEnergy(3);
    setBattlePhase('SELECTION');
    setQueuedCards([]);
    setBattleLog('🔄 Match restarted. Draw 6 cards.');

    setPlayerTeam((prev) => prev.map((a) => ({ ...a, hp: a.maxHp, shield: 0 })));
    setEnemyTeam((prev) => prev.map((a) => ({ ...a, hp: a.maxHp, shield: 0 })));
    setPlayerHand([]);
    drawCards(6);
  };

  useEffect(() => {
    resetMatch();
  }, []);

  const queueCard = (cardIndex: number) => {
    if (battlePhase !== 'SELECTION') return;
    const item = playerHand[cardIndex];
    if (!item || playerEnergy < item.cost) return;

    const owner = playerTeam.find((a) => a.id === item.ownerAxieId);
    if (!owner || owner.hp <= 0) return;

    setPlayerEnergy((e) => e - item.cost);
    setQueuedCards((q) => [...q, { card: item, axieId: item.ownerAxieId }]);
    setPlayerHand((h) => h.filter((_, idx) => idx !== cardIndex));
    playSynthesizedSound('card');
  };

  const clearQueue = () => {
    if (battlePhase !== 'SELECTION' || queuedCards.length === 0) return;
    queuedCards.forEach((q) => {
      setPlayerEnergy((e) => e + q.card.cost);
      setPlayerHand((h) => [...h, q.card]);
    });
    setQueuedCards([]);
    playSynthesizedSound('card');
  };

  const showTempAnnouncement = (title: string, sub: string) => {
    setAnnouncement({ title, sub });
    setTimeout(() => setAnnouncement(null), 1400);
  };

  // Turn Execution
  const executeTurn = async () => {
    if (battlePhase !== 'SELECTION') return;
    setBattlePhase('RESOLVING');

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    // Enemy AI plays cards
    let eEnergy = enemyEnergy;
    const enemyQueued: { card: BattleCard; axieId: string }[] = [];
    enemyTeam
      .filter((a) => a.hp > 0)
      .forEach((a) => {
        for (const c of a.cards) {
          if (eEnergy >= c.cost && Math.random() > 0.4) {
            eEnergy -= c.cost;
            enemyQueued.push({ card: c, axieId: a.id });
          }
        }
      });
    setEnemyEnergy(eEnergy);

    // Speed Order Execution
    const allAxies = [...playerTeam, ...enemyTeam].filter((a) => a.hp > 0);
    allAxies.sort((a, b) => b.speed - a.speed);

    for (const actor of allAxies) {
      if (actor.hp <= 0) continue;

      const actions =
        actor.side === 'PLAYER'
          ? queuedCards.filter((q) => q.axieId === actor.id)
          : enemyQueued.filter((q) => q.axieId === actor.id);

      for (const act of actions) {
        if (actor.hp <= 0) break;

        const targetSide = actor.side === 'PLAYER' ? enemyTeam : playerTeam;
        const aliveTargets = targetSide.filter((t) => t.hp > 0);
        if (aliveTargets.length === 0) break;

        // Target frontmost
        aliveTargets.sort((a, b) => {
          const ord = { FRONT: 1, MID: 2, BACK: 3 };
          return ord[a.position] - ord[b.position];
        });
        const target = aliveTargets[0];

        // Shield
        if (act.card.shield > 0) {
          actor.shield += act.card.shield;
          playSynthesizedSound('shield');
          showTempAnnouncement('🛡️ SHIELD UP!', `${actor.name} gained +${act.card.shield} Shield`);
        }

        // Damage
        if (act.card.attack > 0) {
          let multiplier = 1.0;
          const theme = CLASS_THEMES[actor.class];
          if (theme && theme.strongAgainst === target.class) {
            multiplier = 1.15;
          }

          const isCrit = act.card.effect === 'AUTO_CRIT' || Math.random() < actor.morale / 350;
          const critMult = isCrit ? 1.8 : 1.0;
          const totalDmg = Math.round(act.card.attack * multiplier * critMult);

          let dmgToHp = totalDmg;
          if (target.shield > 0) {
            if (target.shield >= totalDmg) {
              target.shield -= totalDmg;
              dmgToHp = 0;
            } else {
              dmgToHp = totalDmg - target.shield;
              target.shield = 0;
            }
          }
          target.hp = Math.max(0, target.hp - dmgToHp);

          if (isCrit) {
            playSynthesizedSound('crit');
            showTempAnnouncement('💥 CRITICAL HIT!', `${actor.name} struck for ${totalDmg} DMG!`);
          } else {
            playSynthesizedSound('hit');
            showTempAnnouncement(`⚔️ ${act.card.name}`, `${actor.name} dealt ${totalDmg} DMG`);
          }

          setBattleLog(`${actor.name} used [${act.card.name}] on ${target.name} for ${totalDmg} DMG`);
        }

        // Update state
        setPlayerTeam([...playerTeam]);
        setEnemyTeam([...enemyTeam]);
        await sleep(650);

        // Check Victory
        const pAlive = playerTeam.some((a) => a.hp > 0);
        const eAlive = enemyTeam.some((a) => a.hp > 0);
        if (!pAlive || !eAlive) {
          setBattlePhase('GAMEOVER');
          if (!eAlive) {
            showTempAnnouncement('🏆 VICTORY!', 'You defeated the Chimera team! +25 SLP Earned!');
            setBattleLog('🎉 Match Over: Victory!');
          } else {
            showTempAnnouncement('💀 DEFEAT', 'Your team was defeated!');
            setBattleLog('💀 Match Over: Defeat.');
          }
          return;
        }
      }
    }

    // Clean up round
    playerTeam.forEach((a) => (a.shield = 0));
    enemyTeam.forEach((a) => (a.shield = 0));
    setQueuedCards([]);
    setRound((r) => r + 1);
    setPlayerEnergy((e) => Math.min(10, e + 2));
    setEnemyEnergy((e) => Math.min(10, e + 2));
    drawCards(3);
    setBattlePhase('SELECTION');
    setBattleLog(`Round ${round + 1} begins: +2 Energy & 3 cards drawn.`);
  };

  // Draft Axie to Player Team
  const draftAxieToTeam = (axie: AxieItem, slot: 'FRONT' | 'MID' | 'BACK') => {
    setPlayerTeam((prev) =>
      prev.map((member) => {
        if (member.position === slot) {
          return {
            ...member,
            id: axie.id,
            name: axie.name,
            class: axie.class,
            maxHp: axie.stats.hp * 8,
            hp: axie.stats.hp * 8,
            speed: axie.stats.speed,
            skill: axie.stats.skill,
            morale: axie.stats.morale,
            image: axie.image,
          };
        }
        return member;
      })
    );
    setActiveTab('arena');
    showTempAnnouncement(`🧬 Axie #${axie.id} Drafted!`, `Placed at ${slot} position.`);
  };

  // Convert AxieItem to Creature domain entity for Genetic Engine
  const axieItemToCreature = (axie: AxieItem): Creature => {
    const findPart = (type: BodyPartType, partName?: string): PartGene => {
      if (partName) {
        const match = KNOWN_PARTS_CATALOG.find(
          (p) =>
            p.type === type &&
            (p.name.toLowerCase() === partName.toLowerCase() ||
              p.id.toLowerCase().includes(partName.toLowerCase()))
        );
        if (match) return match;
      }
      return (
        KNOWN_PARTS_CATALOG.find(
          (p) => p.type === type && p.class === (axie.class as CreatureClass)
        ) || KNOWN_PARTS_CATALOG.find((p) => p.type === type)!
      );
    };

    const getPartByName = (type: BodyPartType) => {
      const itemPart = axie.parts.find((p) => p.type.toLowerCase() === type);
      return findPart(type, itemPart?.name);
    };

    const eyesPart = getPartByName('eyes');
    const earsPart = getPartByName('ears');
    const mouthPart = getPartByName('mouth');
    const hornPart = getPartByName('horn');
    const backPart = getPartByName('back');
    const tailPart = getPartByName('tail');

    const genes: CreatureGenes = {
      class: (axie.class as CreatureClass) || 'Plant',
      classBinary: CLASS_BINARY_MAP[axie.class as CreatureClass] ?? 3,
      pattern: 1,
      color: 2,
      eyes: { D: eyesPart, R1: eyesPart, R2: eyesPart },
      ears: { D: earsPart, R1: earsPart, R2: earsPart },
      mouth: { D: mouthPart, R1: mouthPart, R2: mouthPart },
      horn: { D: hornPart, R1: hornPart, R2: hornPart },
      back: { D: backPart, R1: backPart, R2: backPart },
      tail: { D: tailPart, R1: tailPart, R2: tailPart },
      rawBigInt: '0x' + (axie.id.padStart(16, '0') + '000000000000000000000000000000000000000000000000').slice(0, 64),
    };

    return {
      id: axie.id,
      name: axie.name,
      ownerAddress: '0xRoninWalletUser',
      class: (axie.class as CreatureClass) || 'Plant',
      genes,
      stats: axie.stats,
      breedCount: axie.breedCount || 0,
      maxBreedCount: 7,
      sireId: null,
      matronId: null,
      stage: 'ADULT',
      birthDate: new Date().toISOString(),
      image: axie.image,
    };
  };

  const selectForBreeding = (axie: AxieItem, targetSlot?: 'SIRE' | 'MATRON') => {
    if (targetSlot === 'SIRE') {
      setSireAxie(axie);
      showTempAnnouncement(`🧬 Sire Assigned`, `Axie #${axie.id} set as Father.`);
    } else if (targetSlot === 'MATRON') {
      setMatronAxie(axie);
      showTempAnnouncement(`🌸 Matron Assigned`, `Axie #${axie.id} set as Mother.`);
    } else {
      if (!sireAxie) {
        setSireAxie(axie);
        showTempAnnouncement(`🧬 Sire Assigned`, `Axie #${axie.id} set as Father. Now choose a Matron!`);
      } else if (!matronAxie && sireAxie.id !== axie.id) {
        setMatronAxie(axie);
        showTempAnnouncement(`🌸 Matron Assigned`, `Axie #${axie.id} set as Mother. Ready to breed!`);
      } else {
        setSireAxie(axie);
        showTempAnnouncement(`🧬 Sire Updated`, `Axie #${axie.id} set as Father.`);
      }
    }
    setActiveTab('breeding');
  };

  const currentCost =
    sireAxie && matronAxie
      ? calculateBreedingCost(sireAxie.breedCount || 0, matronAxie.breedCount || 0)
      : null;

  const currentValidation =
    sireAxie && matronAxie
      ? validateBreedingPair(
          axieItemToCreature(sireAxie),
          axieItemToCreature(matronAxie),
          { slp: slpBalance, axs: axsBalance }
        )
      : null;

  const handleExecuteBreed = () => {
    if (!sireAxie || !matronAxie || !currentValidation?.canBreed || !currentCost) return;

    setIsBreedingAnim(true);
    playSynthesizedSound('crit');

    setTimeout(() => {
      try {
        const sireCreature = axieItemToCreature(sireAxie);
        const matronCreature = axieItemToCreature(matronAxie);
        const result = breed(sireCreature, matronCreature);

        setSlpBalance((prev) => Math.max(0, prev - currentCost.slp));
        setAxsBalance((prev) => Math.max(0, +(prev - currentCost.axs).toFixed(2)));

        setAxies((prev) =>
          prev.map((a) => {
            if (a.id === sireAxie.id) return { ...a, breedCount: (a.breedCount || 0) + 1 };
            if (a.id === matronAxie.id) return { ...a, breedCount: (a.breedCount || 0) + 1 };
            return a;
          })
        );
        setSireAxie((prev) => (prev ? { ...prev, breedCount: (prev.breedCount || 0) + 1 } : null));
        setMatronAxie((prev) => (prev ? { ...prev, breedCount: (prev.breedCount || 0) + 1 } : null));

        const newEggItem = {
          id: result.offspring.id,
          name: result.offspring.name,
          class: result.offspring.class,
          stage: 'EGG' as const,
          hatchDate: '5 Hari Tersisa (120 Jam)',
          genes256: result.offspring.genes.rawBigInt,
          stats: result.offspring.stats,
          image: '/axies/egg_mystic.png',
          sireName: sireAxie.name,
          matronName: matronAxie.name,
          sireId: sireAxie.id,
          matronId: matronAxie.id,
        };

        setIncubatingEggs((prev) => [newEggItem, ...prev]);
        setBreedingModal(result);
        showTempAnnouncement(`🥚 Telur Berhasil Dihasilkan!`, `${result.offspring.name} masuk ke Inkubator!`);
      } catch (err) {
        console.error('Breeding failed:', err);
      } finally {
        setIsBreedingAnim(false);
      }
    }, 1200);
  };

  const handleInstantHatch = (eggId: string) => {
    const egg = incubatingEggs.find((e) => e.id === eggId);
    if (!egg) return;

    playSynthesizedSound('crit');

    const classSprites: Record<string, string> = {
      Plant: '/axies/sprite_blue_eyes_plant.png',
      Beast: '/axies/sprite_yellow_fluffy.png',
      Aquatic: '/axies/sprite_aqua_crest.png',
      Bird: '/axies/sprite_purple_bird.png',
      Reptile: '/axies/sprite_cyan_reptile.png',
      Bug: '/axies/sprite_green_brawler.png',
      Mech: '/axies/sprite_mech_golem.png',
      Dawn: '/axies/sprite_zen_white_plant.png',
      Dusk: '/axies/sprite_dark_dusk.png',
    };
    const adultSprite = classSprites[egg.class] || '/axies/sprite_blue_eyes_plant.png';

    const newAdultAxie: AxieItem = {
      id: egg.id.replace('axie-', ''),
      name: egg.name.replace('Egg', 'Pureborn Axie'),
      class: egg.class,
      image: adultSprite,
      priceUsd: 88.5,
      priceEth: 0.038,
      breedCount: 0,
      stats: egg.stats,
      parts: [
        { id: 'p1', name: 'Mendelian Eyes', class: egg.class, type: 'Eyes' },
        { id: 'p2', name: 'Pure Horn', class: egg.class, type: 'Horn' },
        { id: 'p3', name: 'Inherited Mouth', class: egg.class, type: 'Mouth' },
        { id: 'p4', name: 'Genetic Tail', class: egg.class, type: 'Tail' },
      ],
    };

    setIncubatingEggs((prev) => prev.filter((e) => e.id !== eggId));
    setAxies((prev) => [newAdultAxie, ...prev]);
    showTempAnnouncement(`🐣 Menetas Sukses!`, `${newAdultAxie.name} sekarang siap bertarung & kawin!`);
  };

  const CLASS_SPRITE_PREVIEWS: Record<string, string[]> = {
    Beast: ['/axies/sprite_crimson_fury_beast.png', '/axies/sprite_yellow_fluffy.png', '/axies/sprite_crystal_beast_mech.png'],
    Aquatic: ['/axies/sprite_abyssal_electric_aqua.png', '/axies/sprite_aqua_crest.png', '/axies/sprite_aqua_goggles.png', '/axies/sprite_fluffy_aqua_hat.png'],
    Plant: ['/axies/sprite_emerald_jade_plant.png', '/axies/sprite_blue_eyes_plant.png', '/axies/sprite_moss_deer_horns.png'],
    Bird: ['/axies/sprite_cherry_blossom_bird.png', '/axies/sprite_bird_sakura.png'],
    Reptile: ['/axies/sprite_amethyst_dragon_reptile.png', '/axies/sprite_reptile_spiral.png', '/axies/sprite_derp_snail_horns.png'],
    Bug: ['/axies/sprite_scarlet_blood_bug.png', '/axies/sprite_green_brawler.png'],
    Mech: ['/axies/sprite_golden_mech_golem.png', '/axies/sprite_mech_golem.png'],
    Dawn: ['/axies/sprite_celestial_dawn_archon.png', '/axies/sprite_zen_white_plant.png', '/axies/sprite_prismatic_chimera_mystic.png'],
    Dusk: ['/axies/sprite_void_eclipse_dusk.png', '/axies/sprite_dusk_night.png', '/axies/sprite_mystic_purple.png'],
  };

  const randomizeGenName = () => {
    const prefixes = ['Solar', 'Abyssal', 'Celestial', 'Cyber', 'Emerald', 'Void', 'Crimson', 'Prismatic', 'Shadow', 'Amethyst'];
    const titles = ['Alpha', 'Archon', 'Guardian', 'Sovereign', 'Warden', 'Brawler', 'Seraph', 'Predator', 'Striker', 'Titan'];
    const p = prefixes[Math.floor(Math.random() * prefixes.length)];
    const t = titles[Math.floor(Math.random() * titles.length)];
    setGenName(`${p} ${t} ${genClass}`);
  };

  const applyPurebredPreset = (targetClass: CreatureClass) => {
    const getPart = (type: BodyPartType, cls: CreatureClass) =>
      KNOWN_PARTS_CATALOG.find((p) => p.type === type && p.class === cls) ||
      KNOWN_PARTS_CATALOG.find((p) => p.type === type)!;

    setCustomParts({
      eyes: { D: getPart('eyes', targetClass), R1: getPart('eyes', targetClass), R2: getPart('eyes', targetClass) },
      ears: { D: getPart('ears', targetClass), R1: getPart('ears', targetClass), R2: getPart('ears', targetClass) },
      mouth: { D: getPart('mouth', targetClass), R1: getPart('mouth', targetClass), R2: getPart('mouth', targetClass) },
      horn: { D: getPart('horn', targetClass), R1: getPart('horn', targetClass), R2: getPart('horn', targetClass) },
      back: { D: getPart('back', targetClass), R1: getPart('back', targetClass), R2: getPart('back', targetClass) },
      tail: { D: getPart('tail', targetClass), R1: getPart('tail', targetClass), R2: getPart('tail', targetClass) },
    });
    const defaultSprite = CLASS_SPRITE_PREVIEWS[targetClass]?.[0] || '/axies/sprite_yellow_fluffy.png';
    setCustomSprite(defaultSprite);
    showTempAnnouncement(`⚡ 6/6 Purebred ${targetClass}`, 'Semua alel D, R1, R2 diselaraskan.');
  };

  const applyRandomMixPreset = () => {
    const getRandom = (type: BodyPartType) => {
      const candidates = KNOWN_PARTS_CATALOG.filter((p) => p.type === type);
      return candidates[Math.floor(Math.random() * candidates.length)];
    };
    setCustomParts({
      eyes: { D: getRandom('eyes'), R1: getRandom('eyes'), R2: getRandom('eyes') },
      ears: { D: getRandom('ears'), R1: getRandom('ears'), R2: getRandom('ears') },
      mouth: { D: getRandom('mouth'), R1: getRandom('mouth'), R2: getRandom('mouth') },
      horn: { D: getRandom('horn'), R1: getRandom('horn'), R2: getRandom('horn') },
      back: { D: getRandom('back'), R1: getRandom('back'), R2: getRandom('back') },
      tail: { D: getRandom('tail'), R1: getRandom('tail'), R2: getRandom('tail') },
    });
    showTempAnnouncement('🎲 Silsilah Diacak!', 'Kombinasi alel D, R1, R2 acak dihasilkan.');
  };

  const handleSelectBodyType = (type: AxieBodyType) => {
    setGenBodyType(type);
    const btInfo = BODY_TYPE_CATALOG[type];
    if (btInfo) {
      showTempAnnouncement(`🦴 Body Type: ${btInfo.name}`, `${btInfo.gtkMaterial} diterapkan ke anatomi!`);
    }
  };

  const setPartAllele = (type: BodyPartType, tier: 'D' | 'R1' | 'R2', partId: string) => {
    const found = KNOWN_PARTS_CATALOG.find((p) => p.id === partId);
    if (!found) return;
    setCustomParts((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [tier]: found,
      },
    }));
  };

  // Dynamic stats calculated from the 6 Dominant parts + GTK2D Body Type
  const currentCustomStats = calculateCreatureStats(
    genClass,
    {
      eyes: customParts.eyes.D,
      ears: customParts.ears.D,
      mouth: customParts.mouth.D,
      horn: customParts.horn.D,
      back: customParts.back.D,
      tail: customParts.tail.D,
    },
    genBodyType
  );

  // Dynamic 256-bit BigInt gene hash
  const currentCustomGeneHash = encodeGenesToBigInt({
    class: genClass,
    classBinary: CLASS_BINARY_MAP[genClass] ?? 0,
    pattern: 1,
    color: 1,
    eyes: customParts.eyes,
    ears: customParts.ears,
    mouth: customParts.mouth,
    horn: customParts.horn,
    back: customParts.back,
    tail: customParts.tail,
    rawBigInt: '0x000',
  });

  // Purity calculation
  const customDParts = [
    customParts.eyes.D,
    customParts.ears.D,
    customParts.mouth.D,
    customParts.horn.D,
    customParts.back.D,
    customParts.tail.D,
  ];
  const customPureCount = customDParts.filter((p) => p.class === genClass).length;

  const handleGenerateAxie = async () => {
    setIsGenerating(true);
    playSynthesizedSound('crit');
    try {
      const res = await fetch('/api/axie/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          class: genClass,
          bodyType: genBodyType,
          bodyMaterial: genBodyMaterial,
          name: genName,
          image: customSprite,
          parts: customParts,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.axie) {
          setAxies((prev) => [data.axie, ...prev]);
          showTempAnnouncement('✨ Axie Kustom Dicetak!', `${data.axie.name} (#${data.axie.id}) masuk ke Marketplace!`);
          randomizeGenName();
        }
      }
    } catch (err) {
      console.error('Error generating axie:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredAxies = axies.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.id.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Breadcrumb & Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 backdrop-blur shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500 via-emerald-500 to-amber-400 flex items-center justify-center text-2xl shadow-lg shadow-cyan-500/20">
              🧬
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black bg-gradient-to-r from-emerald-400 via-cyan-300 to-amber-300 bg-clip-text text-transparent">
                  AXIE INFINITY ARENA &amp; MARKETPLACE
                </h1>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                  RONIN NETWORK LIVE
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Official Marketplace Data Scraper &amp; 3v3 Turn-Based Battle Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/crypto"
              className="px-3 py-1.5 rounded-xl bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition"
            >
              ← Back to Crypto Desk
            </Link>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-xs font-semibold flex items-center gap-1.5 text-zinc-300"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
              Sound {soundEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm transition flex items-center gap-2 ${
              activeTab === 'marketplace'
                ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/25'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            Marketplace Explorer ({axies.length})
          </button>
          <button
            onClick={() => setActiveTab('arena')}
            className={`px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm transition flex items-center gap-2 ${
              activeTab === 'arena'
                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/25'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <Sword className="w-4 h-4" />
            3v3 Battle Arena Simulator
          </button>
          <button
            onClick={() => setActiveTab('breeding')}
            className={`px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm transition flex items-center gap-2 ${
              activeTab === 'breeding'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/30'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <Dna className="w-4 h-4 text-pink-400" />
            🧬 Breeding Lab ({incubatingEggs.length} Eggs)
          </button>
          <button
            onClick={() => setActiveTab('generator')}
            className={`px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm transition flex items-center gap-2 ${
              activeTab === 'generator'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/30'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            🧪 Studio Generator
          </button>
        </div>

        {/* TAB 1: MARKETPLACE EXPLORER */}
        {activeTab === 'marketplace' && (
          <div className="space-y-6">
            {/* Filter & Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                {['All', 'Plant', 'Beast', 'Aquatic', 'Bird', 'Reptile', 'Bug', 'Mech', 'Dusk', 'Dawn'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedClass(c)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                      selectedClass === c
                        ? 'bg-zinc-100 text-black shadow'
                        : 'bg-zinc-800/80 text-zinc-400 hover:text-white border border-zinc-700/60'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search Axie ID or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Axies Grid */}
            {loading ? (
              <div className="py-24 text-center">
                <div className="inline-block w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-xs text-zinc-400">Fetching live models from Axie Marketplace CDN...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredAxies.map((axie) => {
                  const theme = CLASS_THEMES[axie.class] || CLASS_THEMES.Plant;
                  return (
                    <div
                      key={axie.id}
                      className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between hover:border-zinc-700 transition hover:shadow-xl hover:shadow-cyan-500/5 group"
                    >
                      <div>
                        {/* Header ID & Class */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${theme.badge}`}>
                              {axie.class.toUpperCase()}
                            </span>
                            {axie.bodyTypeName && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                {axie.bodyTypeName}
                              </span>
                            )}
                          </div>
                          <a
                            href={`https://app.axieinfinity.com/marketplace/axies/${axie.id}/`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] font-bold text-zinc-400 hover:text-cyan-400 flex items-center gap-0.5"
                          >
                            #{axie.id} <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>

                        {/* Image / Avatar Preview */}
                        <div className="relative w-full h-36 flex items-center justify-center my-2 bg-gradient-to-b from-zinc-950/60 to-zinc-900/40 rounded-xl overflow-hidden border border-zinc-800/40 group-hover:scale-105 transition-transform duration-300">
                          <AxieAvatar
                            id={axie.id}
                            axieClass={axie.class}
                            name={axie.name}
                            imageSrc={axie.image}
                            className="w-32 h-28"
                          />
                        </div>

                        {/* Name & Price */}
                        <h3 className="font-extrabold text-sm text-zinc-100 truncate">{axie.name}</h3>
                        <div className="flex items-center justify-between mt-1 text-xs">
                          <span className="font-black text-emerald-400">${axie.priceUsd.toFixed(1)} USD</span>
                          <span className="text-[11px] text-zinc-400 font-mono">{axie.priceEth} WETH</span>
                        </div>

                        {/* Stats Bar */}
                        <div className="grid grid-cols-4 gap-1 mt-3 bg-zinc-950/70 p-2 rounded-xl text-center text-[10px] border border-zinc-800">
                          <div>
                            <div className="text-zinc-500 font-bold">HP</div>
                            <div className="font-black text-emerald-400">{axie.stats.hp}</div>
                          </div>
                          <div>
                            <div className="text-zinc-500 font-bold">SPD</div>
                            <div className="font-black text-cyan-400">{axie.stats.speed}</div>
                          </div>
                          <div>
                            <div className="text-zinc-500 font-bold">SKL</div>
                            <div className="font-black text-amber-400">{axie.stats.skill}</div>
                          </div>
                          <div>
                            <div className="text-zinc-500 font-bold">MOR</div>
                            <div className="font-black text-rose-400">{axie.stats.morale}</div>
                          </div>
                        </div>

                        {/* Body Parts Badges */}
                        <div className="mt-2 flex flex-wrap gap-1">
                          {axie.parts.slice(0, 4).map((part) => (
                            <span
                              key={part.id}
                              className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-300 border border-zinc-700/60"
                            >
                              {part.type}: {part.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Actions: Breed & Draft */}
                      <div className="mt-4 pt-3 border-t border-zinc-800/80 space-y-2">
                        <button
                          onClick={() => selectForBreeding(axie)}
                          className="w-full py-2 rounded-xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500 hover:to-purple-500 hover:text-white border border-pink-500/40 text-xs font-black text-pink-300 transition flex items-center justify-center gap-1.5 shadow-md shadow-pink-500/5 group/breed"
                        >
                          <Dna className="w-3.5 h-3.5 text-pink-400 group-hover/breed:rotate-45 transition-transform" />
                          <span>🧬 Kawinkan / Breed ({axie.breedCount || 0}/7)</span>
                        </button>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => draftAxieToTeam(axie, 'FRONT')}
                            className="flex-1 py-1.5 rounded-lg bg-zinc-800 hover:bg-emerald-600 hover:text-black text-[10px] font-black text-zinc-300 transition text-center"
                          >
                            Draft Front
                          </button>
                          <button
                            onClick={() => draftAxieToTeam(axie, 'MID')}
                            className="flex-1 py-1.5 rounded-lg bg-zinc-800 hover:bg-amber-600 hover:text-black text-[10px] font-black text-zinc-300 transition text-center"
                          >
                            Draft Mid
                          </button>
                          <button
                            onClick={() => draftAxieToTeam(axie, 'BACK')}
                            className="flex-1 py-1.5 rounded-lg bg-zinc-800 hover:bg-cyan-600 hover:text-black text-[10px] font-black text-zinc-300 transition text-center"
                          >
                            Draft Back
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ARENA BATTLE SIMULATOR */}
        {activeTab === 'arena' && (
          <div className="space-y-4">
            {/* Arena Top Status */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-xl text-center">
                  <div className="text-[10px] uppercase font-bold text-zinc-400">ROUND</div>
                  <div className="text-base font-black text-amber-400">{round}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-400">Phase:</span>
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    {battlePhase}
                  </span>
                </div>
              </div>

              {/* Arena Environment Selector */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-zinc-950/80 px-2.5 py-1.5 rounded-xl border border-zinc-700">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase">Arena:</span>
                  <select
                    value={selectedArena}
                    onChange={(e) => setSelectedArena(e.target.value as any)}
                    className="bg-transparent text-xs text-amber-400 font-bold focus:outline-none cursor-pointer"
                  >
                    {ARENA_ENVIRONMENTS.map((env) => (
                      <option key={env.id} value={env.id} className="bg-zinc-900 text-white">
                        {env.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={resetMatch}
                  className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Match
                </button>
              </div>
            </div>

            {/* Battle Arena Canvas with Dynamic Lunacia Environments */}
            <div
              className="relative border border-zinc-800 rounded-3xl p-6 min-h-[460px] flex flex-col justify-between overflow-hidden shadow-2xl bg-zinc-950 bg-cover bg-center transition-all duration-700"
              style={{
                backgroundImage: `linear-gradient(to bottom, rgba(9, 9, 11, 0.62), rgba(9, 9, 11, 0.82)), url('${
                  ARENA_ENVIRONMENTS.find((a) => a.id === selectedArena)?.bg || '/axies/arena_lunacia_pond.png'
                }')`,
              }}
            >
              {/* Floating Announcement Overlay */}
              {announcement && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 text-center animate-bounce">
                  <div className="px-6 py-3 rounded-2xl bg-zinc-900/95 border border-amber-500/60 shadow-2xl backdrop-blur-md">
                    <div className="text-lg font-black text-amber-400">{announcement.title}</div>
                    <div className="text-xs text-zinc-300 mt-0.5">{announcement.sub}</div>
                  </div>
                </div>
              )}

              {/* Arena Teams Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-auto items-center">
                {/* Player Team (Left) */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs px-2 font-bold text-emerald-400">
                    <span>YOUR SQUAD (LUNACIA DEFENDERS)</span>
                    <span className="text-zinc-500">
                      {playerTeam.filter((a) => a.hp > 0).length}/3 ALIVE
                    </span>
                  </div>
                  <div className="flex items-center justify-around gap-2 p-3 rounded-2xl bg-zinc-900/50 border border-emerald-900/30">
                    {playerTeam.map((axie) => {
                      const isDead = axie.hp <= 0;
                      const queuedCount = queuedCards.filter((q) => q.axieId === axie.id).length;
                      return (
                        <div
                          key={axie.id}
                          className={`relative flex flex-col items-center p-2 rounded-2xl transition ${
                            isDead ? 'opacity-25 grayscale' : ''
                          } ${queuedCount > 0 ? 'ring-2 ring-emerald-400 bg-emerald-950/30' : ''}`}
                        >
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 mb-1">
                            {axie.position} • {axie.class}
                          </span>

                          {queuedCount > 0 && (
                            <div className="absolute -top-2 flex gap-0.5">
                              {Array.from({ length: queuedCount }).map((_, i) => (
                                <span key={i} className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-black"></span>
                              ))}
                            </div>
                          )}

                          {axie.shield > 0 && (
                            <div className="absolute top-6 -left-1 z-20 bg-cyan-500 text-black font-black text-[10px] px-1.5 py-0.5 rounded-full shadow">
                              🛡️ {axie.shield}
                            </div>
                          )}

                          <div className="relative w-20 h-16 sm:w-24 sm:h-20 my-1">
                            <AxieAvatar
                              id={axie.id}
                              axieClass={axie.class}
                              name={axie.name}
                              imageSrc={axie.image}
                              className="w-full h-full"
                            />
                          </div>

                          <div className="text-[11px] font-bold text-zinc-200 truncate max-w-[85px] text-center">
                            {axie.name}
                          </div>

                          <div className="w-full bg-zinc-800 rounded-full h-2 mt-1 overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 transition-all duration-300"
                              style={{ width: `${Math.round((axie.hp / axie.maxHp) * 100)}%` }}
                            ></div>
                          </div>
                          <div className="text-[9px] text-zinc-400 mt-0.5 font-mono">
                            {axie.hp} / {axie.maxHp}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Opponent Team (Right) */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs px-2 font-bold text-rose-400">
                    <span>CHIMERA RAIDERS</span>
                    <span className="text-zinc-500">
                      {enemyTeam.filter((a) => a.hp > 0).length}/3 ALIVE
                    </span>
                  </div>
                  <div className="flex items-center justify-around gap-2 p-3 rounded-2xl bg-zinc-900/50 border border-rose-900/30">
                    {enemyTeam.map((axie) => {
                      const isDead = axie.hp <= 0;
                      return (
                        <div
                          key={axie.id}
                          className={`relative flex flex-col items-center p-2 rounded-2xl transition ${
                            isDead ? 'opacity-25 grayscale' : ''
                          }`}
                        >
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 mb-1">
                            {axie.position} • {axie.class}
                          </span>

                          {axie.shield > 0 && (
                            <div className="absolute top-6 -left-1 z-20 bg-cyan-500 text-black font-black text-[10px] px-1.5 py-0.5 rounded-full shadow">
                              🛡️ {axie.shield}
                            </div>
                          )}

                          <div className="relative w-20 h-16 sm:w-24 sm:h-20 my-1 scale-x-[-1]">
                            <AxieAvatar
                              id={axie.id}
                              axieClass={axie.class}
                              name={axie.name}
                              imageSrc={axie.image}
                              className="w-full h-full"
                            />
                          </div>

                          <div className="text-[11px] font-bold text-zinc-200 truncate max-w-[85px] text-center">
                            {axie.name}
                          </div>

                          <div className="w-full bg-zinc-800 rounded-full h-2 mt-1 overflow-hidden">
                            <div
                              className="h-full bg-rose-500 transition-all duration-300"
                              style={{ width: `${Math.round((axie.hp / axie.maxHp) * 100)}%` }}
                            ></div>
                          </div>
                          <div className="text-[9px] text-zinc-400 mt-0.5 font-mono">
                            {axie.hp} / {axie.maxHp}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom Combat Log */}
              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                <div className="truncate max-w-lg text-zinc-300 font-mono">⚡ {battleLog}</div>
                <div className="text-[11px] text-zinc-500">Speed determines turn order</div>
              </div>
            </div>

            {/* Battle Command Dock */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-5 flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                {/* Energy */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-black text-xl shadow-lg shadow-amber-500/30">
                    ⚡ {playerEnergy}
                  </div>
                  <div>
                    <div className="text-sm font-black text-amber-300">ENERGY POOL</div>
                    <div className="text-xs text-zinc-400">+2 per round (max 10)</div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={clearQueue}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300"
                  >
                    Clear Queue
                  </button>
                  <button
                    onClick={executeTurn}
                    disabled={battlePhase !== 'SELECTION'}
                    className={`px-6 py-2.5 rounded-xl font-black text-sm flex items-center gap-2 shadow-lg ${
                      battlePhase === 'SELECTION'
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black shadow-emerald-500/30 hover:scale-105 transition'
                        : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    }`}
                  >
                    <span>END TURN</span>
                    <Sword className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Cards Hand Dock */}
              <div>
                <div className="text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">
                  YOUR HAND ({playerHand.length} CARDS)
                </div>
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {playerHand.map((card, idx) => {
                    const owner = playerTeam.find((a) => a.id === card.ownerAxieId);
                    const canPlay = playerEnergy >= card.cost && owner && owner.hp > 0 && battlePhase === 'SELECTION';
                    return (
                      <div
                        key={card.uid}
                        onClick={() => canPlay && queueCard(idx)}
                        className={`w-32 sm:w-36 bg-zinc-950 border border-zinc-800 rounded-2xl p-2.5 flex flex-col justify-between shrink-0 transition ${
                          canPlay
                            ? 'cursor-pointer hover:-translate-y-2 hover:border-emerald-400 hover:shadow-xl'
                            : 'opacity-40 grayscale cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="w-5 h-5 rounded-full bg-amber-400 text-black font-black text-xs flex items-center justify-center">
                            {card.cost}
                          </span>
                          <span className="text-[9px] font-black uppercase text-zinc-400">{card.class}</span>
                        </div>

                        <div className="text-xs font-bold text-zinc-100 truncate">{card.name}</div>
                        <div className="text-[9px] text-zinc-500 truncate mb-1">{card.part}</div>

                        <div className="flex items-center gap-1.5 my-1">
                          {card.attack > 0 && (
                            <span className="text-[10px] font-black text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-800">
                              ⚔️ {card.attack}
                            </span>
                          )}
                          {card.shield > 0 && (
                            <span className="text-[10px] font-black text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800">
                              🛡️ {card.shield}
                            </span>
                          )}
                        </div>

                        <p className="text-[9px] text-zinc-400 leading-tight border-t border-zinc-800 pt-1 mt-auto">
                          {card.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BREEDING LAB & INCUBATOR */}
        {activeTab === 'breeding' && (
          <div className="space-y-6">
            {/* Top Currency & Status Banner */}
            <div className="bg-gradient-to-r from-pink-950/40 via-purple-950/30 to-zinc-900 border border-pink-500/30 rounded-3xl p-5 shadow-2xl backdrop-blur flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg shadow-pink-500/30 animate-pulse">
                  🧬
                </div>
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    LUNACIA GENETIC BREEDING LAB
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40">
                      MENDELIAN ENGINE V2.0
                    </span>
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Kawinkan 2 Axie dengan kalkulasi 256-bit BigInt, pewarisan alel D (37.5%), R1 (9.375%), R2 (3.125%), dan proteksi inses.
                  </p>
                </div>
              </div>

              {/* Player Wallet Balances & Faucet */}
              <div className="flex items-center gap-3">
                <div className="bg-zinc-950/80 border border-pink-500/30 rounded-2xl px-4 py-2 flex items-center gap-3 shadow-inner">
                  <div>
                    <div className="text-[9px] uppercase font-bold text-zinc-400">Smooth Love Potion (SLP)</div>
                    <div className="text-sm font-black text-pink-400 font-mono">
                      {slpBalance.toLocaleString()} SLP
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSlpBalance((b) => b + 10000);
                      showTempAnnouncement('💧 SLP Faucet', '+10,000 SLP ditambahkan ke wallet!');
                    }}
                    className="px-2 py-1 rounded-lg bg-pink-500/20 hover:bg-pink-500 hover:text-black border border-pink-500/40 text-[10px] font-black text-pink-300 transition"
                    title="Tambah saldo uji coba SLP"
                  >
                    +10k
                  </button>
                </div>

                <div className="bg-zinc-950/80 border border-purple-500/30 rounded-2xl px-4 py-2 flex items-center gap-3 shadow-inner">
                  <div>
                    <div className="text-[9px] uppercase font-bold text-zinc-400">Axie Infinity Shard (AXS)</div>
                    <div className="text-sm font-black text-purple-400 font-mono">
                      {axsBalance.toFixed(2)} AXS
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setAxsBalance((b) => +(b + 5).toFixed(2));
                      showTempAnnouncement('🪙 AXS Faucet', '+5.0 AXS ditambahkan ke wallet!');
                    }}
                    className="px-2 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500 hover:text-black border border-purple-500/40 text-[10px] font-black text-purple-300 transition"
                    title="Tambah saldo uji coba AXS"
                  >
                    +5.0
                  </button>
                </div>
              </div>
            </div>

            {/* Genetics Synthesis Core: Sire Pod, DNA Bridge, Matron Pod */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              {/* SIRE (FATHER) POD - 4 cols */}
              <div className="lg:col-span-4 bg-zinc-900/80 border border-cyan-500/30 rounded-3xl p-5 flex flex-col justify-between shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-cyan-400 bg-cyan-950/80 border border-cyan-800 px-2.5 py-1 rounded-xl">
                      ♂️ SIRE (AYAH)
                    </span>
                    {sireAxie && (
                      <span className="text-[10px] font-bold text-zinc-400">
                        Breed {sireAxie.breedCount || 0}/7
                      </span>
                    )}
                  </div>
                  {sireAxie && (
                    <button
                      onClick={() => setSireAxie(null)}
                      className="text-zinc-500 hover:text-rose-400 p-1 rounded-lg transition"
                      title="Hapus Sire"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {sireAxie ? (
                  <div className="space-y-3">
                    <div className="relative w-full h-44 flex items-center justify-center bg-gradient-to-b from-cyan-950/20 to-zinc-950 rounded-2xl border border-cyan-900/40">
                      <AxieAvatar
                        id={sireAxie.id}
                        axieClass={sireAxie.class}
                        name={sireAxie.name}
                        imageSrc={sireAxie.image}
                        className="w-36 h-32"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-black text-sm text-white truncate">{sireAxie.name}</h3>
                        <span className="text-xs font-black text-cyan-400">#{sireAxie.id}</span>
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        Kelas: <span className="text-white font-bold">{sireAxie.class}</span>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-1 bg-zinc-950/80 p-2 rounded-xl text-center text-[10px] border border-zinc-800">
                      <div>
                        <div className="text-zinc-500 font-bold">HP</div>
                        <div className="font-black text-emerald-400">{sireAxie.stats.hp}</div>
                      </div>
                      <div>
                        <div className="text-zinc-500 font-bold">SPD</div>
                        <div className="font-black text-cyan-400">{sireAxie.stats.speed}</div>
                      </div>
                      <div>
                        <div className="text-zinc-500 font-bold">SKL</div>
                        <div className="font-black text-amber-400">{sireAxie.stats.skill}</div>
                      </div>
                      <div>
                        <div className="text-zinc-500 font-bold">MOR</div>
                        <div className="font-black text-rose-400">{sireAxie.stats.morale}</div>
                      </div>
                    </div>

                    {/* Body Parts */}
                    <div className="flex flex-wrap gap-1">
                      {sireAxie.parts.map((p) => (
                        <span
                          key={p.id}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700"
                        >
                          {p.type}: {p.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-center border-2 border-dashed border-cyan-500/30 rounded-2xl p-6 bg-cyan-950/10">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3 text-xl">
                      🧬
                    </div>
                    <div className="text-sm font-bold text-zinc-300 mb-1">Sire Belum Dipilih</div>
                    <p className="text-xs text-zinc-500 mb-4">
                      Pilih Axie jantan dari katalog di bawah atau dari tab Marketplace.
                    </p>
                    <button
                      onClick={() => {
                        const first = axies[0];
                        if (first) selectForBreeding(first, 'SIRE');
                      }}
                      className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-black transition"
                    >
                      Pilih Axie Pertama
                    </button>
                  </div>
                )}
              </div>

              {/* CENTER DNA SYNTHESIS CORE & LINEAGE CHECK - 4 cols */}
              <div className="lg:col-span-4 bg-zinc-900/80 border border-pink-500/40 rounded-3xl p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"></div>

                <div className="text-center mb-2">
                  <span className="text-[11px] font-black tracking-wider uppercase text-pink-400 bg-pink-950/80 border border-pink-800 px-3 py-1 rounded-full">
                    🧬 SYNTHESIS CHAMBER
                  </span>
                </div>

                {/* Animated DNA Core Graphic */}
                <div className="relative py-4 flex flex-col items-center justify-center">
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-tr from-pink-600 via-purple-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-pink-500/30 transition-transform ${isBreedingAnim ? 'animate-spin scale-110' : 'animate-pulse'}`}>
                    <Dna className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-xs font-black text-zinc-300 mt-3 text-center">
                    Mendelian Crossover Engine
                  </div>
                  <div className="text-[10px] text-zinc-500 text-center font-mono mt-0.5">
                    D: 37.5% | R1: 9.375% | R2: 3.125%
                  </div>
                </div>

                {/* Real-time Lineage Anti-Incest & Fee Check */}
                <div className="space-y-3">
                  {currentCost && (
                    <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-3 space-y-1.5">
                      <div className="text-[10px] uppercase font-bold text-zinc-400 flex items-center justify-between">
                        <span>Biaya Kawin (Breeding Fee):</span>
                        <span className="text-zinc-500 font-mono">≈ ${currentCost.usdEquivalent} USD</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-black">
                        <span className="text-pink-400 flex items-center gap-1">
                          💧 {currentCost.slp.toLocaleString()} SLP
                        </span>
                        <span className="text-purple-400 flex items-center gap-1">
                          🪙 {currentCost.axs} AXS
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Validation Banner */}
                  {currentValidation ? (
                    currentValidation.canBreed ? (
                      <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-2xl p-3 flex items-start gap-2 text-emerald-300 text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-black text-emerald-300">Validasi Silsilah Lolos</div>
                          <div className="text-[10px] text-emerald-400/80">
                            Tidak terdeteksi hubungan inses (bukan saudara sekandung / orang tua-anak). Saldo mencukupi!
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-rose-950/50 border border-rose-500/40 rounded-2xl p-3 space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 font-black text-rose-300">
                          <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
                          <span>Perkawinan Ditolak (Pelanggaran):</span>
                        </div>
                        <ul className="text-[10px] text-rose-300/80 list-disc list-inside space-y-0.5">
                          {currentValidation.reasons.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    )
                  ) : (
                    <div className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-3 text-center text-xs text-zinc-400">
                      Pilih Sire dan Matron untuk memverifikasi silsilah dan biaya.
                    </div>
                  )}

                  {/* Big Glowing Breed Button */}
                  <button
                    disabled={!currentValidation?.canBreed || isBreedingAnim}
                    onClick={handleExecuteBreed}
                    className={`w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-xl ${
                      currentValidation?.canBreed && !isBreedingAnim
                        ? 'bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:brightness-110 text-white shadow-pink-500/40 cursor-pointer active:scale-95'
                        : 'bg-zinc-800 text-zinc-500 border border-zinc-700/50 cursor-not-allowed opacity-60'
                    }`}
                  >
                    {isBreedingAnim ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        Mensintesis Genetik DNA...
                      </>
                    ) : (
                      <>
                        <Dna className="w-4 h-4" />
                        KAWINKAN SEKARANG (BREED AXIES)
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* MATRON (MOTHER) POD - 4 cols */}
              <div className="lg:col-span-4 bg-zinc-900/80 border border-purple-500/30 rounded-3xl p-5 flex flex-col justify-between shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-purple-400 bg-purple-950/80 border border-purple-800 px-2.5 py-1 rounded-xl">
                      ♀️ MATRON (IBU)
                    </span>
                    {matronAxie && (
                      <span className="text-[10px] font-bold text-zinc-400">
                        Breed {matronAxie.breedCount || 0}/7
                      </span>
                    )}
                  </div>
                  {matronAxie && (
                    <button
                      onClick={() => setMatronAxie(null)}
                      className="text-zinc-500 hover:text-rose-400 p-1 rounded-lg transition"
                      title="Hapus Matron"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {matronAxie ? (
                  <div className="space-y-3">
                    <div className="relative w-full h-44 flex items-center justify-center bg-gradient-to-b from-purple-950/20 to-zinc-950 rounded-2xl border border-purple-900/40">
                      <AxieAvatar
                        id={matronAxie.id}
                        axieClass={matronAxie.class}
                        name={matronAxie.name}
                        imageSrc={matronAxie.image}
                        className="w-36 h-32"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-black text-sm text-white truncate">{matronAxie.name}</h3>
                        <span className="text-xs font-black text-purple-400">#{matronAxie.id}</span>
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        Kelas: <span className="text-white font-bold">{matronAxie.class}</span>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-1 bg-zinc-950/80 p-2 rounded-xl text-center text-[10px] border border-zinc-800">
                      <div>
                        <div className="text-zinc-500 font-bold">HP</div>
                        <div className="font-black text-emerald-400">{matronAxie.stats.hp}</div>
                      </div>
                      <div>
                        <div className="text-zinc-500 font-bold">SPD</div>
                        <div className="font-black text-cyan-400">{matronAxie.stats.speed}</div>
                      </div>
                      <div>
                        <div className="text-zinc-500 font-bold">SKL</div>
                        <div className="font-black text-amber-400">{matronAxie.stats.skill}</div>
                      </div>
                      <div>
                        <div className="text-zinc-500 font-bold">MOR</div>
                        <div className="font-black text-rose-400">{matronAxie.stats.morale}</div>
                      </div>
                    </div>

                    {/* Body Parts */}
                    <div className="flex flex-wrap gap-1">
                      {matronAxie.parts.map((p) => (
                        <span
                          key={p.id}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700"
                        >
                          {p.type}: {p.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-center border-2 border-dashed border-purple-500/30 rounded-2xl p-6 bg-purple-950/10">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3 text-xl">
                      🌸
                    </div>
                    <div className="text-sm font-bold text-zinc-300 mb-1">Matron Belum Dipilih</div>
                    <p className="text-xs text-zinc-500 mb-4">
                      Pilih Axie betina dari katalog di bawah atau dari tab Marketplace.
                    </p>
                    <button
                      onClick={() => {
                        const second = axies[1] || axies[0];
                        if (second) selectForBreeding(second, 'MATRON');
                      }}
                      className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-black text-xs font-black transition"
                    >
                      Pilih Axie Kedua
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Assign Tray from Roster */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <span>⚡ Quick Parent Selector</span>
                    <span className="text-[10px] text-zinc-500 font-normal">
                      (Klik tombol untuk pasang langsung ke Sire atau Matron)
                    </span>
                  </h3>
                </div>
                <span className="text-xs text-zinc-400 font-bold">{axies.length} Axie Siap Kawin</span>
              </div>

              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {axies.slice(0, 10).map((axie) => (
                  <div
                    key={axie.id}
                    className="w-48 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-3 shrink-0 flex flex-col justify-between transition group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[9px] font-black uppercase text-zinc-400">{axie.class}</span>
                        <span className="text-[9px] font-bold text-zinc-500">#{axie.id}</span>
                      </div>
                      <div className="w-full h-24 flex items-center justify-center bg-zinc-900/50 rounded-xl mb-2">
                        <AxieAvatar
                          id={axie.id}
                          axieClass={axie.class}
                          name={axie.name}
                          imageSrc={axie.image}
                          className="w-20 h-20"
                        />
                      </div>
                      <div className="text-xs font-black text-white truncate">{axie.name}</div>
                      <div className="text-[10px] text-zinc-400">Breed: {axie.breedCount || 0}/7</div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 mt-3 pt-2 border-t border-zinc-800">
                      <button
                        onClick={() => selectForBreeding(axie, 'SIRE')}
                        className={`py-1 rounded-lg text-[10px] font-black transition ${
                          sireAxie?.id === axie.id
                            ? 'bg-cyan-500 text-black'
                            : 'bg-zinc-900 hover:bg-cyan-600 hover:text-black text-cyan-400 border border-cyan-800/40'
                        }`}
                      >
                        Set Sire
                      </button>
                      <button
                        onClick={() => selectForBreeding(axie, 'MATRON')}
                        className={`py-1 rounded-lg text-[10px] font-black transition ${
                          matronAxie?.id === axie.id
                            ? 'bg-purple-500 text-black'
                            : 'bg-zinc-900 hover:bg-purple-600 hover:text-black text-purple-400 border border-purple-800/40'
                        }`}
                      >
                        Set Matron
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* EGG INCUBATOR & NURSERY */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl">
                    🥚
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">
                      INKUBATOR TELUR &amp; NURSERY ({incubatingEggs.length} TELUR)
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Telur hasil pembuahan mengalami masa inkubasi 5 hari. Gunakan fitur Tetaskan Instan untuk langsung memasukkannya ke roster pertarungan.
                    </p>
                  </div>
                </div>
              </div>

              {incubatingEggs.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/50">
                  <div className="text-3xl mb-2">🥚</div>
                  <p className="text-sm font-bold text-zinc-400">Belum ada telur di inkubator.</p>
                  <p className="text-xs text-zinc-600 mt-1">
                    Pilih Sire dan Matron di atas lalu klik &quot;Kawinkan Sekarang&quot; untuk menghasilkan telur baru!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {incubatingEggs.map((egg) => (
                    <div
                      key={egg.id}
                      className="bg-zinc-950 border border-zinc-800 hover:border-pink-500/50 rounded-2xl p-4 flex flex-col justify-between shadow-xl transition relative overflow-hidden group"
                    >
                      <div className="absolute top-0 right-0 bg-pink-500/20 text-pink-300 text-[10px] font-black px-2.5 py-1 rounded-bl-xl border-l border-b border-pink-500/30">
                        {egg.stage}
                      </div>

                      <div>
                        {/* Egg Image Preview */}
                        <div className="w-full h-36 flex items-center justify-center bg-gradient-to-b from-pink-950/20 to-zinc-950 rounded-xl mb-3 border border-pink-950/40">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={egg.image || '/axies/egg_mystic.png'}
                            alt={egg.name}
                            className="w-28 h-28 object-contain filter drop-shadow-[0_10px_20px_rgba(236,72,153,0.3)] group-hover:scale-110 transition-transform duration-300 animate-pulse"
                          />
                        </div>

                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                            {egg.class}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">#{egg.id}</span>
                        </div>

                        <h4 className="font-black text-sm text-white truncate">{egg.name}</h4>

                        <div className="text-[11px] text-zinc-400 mt-1">
                          Lineage: <span className="text-cyan-400 font-semibold">{egg.sireName}</span> ×{' '}
                          <span className="text-purple-400 font-semibold">{egg.matronName}</span>
                        </div>

                        {/* Gene 256-Bit Preview */}
                        <div className="mt-2 bg-zinc-900/90 p-2 rounded-xl text-[9px] font-mono text-zinc-400 truncate border border-zinc-800">
                          <span className="text-pink-400 font-bold">DNA:</span> {egg.genes256}
                        </div>

                        <div className="flex items-center gap-1.5 mt-2 text-[10px] text-amber-400 font-bold">
                          <Clock className="w-3.5 h-3.5" /> {egg.hatchDate}
                        </div>
                      </div>

                      {/* Instant Hatch Button */}
                      <div className="mt-4 pt-3 border-t border-zinc-800">
                        <button
                          onClick={() => handleInstantHatch(egg.id)}
                          className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black text-xs font-black transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95"
                        >
                          <Zap className="w-3.5 h-3.5 fill-black" />
                          ⚡ Tetaskan Instan (Instant Hatch)
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: ASSET GENERATOR STUDIO (OPSI 3) */}
        {activeTab === 'generator' && (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-amber-950/40 via-orange-950/30 to-zinc-900 border border-amber-500/30 rounded-3xl p-5 shadow-2xl backdrop-blur flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/30 animate-pulse">
                  🧪
                </div>
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    AXIE ASSET GENERATOR STUDIO (OPSI 3)
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      HEADLESS ASSET SYNTHESIS
                    </span>
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Sintesis dan cetak Axie baru beresolusi tinggi dengan sprite transparan murni, kalkulasi genetik 256-bit BigInt, dan ekspor instan ke Marketplace.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={randomizeGenName}
                  className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-amber-300 transition flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Acak Nama Baru
                </button>
              </div>
            </div>

            {/* 2D Modular Spine Assembler & Layer Customizer Studio */}
            <AxieModularAssembler
              initialClass={
                (['Beast', 'Plant', 'Aquatic', 'Bird', 'Bug', 'Reptile'].includes(genClass)
                  ? genClass
                  : 'Beast') as any
              }
              initialBodyType={genBodyType}
              selectedBodyType={genBodyType}
              onConfigChange={(newCfg) => {
                if (newCfg.bodyClass && newCfg.bodyClass !== genClass) {
                  setGenClass(newCfg.bodyClass as CreatureClass);
                }
                if (newCfg.bodyType && newCfg.bodyType !== genBodyType) {
                  setGenBodyType(newCfg.bodyType as AxieBodyType);
                }
              }}
              onExportPNG={(dataUrl) => {
                setCustomSprite(dataUrl);
                showTempAnnouncement('✨ Sprite Dirakit!', 'Sprite modular resolusi tinggi diterapkan ke Generator.');
              }}
            />

            {/* Studio Workspace: Configuration & Live Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Left Column: Generator & Body Parts Customizer - 7 cols */}
              <div className="lg:col-span-7 bg-zinc-900/80 border border-amber-500/30 rounded-3xl p-6 flex flex-col justify-between shadow-xl space-y-6">
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Kustomisasi Bagian Tubuh &amp; Silsilah Genetik
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => applyPurebredPreset(genClass)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 hover:text-black border border-emerald-500/40 text-[10px] font-black text-emerald-300 transition"
                      >
                        ⚡ 6/6 Purebred
                      </button>
                      <button
                        onClick={applyRandomMixPreset}
                        className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500 hover:text-black border border-purple-500/40 text-[10px] font-black text-purple-300 transition"
                      >
                        🎲 Acak Silsilah
                      </button>
                      <button
                        onClick={() => {
                          setGenClass('Beast');
                          setGenBodyType('bigyak');
                          setCustomSprite('/axies/assets/custom_bigyak_creature.svg');
                          showTempAnnouncement('🔥 Bigyak Custom Dimuat!', 'Karakter modular Bigyak Beast resmi diterapkan.');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500 hover:text-black border border-amber-500/40 text-[10px] font-black text-amber-300 transition"
                      >
                        🔥 Bigyak Custom
                      </button>
                    </div>
                  </div>

                  {/* 1. Class / Archetype Selector */}
                  <div>
                    <label className="text-xs font-bold text-zinc-400 block mb-2">
                      1. Pilih Kelas Dasar / Archetype Tubuh:
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                      {['Plant', 'Beast', 'Aquatic', 'Bird', 'Reptile', 'Bug', 'Mech', 'Dawn', 'Dusk'].map((c) => (
                        <button
                          key={c}
                          onClick={() => {
                            setGenClass(c as CreatureClass);
                            applyPurebredPreset(c as CreatureClass);
                            setGenName(`Alpha ${c} Sovereign Prototype`);
                          }}
                          className={`py-1.5 px-2.5 rounded-xl text-xs font-black transition border text-center ${
                            genClass === c
                              ? 'bg-amber-400 text-black border-amber-300 shadow-md shadow-amber-400/20'
                              : 'bg-zinc-950/80 text-zinc-400 hover:text-white border-zinc-800'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. GTK2D Special Body Types Selector */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
                        <span>2. Pilih Tipe Tubuh Spesial (Official unity-axie-gtk2d):</span>
                        <span className="text-[10px] text-amber-400 font-mono">
                          {BODY_TYPE_CATALOG[genBodyType]?.gtkMaterial}
                        </span>
                      </label>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        10 Tipe GTK2D Tersedia
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {(Object.keys(BODY_TYPE_CATALOG) as AxieBodyType[]).map((btKey) => {
                        const bt = BODY_TYPE_CATALOG[btKey];
                        const isSelected = genBodyType === btKey;
                        const mod = bt.modifiers;
                        return (
                          <div
                            key={btKey}
                            onClick={() => handleSelectBodyType(btKey)}
                            className={`p-2.5 rounded-2xl border cursor-pointer transition flex flex-col justify-between text-left relative overflow-hidden ${
                              isSelected
                                ? 'bg-amber-500/15 border-amber-400 shadow-lg shadow-amber-500/20 scale-[1.02]'
                                : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-black ${
                                  isSelected ? 'bg-amber-400 text-black' : 'bg-zinc-800 text-zinc-400'
                                }`}
                              >
                                {bt.gtkMaterial}
                              </span>
                              <span className="text-xs">{bt.icon}</span>
                            </div>
                            <div className="my-1 flex items-center justify-center">
                              <AxieBodyTypeThumbnail bodyType={btKey} isSelected={isSelected} className="w-full h-14" />
                            </div>
                            <div className="mt-1">
                              <div className="text-xs font-black text-white">{bt.name}</div>
                              <div className="text-[9px] text-zinc-400 line-clamp-1 mt-0.5">{bt.description}</div>
                            </div>
                            {/* Modifiers Pill */}
                            <div className="mt-2 pt-1.5 border-t border-zinc-800/80 flex flex-wrap gap-1 text-[8px] font-bold font-mono">
                              {mod.hp !== 0 && (
                                <span className={mod.hp > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                                  {mod.hp > 0 ? `+${mod.hp}` : mod.hp} HP
                                </span>
                              )}
                              {mod.speed !== 0 && (
                                <span className={mod.speed > 0 ? 'text-cyan-400' : 'text-rose-400'}>
                                  {mod.speed > 0 ? `+${mod.speed}` : mod.speed} SPD
                                </span>
                              )}
                              {mod.skill !== 0 && (
                                <span className={mod.skill > 0 ? 'text-amber-400' : 'text-rose-400'}>
                                  {mod.skill > 0 ? `+${mod.skill}` : mod.skill} SKL
                                </span>
                              )}
                              {mod.morale !== 0 && (
                                <span className={mod.morale > 0 ? 'text-rose-400' : 'text-rose-400'}>
                                  {mod.morale > 0 ? `+${mod.morale}` : mod.morale} MOR
                                </span>
                              )}
                              {mod.hp === 0 && mod.speed === 0 && mod.skill === 0 && mod.morale === 0 && (
                                <span className="text-zinc-500">Seimbang Standar</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. GTK2D Body Material / Skin Shader Selector */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
                        <span>3. Finishing Material Kulit &amp; Shader (unity-axie-gtk2d):</span>
                        <span className="text-[10px] text-purple-400 font-mono">
                          {BODY_MATERIAL_CATALOG[genBodyMaterial]?.shaderTag}
                        </span>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {(Object.keys(BODY_MATERIAL_CATALOG) as BodyMaterialType[]).map((matKey) => {
                        const mat = BODY_MATERIAL_CATALOG[matKey];
                        const isSelected = genBodyMaterial === matKey;
                        return (
                          <div
                            key={matKey}
                            onClick={() => setGenBodyMaterial(matKey)}
                            className={`p-2 rounded-xl border cursor-pointer transition flex flex-col justify-between text-left ${
                              isSelected
                                ? 'bg-purple-500/15 border-purple-400 shadow-md shadow-purple-500/20'
                                : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-white">{mat.name}</span>
                              <span className={`text-[8px] font-mono px-1 rounded ${mat.badge}`}>
                                {matKey}
                              </span>
                            </div>
                            <div className="text-[9px] text-zinc-400 mt-1 line-clamp-1">{mat.description}</div>
                            <div className="text-[8px] font-mono text-zinc-500 mt-1">Shader: {mat.shaderTag}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 4. Inheritance Tier Switch (Pewarisan Struktur D, R1, R2) */}
                  <div>
                    <label className="text-xs font-bold text-zinc-400 flex items-center justify-between mb-2">
                      <span>4. Pilih Tier Alel yang Ingin Dikustomisasi (Struktur Pewarisan):</span>
                      <span className="text-[10px] font-mono text-amber-400">
                        {customGeneTier === 'D'
                          ? '⭐ Dominan (Fisik / 37.5%)'
                          : customGeneTier === 'R1'
                          ? '🧬 Resesif 1 (9.375%)'
                          : '🔬 Resesif 2 (3.125%)'}
                      </span>
                    </label>
                    <div className="grid grid-cols-3 gap-2 p-1.5 bg-zinc-950 rounded-2xl border border-zinc-800">
                      <button
                        onClick={() => setCustomGeneTier('D')}
                        className={`py-2 px-3 rounded-xl text-xs font-black transition flex flex-col items-center gap-0.5 ${
                          customGeneTier === 'D'
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/25'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <span className="font-black text-xs">⭐ DOMINAN (D)</span>
                        <span className="text-[9px] opacity-80">Tampil Fisik &amp; 37.5%</span>
                      </button>
                      <button
                        onClick={() => setCustomGeneTier('R1')}
                        className={`py-2 px-3 rounded-xl text-xs font-black transition flex flex-col items-center gap-0.5 ${
                          customGeneTier === 'R1'
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black shadow-lg shadow-cyan-500/25'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <span className="font-black text-xs">🧬 RESESIF 1 (R1)</span>
                        <span className="text-[9px] opacity-80">Peluang Waris 9.375%</span>
                      </button>
                      <button
                        onClick={() => setCustomGeneTier('R2')}
                        className={`py-2 px-3 rounded-xl text-xs font-black transition flex flex-col items-center gap-0.5 ${
                          customGeneTier === 'R2'
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-black shadow-lg shadow-purple-500/25'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <span className="font-black text-xs">🔬 RESESIF 2 (R2)</span>
                        <span className="text-[9px] opacity-80">Peluang Waris 3.125%</span>
                      </button>
                    </div>
                  </div>

                  {/* 5. 6 Body Parts Customizer Cards */}
                  <div>
                    <label className="text-xs font-bold text-zinc-400 block mb-2">
                      5. Kustomisasi 6 Bagian Tubuh untuk Tier{' '}
                      <span className="text-amber-400 font-black">[{customGeneTier}]</span>:
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {(['eyes', 'ears', 'mouth', 'horn', 'back', 'tail'] as BodyPartType[]).map((partType) => {
                        const currentPart = customParts[partType][customGeneTier];
                        const availableParts = KNOWN_PARTS_CATALOG.filter((p) => p.type === partType);

                        const partLabelMap: Record<BodyPartType, { name: string; icon: string }> = {
                          eyes: { name: 'Mata (Eyes)', icon: '👁️' },
                          ears: { name: 'Telinga (Ears)', icon: '👂' },
                          mouth: { name: 'Mulut (Mouth)', icon: '👄' },
                          horn: { name: 'Tanduk (Horn)', icon: '📯' },
                          back: { name: 'Punggung (Back)', icon: '🛡️' },
                          tail: { name: 'Ekor (Tail)', icon: '🪶' },
                        };

                        return (
                          <div
                            key={partType}
                            className="bg-zinc-950/90 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-3 space-y-2 transition shadow-inner"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-zinc-300 flex items-center gap-1.5">
                                <span>{partLabelMap[partType].icon}</span>
                                <span>{partLabelMap[partType].name}</span>
                              </span>
                              <span
                                className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                                  CLASS_THEMES[currentPart.class]?.badge || 'bg-zinc-800 text-zinc-300'
                                }`}
                              >
                                {currentPart.class}
                              </span>
                            </div>

                            {/* Part Selector Dropdown */}
                            <select
                              value={currentPart.id}
                              onChange={(e) => setPartAllele(partType, customGeneTier, e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-800 text-xs font-bold text-white rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-amber-400 cursor-pointer"
                            >
                              {availableParts.map((p) => (
                                <option key={p.id} value={p.id} className="bg-zinc-900 text-white">
                                  [{p.class.toUpperCase()}] {p.name}
                                </option>
                              ))}
                            </select>

                            <div className="text-[10px] text-zinc-500 flex items-center justify-between font-mono">
                              <span>Binary: #{currentPart.binaryCode}</span>
                              <span className="text-zinc-400">
                                Bonus:{' '}
                                {currentPart.class === 'Plant'
                                  ? '+3 HP, +1 MOR'
                                  : currentPart.class === 'Aquatic'
                                  ? '+3 SPD, +1 HP'
                                  : currentPart.class === 'Beast'
                                  ? '+3 MOR, +1 SPD'
                                  : currentPart.class === 'Bird'
                                  ? '+3 SPD, +1 MOR'
                                  : currentPart.class === 'Reptile'
                                  ? '+3 HP, +1 SPD'
                                  : '+3 MOR, +1 HP'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 6. Sprite Visual Model Selector */}
                  <div>
                    <label className="text-xs font-bold text-zinc-400 block mb-2">
                      6. Pilih Varian Model Visual (Sprite Transparan Murni):
                    </label>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {(CLASS_SPRITE_PREVIEWS[genClass] || CLASS_SPRITE_PREVIEWS.Plant).map((spr, idx) => (
                        <div
                          key={idx}
                          onClick={() => setCustomSprite(spr)}
                          className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center p-1 cursor-pointer transition shrink-0 ${
                            customSprite === spr
                              ? 'border-amber-400 bg-amber-400/20 scale-105 shadow-md shadow-amber-400/20'
                              : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={spr} alt="model" className="w-full h-full object-contain" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 7. Custom Name Input */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400 flex items-center justify-between">
                      <span>7. Nama Karakter Axie:</span>
                      <button
                        onClick={randomizeGenName}
                        className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 font-bold"
                      >
                        🎲 Acak Nama Lunacia
                      </button>
                    </label>
                    <input
                      type="text"
                      value={genName}
                      onChange={(e) => setGenName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 font-bold"
                      placeholder="Masukkan nama Axie..."
                    />
                  </div>
                </div>

                {/* Synthesis Action Button */}
                <div className="pt-3 border-t border-zinc-800">
                  <button
                    disabled={isGenerating}
                    onClick={handleGenerateAxie}
                    className={`w-full py-4 rounded-2xl font-black text-sm transition flex items-center justify-center gap-2 shadow-xl ${
                      isGenerating
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 hover:brightness-110 text-black shadow-amber-500/25 active:scale-95 cursor-pointer'
                    }`}
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-zinc-400" />
                        Mensintesis Sprite &amp; Genetik Kustom...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 fill-black" />
                        CETAK &amp; TERBITKAN AXIE KUSTOM KE MARKETPLACE
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Right Column: Live Visual & Metadata Preview - 5 cols */}
              <div className="lg:col-span-5 bg-zinc-900/80 border border-amber-500/30 rounded-3xl p-6 flex flex-col justify-between shadow-xl space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black text-amber-400 bg-amber-950/80 border border-amber-800 px-2.5 py-1 rounded-xl">
                      👁️ LIVE SPRITE PREVIEW
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                      PURE TRANSPARENT RGBA
                    </span>
                  </div>

                  {/* Visual Render Canvas */}
                  <div className="relative w-full h-56 flex items-center justify-center bg-gradient-to-b from-amber-950/20 via-zinc-950 to-zinc-950 rounded-2xl border border-amber-900/40 p-4 overflow-hidden group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={customSprite}
                      alt={genName}
                      className="w-48 h-44 object-contain filter drop-shadow-[0_12px_24px_rgba(245,158,11,0.35)] group-hover:scale-105 transition-transform"
                    />
                  </div>

                  {/* Character Name, Class, Body Type, Material, and Purity */}
                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <h3 className="text-base font-black text-white">{genName}</h3>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className="text-[10px] text-zinc-400 font-bold">
                          Kelas: <span className="text-amber-400">{genClass}</span>
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          {BODY_TYPE_CATALOG[genBodyType]?.icon} {BODY_TYPE_CATALOG[genBodyType]?.gtkMaterial}
                        </span>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                          {BODY_MATERIAL_CATALOG[genBodyMaterial]?.name}
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          Kemurnian: {customPureCount}/6 ({Math.round((customPureCount / 6) * 100)}%)
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-black text-emerald-400">$64.0 USD</div>
                      <div className="text-[10px] font-mono text-zinc-500">0.026 WETH</div>
                    </div>
                  </div>

                  {/* Dynamic Stats Grid based on Dominant Parts + Body Type Modifiers */}
                  {(() => {
                    const btMod = BODY_TYPE_CATALOG[genBodyType]?.modifiers || { hp: 0, speed: 0, skill: 0, morale: 0 };
                    return (
                      <div className="grid grid-cols-4 gap-2 mt-4 bg-zinc-950 p-3 rounded-2xl text-center text-xs border border-zinc-800">
                        <div>
                          <div className="text-zinc-500 font-bold text-[10px] flex items-center justify-center gap-1">
                            <span>HP</span>
                            {btMod.hp !== 0 && (
                              <span className={`text-[8px] font-mono font-bold ${btMod.hp > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                ({btMod.hp > 0 ? `+${btMod.hp}` : btMod.hp})
                              </span>
                            )}
                          </div>
                          <div className="font-black text-emerald-400 text-sm">{currentCustomStats.hp}</div>
                        </div>
                        <div>
                          <div className="text-zinc-500 font-bold text-[10px] flex items-center justify-center gap-1">
                            <span>SPEED</span>
                            {btMod.speed !== 0 && (
                              <span className={`text-[8px] font-mono font-bold ${btMod.speed > 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
                                ({btMod.speed > 0 ? `+${btMod.speed}` : btMod.speed})
                              </span>
                            )}
                          </div>
                          <div className="font-black text-cyan-400 text-sm">{currentCustomStats.speed}</div>
                        </div>
                        <div>
                          <div className="text-zinc-500 font-bold text-[10px] flex items-center justify-center gap-1">
                            <span>SKILL</span>
                            {btMod.skill !== 0 && (
                              <span className={`text-[8px] font-mono font-bold ${btMod.skill > 0 ? 'text-amber-400' : 'text-rose-400'}`}>
                                ({btMod.skill > 0 ? `+${btMod.skill}` : btMod.skill})
                              </span>
                            )}
                          </div>
                          <div className="font-black text-amber-400 text-sm">{currentCustomStats.skill}</div>
                        </div>
                        <div>
                          <div className="text-zinc-500 font-bold text-[10px] flex items-center justify-center gap-1">
                            <span>MORALE</span>
                            {btMod.morale !== 0 && (
                              <span className={`text-[8px] font-mono font-bold ${btMod.morale > 0 ? 'text-rose-400' : 'text-rose-400'}`}>
                                ({btMod.morale > 0 ? `+${btMod.morale}` : btMod.morale})
                              </span>
                            )}
                          </div>
                          <div className="font-black text-rose-400 text-sm">{currentCustomStats.morale}</div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Comprehensive Genetic Allele Breakdown Table (D | R1 | R2) */}
                  <div className="mt-4 bg-zinc-950 border border-zinc-800 rounded-2xl p-3 space-y-2">
                    <div className="text-[11px] font-black uppercase text-zinc-400 flex items-center justify-between">
                      <span>Rincian Alel Genetik Lengkap:</span>
                      <span className="text-amber-400 font-mono text-[10px]">6 Bagian × 3 Tier</span>
                    </div>

                    <div className="overflow-x-auto text-[10px]">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-zinc-500 border-b border-zinc-800/80">
                            <th className="pb-1">Bagian</th>
                            <th className="pb-1 text-amber-400 font-bold">D (37.5%)</th>
                            <th className="pb-1 text-cyan-400 font-bold">R1 (9.375%)</th>
                            <th className="pb-1 text-purple-400 font-bold">R2 (3.125%)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900">
                          {(['eyes', 'ears', 'mouth', 'horn', 'back', 'tail'] as BodyPartType[]).map((type) => (
                            <tr key={type} className="hover:bg-zinc-900/50">
                              <td className="py-1 font-bold text-zinc-400 capitalize">{type}</td>
                              <td className="py-1 text-zinc-200 truncate max-w-[90px]">
                                {customParts[type].D.name}
                              </td>
                              <td className="py-1 text-zinc-400 truncate max-w-[90px]">
                                {customParts[type].R1.name}
                              </td>
                              <td className="py-1 text-zinc-500 truncate max-w-[90px]">
                                {customParts[type].R2.name}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 256-Bit Gene Hex Preview */}
                  <div className="mt-3 bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 text-[10px] font-mono text-zinc-400 truncate">
                    <span className="text-amber-400 font-bold">256-Bit DNA:</span>{' '}
                    {currentCustomGeneHash}
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800/80 text-[11px] text-zinc-500 flex items-center justify-between">
                  <span>Format: WebP / PNG Transparan Murni</span>
                  <span className="text-emerald-400 font-bold">✓ Ready for Marketplace</span>
                </div>
              </div>
            </div>

            {/* Showcase of 10 Batch-Generated Axies */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>✨ Koleksi 10 Axie Baru Hasil Cetak Generator (Batch-Generated Variants)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      LIVE IN MARKETPLACE
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Varian unik di bawah ini baru saja dicetak secara batch menggunakan Headless Generator Engine dan siap dikawinkan atau dipertarungkan.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('marketplace')}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 transition"
                >
                  Buka di Marketplace →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {axies.slice(0, 10).map((axie) => (
                  <div
                    key={axie.id}
                    className="bg-zinc-950 border border-zinc-800 hover:border-amber-500/50 rounded-2xl p-3 flex flex-col justify-between transition group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="text-[9px] font-black px-2 py-0.5 rounded bg-zinc-900 text-zinc-300">
                            {axie.class}
                          </span>
                          {axie.bodyTypeName && (
                            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              {axie.bodyTypeName}
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-zinc-500 font-mono">#{axie.id}</span>
                      </div>

                      <div className="w-full h-32 flex items-center justify-center bg-zinc-900/40 rounded-xl my-2 border border-zinc-800/60 group-hover:scale-105 transition-transform">
                        <AxieAvatar
                          id={axie.id}
                          axieClass={axie.class}
                          name={axie.name}
                          imageSrc={axie.image}
                          className="w-24 h-24"
                        />
                      </div>

                      <h4 className="font-black text-xs text-white truncate">{axie.name}</h4>
                      <div className="text-[10px] text-emerald-400 font-black mt-0.5">
                        ${axie.priceUsd.toFixed(1)} USD
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-zinc-800 space-y-1">
                      <button
                        onClick={() => selectForBreeding(axie)}
                        className="w-full py-1.5 rounded-lg bg-pink-500/20 hover:bg-pink-500 hover:text-black border border-pink-500/40 text-[10px] font-black text-pink-300 transition flex items-center justify-center gap-1"
                      >
                        <Dna className="w-3 h-3" /> Kawinkan (0/7)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* BREEDING CELEBRATION MODAL */}
        {breedingModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-zinc-950 border border-pink-500/50 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 animate-in fade-in zoom-in duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg shadow-pink-500/30">
                    🎉
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">TELUR AXIE BARU BERHASIL DIHASILKAN!</h3>
                    <p className="text-xs text-zinc-400">
                      Transaksi Silsilah Ronin Berhasil Diverifikasi ({breedingModal.txHash.slice(0, 16)}...)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setBreedingModal(null)}
                  className="text-zinc-500 hover:text-white p-1 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Egg Showcase */}
              <div className="flex flex-col sm:flex-row items-center gap-6 bg-gradient-to-r from-pink-950/30 to-purple-950/30 p-5 rounded-2xl border border-pink-500/30">
                <div className="w-32 h-32 flex items-center justify-center shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/axies/egg_mystic.png"
                    alt="Bred Egg"
                    className="w-28 h-28 object-contain filter drop-shadow-[0_10px_25px_rgba(236,72,153,0.5)] animate-pulse"
                  />
                </div>
                <div className="space-y-1.5 text-center sm:text-left">
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40">
                    KELAS: {breedingModal.offspring.class.toUpperCase()}
                  </span>
                  <h4 className="text-base font-black text-white">{breedingModal.offspring.name}</h4>
                  <p className="text-xs text-zinc-400 font-mono">
                    ID: #{breedingModal.offspring.id} | Inkubasi: 5 Hari
                  </p>
                  <div className="text-[10px] font-mono text-zinc-400 bg-zinc-950/80 p-2 rounded-lg border border-zinc-800 break-all">
                    <span className="text-pink-400 font-bold">256-Bit Gene:</span> {breedingModal.offspring.genes.rawBigInt}
                  </div>
                </div>
              </div>

              {/* Mendelian Breakdown Table */}
              <div>
                <h4 className="text-xs font-black uppercase text-zinc-400 mb-2 flex items-center gap-1.5">
                  <Dna className="w-3.5 h-3.5 text-pink-400" />
                  Rincian Pewarisan Alel Genetik (Mendelian Inheritance)
                </h4>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden text-[11px]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-950/80 text-zinc-400 border-b border-zinc-800 text-[10px] uppercase font-bold">
                        <th className="p-2">Bagian Tubuh</th>
                        <th className="p-2">Asal Pewarisan</th>
                        <th className="p-2">Tier Alel</th>
                        <th className="p-2">Nama Bagian Terpilih</th>
                        <th className="p-2">Kelas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {Object.values(breedingModal.geneBreakdown).map((gene) => (
                        <tr key={gene.partType} className="hover:bg-zinc-800/40">
                          <td className="p-2 font-bold capitalize text-white">{gene.partType}</td>
                          <td className="p-2">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                gene.inheritedFrom === 'sire'
                                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-800'
                                  : gene.inheritedFrom === 'matron'
                                  ? 'bg-purple-500/20 text-purple-400 border border-purple-800'
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-800'
                              }`}
                            >
                              {gene.inheritedFrom.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-2 font-mono font-bold text-pink-400">{gene.tier}</td>
                          <td className="p-2 text-zinc-200">{gene.expressedGene.name}</td>
                          <td className="p-2 text-zinc-400">{gene.expressedGene.class}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setBreedingModal(null)}
                  className="px-5 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-400 text-black text-xs font-black transition shadow-lg shadow-pink-500/25"
                >
                  Tutup &amp; Lihat di Inkubator
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
