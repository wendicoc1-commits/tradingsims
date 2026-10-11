import { NextRequest, NextResponse } from 'next/server';
import {
  KNOWN_PARTS_CATALOG,
  CreatureClass,
  BodyPartType,
  encodeGenesToBigInt,
  calculateBaseStats,
  CLASS_BINARY_MAP,
  PartGene,
  CreatureGenes,
} from '@/lib/axie/geneticEngine';
import generatedAxiesData from '@/lib/axie/generatedAxies.json';

const CLASS_SPRITE_MAP: Record<string, string[]> = {
  Beast: ['/axies/sprite_crimson_fury_beast.png', '/axies/sprite_yellow_fluffy.png', '/axies/beast.png'],
  Aquatic: ['/axies/sprite_abyssal_electric_aqua.png', '/axies/sprite_aqua_crest.png', '/axies/sprite_aqua_goggles.png', '/axies/aqua.png'],
  Plant: ['/axies/sprite_emerald_jade_plant.png', '/axies/sprite_blue_eyes_plant.png', '/axies/sprite_moss_deer_horns.png', '/axies/plant.png'],
  Bird: ['/axies/sprite_cherry_blossom_bird.png', '/axies/sprite_bird_sakura.png'],
  Reptile: ['/axies/sprite_amethyst_dragon_reptile.png', '/axies/sprite_reptile_spiral.png', '/axies/sprite_derp_snail_horns.png'],
  Bug: ['/axies/sprite_scarlet_blood_bug.png', '/axies/sprite_green_brawler.png'],
  Mech: ['/axies/sprite_golden_mech_golem.png', '/axies/sprite_mech_golem.png', '/axies/sprite_crystal_beast_mech.png'],
  Dawn: ['/axies/sprite_celestial_dawn_archon.png', '/axies/sprite_zen_white_plant.png', '/axies/sprite_prismatic_chimera_mystic.png'],
  Dusk: ['/axies/sprite_void_eclipse_dusk.png', '/axies/sprite_dusk_night.png', '/axies/sprite_mystic_purple.png'],
};

export async function GET() {
  return NextResponse.json({
    success: true,
    totalGenerated: generatedAxiesData.length,
    catalog: generatedAxiesData,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const targetClass: CreatureClass = body.class || 'Beast';
    const customName: string = body.name || `${targetClass} Genetic Prototype #${Math.floor(1000 + Math.random() * 9000)}`;

    const getRandomPart = (type: BodyPartType): PartGene => {
      const candidates = KNOWN_PARTS_CATALOG.filter((p) => p.type === type);
      const sameClass = candidates.filter((p) => p.class === targetClass);
      // 70% pure class part, 30% hybrid cross-class
      if (Math.random() < 0.7 && sameClass.length > 0) {
        return sameClass[Math.floor(Math.random() * sameClass.length)];
      }
      return candidates[Math.floor(Math.random() * candidates.length)];
    };

    const eyes = { D: getRandomPart('eyes'), R1: getRandomPart('eyes'), R2: getRandomPart('eyes') };
    const ears = { D: getRandomPart('ears'), R1: getRandomPart('ears'), R2: getRandomPart('ears') };
    const mouth = { D: getRandomPart('mouth'), R1: getRandomPart('mouth'), R2: getRandomPart('mouth') };
    const horn = { D: getRandomPart('horn'), R1: getRandomPart('horn'), R2: getRandomPart('horn') };
    const back = { D: getRandomPart('back'), R1: getRandomPart('back'), R2: getRandomPart('back') };
    const tail = { D: getRandomPart('tail'), R1: getRandomPart('tail'), R2: getRandomPart('tail') };

    const genes: CreatureGenes = {
      class: targetClass,
      classBinary: CLASS_BINARY_MAP[targetClass] ?? 0,
      pattern: Math.floor(Math.random() * 256),
      color: Math.floor(Math.random() * 256),
      eyes,
      ears,
      mouth,
      horn,
      back,
      tail,
      rawBigInt: '0x000',
    };

    genes.rawBigInt = encodeGenesToBigInt(genes);

    const stats = calculateBaseStats(targetClass, {
      eyes: eyes.D,
      ears: ears.D,
      mouth: mouth.D,
      horn: horn.D,
      back: back.D,
      tail: tail.D,
    });

    const sprites = CLASS_SPRITE_MAP[targetClass] || CLASS_SPRITE_MAP.Plant;
    const selectedSprite = sprites[Math.floor(Math.random() * sprites.length)];

    const newId = `9904${Math.floor(100 + Math.random() * 900)}`;

    const newAxie = {
      id: newId,
      name: customName,
      class: targetClass,
      image: selectedSprite,
      priceUsd: +(45 + Math.random() * 40).toFixed(1),
      priceEth: +(0.018 + Math.random() * 0.02).toFixed(4),
      breedCount: 0,
      stats,
      genes256: genes.rawBigInt,
      parts: [
        { id: `part-${eyes.D.binaryCode}`, name: eyes.D.name, class: eyes.D.class, type: 'Eyes' },
        { id: `part-${ears.D.binaryCode}`, name: ears.D.name, class: ears.D.class, type: 'Ears' },
        { id: `part-${mouth.D.binaryCode}`, name: mouth.D.name, class: mouth.D.class, type: 'Mouth' },
        { id: `part-${horn.D.binaryCode}`, name: horn.D.name, class: horn.D.class, type: 'Horn' },
        { id: `part-${back.D.binaryCode}`, name: back.D.name, class: back.D.class, type: 'Back' },
        { id: `part-${tail.D.binaryCode}`, name: tail.D.name, class: tail.D.class, type: 'Tail' },
      ],
    };

    return NextResponse.json({
      success: true,
      message: 'Axie successfully synthesized with pure transparent sprite and 256-bit genetic hash.',
      axie: newAxie,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to synthesize Axie' },
      { status: 500 }
    );
  }
}
