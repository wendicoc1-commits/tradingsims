'use client';

import React, { useState } from 'react';

interface AxieAvatarProps {
  id: string;
  axieClass: string;
  name?: string;
  className?: string;
  imageSrc?: string;
}

// Authentic class color palettes and signatures
const CLASS_SPECS: Record<
  string,
  {
    body: string;
    bodyDark: string;
    belly: string;
    accent: string;
    horn: string;
    eyeColor: string;
    hornShape: 'cactus' | 'blade' | 'anemone' | 'feather' | 'spikes' | 'antenna';
    tailShape: 'carrot' | 'rice' | 'nimo' | 'feather' | 'iguana' | 'bug';
  }
> = {
  Plant: {
    body: '#22c55e',
    bodyDark: '#15803d',
    belly: '#86efac',
    accent: '#166534',
    horn: '#f59e0b',
    eyeColor: '#0f172a',
    hornShape: 'cactus',
    tailShape: 'carrot',
  },
  Beast: {
    body: '#f59e0b',
    bodyDark: '#d97706',
    belly: '#fde68a',
    accent: '#b45309',
    horn: '#ea580c',
    eyeColor: '#0f172a',
    hornShape: 'blade',
    tailShape: 'rice',
  },
  Aquatic: {
    body: '#06b6d4',
    bodyDark: '#0891b2',
    belly: '#a5f3fc',
    accent: '#0e7490',
    horn: '#f43f5e',
    eyeColor: '#0f172a',
    hornShape: 'anemone',
    tailShape: 'nimo',
  },
  Bird: {
    body: '#ec4899',
    bodyDark: '#db2777',
    belly: '#fbcfe8',
    accent: '#be185d',
    horn: '#eab308',
    eyeColor: '#0f172a',
    hornShape: 'feather',
    tailShape: 'feather',
  },
  Reptile: {
    body: '#a855f7',
    bodyDark: '#9333ea',
    belly: '#e9d5ff',
    accent: '#7e22ce',
    horn: '#06b6d4',
    eyeColor: '#0f172a',
    hornShape: 'spikes',
    tailShape: 'iguana',
  },
  Bug: {
    body: '#ef4444',
    bodyDark: '#dc2626',
    belly: '#fca5a5',
    accent: '#b91c1c',
    horn: '#eab308',
    eyeColor: '#0f172a',
    hornShape: 'antenna',
    tailShape: 'bug',
  },
};

const CLASS_SPRITE_CONFIG: Record<
  string,
  {
    sprite: string;
    filter: string;
    glow: string;
  }
> = {
  Aquatic: {
    sprite: '/axies/sprite_aqua_crest.png',
    filter: 'none',
    glow: 'rgba(6, 182, 212, 0.45)',
  },
  Aqua: {
    sprite: '/axies/sprite_aqua_crest.png',
    filter: 'none',
    glow: 'rgba(6, 182, 212, 0.45)',
  },
  Beast: {
    sprite: '/axies/sprite_yellow_fluffy.png',
    filter: 'none',
    glow: 'rgba(245, 158, 11, 0.45)',
  },
  Plant: {
    sprite: '/axies/sprite_blue_eyes_plant.png',
    filter: 'none',
    glow: 'rgba(34, 197, 94, 0.45)',
  },
  Bird: {
    sprite: '/axies/sprite_bird_sakura.png',
    filter: 'none',
    glow: 'rgba(236, 72, 153, 0.45)',
  },
  Reptile: {
    sprite: '/axies/sprite_reptile_spiral.png',
    filter: 'none',
    glow: 'rgba(168, 85, 247, 0.45)',
  },
  Bug: {
    sprite: '/axies/sprite_green_brawler.png',
    filter: 'none',
    glow: 'rgba(239, 68, 68, 0.45)',
  },
  Mech: {
    sprite: '/axies/sprite_mech_golem.png',
    filter: 'none',
    glow: 'rgba(96, 165, 250, 0.45)',
  },
  Dusk: {
    sprite: '/axies/sprite_dusk_night.png',
    filter: 'none',
    glow: 'rgba(99, 102, 241, 0.45)',
  },
  Dawn: {
    sprite: '/axies/sprite_zen_white_plant.png',
    filter: 'none',
    glow: 'rgba(252, 211, 77, 0.45)',
  },
};

