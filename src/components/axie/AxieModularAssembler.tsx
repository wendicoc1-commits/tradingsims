'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Layers,
  Sparkles,
  Download,
  Eye,
  EyeOff,
  RefreshCw,
  Sliders,
  Palette,
  Play,
  Pause,
  Copy,
  Check,
  CheckCircle2,
  Box,
  Wand2,
} from 'lucide-react';
import {
  parseSpineAtlas,
  STARTER_AXIE_ATLAS_MAP,
  AtlasData,
  AtlasRegion,
} from '@/lib/axie/atlasParser';
import axieGenesData from '@/lib/axie/axieGenesData.json';

export type AxieClassKey = 'Beast' | 'Plant' | 'Aquatic' | 'Bird' | 'Bug' | 'Reptile';

export interface AxieAppearanceConfig {
  bodyClass: AxieClassKey;
  bodyType: string;
  bodyColor: string;
  eyes: { class: AxieClassKey; partId: string; color: string; visible: boolean };
  ears: { class: AxieClassKey; partId: string; color: string; visible: boolean };
  mouth: { class: AxieClassKey; partId: string; color: string; visible: boolean };
  horn: { class: AxieClassKey; partId: string; color: string; visible: boolean };
  back: { class: AxieClassKey; partId: string; color: string; visible: boolean };
  tail: { class: AxieClassKey; partId: string; color: string; visible: boolean };
  shadowVisible: boolean;
  legsVisible: boolean;
  patternVisible: boolean;
}

export interface AxieModularAssemblerProps {
  initialClass?: AxieClassKey;
  initialBodyType?: string;
  onConfigChange?: (config: AxieAppearanceConfig) => void;
  onExportPNG?: (dataUrl: string) => void;
  className?: string;
}

// 10 Official unity-axie-gtk2d Body Types with scale & silhouette modifiers
export const GTK2D_BODY_TYPES: Record<
  string,
  {
    name: string;
    gtkMaterial: string;
    icon: string;
    scaleX: number;
    scaleY: number;
    offsetY: number;
    description: string;
  }
> = {
  bigyak: {
    name: 'Bigyak',
    gtkMaterial: 'Bigyak.mat',
    icon: '🦬',
    scaleX: 1.15,
    scaleY: 1.05,
    offsetY: 2,
    description: 'Tubuh kekar, dada lebar berlapis mantel bulu lebat menjuntai',
  },
  curly: {
    name: 'Curly',
    gtkMaterial: 'Curly.mat',
    icon: '🌀',
    scaleX: 0.95,
    scaleY: 1.02,
    offsetY: -3,
    description: 'Bulu wol melingkar rapat mirip awan domba elastis dinamis',
  },
  frosty: {
    name: 'Frosty',
    gtkMaterial: 'Frosty.mat',
    icon: '❄️',
    scaleX: 1.02,
    scaleY: 1.02,
    offsetY: 0,
    description: 'Kristal salju beku abadi Arktik Lunacia bersyal rajut musim dingin',
  },
  fuzzy: {
    name: 'Fuzzy',
    gtkMaterial: 'Fuzzy.mat',
    icon: '🧶',
    scaleX: 1.06,
    scaleY: 1.04,
    offsetY: 0,
    description: 'Bulu kapas jabrik mengembang lembut ke segala arah bermorale tinggi',
  },
  nightmare: {
    name: 'Nightmare',
    gtkMaterial: 'Nightmare.mat',
    icon: '👁️',
    scaleX: 1.08,
    scaleY: 0.96,
    offsetY: 4,
    description: 'Tubuh spektral pucat bermata siklop raksasa dengan cakar laba-laba mistis',
  },
  normal: {
    name: 'Normal',
    gtkMaterial: 'Normal.mat',
    icon: '⚪',
    scaleX: 1.0,
    scaleY: 1.0,
    offsetY: 0,
    description: 'Siluet kacang polong standar klasik Lunacia yang 100% seimbang',
  },
  spiky: {
    name: 'Spiky',
    gtkMaterial: 'Spiky.mat',
    icon: '🦔',
    scaleX: 1.05,
    scaleY: 1.06,
    offsetY: -2,
    description: 'Karapas keras berduri tajam melengkung di punggung berdaya serang kritis',
  },
  sumo: {
    name: 'Sumo',
    gtkMaterial: 'Sumo.mat',
    icon: '🛡️',
    scaleX: 1.22,
    scaleY: 1.14,
    offsetY: 6,
    description: 'Badan raksasa super gemuk masif bagai dinding pertahanan baja',
  },
  wavy: {
    name: 'Wavy',
    gtkMaterial: 'Wavy.mat',
    icon: '🌊',
    scaleX: 1.02,
    scaleY: 1.05,
    offsetY: -1,
    description: 'Siluet bergelombang halus berirama pusaran arus samudera',
  },
  wetdog: {
    name: 'Wetdog',
    gtkMaterial: 'Wetdog.mat',
    icon: '🐕',
    scaleX: 1.1,
    scaleY: 0.94,
    offsetY: 8,
    description: 'Bulu basah kuyup menggantung rendah dengan kelincahan air tinggi',
  },
};

// Official Axie starter color presets
export const AXIE_STARTER_PRESETS: Record<
  AxieClassKey,
  { primary: string; secondary: string; dark: string; name: string }
> = {
  Beast: { primary: '#fdb014', secondary: '#fef0a3', dark: '#d97706', name: 'Golden Beast' },
  Plant: { primary: '#afdb1b', secondary: '#e3efdb', dark: '#65a30d', name: 'Emerald Plant' },
  Aquatic: { primary: '#00dff3', secondary: '#bffef4', dark: '#0284c7', name: 'Cyan Aquatic' },
  Bird: { primary: '#ff99b0', secondary: '#ffd8f3', dark: '#db2777', name: 'Blush Bird' },
  Bug: { primary: '#ff433e', secondary: '#ffdcce', dark: '#dc2626', name: 'Crimson Bug' },
  Reptile: { primary: '#c569cf', secondary: '#ffd2fe', dark: '#9333ea', name: 'Amethyst Reptile' },
};

