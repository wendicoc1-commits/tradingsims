'use client';

import React from 'react';
import { AxieBodyType } from '@/lib/axie/geneticEngine';

interface AxieBodyTypeThumbnailProps {
  bodyType: AxieBodyType;
  isSelected?: boolean;
  className?: string;
}

export default function AxieBodyTypeThumbnail({
  bodyType,
  isSelected = false,
  className = 'w-16 h-12',
}: AxieBodyTypeThumbnailProps) {
  const baseColor = isSelected ? '#fde047' : '#9ca3af';
  const shadowColor = isSelected ? '#ca8a04' : '#4b5563';
  const highlightColor = isSelected ? '#fef9c3' : '#e5e7eb';

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 100 80"
        className="w-full h-full drop-shadow-sm select-none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Ground shadow */}
        <ellipse cx="50" cy="74" rx="34" ry="4" fill="#000000" fillOpacity="0.45" />

        {/* 1. BIGYAK: Shaggy yak coat dome + hanging bottom fringe + 2 braided pigtails */}
        {bodyType === 'bigyak' && (
          <g>
            {/* Small feet under hanging coat */}
            <ellipse cx="36" cy="69" rx="5" ry="3" fill="#374151" />
            <ellipse cx="64" cy="69" rx="5" ry="3" fill="#374151" />

            {/* Shaggy Yak Body Dome with hanging fleece fringe */}
            <path
              d="M20 66 C15 50 20 30 36 20 C42 16 58 16 64 20 C80 30 85 50 80 66 
                 L77 62 L73 67 L69 62 L65 67 L61 62 L57 67 L53 62 L49 67 L45 62 L41 67 L37 62 L33 67 L29 62 L25 67 Z"
              fill={baseColor}
              stroke="#1f2937"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Tuft crest on head */}
            <path
              d="M45 20 Q50 14 53 19 Q56 13 60 21"
              stroke="#1f2937"
              strokeWidth="2.5"
              fill={highlightColor}
              strokeLinecap="round"
            />
            {/* Left Braided Pigtail */}
            <path
              d="M27 48 Q23 54 25 61 Q26 64 24 67"
              stroke="#1f2937"
              strokeWidth="2.8"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="25" cy="55" r="2.5" fill="#f87171" stroke="#1f2937" strokeWidth="1" />
            <circle cx="24" cy="64" r="2.2" fill="#fbbf24" stroke="#1f2937" strokeWidth="1" />

            {/* Right Braided Pigtail */}
            <path
              d="M35 50 Q31 56 33 63 Q34 66 32 68"
              stroke="#1f2937"
              strokeWidth="2.8"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="33" cy="57" r="2.5" fill="#f87171" stroke="#1f2937" strokeWidth="1" />
            <circle cx="32" cy="65" r="2.2" fill="#fbbf24" stroke="#1f2937" strokeWidth="1" />
          </g>
        )}

        {/* 2. CURLY: Cloud-like fleece wool rings with face opening */}
        {bodyType === 'curly' && (
          <g>
            {/* Feet */}
            <ellipse cx="38" cy="68" rx="4.5" ry="3" fill="#374151" />
            <ellipse cx="62" cy="68" rx="4.5" ry="3" fill="#374151" />

            {/* Outer Wool Clouds ring */}
            <g fill={baseColor} stroke="#1f2937" strokeWidth="2.5">
              <circle cx="30" cy="58" r="9" />
              <circle cx="23" cy="48" r="8.5" />
              <circle cx="24" cy="37" r="8" />
              <circle cx="31" cy="27" r="8.5" />
              <circle cx="43" cy="22" r="9" />
              <circle cx="57" cy="22" r="9" />
              <circle cx="69" cy="27" r="8.5" />
              <circle cx="76" cy="37" r="8" />
              <circle cx="77" cy="48" r="8.5" />
              <circle cx="70" cy="58" r="9" />
              <circle cx="58" cy="63" r="9" />
              <circle cx="42" cy="63" r="9" />
              {/* Inner face disc */}
              <circle cx="50" cy="44" r="16" fill={shadowColor} stroke="#1f2937" strokeWidth="2" />
            </g>
            {/* Wool swirl details inside */}
            <path
              d="M47 41 Q50 38 53 41 Q55 45 51 47"
              stroke="#1f2937"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* 3. FROSTY: Snow cap dome, icy cyan belly, and red striped winter scarf with bell */}
        {bodyType === 'frosty' && (
          <g>
            {/* Icy blue base body */}
            <ellipse cx="50" cy="50" rx="27" ry="20" fill="#7dd3fc" stroke="#1f2937" strokeWidth="2.5" />
            {/* Feet */}
            <ellipse cx="36" cy="68" rx="4.5" ry="3" fill="#0284c7" />
            <ellipse cx="64" cy="68" rx="4.5" ry="3" fill="#0284c7" />

            {/* White Snow Mound Cap */}
            <path
              d="M23 48 C23 28 35 18 50 18 C65 18 77 28 77 48 
                 C73 50 67 46 62 49 C57 52 52 47 47 50 C42 53 37 47 32 50 C27 52 24 49 23 48 Z"
              fill="#f8fafc"
              stroke="#1f2937"
              strokeWidth="2.5"
            />

            {/* Red & White Striped Winter Scarf wrapped along lower torso */}
            <path
              d="M26 53 Q50 64 74 53 Q75 60 71 64 Q50 71 29 64 Z"
              fill="#ef4444"
              stroke="#1f2937"
              strokeWidth="2"
            />
            {/* Scarf white stripes */}
            <path d="M37 57 L35 63" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M48 60 L47 66" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M59 59 L60 65" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />

            {/* Golden Round Bell / Clasp */}
            <circle cx="71" cy="62" r="4.5" fill="#eab308" stroke="#1f2937" strokeWidth="1.5" />
            <line x1="68" y1="62" x2="74" y2="62" stroke="#78350f" strokeWidth="1" />
          </g>
        )}

        {/* 4. FUZZY: Starburst pom-pom tufts pointing outwards all around */}
        {bodyType === 'fuzzy' && (
          <g>
            {/* Feet */}
            <ellipse cx="38" cy="68" rx="4.5" ry="3" fill="#374151" />
            <ellipse cx="62" cy="68" rx="4.5" ry="3" fill="#374151" />

            {/* Multi-spiked jagged fluff perimeter */}
            <path
              d="M50 15 
                 L57 23 L67 18 L68 28 L78 27 L74 37 L83 40 L76 49 L83 55 L74 61 L77 68 L66 67 L62 73 L50 68 
                 L38 73 L34 67 L23 68 L26 61 L17 55 L24 49 L17 40 L26 37 L22 27 L32 28 L33 18 L43 23 Z"
              fill={baseColor}
              stroke="#1f2937"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Inner tuft creases */}
            <path d="M42 35 Q50 32 58 35" stroke="#1f2937" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M36 46 Q50 43 64 46" stroke="#1f2937" strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>
        )}

        {/* 5. NIGHTMARE: Ghostly pale bean, giant cyclops eye, and spider/insect claws */}
        {bodyType === 'nightmare' && (
          <g>
            {/* Spindly insect/spider legs */}
            <path d="M30 60 Q22 66 18 70" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M38 64 Q32 72 28 75" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M68 62 Q76 68 82 72" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M60 64 Q66 72 70 75" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />

            {/* Ghostly pale bean body */}
            <ellipse cx="52" cy="46" rx="28" ry="20" fill="#f1f5f9" stroke="#1f2937" strokeWidth="2.5" />

            {/* Cyclops Eye Socket protruding on front */}
            <ellipse cx="32" cy="42" rx="10" ry="12" fill="#ffffff" stroke="#1f2937" strokeWidth="2.5" />
            {/* Eye Iris */}
            <circle cx="32" cy="42" r="6" fill="#64748b" stroke="#1f2937" strokeWidth="1.5" />
            <circle cx="31" cy="41" r="2.5" fill="#0f172a" />
            <circle cx="33" cy="39" r="1.2" fill="#ffffff" />

            {/* Nightmare back dorsal thorn */}
            <path d="M68 33 Q74 27 72 22 Q68 28 65 31" fill="#475569" stroke="#1f2937" strokeWidth="1.5" />
          </g>
        )}

        {/* 6. NORMAL: Classic smooth bean shape */}
        {bodyType === 'normal' && (
          <g>
            {/* Feet */}
            <ellipse cx="36" cy="66" rx="5" ry="3.5" fill="#374151" />
            <ellipse cx="64" cy="66" rx="5" ry="3.5" fill="#374151" />

            {/* Smooth rounded bean body */}
            <ellipse cx="50" cy="45" rx="27" ry="21" fill={baseColor} stroke="#1f2937" strokeWidth="2.5" />
            {/* Belly highlight */}
            <ellipse cx="48" cy="42" rx="20" ry="14" fill={highlightColor} fillOpacity="0.3" />
          </g>
        )}

        {/* 7. SPIKY: Scalloped dorsal carapace shell and sharp curved spikes */}
        {bodyType === 'spiky' && (
          <g>
            {/* Feet */}
            <ellipse cx="36" cy="66" rx="5" ry="3.5" fill="#374151" />
            <ellipse cx="64" cy="66" rx="5" ry="3.5" fill="#374151" />

            {/* Sharp dorsal rump spikes on the left/back */}
            <path d="M22 45 L13 41 L21 50 Z" fill="#475569" stroke="#1f2937" strokeWidth="2" strokeLinejoin="round" />
            <path d="M25 36 L16 30 L26 42 Z" fill="#475569" stroke="#1f2937" strokeWidth="2" strokeLinejoin="round" />
            <path d="M32 28 L24 20 L35 32 Z" fill="#475569" stroke="#1f2937" strokeWidth="2" strokeLinejoin="round" />
            <path d="M42 22 L36 14 L46 25 Z" fill="#475569" stroke="#1f2937" strokeWidth="2" strokeLinejoin="round" />

            {/* Base body */}
            <ellipse cx="52" cy="46" rx="27" ry="20" fill={baseColor} stroke="#1f2937" strokeWidth="2.5" />

            {/* Spiral shell whorl on rear flank */}
            <path
              d="M28 47 Q33 42 38 46 Q41 51 36 55 Q30 55 28 50 Q28 46 32 46"
              stroke="#1f2937"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* 8. SUMO: Massive spherical heavy body with stubby pillar feet */}
        {bodyType === 'sumo' && (
          <g>
            {/* Heavy stubby pillar feet */}
            <ellipse cx="32" cy="68" rx="6.5" ry="4.5" fill="#374151" stroke="#1f2937" strokeWidth="2" />
            <ellipse cx="68" cy="68" rx="6.5" ry="4.5" fill="#374151" stroke="#1f2937" strokeWidth="2" />

            {/* Heavy spherical sumo body */}
            <ellipse cx="50" cy="44" rx="32" ry="25" fill={baseColor} stroke="#1f2937" strokeWidth="3" />

            {/* Deep belly crease line */}
            <path
              d="M28 48 Q50 63 72 48"
              stroke="#1f2937"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
            {/* Top highlight */}
            <ellipse cx="50" cy="35" rx="22" ry="14" fill={highlightColor} fillOpacity="0.25" />
          </g>
        )}

        {/* 9. WAVY: Cresting ocean wave swirl on dorsal contour */}
        {bodyType === 'wavy' && (
          <g>
            {/* Feet */}
            <ellipse cx="36" cy="66" rx="5" ry="3.5" fill="#374151" />
            <ellipse cx="64" cy="66" rx="5" ry="3.5" fill="#374151" />

            {/* Base Body */}
            <ellipse cx="50" cy="46" rx="27" ry="20" fill={baseColor} stroke="#1f2937" strokeWidth="2.5" />

            {/* Swirling crest ocean wave on back & side */}
            <path
              d="M24 48 C24 32 36 22 52 24 C44 28 40 36 46 42 C52 48 64 45 74 54 C68 62 42 66 24 48 Z"
              fill="#ffffff"
              stroke="#1f2937"
              strokeWidth="2"
            />
            {/* Ocean spiral vortex */}
            <path
              d="M32 40 Q38 34 44 38 Q48 43 43 48 Q37 48 35 44"
              stroke="#1f2937"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* 10. WETDOG: Shaggy dripping mop hair with hanging strand over face */}
        {bodyType === 'wetdog' && (
          <g>
            {/* Feet */}
            <ellipse cx="36" cy="67" rx="5" ry="3" fill="#374151" />
            <ellipse cx="64" cy="67" rx="5" ry="3" fill="#374151" />

            {/* Dripping shaggy matted fur body */}
            <path
              d="M23 63 C18 48 24 30 38 22 C44 19 58 19 64 22 C78 30 84 48 79 63 
                 L75 58 L71 64 L67 59 L63 65 L59 59 L55 65 L51 59 L47 65 L43 59 L39 65 L35 59 L31 65 L27 59 Z"
              fill={baseColor}
              stroke="#1f2937"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            {/* Forehead wet hanging mop strand */}
            <path
              d="M36 34 Q32 44 34 52 Q35 55 33 58"
              stroke="#1f2937"
              strokeWidth="2.8"
              fill="none"
              strokeLinecap="round"
            />
            {/* Water droplet hints */}
            <ellipse cx="33" cy="61" rx="1.5" ry="2.2" fill="#38bdf8" />
            <ellipse cx="55" cy="68" rx="1.2" ry="1.8" fill="#38bdf8" />
            <ellipse cx="71" cy="67" rx="1.2" ry="1.8" fill="#38bdf8" />
          </g>
        )}
      </svg>
    </div>
  );
}
