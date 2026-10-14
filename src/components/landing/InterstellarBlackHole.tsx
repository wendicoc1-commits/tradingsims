'use client';

import React, { useEffect, useRef } from 'react';

interface InterstellarProps {
  mousePos?: { x: number; y: number };
}

// ─────────────────────────────────────────────────────────────────────────────
// WebGL Shader Sources for True Gravitational Lensing & Relativistic Accretion
// ─────────────────────────────────────────────────────────────────────────────
const VERTEX_SHADER_SRC = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = (a_position + 1.0) * 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER_SRC = `
#ifdef GL_ES
precision highp float;
#endif

varying vec2 v_uv;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

#define PI 3.14159265359

// Hash for procedural starfield & plasma turbulence
float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

// 2D Simplex-like noise for accretion plasma
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// Fractional Brownian Motion for glowing plasma filaments
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = rot * p * 2.05 + vec2(100.0);
    a *= 0.5;
  }
  return v;
}

// Blackbody / Incandescent Accretion Color Palette (Interstellar Gold & Amber)
vec3 accretionPalette(float t, float doppler) {
  // Ultra-hot inner ring: incandescent white-gold
  vec3 hotWhite = vec3(1.0, 0.96, 0.88);
  vec3 pureGold  = vec3(1.0, 0.72, 0.16);
  vec3 amberFire = vec3(0.95, 0.42, 0.05);
  vec3 darkRed   = vec3(0.45, 0.08, 0.02);

  vec3 col = mix(darkRed, amberFire, smoothstep(0.0, 0.45, t));
  col = mix(col, pureGold, smoothstep(0.45, 0.8, t));
  col = mix(col, hotWhite, smoothstep(0.8, 1.0, t));

  // Doppler color shift: approaching side turns whiter & brighter, receding side turns deeper red
  col *= doppler;
  return col;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);

  // Singularity position slightly above center to frame hero headline
  vec2 singularity = vec2(0.0, 0.12);
  vec2 p = uv - singularity;

  // Mouse camera parallax tilt
  vec2 mouseOffset = (u_mouse / u_resolution - 0.5) * 0.15;
  p += mouseOffset;

  float r = length(p);

  // Black hole event horizon parameters
  float r_s = 0.16;             // Schwarzschild radius
  float photon_ring = r_s * 1.12;// Photon sphere
  float disk_in = r_s * 1.25;    // Inner accretion edge (ISCO)
  float disk_out = r_s * 4.6;    // Outer accretion edge

  // ── 1. Gravitational Lensing Curvature Approximation ──
  // Relativistic light deflection: alpha ~ 4GM / (c^2 * r)
  // Rays bend inward toward the singularity
  float deflection = (r_s * 0.35) / max(r, 0.001);
  vec2 bent_p = p * (1.0 + deflection * 0.75);

  // 3D Perspective Disk Tilt (viewed at inclined angle, like in the film)
  float tiltAngle = 0.38; // Accretion disk tilt
  float dist3D = length(vec2(bent_p.x, bent_p.y / tiltAngle));

  // ── 2. Accretion Disk Physics (Keplerian Differential Rotation) ──
  // Inner gas orbits faster than outer gas: omega ~ 1 / r^1.5
  float orbitalSpeed = 1.1 / pow(max(dist3D, 0.05), 1.35);
  float phi = atan(bent_p.y / tiltAngle, bent_p.x) + u_time * 0.35 * orbitalSpeed;

  // Relativistic Doppler Beaming
  // Approaching side (bent_p.x < 0) is blindingly brighter; receding side is dimmer
  vec2 velocityDir = normalize(vec2(-bent_p.y, bent_p.x));
  float dopplerFactor = pow(clamp(1.0 - 0.65 * (bent_p.x / max(dist3D, 0.01)), 0.25, 2.8), 2.2);

  // Plasma Turbulence Noise
  vec2 plasmaCoord = vec2(dist3D * 7.5 - u_time * 0.15, phi * 2.5);
  float turbulence = fbm(plasmaCoord);
  turbulence = smoothstep(0.2, 0.9, turbulence);

  // Disk Radial Density Envelope
  float diskMask = smoothstep(disk_in, disk_in + 0.08, dist3D) * (1.0 - smoothstep(disk_out * 0.75, disk_out, dist3D));
  
  // Vertical disk cross-section thickness
  float diskThickness = (0.012 + dist3D * 0.025);
  float verticalFalloff = exp(-pow(bent_p.y / diskThickness, 2.0));

  // Primary Accretion Disk Emission
  float diskIntensity = diskMask * verticalFalloff * (0.6 + 0.8 * turbulence) * dopplerFactor;

  // ── 3. Gravitational Lensing Halo (The Trademark Interstellar Double Arch) ──
  // Light from behind the black hole bent up and over the event horizon
  float upperArchDist = length(vec2(p.x, (p.y - r_s * 0.3) / 0.85));
  float upperArchMask = smoothstep(disk_in * 0.9, disk_in + 0.06, upperArchDist) * (1.0 - smoothstep(disk_out * 0.6, disk_out * 0.9, upperArchDist));
  float upperArchFalloff = exp(-pow(abs(upperArchDist - r_s * 1.55) / 0.045, 2.0));
  float upperArchIntensity = upperArchMask * upperArchFalloff * 0.95 * dopplerFactor * (0.7 + 0.3 * fbm(vec2(upperArchDist * 12.0, phi)));

  // Lower counter-arch
  float lowerArchDist = length(vec2(p.x, (p.y + r_s * 0.25) / 0.65));
  float lowerArchFalloff = exp(-pow(abs(lowerArchDist - r_s * 1.35) / 0.035, 2.0));
  float lowerArchIntensity = lowerArchFalloff * 0.45 * dopplerFactor;

  // Combine Accretion Radiation
  float totalAccretion = diskIntensity + upperArchIntensity + lowerArchIntensity;

  // ── 4. The Photon Ring (Blinding White Incandescent Ring at Event Horizon Edge) ──
  float photonRingGlow = exp(-pow(abs(r - photon_ring) / 0.004, 2.0)) * 2.8;
  float secondaryRingGlow = exp(-pow(abs(r - photon_ring * 1.05) / 0.008, 2.0)) * 1.2;

  // ── 5. Ambient Relativistic Flare & Cosmic Fog ──
  float ambientGlow = exp(-r * 3.2) * 0.35 + exp(-r * 1.8) * 0.12;

  // ── 6. Distant Deep Space Cosmic Starfield (Gravitationally Distorted) ──
  vec2 starCoord = bent_p * 45.0;
  vec2 starId = floor(starCoord);
  float starRandom = hash21(starId);
  float star = smoothstep(0.975, 1.0, starRandom);
  float starTwinkle = 0.5 + 0.5 * sin(u_time * 2.0 + starRandom * 20.0);
  vec3 starColor = vec3(0.9, 0.95, 1.0) * star * starTwinkle * 0.6;

  // ── 7. Color Composition ──
  vec3 finalColor = vec3(0.0);

  // Background stars
  finalColor += starColor;

  // Accretion disk plasma emission
  if (totalAccretion > 0.001) {
    float normDist = clamp((dist3D - disk_in) / (disk_out - disk_in), 0.0, 1.0);
    vec3 plasmaCol = accretionPalette(1.0 - normDist, dopplerFactor);
    finalColor += plasmaCol * totalAccretion * 1.8;
  }

  // Photon ring addition
  finalColor += vec3(1.0, 0.95, 0.85) * (photonRingGlow + secondaryRingGlow);

  // Ambient relativistic glow
  finalColor += vec3(0.95, 0.65, 0.15) * ambientGlow;

  // ── 8. Absolute Event Horizon Black Hole Void ──
  // Nothing escapes past the Schwarzschild event horizon
  float horizonEdge = smoothstep(r_s * 0.98, r_s * 1.02, r);
  finalColor *= horizonEdge;

  // Vignette & Tone Mapping for Film Texture
  finalColor = finalColor / (1.0 + finalColor * 0.35); // Reinhard tone mapping
  finalColor = pow(finalColor, vec3(0.95));            // Subtle gamma curve

  gl_FragColor = vec4(finalColor, 0.92);
}
`;

