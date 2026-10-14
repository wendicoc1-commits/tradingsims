'use client';

import React, { useEffect, useRef } from 'react';

/**
 * AIBreathingSphere
 * 100% faithful replication of the WebGL 1.0 Raymarching Shader from https://aicommon.creamu.co.jp/
 * 
 * Features:
 * - Organic breathing signed distance field (SDF) sphere with undulating harmonic waves.
 * - Champagne Gold, Copper, and Warm Obsidian color palette (#3b2416, #8e5a36, #e2c58e, #ebd9b8, #0a0a09).
 * - Interactive mouse/cursor light tracking with specular highlight and ambient rim lighting.
 * - Parallax scroll attenuation: sphere gently translates and dims down as the user scrolls into subsequent sections.
 * - Zero external dependencies (pure WebGL 1.0 with auto viewport scaling and visibility throttling).
 */
export default function AIBreathingSphere() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance',
    });
    if (!gl) return;

    const VS = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
    const FS = `
precision highp float;
uniform vec2 r; 
uniform float t; 
uniform vec2 m;
uniform vec4 s;   // x,y: center (-1..1), z: size, w: first-view intensity (1=hero)

float h(vec2 p){
  return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);
}

// Luxurious Champagne Gold / Warm Copper Palette from aicommon.creamu.co.jp
const vec3 BROWN  = vec3(0.231, 0.141, 0.086);   // #3b2416
const vec3 COPPER = vec3(0.557, 0.353, 0.212);   // #8e5a36
const vec3 GOLD   = vec3(0.886, 0.773, 0.557);   // #e2c58e
const vec3 CHAMP  = vec3(0.922, 0.851, 0.722);   // #ebd9b8
const vec3 CREAM  = vec3(0.949, 0.918, 0.875);   // #f2eadf
const vec3 SITE   = vec3(0.024, 0.027, 0.035);   // Dark Slate/Charcoal background
const vec3 HERO   = vec3(0.016, 0.014, 0.012);   // Deep warm obsidian

// Organic Breathing Signed Distance Function (SDF)
float sd(vec3 p){
  float T = t * 0.55;
  float R = 0.64 * (1.0 + 0.022 * sin(t * 0.85));               // Natural respiration rhythm
  float d = length(p) - R;
  d += 0.032 * sin(3.1 * p.x + T) * sin(3.3 * p.y + T * 1.3) * sin(2.9 * p.z + T * 0.7);
  d += 0.014 * sin(7.0 * p.y - T * 1.7 + p.x * 3.0);
  return d;
}

vec3 nor(vec3 p){
  vec2 e = vec2(0.001, 0.0);
  return normalize(vec3(
    sd(p + e.xyy) - sd(p - e.xyy),
    sd(p + e.yxy) - sd(p - e.yxy),
    sd(p + e.yyx) - sd(p - e.yyx)
  ));
}

vec3 env(vec3 R){
  float y = R.y * 0.5 + 0.5;
  vec3 c = mix(vec3(0.03, 0.02, 0.012), BROWN * 1.3, smoothstep(0.15, 0.95, y));
  c += CHAMP * smoothstep(0.965, 0.995, sin(R.y * 3.1 + R.x * 0.9 + t * 0.12) * 0.5 + 0.5) * 0.55;
  c += GOLD * pow(max(dot(R, normalize(vec3(-0.55, 0.75, 0.45))), 0.0), 18.0) * 0.9;
  return c;
}

vec3 render(vec2 frag, out float edge){
  edge = 0.0;
  float base = min(r.x * (r.x < r.y ? 0.85 : 1.0), r.y * 1.05);
  vec2 cen = 0.5 * r + vec2(s.x, -s.y) * 0.5 * r;               // Center coordinate in pixels
  vec2 p = (frag - cen) / (base * s.z);
  p.y -= 0.02;
  vec3 ro = vec3(0.0, 0.0, 3.2);
  vec3 rd = normalize(vec3(p, -1.6));

  // Ambient atmospheric background glow
  vec2 q = frag / r;
  float glow = smoothstep(0.95, 0.0, length((frag - cen) / min(r.x, r.y) * 0.9 / max(s.z, 0.25)));
  vec3 bg = mix(SITE, HERO, s.w) + BROWN * glow * mix(0.14, 0.38, s.w);
  bg += (h(frag + fract(t * 7.0)) - 0.5) * mix(0.016, 0.028, s.w);

  vec3 col = bg;
  
  // Raymarching Sphere Bounding Check
  float b = dot(ro, rd);
  float c = dot(ro, ro) - 0.74 * 0.74;
  if(b * b - c > 0.0){
    float d0 = max(0.0, -b - sqrt(b * b - c));
    bool hit = false;
    float nearest = 1.0;
    
    for(int i = 0; i < 96; i++){
      vec3 x = ro + rd * d0;
      float d = sd(x);
      nearest = min(nearest, d);
      if(d < 0.00015){
        hit = true;
        break;
      }
      d0 += d * 0.9;
      if(d0 > 6.0) break;
    }
    
    edge = 1.0 - step(0.004, nearest);
    if(hit){
      vec3 x = ro + rd * d0; 
      vec3 N = nor(x);
      edge = 1.0 - step(0.22, abs(dot(N, -rd)));
      
      // Interactive light follow mouse vector
      vec3 L = normalize(vec3((m.x - 0.5) * 5.0 - 1.2, (m.y - 0.5) * 5.0 + 1.6, 2.2));
      float fr = pow(1.0 - max(dot(N, -rd), 0.0), 2.6);
      vec3 R = reflect(rd, N);
      float dif = max(dot(N, L), 0.0);
      float spec = pow(max(dot(reflect(-L, N), -rd), 0.0), 70.0);
      vec3 tint = mix(COPPER * 0.9, GOLD, clamp(fr * 1.2 + dif * 0.35, 0.0, 1.0));
      
      vec3 sc = BROWN * 0.18 * (0.3 + dif) + env(R) * tint * 1.25 + GOLD * fr * 0.35 + CREAM * spec * mix(0.35, 0.85, s.w);
      col = sc * 0.95 * mix(0.55, 1.0, s.w);
    }
  }
  
  // Vignette overlay
  col *= mix(1.0, mix(0.82, 1.0, smoothstep(1.2, 0.3, length(q - 0.5) * 1.4)), s.w);
  return col;
}

void main(){
  float edge;
  vec3 col = render(gl_FragCoord.xy, edge);
  if(edge > 0.5){
    float unused;
    col = (
      render(gl_FragCoord.xy + vec2(-0.25, -0.25), unused) +
      render(gl_FragCoord.xy + vec2(0.25, -0.25), unused) +
      render(gl_FragCoord.xy + vec2(-0.25, 0.25), unused) +
      render(gl_FragCoord.xy + vec2(0.25, 0.25), unused)
    ) * 0.25;
  }
  gl_FragColor = vec4(col, 1.0);
}
`;

    function compile(type: number, src: string) {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn(gl.getShaderInfoLog(shader));
        return null;
      }
      return shader;
    }

    const vShader = compile(gl.VERTEX_SHADER, VS);
    const fShader = compile(gl.FRAGMENT_SHADER, FS);
    if (!vShader || !fShader) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vShader);
    gl.attachShader(prog, fShader);
    gl.linkProgram(prog);

    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn(gl.getProgramInfoLog(prog));
      return;
    }

    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );

    const aPos = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uR = gl.getUniformLocation(prog, 'r');
    const uT = gl.getUniformLocation(prog, 't');
    const uM = gl.getUniformLocation(prog, 'm');
    const uS = gl.getUniformLocation(prog, 's');

    const ease = (x: number) => x * x * (3 - 2 * x);
    const PARALLAX = 0.45;
    const target = { x: 0.5, y: 0.55 };
    const cur = { x: 0.5, y: 0.55 };
    const P = { x: 0, y: 0.05, z: 1.0, w: 1.0 };

    let running = false;
    let raf = 0;
    let last = performance.now();
    let time = 8;
    let isVisible = true;

    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      let scale = Math.min((window.devicePixelRatio || 1), 2.5);
      const MAX_PX = 8e6;
      const px = rect.width * rect.height * scale * scale;
      if (px > MAX_PX) scale *= Math.sqrt(MAX_PX / px);

      canvas.width = Math.max(1, Math.round(rect.width * scale));
      canvas.height = Math.max(1, Math.round(rect.height * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (!running) draw(true);
    }

    function draw(snap: boolean) {
      cur.x += (target.x - cur.x) * 0.045;
      cur.y += (target.y - cur.y) * 0.045;

      const scrollY = window.scrollY || 0;
      const w0 = 1.0 - Math.min(1.0, Math.max(0.0, scrollY / (window.innerHeight * 0.9)));
      const k = snap ? 1.0 : 0.12;
      P.w += (ease(w0) - P.w) * k;

      gl.uniform2f(uR, canvas.width, canvas.height);
      gl.uniform1f(uT, time);
      gl.uniform2f(uM, cur.x, cur.y);
      gl.uniform4f(uS, P.x, P.y, P.z, P.w);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    function loop(now: number) {
      if (!running) return;
      time += Math.min(50, now - last) / 1000;
      last = now;
      draw(false);
      raf = requestAnimationFrame(loop);
    }

    function start() {
      if (running || !isVisible || document.hidden) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e && e.touches[0] ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e && e.touches[0] ? e.touches[0].clientY : (e as MouseEvent).clientY;
      target.x = clientX / window.innerWidth;
      target.y = 1.0 - clientY / window.innerHeight;
    };

    window.addEventListener('mousemove', onPointerMove, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    document.addEventListener('mouseleave', () => {
      target.x = 0.5;
      target.y = 0.55;
    });

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          ticking = false;
          const y = Math.max(0, window.scrollY);
          if (canvas) {
            canvas.style.transform = `translate3d(0, ${(y * PARALLAX).toFixed(1)}px, 0)`;
          }
        });
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    window.addEventListener('resize', resize, { passive: true });

    const onVisibilityChange = () => {
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    resize();
    onScroll();
    draw(true);
    start();

    return () => {
      stop();
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', resize);
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      <canvas
        ref={canvasRef}
        className="w-full h-full block will-change-transform opacity-95 transition-opacity duration-1000"
        aria-hidden="true"
      />
      {/* Subtle radial ambient gradient softening bottom transition */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#06080E] pointer-events-none" />
    </div>
  );
}
