/**
 * @file atlasParser.ts
 * @description Spine 2D Atlas Parser for Axie Infinity GTK2D assets.
 * Parses .atlas.txt into discrete anatomical part regions for runtime canvas composition.
 */

export interface AtlasRegion {
  name: string;
  rotate: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  origWidth: number;
  origHeight: number;
  offsetX: number;
  offsetY: number;
}

export interface AtlasData {
  imageName: string;
  width: number;
  height: number;
  regions: Record<string, AtlasRegion>;
}

/**
 * Parses raw Spine .atlas.txt content
 */
export function parseSpineAtlas(rawText: string): AtlasData {
  const lines = rawText.split('\n').map((l) => l.trim());
  let imageName = '';
  let width = 0;
  let height = 0;
  const regions: Record<string, AtlasRegion> = {};

  let currentRegion: Partial<AtlasRegion> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    if (line.endsWith('.png')) {
      imageName = line;
      continue;
    }

    if (line.startsWith('size:')) {
      const parts = line.replace('size:', '').trim().split(',');
      width = parseInt(parts[0], 10);
      height = parseInt(parts[1], 10);
      continue;
    }

    if (line.startsWith('format:') || line.startsWith('filter:') || line.startsWith('repeat:')) {
      continue;
    }

    if (!line.includes(':')) {
      // New region entry
      if (currentRegion && currentRegion.name) {
        regions[currentRegion.name] = currentRegion as AtlasRegion;
      }
      currentRegion = {
        name: line,
        rotate: false,
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        origWidth: 0,
        origHeight: 0,
        offsetX: 0,
        offsetY: 0,
      };
      continue;
    }

    if (!currentRegion) continue;

    if (line.startsWith('rotate:')) {
      currentRegion.rotate = line.replace('rotate:', '').trim() === 'true';
    } else if (line.startsWith('xy:')) {
      const parts = line.replace('xy:', '').trim().split(',');
      currentRegion.x = parseInt(parts[0], 10);
      currentRegion.y = parseInt(parts[1], 10);
    } else if (line.startsWith('size:')) {
      const parts = line.replace('size:', '').trim().split(',');
      currentRegion.width = parseInt(parts[0], 10);
      currentRegion.height = parseInt(parts[1], 10);
    } else if (line.startsWith('orig:')) {
      const parts = line.replace('orig:', '').trim().split(',');
      currentRegion.origWidth = parseInt(parts[0], 10);
      currentRegion.origHeight = parseInt(parts[1], 10);
    } else if (line.startsWith('offset:')) {
      const parts = line.replace('offset:', '').trim().split(',');
      currentRegion.offsetX = parseInt(parts[0], 10);
      currentRegion.offsetY = parseInt(parts[1], 10);
    }
  }

  if (currentRegion && currentRegion.name) {
    regions[currentRegion.name] = currentRegion as AtlasRegion;
  }

  return { imageName, width, height, regions };
}

/**
 * Pre-configured registry of official Axie starter Spine Atlases
 */
export const STARTER_AXIE_ATLAS_MAP: Record<string, { imagePath: string; atlasPath: string; defaultClass: string }> = {
  Beast: {
    imagePath: '/axies/spine/01-buba-beast/buba.png',
    atlasPath: '/axies/spine/01-buba-beast/buba.atlas.txt',
    defaultClass: 'Beast',
  },
  Plant: {
    imagePath: '/axies/spine/02-olek-plant/olek.png',
    atlasPath: '/axies/spine/02-olek-plant/olek.atlas.txt',
    defaultClass: 'Plant',
  },
  Aquatic: {
    imagePath: '/axies/spine/03-puffy-aquatic/03-puffy-aquatic.png',
    atlasPath: '/axies/spine/03-puffy-aquatic/03-puffy-aquatic.atlas.txt',
    defaultClass: 'Aquatic',
  },
  Bug: {
    imagePath: '/axies/spine/06-pomodoro-bug/06-pomodoro-bug.png',
    atlasPath: '/axies/spine/06-pomodoro-bug/06-pomodoro-bug.atlas.txt',
    defaultClass: 'Bug',
  },
  Reptile: {
    imagePath: '/axies/spine/07-venoki-reptile/07-dps-reptile.png',
    atlasPath: '/axies/spine/07-venoki-reptile/07-dps-reptile.atlas.txt',
    defaultClass: 'Reptile',
  },
  Bird: {
    imagePath: '/axies/spine/12-momo-bird/12-momo-bird.png',
    atlasPath: '/axies/spine/12-momo-bird/12-momo-bird.atlas.txt',
    defaultClass: 'Bird',
  },
};