export default function AxieModularAssembler({
  initialClass = 'Beast',
  initialBodyType = 'normal',
  onConfigChange,
  onExportPNG,
  className = '',
}: AxieModularAssemblerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Active studio tab
  const [activeTab, setActiveTab] = useState<'parts' | 'layers' | 'palette' | 'bodyType'>('parts');

  // Animation toggle
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const [appliedNotification, setAppliedNotification] = useState<boolean>(false);

  // Asset Loading State
  const [atlasesLoaded, setAtlasesLoaded] = useState<boolean>(false);
  const loadedAssetsRef = useRef<
    Record<
      AxieClassKey,
      {
        image: HTMLImageElement;
        atlas: AtlasData;
      }
    >
  >({} as any);

  // Extracted offscreen region cache
  const regionCanvasCacheRef = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const fallbackImgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const fImg = new Image();
    fImg.src = '/axies/sprite_crimson_fury_beast.png';
    fallbackImgRef.current = fImg;
  }, []);

  const safeInitialClass = (['Beast', 'Plant', 'Aquatic', 'Bird', 'Bug', 'Reptile'].includes(initialClass)
    ? initialClass
    : 'Beast') as AxieClassKey;

  // Configuration State
  const [config, setConfig] = useState<AxieAppearanceConfig>({
    bodyClass: safeInitialClass,
    bodyType: initialBodyType,
    bodyColor: AXIE_STARTER_PRESETS[safeInitialClass].primary,
    eyes: { class: safeInitialClass, partId: 'eyes', color: '#0f172a', visible: true },
    ears: { class: safeInitialClass, partId: 'ear', color: AXIE_STARTER_PRESETS[safeInitialClass].primary, visible: true },
    mouth: { class: safeInitialClass, partId: 'mouth', color: '#dc2626', visible: true },
    horn: { class: safeInitialClass, partId: 'horn', color: AXIE_STARTER_PRESETS[safeInitialClass].secondary, visible: true },
    back: { class: safeInitialClass, partId: 'back', color: AXIE_STARTER_PRESETS[safeInitialClass].primary, visible: true },
    tail: { class: safeInitialClass, partId: 'tail', color: AXIE_STARTER_PRESETS[safeInitialClass].secondary, visible: true },
    shadowVisible: true,
    legsVisible: true,
    patternVisible: true,
  });

  // Notify parent on config update
  useEffect(() => {
    if (onConfigChange) {
      onConfigChange(config);
    }
  }, [config, onConfigChange]);

  // Load all starter Spine Atlases and Spritesheets on mount
  useEffect(() => {
    let isMounted = true;
    const classes: AxieClassKey[] = ['Beast', 'Plant', 'Aquatic', 'Bug', 'Reptile', 'Bird'];

    async function loadAllAssets() {
      try {
        const promises = classes.map(async (cls) => {
          try {
            const info = STARTER_AXIE_ATLAS_MAP[cls];
            if (!info) return null;

            const atlasRes = await fetch(info.atlasPath);
            if (!atlasRes.ok) return null;
            const atlasText = await atlasRes.text();
            const parsedAtlas = parseSpineAtlas(atlasText);

            const img = new Image();
            img.src = info.imagePath;

            await new Promise<void>((resolve, reject) => {
              if (img.complete) return resolve();
              img.onload = () => resolve();
              img.onerror = () => reject(new Error(`Failed to load ${info.imagePath}`));
            });

            return { cls, image: img, atlas: parsedAtlas };
          } catch (err) {
            console.warn(`Failed loading Spine asset for ${cls}:`, err);
            return null;
          }
        });

        const results = await Promise.all(promises);
        if (!isMounted) return;

        let anyLoaded = false;
        results.forEach((res) => {
          if (res) {
            loadedAssetsRef.current[res.cls] = {
              image: res.image,
              atlas: res.atlas,
            };
            anyLoaded = true;
          }
        });

        if (anyLoaded) {
          setAtlasesLoaded(true);
        }
      } catch (err) {
        console.error('Error loading Spine GTK2D assets:', err);
      }
    }

    loadAllAssets();
    return () => {
      isMounted = false;
    };
  }, []);

  // Helper to extract or fetch a clean unrotated region canvas
  const getRegionCanvas = useCallback(
    (cls: AxieClassKey, regionName: string): HTMLCanvasElement | null => {
      const cacheKey = `${cls}:${regionName}`;
      if (regionCanvasCacheRef.current.has(cacheKey)) {
        return regionCanvasCacheRef.current.get(cacheKey)!;
      }

      const asset = loadedAssetsRef.current[cls];
      if (!asset) return null;

      const region = asset.atlas.regions[regionName];
      if (!region || !region.width || !region.height) return null;

      const offCanvas = document.createElement('canvas');
      const offCtx = offCanvas.getContext('2d');
      if (!offCtx) return null;

      if (region.rotate) {
        // Spine atlas pack rotation
        const packedW = region.height;
        const packedH = region.width;

        offCanvas.width = region.width;
        offCanvas.height = region.height;

        offCtx.save();
        offCtx.translate(0, region.height);
        offCtx.rotate(-Math.PI / 2);
        offCtx.drawImage(
          asset.image,
          region.x,
          region.y,
          packedW,
          packedH,
          0,
          0,
          packedW,
          packedH
        );
        offCtx.restore();
      } else {
        offCanvas.width = region.width;
        offCanvas.height = region.height;
        offCtx.drawImage(
          asset.image,
          region.x,
          region.y,
          region.width,
          region.height,
          0,
          0,
          region.width,
          region.height
        );
      }

      regionCanvasCacheRef.current.set(cacheKey, offCanvas);
      return offCanvas;
    },
    []
  );

  // Helper to generate tinted sprite
  const getTintedRegion = useCallback(
    (baseCanvas: HTMLCanvasElement, tintHex: string, strength: number = 0.55): HTMLCanvasElement => {
      if (!tintHex || tintHex === '#ffffff' || strength <= 0) return baseCanvas;

      const tinted = document.createElement('canvas');
      tinted.width = baseCanvas.width;
      tinted.height = baseCanvas.height;
      const tCtx = tinted.getContext('2d');
      if (!tCtx) return baseCanvas;

      // Draw base
      tCtx.drawImage(baseCanvas, 0, 0);

      // Safely tint via source-atop to preserve lineart and alpha channel
      tCtx.save();
      tCtx.globalCompositeOperation = 'source-atop';
      tCtx.fillStyle = tintHex;
      tCtx.globalAlpha = Math.min(1, Math.max(0, strength));
      tCtx.fillRect(0, 0, tinted.width, tinted.height);
      tCtx.restore();

      return tinted;
    },
    []
  );

  // Main Canvas Render Loop
  useEffect(() => {
    if (!atlasesLoaded) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let startTime = performance.now();

    const render = (now: number) => {
      const elapsed = isPlaying ? (now - startTime) / 1000 : 0;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2 + 15;

      // GTK2D Body Type parameters
      const bodyTypeDef = GTK2D_BODY_TYPES[config.bodyType] || GTK2D_BODY_TYPES.normal;
      const bScaleX = bodyTypeDef.scaleX;
      const bScaleY = bodyTypeDef.scaleY;
      const bOffsetY = bodyTypeDef.offsetY;

      // Animation calculations
      const breathe = Math.sin(elapsed * 2.8) * 0.025;
      const breatheY = Math.sin(elapsed * 2.8) * 3;
      const wagAngle = Math.sin(elapsed * 3.8) * 0.12;
      const earWiggleL = Math.sin(elapsed * 2.8 + 0.4) * 0.05;
      const earWiggleR = Math.cos(elapsed * 2.8 + 0.4) * 0.05;
      const hornBob = Math.sin(elapsed * 2.8) * 2;

      // -------------------------------------------------------------
      // LAYER 0: Ground Shadow
      // -------------------------------------------------------------
      // -------------------------------------------------------------
      // LAYER 0: Ground Shadow
      // -------------------------------------------------------------
      if (config.shadowVisible) {
        const shadowCanvas = getRegionCanvas(config.bodyClass, 'shadow');
        if (shadowCanvas) {
          ctx.save();
          const sW = 300 * (bScaleX * 0.95 + 0.05);
          const sH = 55 * bScaleY;
          ctx.globalAlpha = 0.45 + Math.sin(elapsed * 2.8) * 0.04;
          ctx.drawImage(shadowCanvas, cx - sW / 2 + 5, cy + 92 - breatheY * 0.2, sW, sH);
          ctx.restore();
        }
      }

      // -------------------------------------------------------------
      // LAYER 1: Far Ear (Ear Right - BEHIND head/body)
      // In Spine, ear-right is on bone:ear-right at upper right skull behind head
      // -------------------------------------------------------------
      if (config.ears.visible) {
        const earRCanvas = getRegionCanvas(config.ears.class, 'ear-right');
        if (earRCanvas) {
          const tintedER = getTintedRegion(earRCanvas, config.ears.color);
          ctx.save();
          const erW = tintedER.width * 0.65;
          const erH = tintedER.height * 0.65;
          const erAnchorX = cx + 58 * bScaleX;
          const erAnchorY = cy - 78 * bScaleY + breatheY * 0.8;
          ctx.translate(erAnchorX, erAnchorY);
          ctx.rotate(0.20 + earWiggleR);
          ctx.drawImage(tintedER, -erW / 2, -erH * 0.9, erW, erH);
          ctx.restore();
        }
      }

      // -------------------------------------------------------------
      // LAYER 2: Far Rear Foot & Far Front Foot (BEHIND body)
      // -------------------------------------------------------------
      if (config.legsVisible) {
        const legFR = getRegionCanvas(config.bodyClass, 'leg-front-right');
        const legBL = getRegionCanvas(config.bodyClass, 'leg-back-left');
        if (legFR) {
          const tintedFR = getTintedRegion(legFR, config.bodyColor, 0.4);
          ctx.drawImage(tintedFR, cx + 55 * bScaleX, cy + 62 + bOffsetY, tintedFR.width * 0.68, tintedFR.height * 0.68);
        }
        if (legBL) {
          const tintedBL = getTintedRegion(legBL, config.bodyColor, 0.4);
          ctx.drawImage(tintedBL, cx - 82 * bScaleX, cy + 64 + bOffsetY, tintedBL.width * 0.68, tintedBL.height * 0.68);
        }
      }

      // -------------------------------------------------------------
      // LAYER 3: Tail (Behind Torso, Attached to Rump)
      // -------------------------------------------------------------
      if (config.tail.visible) {
        const tailCanvas = getRegionCanvas(config.tail.class, 'tail');
        if (tailCanvas) {
          const tintedTail = getTintedRegion(tailCanvas, config.tail.color);
          ctx.save();
          const tW = tintedTail.width * 0.68;
          const tH = tintedTail.height * 0.68;
          const tAnchorX = cx - 118 * bScaleX;
          const tAnchorY = cy + 5 + breatheY;

          ctx.translate(tAnchorX, tAnchorY);
          ctx.rotate(wagAngle - 0.15);
          ctx.drawImage(tintedTail, -tW, -tH * 0.55, tW, tH);
          ctx.restore();
        }
      }

      // -------------------------------------------------------------
      // LAYER 4: Back Part (Spine Ridge Curve)
      // -------------------------------------------------------------
      if (config.back.visible) {
        const backCanvas = getRegionCanvas(config.back.class, 'back');
        if (backCanvas) {
          const tintedBack = getTintedRegion(backCanvas, config.back.color);
          ctx.save();
          const bkW = tintedBack.width * 0.68;
          const bkH = tintedBack.height * 0.68;
          const bkX = cx - 55 * bScaleX;
          const bkY = cy - 96 * bScaleY + breatheY * 0.7;

          ctx.drawImage(tintedBack, bkX, bkY, bkW, bkH);
          ctx.restore();
        }
      }

      // -------------------------------------------------------------
      // LAYER 5: Body Torso Base (GTK2D Body Type Silhouette)
      // -------------------------------------------------------------
      const bodyCanvas = getRegionCanvas(config.bodyClass, 'body');
      if (bodyCanvas) {
        const tintedBody = getTintedRegion(bodyCanvas, config.bodyColor, 0.65);
        ctx.save();
        const baseW = tintedBody.width * 0.68;
        const baseH = tintedBody.height * 0.68;
        const w = baseW * bScaleX;
        const h = baseH * bScaleY * (1 + breathe);
        const bX = cx - w / 2;
        const bY = cy - h / 2 + bOffsetY + breatheY;

        if (config.bodyType === 'frosty') {
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 14;
        } else if (config.bodyType === 'nightmare') {
          ctx.shadowColor = '#a855f7';
          ctx.shadowBlur = 16;
        } else if (config.bodyType === 'spiky') {
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 8;
        }

        ctx.drawImage(tintedBody, bX, bY, w, h);
        ctx.restore();
      } else if (fallbackImgRef.current && fallbackImgRef.current.complete) {
        ctx.save();
        const w = 240 * bScaleX;
        const h = 210 * bScaleY * (1 + breathe);
        ctx.drawImage(fallbackImgRef.current, cx - w / 2, cy - h / 2 + bOffsetY + breatheY, w, h);
        ctx.restore();
      }

      // -------------------------------------------------------------
      // LAYER 6: Body Pattern / Markings
      // -------------------------------------------------------------
      if (config.patternVisible) {
        const patCanvas = getRegionCanvas(config.bodyClass, 'body-pattern');
        if (patCanvas) {
          ctx.save();
          const pW = patCanvas.width * 0.68;
          const pH = patCanvas.height * 0.68;
          ctx.drawImage(patCanvas, cx + 15 * bScaleX - pW / 2, cy + 28 * bScaleY + breatheY - pH / 2, pW, pH);
          ctx.restore();
        }
      }

      // -------------------------------------------------------------
      // LAYER 7: Near Front Leg (leg-front-left)
      // -------------------------------------------------------------
      if (config.legsVisible) {
        const legFL = getRegionCanvas(config.bodyClass, 'leg-front-left');
        if (legFL) {
          const tintedL = getTintedRegion(legFL, config.bodyColor, 0.4);
          ctx.drawImage(tintedL, cx - 18 * bScaleX, cy + 76 + bOffsetY, tintedL.width * 0.7, tintedL.height * 0.7);
        }
      }

      // -------------------------------------------------------------
      // LAYER 8: Mouth (Snout Tip)
      // -------------------------------------------------------------
      if (config.mouth.visible) {
        const mouthCanvas =
          getRegionCanvas(config.mouth.class, 'mouth') ||
          getRegionCanvas(config.mouth.class, 'mouth-open') ||
          getRegionCanvas(config.mouth.class, 'mouth-smile');
        if (mouthCanvas) {
          const tintedMouth = getTintedRegion(mouthCanvas, config.mouth.color, 0.35);
          ctx.save();
          const mW = tintedMouth.width * 0.68;
          const mH = tintedMouth.height * 0.68;
          const mX = cx + 68 * bScaleX;
          const mY = cy + 12 * bScaleY + breatheY;
          ctx.drawImage(tintedMouth, mX - mW / 2, mY - mH / 2, mW, mH);
          ctx.restore();
        }
      }

      // -------------------------------------------------------------
      // LAYER 9: Eyes (Mid Face / Front Cranium)
      // -------------------------------------------------------------
      if (config.eyes.visible) {
        const eyesCanvas =
          getRegionCanvas(config.eyes.class, 'eyes') ||
          getRegionCanvas(config.eyes.class, 'eyes-happy') ||
          getRegionCanvas(config.eyes.class, 'eyes-angry');
        if (eyesCanvas) {
          ctx.save();
          const eyW = eyesCanvas.width * 0.68;
          const eyH = eyesCanvas.height * 0.68;
          const eyX = cx + 52 * bScaleX;
          const eyY = cy - 20 * bScaleY + breatheY;
          ctx.drawImage(eyesCanvas, eyX - eyW / 2, eyY - eyH / 2, eyW, eyH);
          ctx.restore();
        }
      }

      // -------------------------------------------------------------
      // LAYER 10: Horn (Forehead Crown)
      // Anchored directly to the skull forehead above the eyes
      // -------------------------------------------------------------
      if (config.horn.visible) {
        const hornCanvas = getRegionCanvas(config.horn.class, 'horn');
        if (hornCanvas) {
          const tintedHorn = getTintedRegion(hornCanvas, config.horn.color);
          ctx.save();
          const hW = tintedHorn.width * 0.68;
          const hH = tintedHorn.height * 0.68;
          const hAnchorX = cx + 32 * bScaleX;
          const hAnchorY = cy - 82 * bScaleY + breatheY + hornBob;
          ctx.translate(hAnchorX, hAnchorY);
          ctx.rotate(0.08);
          ctx.drawImage(tintedHorn, -hW / 2, -hH * 0.88, hW, hH);
          ctx.restore();
        }
      }

      // -------------------------------------------------------------
      // LAYER 11: Near Ear (Ear Left - IN FRONT of skull crown)
      // -------------------------------------------------------------
      if (config.ears.visible) {
        const earLCanvas = getRegionCanvas(config.ears.class, 'ear-left');
        if (earLCanvas) {
          const tintedEL = getTintedRegion(earLCanvas, config.ears.color);
          ctx.save();
          const elW = tintedEL.width * 0.65;
          const elH = tintedEL.height * 0.65;
          const elAnchorX = cx - 12 * bScaleX;
          const elAnchorY = cy - 80 * bScaleY + breatheY;
          ctx.translate(elAnchorX, elAnchorY);
          ctx.rotate(-0.16 + earWiggleL);
          ctx.drawImage(tintedEL, -elW / 2, -elH * 0.92, elW, elH);
          ctx.restore();
        }
      }

      if (isPlaying) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [
    atlasesLoaded,
    config,
    isPlaying,
    getRegionCanvas,
    getTintedRegion,
  ]);

  // Export current config as JSON
  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(config, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  // Export high-res transparent PNG
  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');

    // Trigger download
    const link = document.createElement('a');
    link.download = `axie_${config.bodyClass.toLowerCase()}_${config.bodyType}_${Date.now()}.png`;
    link.href = dataUrl;
    link.click();

    if (onExportPNG) {
      onExportPNG(dataUrl);
    }
  };

  // Apply Assembled Axie to parent generator state
  const handleApplyToGenerator = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    if (onExportPNG) {
      onExportPNG(dataUrl);
    }
    setAppliedNotification(true);
    setTimeout(() => setAppliedNotification(false), 2500);
  };

  // Preset Class Application
  const handleSelectClass = (cls: AxieClassKey) => {
    const preset = AXIE_STARTER_PRESETS[cls];
    setConfig((prev) => ({
      ...prev,
      bodyClass: cls,
      bodyColor: preset.primary,
      ears: { ...prev.ears, class: cls, color: preset.primary },
      eyes: { ...prev.eyes, class: cls },
      mouth: { ...prev.mouth, class: cls },
      horn: { ...prev.horn, class: cls, color: preset.secondary },
      back: { ...prev.back, class: cls, color: preset.primary },
      tail: { ...prev.tail, class: cls, color: preset.secondary },
    }));
  };

  // Randomize all slots cross-class
  const handleRandomizeMixer = () => {
    const classes: AxieClassKey[] = ['Beast', 'Plant', 'Aquatic', 'Bug', 'Reptile', 'Bird'];
    const bodyTypes = Object.keys(GTK2D_BODY_TYPES);

    const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

    const randomClass = pick(classes);
    const randomPreset = AXIE_STARTER_PRESETS[randomClass];

    setConfig({
      bodyClass: randomClass,
      bodyType: pick(bodyTypes),
      bodyColor: randomPreset.primary,
      eyes: { class: pick(classes), partId: 'eyes', color: '#0f172a', visible: true },
      ears: { class: pick(classes), partId: 'ear', color: AXIE_STARTER_PRESETS[pick(classes)].primary, visible: true },
      mouth: { class: pick(classes), partId: 'mouth', color: '#dc2626', visible: true },
      horn: { class: pick(classes), partId: 'horn', color: AXIE_STARTER_PRESETS[pick(classes)].secondary, visible: true },
      back: { class: pick(classes), partId: 'back', color: AXIE_STARTER_PRESETS[pick(classes)].primary, visible: true },
      tail: { class: pick(classes), partId: 'tail', color: AXIE_STARTER_PRESETS[pick(classes)].secondary, visible: true },
      shadowVisible: true,
      legsVisible: true,
      patternVisible: true,
    });
  };

  return (
    <div className={`bg-zinc-950/90 border border-amber-500/40 rounded-3xl p-5 shadow-2xl backdrop-blur relative ${className}`}>
      {/* Top Banner & Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-xl shadow-lg shadow-amber-500/20">
            🧬
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Axie 2D Modular Character Assembler
              </h3>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                GTK2D SPINE ATLAS ENGINE
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Konstruksi anatomi berlapis (Layer-by-Layer) dengan aset resmi Spine 2D dari official repo.
            </p>
          </div>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-300 transition flex items-center gap-1.5"
            title={isPlaying ? 'Jeda Animasi' : 'Putar Animasi'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>

          <button
            onClick={handleRandomizeMixer}
            className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500 hover:text-black border border-purple-500/40 text-xs font-black text-purple-300 transition flex items-center gap-1.5"
          >
            <Wand2 className="w-3.5 h-3.5" /> Acak Anatomi
          </button>

          <button
            onClick={handleExportJSON}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-cyan-400 transition flex items-center gap-1.5"
            title="Salin Schema Konfigurasi JSON"
          >
            {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedJson ? 'Disalin!' : 'JSON Config'}
          </button>

          <button
            onClick={handleExportPNG}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-emerald-400 transition flex items-center gap-1.5"
            title="Unduh PNG Transparan Murni 500x420"
          >
            <Download className="w-3.5 h-3.5" /> Unduh PNG
          </button>

          <button
            onClick={handleApplyToGenerator}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-black text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-amber-500/20"
            title="Terapkan Sprite yang dirakit ini langsung ke Studio Generator"
          >
            <Sparkles className="w-3.5 h-3.5 fill-black" />
            Terapkan ke Generator
          </button>
        </div>
      </div>

      {/* Applied Banner Alert */}
      {appliedNotification && (
        <div className="mb-4 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl p-3 flex items-center gap-2 text-emerald-300 text-xs font-bold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Sprite Axie Modular berhasil dirakit dan diterapkan ke Generator Preview! Anda sekarang dapat langsung mencetak ke Marketplace.</span>
        </div>
      )}

      {/* Main Grid: Viewport on Left, Control Tabs on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* VIEWPORT CANVAS (5 Cols) */}
        <div className="lg:col-span-5 bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-zinc-800 rounded-3xl p-4 flex flex-col items-center justify-center relative overflow-hidden shadow-inner group">
          {/* Background Grid Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#3f3f46_1px,transparent_1px)] [background-size:16px_16px] opacity-25"></div>

          {/* Quick HUD Badge */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {config.bodyClass.toUpperCase()}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700">
              {GTK2D_BODY_TYPES[config.bodyType]?.name}
            </span>
          </div>

          <div className="absolute top-3 right-3 z-10 text-[9px] font-mono text-zinc-500">
            500 × 420 px
          </div>

          {/* HTML5 Canvas */}
          <div className="relative z-0 w-full flex items-center justify-center py-2 min-h-[360px]">
            <canvas
              ref={canvasRef}
              width={500}
              height={420}
              className="w-full max-w-[440px] h-auto object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)] group-hover:scale-[1.02] transition-transform duration-300"
            />

            {!atlasesLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-400 text-xs bg-zinc-950/70 backdrop-blur-xs rounded-2xl">
                <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
                <span>Memuat Spine Atlases (01-Buba, 02-Olek, 03-Puffy...)...</span>
              </div>
            )}
          </div>

          {/* Bottom Viewport Legend */}
          <div className="w-full border-t border-zinc-800/80 pt-3 mt-2 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Spine Skeletal Loop
            </span>
            <span>Alpha: RGBA Transparent</span>
          </div>
        </div>

        {/* CONTROLS & INSPECTOR PANEL (7 Cols) */}
        <div className="lg:col-span-7 bg-zinc-900/70 border border-zinc-800 rounded-3xl p-5 space-y-5">
          {/* Sub-Tab Navigation */}
          <div className="grid grid-cols-4 gap-1.5 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800 text-xs font-bold">
            <button
              onClick={() => setActiveTab('parts')}
              className={`py-2 px-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'parts'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Slot Bagian</span>
            </button>

            <button
              onClick={() => setActiveTab('layers')}
              className={`py-2 px-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'layers'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Layer Inspector</span>
            </button>

            <button
              onClick={() => setActiveTab('palette')}
              className={`py-2 px-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'palette'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Warna &amp; Tint</span>
            </button>

            <button
              onClick={() => setActiveTab('bodyType')}
              className={`py-2 px-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'bodyType'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>Tipe Tubuh</span>
            </button>
          </div>

          {/* TAB CONTENT 1: PART SLOTS & MODULAR MIXER */}
          {activeTab === 'parts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-zinc-300 uppercase tracking-wide">
                  Ganti Sumber Bagian Tubuh (Cross-Class Mixing)
                </span>
                <span className="text-[10px] text-zinc-500">6 Slot Utama Spine 2D</span>
              </div>

              {/* Archetype Quick Switcher */}
              <div>
                <label className="text-[11px] font-bold text-zinc-400 block mb-1.5">
                  Preset Kelas Lengkap (Setel Semua Bagian):
                </label>
                <div className="grid grid-cols-6 gap-1.5">
                  {(['Beast', 'Plant', 'Aquatic', 'Bird', 'Bug', 'Reptile'] as AxieClassKey[]).map((cls) => (
                    <button
                      key={cls}
                      onClick={() => handleSelectClass(cls)}
                      className={`py-1.5 px-1 rounded-xl text-[10px] font-black border text-center transition ${
                        config.bodyClass === cls
                          ? 'bg-amber-400 text-black border-amber-300'
                          : 'bg-zinc-950 text-zinc-400 hover:text-white border-zinc-800'
                      }`}
                    >
                      {cls}
                    </button>
                  ))}
                </div>
              </div>

              {/* 6 Discrete Part Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Horn Slot */}
                <div className="bg-zinc-950/80 p-3 rounded-2xl border border-zinc-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                    <span className="flex items-center gap-1">📯 Tanduk (Horn)</span>
                    <span className="text-[10px] font-mono text-amber-400">{config.horn.class}</span>
                  </div>
                  <select
                    value={config.horn.class}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        horn: { ...prev.horn, class: e.target.value as AxieClassKey },
                      }))
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 text-xs font-bold text-white rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-amber-400"
                  >
                    {(['Beast', 'Plant', 'Aquatic', 'Bird', 'Bug', 'Reptile'] as AxieClassKey[]).map((c) => (
                      <option key={c} value={c}>
                        {c} Horn
                      </option>
                    ))}
                  </select>
                </div>

                {/* Back Slot */}
                <div className="bg-zinc-950/80 p-3 rounded-2xl border border-zinc-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                    <span className="flex items-center gap-1">🛡️ Punggung (Back)</span>
                    <span className="text-[10px] font-mono text-amber-400">{config.back.class}</span>
                  </div>
                  <select
                    value={config.back.class}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        back: { ...prev.back, class: e.target.value as AxieClassKey },
                      }))
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 text-xs font-bold text-white rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-amber-400"
                  >
                    {(['Beast', 'Plant', 'Aquatic', 'Bird', 'Bug', 'Reptile'] as AxieClassKey[]).map((c) => (
                      <option key={c} value={c}>
                        {c} Back
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tail Slot */}
                <div className="bg-zinc-950/80 p-3 rounded-2xl border border-zinc-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                    <span className="flex items-center gap-1">🪶 Ekor (Tail)</span>
                    <span className="text-[10px] font-mono text-amber-400">{config.tail.class}</span>
                  </div>
                  <select
                    value={config.tail.class}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        tail: { ...prev.tail, class: e.target.value as AxieClassKey },
                      }))
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 text-xs font-bold text-white rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-amber-400"
                  >
                    {(['Beast', 'Plant', 'Aquatic', 'Bird', 'Bug', 'Reptile'] as AxieClassKey[]).map((c) => (
                      <option key={c} value={c}>
                        {c} Tail
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ears Slot */}
                <div className="bg-zinc-950/80 p-3 rounded-2xl border border-zinc-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                    <span className="flex items-center gap-1">👂 Telinga (Ears)</span>
                    <span className="text-[10px] font-mono text-amber-400">{config.ears.class}</span>
                  </div>
                  <select
                    value={config.ears.class}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        ears: { ...prev.ears, class: e.target.value as AxieClassKey },
                      }))
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 text-xs font-bold text-white rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-amber-400"
                  >
                    {(['Beast', 'Plant', 'Aquatic', 'Bird', 'Bug', 'Reptile'] as AxieClassKey[]).map((c) => (
                      <option key={c} value={c}>
                        {c} Ears
                      </option>
                    ))}
                  </select>
                </div>

                {/* Eyes Slot */}
                <div className="bg-zinc-950/80 p-3 rounded-2xl border border-zinc-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                    <span className="flex items-center gap-1">👁️ Mata (Eyes)</span>
                    <span className="text-[10px] font-mono text-amber-400">{config.eyes.class}</span>
                  </div>
                  <select
                    value={config.eyes.class}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        eyes: { ...prev.eyes, class: e.target.value as AxieClassKey },
                      }))
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 text-xs font-bold text-white rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-amber-400"
                  >
                    {(['Beast', 'Plant', 'Aquatic', 'Bird', 'Bug', 'Reptile'] as AxieClassKey[]).map((c) => (
                      <option key={c} value={c}>
                        {c} Eyes
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mouth Slot */}
                <div className="bg-zinc-950/80 p-3 rounded-2xl border border-zinc-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                    <span className="flex items-center gap-1">👄 Mulut (Mouth)</span>
                    <span className="text-[10px] font-mono text-amber-400">{config.mouth.class}</span>
                  </div>
                  <select
                    value={config.mouth.class}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        mouth: { ...prev.mouth, class: e.target.value as AxieClassKey },
                      }))
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 text-xs font-bold text-white rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-amber-400"
                  >
                    {(['Beast', 'Plant', 'Aquatic', 'Bird', 'Bug', 'Reptile'] as AxieClassKey[]).map((c) => (
                      <option key={c} value={c}>
                        {c} Mouth
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT 2: LAYER INSPECTOR (TOGGLE VISIBILITY) */}
          {activeTab === 'layers' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wide">
                    Layer Visibility Inspector
                  </h4>
                  <p className="text-[10px] text-zinc-400">
                    Nonaktifkan/aktifkan layer individual untuk memverifikasi perakitan modular terpisah.
                  </p>
                </div>
                <button
                  onClick={() =>
                    setConfig((prev) => ({
                      ...prev,
                      shadowVisible: true,
                      legsVisible: true,
                      patternVisible: true,
                      horn: { ...prev.horn, visible: true },
                      back: { ...prev.back, visible: true },
                      tail: { ...prev.tail, visible: true },
                      ears: { ...prev.ears, visible: true },
                      eyes: { ...prev.eyes, visible: true },
                      mouth: { ...prev.mouth, visible: true },
                    }))
                  }
                  className="text-[10px] font-bold text-amber-400 hover:underline"
                >
                  Tampilkan Semua
                </button>
              </div>

              {/* Layer Stacking Order List (Front to Back) */}
              <div className="space-y-1.5">
                {[
                  {
                    key: 'horn',
                    name: 'Layer 10: Tanduk (Horn)',
                    visible: config.horn.visible,
                    toggle: () =>
                      setConfig((p) => ({ ...p, horn: { ...p.horn, visible: !p.horn.visible } })),
                  },
                  {
                    key: 'eyes',
                    name: 'Layer 9: Mata (Eyes)',
                    visible: config.eyes.visible,
                    toggle: () =>
                      setConfig((p) => ({ ...p, eyes: { ...p.eyes, visible: !p.eyes.visible } })),
                  },
                  {
                    key: 'mouth',
                    name: 'Layer 8: Mulut (Mouth)',
                    visible: config.mouth.visible,
                    toggle: () =>
                      setConfig((p) => ({ ...p, mouth: { ...p.mouth, visible: !p.mouth.visible } })),
                  },
                  {
                    key: 'ears',
                    name: 'Layer 7: Telinga Kiri & Kanan (Ears)',
                    visible: config.ears.visible,
                    toggle: () =>
                      setConfig((p) => ({ ...p, ears: { ...p.ears, visible: !p.ears.visible } })),
                  },
                  {
                    key: 'legs',
                    name: 'Layer 6: Kaki Depan (Front Legs)',
                    visible: config.legsVisible,
                    toggle: () => setConfig((p) => ({ ...p, legsVisible: !p.legsVisible })),
                  },
                  {
                    key: 'pattern',
                    name: 'Layer 5: Motif Tubuh (Body Pattern)',
                    visible: config.patternVisible,
                    toggle: () => setConfig((p) => ({ ...p, patternVisible: !p.patternVisible })),
                  },
                  {
                    key: 'back',
                    name: 'Layer 2: Punggung (Back Part)',
                    visible: config.back.visible,
                    toggle: () =>
                      setConfig((p) => ({ ...p, back: { ...p.back, visible: !p.back.visible } })),
                  },
                  {
                    key: 'tail',
                    name: 'Layer 1: Ekor (Tail Base)',
                    visible: config.tail.visible,
                    toggle: () =>
                      setConfig((p) => ({ ...p, tail: { ...p.tail, visible: !p.tail.visible } })),
                  },
                  {
                    key: 'shadow',
                    name: 'Layer 0: Bayangan Tanah (Ground Shadow)',
                    visible: config.shadowVisible,
                    toggle: () => setConfig((p) => ({ ...p, shadowVisible: !p.shadowVisible })),
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    onClick={item.toggle}
                    className={`px-3 py-2 rounded-xl border flex items-center justify-between cursor-pointer transition text-xs font-bold ${
                      item.visible
                        ? 'bg-zinc-950 border-zinc-800 text-zinc-200 hover:border-zinc-700'
                        : 'bg-zinc-950/40 border-zinc-900 text-zinc-600 line-through'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      {item.name}
                    </span>
                    <button className="text-zinc-400 hover:text-white">
                      {item.visible ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB CONTENT 3: PALETTES & SLOT TINTING */}
          {activeTab === 'palette' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wide">
                  Palet Warna Resmi &amp; Slot Tinting
                </h4>
                <p className="text-[10px] text-zinc-400">
                  Shader tinting dinamis menggunakan formula Canvas Multiply &amp; Destination-In.
                </p>
              </div>

              {/* Slot Tint Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Body Tint */}
                <div className="bg-zinc-950/80 p-3 rounded-2xl border border-zinc-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                    <span>Warna Badan (Body Torso):</span>
                    <input
                      type="color"
                      value={config.bodyColor}
                      onChange={(e) => setConfig((p) => ({ ...p, bodyColor: e.target.value }))}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    />
                  </div>
                  <div className="text-[10px] font-mono text-zinc-400">{config.bodyColor}</div>
                </div>

                {/* Horn Tint */}
                <div className="bg-zinc-950/80 p-3 rounded-2xl border border-zinc-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                    <span>Warna Tanduk (Horn):</span>
                    <input
                      type="color"
                      value={config.horn.color}
                      onChange={(e) =>
                        setConfig((p) => ({ ...p, horn: { ...p.horn, color: e.target.value } }))
                      }
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    />
                  </div>
                  <div className="text-[10px] font-mono text-zinc-400">{config.horn.color}</div>
                </div>

                {/* Tail Tint */}
                <div className="bg-zinc-950/80 p-3 rounded-2xl border border-zinc-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                    <span>Warna Ekor (Tail):</span>
                    <input
                      type="color"
                      value={config.tail.color}
                      onChange={(e) =>
                        setConfig((p) => ({ ...p, tail: { ...p.tail, color: e.target.value } }))
                      }
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    />
                  </div>
                  <div className="text-[10px] font-mono text-zinc-400">{config.tail.color}</div>
                </div>

                {/* Back Tint */}
                <div className="bg-zinc-950/80 p-3 rounded-2xl border border-zinc-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                    <span>Warna Punggung (Back):</span>
                    <input
                      type="color"
                      value={config.back.color}
                      onChange={(e) =>
                        setConfig((p) => ({ ...p, back: { ...p.back, color: e.target.value } }))
                      }
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    />
                  </div>
                  <div className="text-[10px] font-mono text-zinc-400">{config.back.color}</div>
                </div>
              </div>

              {/* Official Axie Gene Color Swatches */}
              <div>
                <label className="text-[11px] font-bold text-zinc-400 block mb-2">
                  Palet Warna Resmi Axie Infinity Genes (67 Warna Terdaftar):
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-zinc-950 rounded-2xl border border-zinc-800">
                  {((axieGenesData.items as any)?.colors || []).slice(0, 36).map((col: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() =>
                        setConfig((p) => ({
                          ...p,
                          bodyColor: `#${col.primary1}`,
                          back: { ...p.back, color: `#${col.primary1}` },
                          ears: { ...p.ears, color: `#${col.primary1}` },
                          horn: { ...p.horn, color: `#${col.primary2}` },
                          tail: { ...p.tail, color: `#${col.primary2}` },
                        }))
                      }
                      className="w-7 h-7 rounded-lg border border-zinc-700 hover:scale-110 transition shadow"
                      style={{ backgroundColor: `#${col.primary1}` }}
                      title={`${col.key} (#${col.primary1})`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT 4: GTK2D BODY TYPES */}
          {activeTab === 'bodyType' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wide">
                    10 Tipe Tubuh GTK2D (Official unity-axie-gtk2d)
                  </h4>
                  <p className="text-[10px] text-zinc-400">
                    Setiap tipe memodifikasi mesh scaling, siluet anatomis, dan bobot tubuh.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-amber-400">
                  {GTK2D_BODY_TYPES[config.bodyType]?.gtkMaterial}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {Object.entries(GTK2D_BODY_TYPES).map(([key, item]) => {
                  const isSelected = config.bodyType === key;
                  return (
                    <div
                      key={key}
                      onClick={() => setConfig((p) => ({ ...p, bodyType: key }))}
                      className={`p-3 rounded-2xl border cursor-pointer transition flex flex-col justify-between items-center text-center ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-400 shadow-md shadow-amber-500/20 scale-[1.03] ring-1 ring-amber-400/50'
                          : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50'
                      }`}
                    >
                      <div className="text-2xl my-1">{item.icon}</div>
                      <div className="mt-1">
                        <div className="text-xs font-black text-white">{item.name}</div>
                        <div className="text-[9px] font-mono text-zinc-500 mt-0.5">{item.gtkMaterial}</div>
                      </div>
                      <div className="mt-2 text-[8px] font-mono text-zinc-400 border-t border-zinc-800/80 pt-1 w-full">
                        {item.scaleX}x × {item.scaleY}x
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
