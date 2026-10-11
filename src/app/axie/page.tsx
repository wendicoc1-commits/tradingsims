'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import AxieAvatar from '@/components/axie/AxieAvatar';
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
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'marketplace' | 'arena'>('marketplace');
  const [axies, setAxies] = useState<AxieItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedArena, setSelectedArena] = useState<'pond' | 'night' | 'lotus' | 'gears' | 'amethyst' | 'canyon' | 'jungle'>('pond');

  const ARENA_ENVIRONMENTS = [
    { id: 'pond', name: '🌸 Lunacia Pond (Day)', bg: '/axies/arena_lunacia_pond.png' },
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
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${theme.badge}`}>
                            {axie.class.toUpperCase()}
                          </span>
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

                      {/* Draft Action Button */}
                      <div className="mt-4 pt-3 border-t border-zinc-800/80 flex gap-1.5">
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
      </div>
    </div>
  );
}