export default function InterstellarBlackHole({ mousePos }: InterstellarProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Try WebGL2 then WebGL1
    const gl =
      canvas.getContext('webgl2', { alpha: true, antialias: true, powerPreference: 'high-performance' }) ||
      canvas.getContext('webgl', { alpha: true, antialias: true, powerPreference: 'high-performance' });

    if (!gl) {
      console.warn('WebGL not supported for Interstellar effect, falling back.');
      return;
    }

    // Compile shader helper
    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertShader = createShader(gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
    const fragShader = createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);
    if (!vertShader || !fragShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Fullscreen quad buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0,
      ]),
      gl.STATIC_DRAW
    );

    const aPositionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPositionLocation);
    gl.vertexAttribPointer(aPositionLocation, 2, gl.FLOAT, false, 0, 0);

    const uResolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const uTimeLocation = gl.getUniformLocation(program, 'u_time');
    const uMouseLocation = gl.getUniformLocation(program, 'u_mouse');

    let animId: number;
    let startTime = performance.now();

    // Resize handling with DPR capping for 60-120fps smoothness
    const resize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.floor(window.innerWidth * dpr);
      const height = Math.floor(window.innerHeight * dpr);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };

    window.addEventListener('resize', resize);
    resize();

    // Mouse lerp coordinates
    let currentMouseX = window.innerWidth * 0.5;
    let currentMouseY = window.innerHeight * 0.5;

    const render = (now: number) => {
      if (document.hidden) {
        animId = requestAnimationFrame(render);
        return;
      }

      const elapsed = (now - startTime) * 0.001;

      // Smooth mouse lerping
      if (mousePos && mousePos.x >= 0) {
        currentMouseX += (mousePos.x - currentMouseX) * 0.05;
        currentMouseY += (mousePos.y - currentMouseY) * 0.05;
      }

      gl.useProgram(program);
      gl.uniform2f(uResolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(uTimeLocation, elapsed);
      gl.uniform2f(uMouseLocation, currentMouseX, canvas.height - currentMouseY);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      if (gl) {
        gl.deleteProgram(program);
        gl.deleteShader(vertShader);
        gl.deleteShader(fragShader);
        gl.deleteBuffer(positionBuffer);
      }
    };
  }, [mousePos]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-95 transition-opacity duration-1000"
      style={{ filter: 'contrast(1.15) saturate(1.2)' }}
    />
  );
}