export default function AxieAvatar({
  id,
  axieClass,
  name,
  className = 'w-24 h-20',
  imageSrc,
}: AxieAvatarProps) {
  const [imgFailed, setImgFailed] = useState(false);

  const config = CLASS_SPRITE_CONFIG[axieClass] || CLASS_SPRITE_CONFIG.Plant;
  const activeSprite = imageSrc && imageSrc.startsWith('/axies/') ? imageSrc : config.sprite;
  const activeFilter = imageSrc && imageSrc.startsWith('/axies/') ? 'none' : config.filter;

  // Render high-res painterly sprite with authentic class art & lighting
  if (config && !imgFailed) {
    return (
      <div className={`relative flex items-center justify-center select-none ${className}`}>
        <div
          className="w-full h-full relative overflow-hidden rounded-2xl border border-zinc-700/80 bg-zinc-900/90 shadow-xl group-hover:scale-105 transition-all duration-300"
          style={{ boxShadow: `0 8px 24px -6px ${config.glow}` }}
        >
          <img
            src={activeSprite}
            alt={name || `Axie #${id}`}
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover transition-transform duration-300"
            style={{ filter: activeFilter }}
            loading="lazy"
          />
          <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 pointer-events-none" />
        </div>
      </div>
    );
  }

  // Render authentic animated SVG Axie model for other classes or fallback
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {!imgFailed && imageSrc ? (
        <img
          src={imageSrc}
          alt={name || `Axie #${id}`}
          onError={() => setImgFailed(true)}
          className="w-full h-full object-contain filter drop-shadow-lg"
          loading="lazy"
        />
      ) : (
        <svg
          viewBox="0 0 140 120"
          className="w-full h-full filter drop-shadow-xl overflow-visible transition-transform hover:scale-105 duration-200"
        >
          <defs>
            <radialGradient id={`glow-${id}`} cx="50%" cy="40%" r="55%">
              <stop offset="0%" stopColor={spec.belly} stopOpacity="0.4" />
              <stop offset="100%" stopColor={spec.bodyDark} stopOpacity="0.9" />
            </radialGradient>
            <linearGradient id={`grad-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={spec.body} />
              <stop offset="100%" stopColor={spec.bodyDark} />
            </linearGradient>
          </defs>

          {/* Ground Soft Shadow */}
          <ellipse cx="70" cy="106" rx="46" ry="10" fill="rgba(0, 0, 0, 0.45)" />

          {/* BACK PARTS / TAIL */}
          {spec.tailShape === 'carrot' && (
            <g transform="translate(14, 52) rotate(-20)">
              {/* Carrot Tail */}
              <polygon points="0,15 15,0 20,20" fill="#f97316" stroke="#090d16" strokeWidth="2.5" />
              <path d="M 0 15 Q -6 8 -2 2" stroke="#22c55e" strokeWidth="3" fill="none" strokeLinecap="round" />
            </g>
          )}

          {spec.tailShape === 'rice' && (
            <g transform="translate(18, 56) rotate(-15)">
              {/* Beast Fur Tail */}
              <path d="M 0 12 Q -12 2 4 -4 Q 14 6 12 18 Z" fill={spec.horn} stroke="#090d16" strokeWidth="2.5" />
            </g>
          )}

          {spec.tailShape === 'nimo' && (
            <g transform="translate(14, 55)">
              {/* Aqua Nimo Tail */}
              <polygon points="5,15 -10,0 -8,30" fill="#f43f5e" stroke="#090d16" strokeWidth="2.5" />
              <polygon points="5,15 -4,8 -2,22" fill="#ffffff" />
            </g>
          )}

          {spec.tailShape === 'feather' && (
            <g transform="translate(14, 48) rotate(-15)">
              {/* Bird Feather Fan Tail */}
              <path d="M 12 18 Q -8 0 8 -10 Q 22 2 16 16 Z" fill="#eab308" stroke="#090d16" strokeWidth="2.5" />
              <path d="M 16 22 Q -4 10 12 0 Q 24 10 18 20 Z" fill="#ec4899" stroke="#090d16" strokeWidth="2.5" />
            </g>
          )}

          {spec.tailShape === 'iguana' && (
            <g transform="translate(12, 58) rotate(-10)">
              {/* Reptile Iguana Tail with Spikes */}
              <path d="M 15 12 Q -8 16 -12 28 Q 0 24 12 20 Z" fill={spec.bodyDark} stroke="#090d16" strokeWidth="2.5" />
              <polygon points="-4,22 -1,16 3,21" fill="#06b6d4" />
            </g>
          )}

          {/* BACK CARAPACE / PUMPKIN / SHELL */}
          <g transform="translate(24, 25)">
            <polygon points="12,18 2,4 20,12" fill={spec.accent} stroke="#090d16" strokeWidth="2.5" />
            <polygon points="26,10 20,-4 34,4" fill={spec.accent} stroke="#090d16" strokeWidth="2.5" />
          </g>

          {/* AXIE BODY (Main Round Potato Shape) */}
          <ellipse
            cx="70"
            cy="65"
            rx="46"
            ry="36"
            fill={`url(#grad-${id})`}
            stroke="#090d16"
            strokeWidth="3.5"
          />

          {/* BELLY HIGHLIGHT */}
          <ellipse
            cx="73"
            cy="75"
            rx="28"
            ry="20"
            fill={`url(#glow-${id})`}
          />

          {/* HORN (Top of head) */}
          {spec.hornShape === 'cactus' && (
            <g transform="translate(70, 28)">
              {/* Cactus Horn */}
              <path d="M -6 5 Q -10 -18 0 -22 Q 10 -18 6 5 Z" fill="#15803d" stroke="#090d16" strokeWidth="3" />
              <line x1="-8" y1="-8" x2="-2" y2="-8" stroke="#facc15" strokeWidth="2" />
              <line x1="2" y1="-14" x2="8" y2="-14" stroke="#facc15" strokeWidth="2" />
            </g>
          )}

          {spec.hornShape === 'blade' && (
            <g transform="translate(70, 28)">
              {/* Beast Dual Blade */}
              <polygon points="-8,4 -18,-24 0,-14" fill="#ea580c" stroke="#090d16" strokeWidth="3" />
              <polygon points="4,4 16,-22 0,-12" fill="#f97316" stroke="#090d16" strokeWidth="3" />
            </g>
          )}

          {spec.hornShape === 'anemone' && (
            <g transform="translate(70, 26)">
              {/* Aqua Anemone Tentacles */}
              <path d="M -8 6 Q -14 -16 -4 -18 Q 4 -12 0 6 Z" fill="#f43f5e" stroke="#090d16" strokeWidth="2.5" />
              <path d="M 0 6 Q 6 -20 12 -16 Q 10 -8 4 6 Z" fill="#fb7185" stroke="#090d16" strokeWidth="2.5" />
            </g>
          )}

          {spec.hornShape === 'feather' && (
            <g transform="translate(70, 28)">
              {/* Bird Crown / Eggshell */}
              <polygon points="-8,4 0,-24 8,4" fill="#facc15" stroke="#090d16" strokeWidth="3" />
              <polygon points="2,4 12,-18 16,4" fill="#f59e0b" stroke="#090d16" strokeWidth="2.5" />
            </g>
          )}

          {spec.hornShape === 'spikes' && (
            <g transform="translate(70, 28)">
              {/* Reptile Cerastes / Spikes */}
              <polygon points="-8,4 -16,-20 -2,-6" fill="#06b6d4" stroke="#090d16" strokeWidth="3" />
              <polygon points="4,4 14,-18 0,-6" fill="#0891b2" stroke="#090d16" strokeWidth="3" />
            </g>
          )}

          {spec.hornShape === 'antenna' && (
            <g transform="translate(70, 28)">
              {/* Bug Antennae */}
              <path d="M -4 4 Q -16 -18 -8 -22" stroke="#090d16" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              <circle cx="-8" cy="-22" r="4.5" fill="#eab308" stroke="#090d16" strokeWidth="2" />
              <path d="M 4 4 Q 16 -18 8 -22" stroke="#090d16" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              <circle cx="8" cy="-22" r="4.5" fill="#eab308" stroke="#090d16" strokeWidth="2" />
            </g>
          )}

          {/* EARS (Side) */}
          <g transform="translate(35, 52)">
            <ellipse cx="0" cy="0" rx="9" ry="6" fill={spec.accent} stroke="#090d16" strokeWidth="2.5" transform="rotate(-30)" />
          </g>

          {/* EYES (Big Anime Cute Eyes) */}
          {/* Left Eye */}
          <g transform="translate(78, 55)">
            <ellipse cx="0" cy="0" rx="9" ry="11" fill="#ffffff" stroke="#090d16" strokeWidth="2.5" />
            <circle cx="2" cy="0" r="5.5" fill={spec.eyeColor} />
            <circle cx="4" cy="-2" r="2.5" fill="#ffffff" />
            <circle cx="0" cy="3" r="1.2" fill="#ffffff" />
          </g>

          {/* Right Eye */}
          <g transform="translate(98, 58)">
            <ellipse cx="0" cy="0" rx="7.5" ry="9.5" fill="#ffffff" stroke="#090d16" strokeWidth="2.5" />
            <circle cx="1.5" cy="0" r="4.5" fill={spec.eyeColor} />
            <circle cx="3" cy="-1.5" r="2" fill="#ffffff" />
          </g>

          {/* CHEEK BLUSH */}
          <ellipse cx="74" cy="74" rx="5" ry="3" fill="rgba(244, 63, 94, 0.55)" />
          <ellipse cx="106" cy="75" rx="4.5" ry="2.5" fill="rgba(244, 63, 94, 0.55)" />

          {/* MOUTH / SMILE / TEETH */}
          <path
            d="M 88 68 Q 94 76 98 70"
            stroke="#090d16"
            strokeWidth="2.8"
            fill="none"
            strokeLinecap="round"
          />

          {/* LITTLE FEET */}
          <ellipse cx="58" cy="98" rx="8" ry="5" fill={spec.accent} stroke="#090d16" strokeWidth="2.5" />
          <ellipse cx="86" cy="98" rx="8" ry="5" fill={spec.accent} stroke="#090d16" strokeWidth="2.5" />
        </svg>
      )}
    </div>
  );
}
