import React, { useEffect, useRef } from 'react';

export type LiquidTheme =
  | 'opal-pearl'
  | 'glacial-cyan'
  | 'sakura-blush'
  | 'solar-ivory'
  | 'cyber-aurora'
  | 'emerald-nexus';

export const isThemeLight = (_theme?: LiquidTheme) => true;

export interface DynamicLiquidBackgroundProps {
  theme?: LiquidTheme;
  interactive?: boolean;
  speed?: number;
  rippleIntensity?: number;
  disruptionCount?: number;
  glassBlurLevel?: 'low' | 'medium' | 'high';
}

interface GridDot {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  alpha: number;
  vx: number;
  vy: number;
  phase: number;
  isHero: boolean;
  pushX: number;
  pushY: number;
}

interface ClickShockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
}

export const THEME_PALETTES: Record<
  LiquidTheme,
  {
    bg: string;
    ambientHero1: string;
    ambientHero2: string;
    dotBaseRgb: [number, number, number];
    dotHighlightRgb: [number, number, number];
    lineRgb: [number, number, number];
    shockwaveRgb: [number, number, number];
  }
> = {
  'opal-pearl': {
    bg: '#f8fafc',
    ambientHero1: 'rgba(99, 102, 241, 0.09)',
    ambientHero2: 'rgba(56, 189, 248, 0.05)',
    dotBaseRgb: [79, 70, 229],
    dotHighlightRgb: [99, 102, 241],
    lineRgb: [99, 102, 241],
    shockwaveRgb: [99, 102, 241],
  },
  'glacial-cyan': {
    bg: '#f0fdfa',
    ambientHero1: 'rgba(6, 182, 212, 0.10)',
    ambientHero2: 'rgba(20, 184, 166, 0.06)',
    dotBaseRgb: [8, 145, 178],
    dotHighlightRgb: [6, 182, 212],
    lineRgb: [6, 182, 212],
    shockwaveRgb: [6, 182, 212],
  },
  'sakura-blush': {
    bg: '#fff1f2',
    ambientHero1: 'rgba(244, 63, 94, 0.09)',
    ambientHero2: 'rgba(236, 72, 153, 0.05)',
    dotBaseRgb: [225, 29, 72],
    dotHighlightRgb: [244, 63, 94],
    lineRgb: [244, 63, 94],
    shockwaveRgb: [244, 63, 94],
  },
  'solar-ivory': {
    bg: '#fffbeb',
    ambientHero1: 'rgba(245, 158, 11, 0.09)',
    ambientHero2: 'rgba(251, 146, 60, 0.05)',
    dotBaseRgb: [217, 119, 6],
    dotHighlightRgb: [245, 158, 11],
    lineRgb: [245, 158, 11],
    shockwaveRgb: [245, 158, 11],
  },
  'cyber-aurora': {
    bg: '#f5f3ff',
    ambientHero1: 'rgba(124, 58, 237, 0.10)',
    ambientHero2: 'rgba(99, 102, 241, 0.06)',
    dotBaseRgb: [109, 40, 217],
    dotHighlightRgb: [124, 58, 237],
    lineRgb: [124, 58, 237],
    shockwaveRgb: [124, 58, 237],
  },
  'emerald-nexus': {
    bg: '#f0fdf4',
    ambientHero1: 'rgba(16, 185, 129, 0.10)',
    ambientHero2: 'rgba(20, 184, 166, 0.06)',
    dotBaseRgb: [5, 150, 105],
    dotHighlightRgb: [16, 185, 129],
    lineRgb: [16, 185, 129],
    shockwaveRgb: [16, 185, 129],
  },
};

export const DynamicLiquidBackground: React.FC<DynamicLiquidBackgroundProps> = ({
  theme = 'opal-pearl',
  interactive = true,
  speed = 1.0,
  rippleIntensity = 1.0,
  disruptionCount = 0,
  glassBlurLevel = 'medium',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    isHovering: boolean;
  }>({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 500,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 400,
    targetX: typeof window !== 'undefined' ? window.innerWidth / 2 : 500,
    targetY: typeof window !== 'undefined' ? window.innerHeight / 2 : 400,
    isHovering: false,
  });

  const dotsRef = useRef<GridDot[]>([]);
  const shockwavesRef = useRef<ClickShockwave[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  // Initialize loose dot grid with high contrast so it's vividly visible through glass cards
  const initDotGrid = (width: number, height: number) => {
    const dots: GridDot[] = [];
    const regularSpacing = 28; // Balanced matrix grid spacing

    for (let x = 14; x < width + regularSpacing; x += regularSpacing) {
      for (let y = 14; y < height + regularSpacing; y += regularSpacing) {
        const isHeroRegion = y < 450;

        // Base opacity: 32-45% so dots are crystal clear through liquid glass
        const edgeDistX = Math.min(x, width - x) / (width * 0.35);
        const edgeDistY = Math.min(y, height - y) / (height * 0.35);
        const edgeFade = Math.min(Math.max(edgeDistX, 0.6), Math.max(edgeDistY, 0.6), 1);

        const baseAlpha = (isHeroRegion ? 0.42 : 0.36) * edgeFade;

        const angle = Math.random() * Math.PI * 2;
        const driftSpeed = 0.08 + Math.random() * 0.12;

        dots.push({
          baseX: x,
          baseY: y,
          x,
          y,
          radius: 2.2 + Math.random() * 0.6, // Crisp 2.2px to 2.8px dots
          baseAlpha,
          alpha: baseAlpha,
          vx: Math.cos(angle) * driftSpeed,
          vy: Math.sin(angle) * driftSpeed,
          phase: Math.random() * Math.PI * 2,
          isHero: isHeroRegion,
          pushX: 0,
          pushY: 0,
        });
      }
    }

    dotsRef.current = dots;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      initDotGrid(width, height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mouse move and click interaction
  useEffect(() => {
    if (!interactive) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
      mouseRef.current.isHovering = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.isHovering = false;
    };

    const handleClick = (e: MouseEvent) => {
      shockwavesRef.current.push({
        x: e.clientX,
        y: e.clientY,
        radius: 6,
        maxRadius: Math.max(120, 220 * rippleIntensity),
        opacity: 0.85,
      });
      if (shockwavesRef.current.length > 6) {
        shockwavesRef.current.shift();
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('click', handleClick);
    };
  }, [interactive, rippleIntensity]);

  // Subtle Drift & Dynamic Cursor Reaction Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let isRunning = true;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isRunning = false;
      } else {
        isRunning = true;
        lastTimeRef.current = performance.now();
        animFrameRef.current = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const palette = THEME_PALETTES[theme] || THEME_PALETTES['opal-pearl'];
    const [rB, gB, bB] = palette.dotBaseRgb;
    const [rH, gH, bH] = palette.dotHighlightRgb;
    const [rL, gL, bL] = palette.lineRgb;
    const [rS, gS, bS] = palette.shockwaveRgb;

    const render = (time: number) => {
      if (!isRunning) return;

      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = time;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      ctx.save();
      ctx.scale(dpr, dpr);

      // Smooth mouse lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.12;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.12;

      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;
      const isHovering = mouseRef.current.isHovering;

      const mouseNormX = (mouseX / width - 0.5) * 12;
      const mouseNormY = (mouseY / height - 0.5) * 12;

      // Base background: clean soft light canvas matching active theme
      ctx.fillStyle = palette.bg;
      ctx.fillRect(0, 0, width, height);

      // Top ambient hero glow matching theme
      const heroGrad = ctx.createRadialGradient(
        width / 2,
        140,
        30,
        width / 2,
        140,
        width * 0.75
      );
      heroGrad.addColorStop(0, palette.ambientHero1);
      heroGrad.addColorStop(0.5, palette.ambientHero2);
      heroGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = heroGrad;
      ctx.fillRect(0, 0, width, Math.min(height, 650));

      // Update and draw shockwaves
      const shockwaves = shockwavesRef.current;
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += dt * (320 + rippleIntensity * 60);
        sw.opacity -= dt * (1.4 / Math.max(0.5, rippleIntensity));

        if (sw.opacity <= 0 || sw.radius >= sw.maxRadius) {
          shockwaves.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${rS}, ${gS}, ${bS}, ${sw.opacity * 0.55})`;
        ctx.lineWidth = 1.5 * rippleIntensity;
        ctx.stroke();
      }

      // Draw and react floating dots
      const dots = dotsRef.current;
      const effectiveSpeed = Math.max(0.2, speed);
      const driftScale = effectiveSpeed * 6;
      const cursorInteractRadius = 155;
      const disruptionEnergy = Math.min(disruptionCount * 0.08, 0.4);

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        dot.phase += dt * (0.7 + disruptionEnergy * 0.5);

        // Slow harmonic drift
        const floatX = Math.sin(dot.phase) * 4 + dot.vx * driftScale;
        const floatY = Math.cos(dot.phase * 0.9) * 4 + dot.vy * driftScale;

        // Base target position with parallax
        const parallaxFactor = dot.isHero ? 0.35 : 0.2;
        let curX = dot.baseX + floatX - mouseNormX * parallaxFactor;
        let curY = dot.baseY + floatY - mouseNormY * parallaxFactor;

        // Disruption vibration excitation
        if (disruptionEnergy > 0) {
          curX += Math.sin(dot.phase * 3.5 + i) * (disruptionEnergy * 3);
          curY += Math.cos(dot.phase * 3.5 + i) * (disruptionEnergy * 3);
        }

        // Reactive Cursor Interaction
        let currentRadius = dot.radius;
        let dynamicAlpha = dot.baseAlpha + disruptionEnergy * 0.15;
        let isHighlighted = false;

        if (interactive && isHovering) {
          const dx = curX - mouseX;
          const dy = curY - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < cursorInteractRadius && dist > 0) {
            const factor = 1 - dist / cursorInteractRadius;

            // 1. Elastic repulsion push
            const pushMagnitude = factor * 26 * rippleIntensity;
            const pushDirX = (dx / dist) * pushMagnitude;
            const pushDirY = (dy / dist) * pushMagnitude;

            dot.pushX += (pushDirX - dot.pushX) * 0.16;
            dot.pushY += (pushDirY - dot.pushY) * 0.16;

            // 2. High-visibility opacity & size growth near cursor
            dynamicAlpha = Math.min(0.92, dot.baseAlpha + factor * 0.58);
            currentRadius = dot.radius + factor * 1.6;
            isHighlighted = factor > 0.4;

            // 3. Connective line to cursor
            if (dist < 115) {
              const lineAlpha = (1 - dist / 115) * 0.28;
              ctx.beginPath();
              ctx.moveTo(mouseX, mouseY);
              ctx.lineTo(curX + dot.pushX, curY + dot.pushY);
              ctx.strokeStyle = `rgba(${rL}, ${gL}, ${bL}, ${lineAlpha})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          } else {
            dot.pushX *= 0.88;
            dot.pushY *= 0.88;
          }
        } else {
          dot.pushX *= 0.88;
          dot.pushY *= 0.88;
        }

        // Apply push offset
        curX += dot.pushX;
        curY += dot.pushY;

        // Shockwave deflection
        for (let s = 0; s < shockwaves.length; s++) {
          const sw = shockwaves[s];
          const sDx = curX - sw.x;
          const sDy = curY - sw.y;
          const sDist = Math.sqrt(sDx * sDx + sDy * sDy);
          const waveDist = Math.abs(sDist - sw.radius);

          if (waveDist < 42 && sDist > 0) {
            const wavePush = (1 - waveDist / 42) * sw.opacity * 18 * rippleIntensity;
            curX += (sDx / sDist) * wavePush;
            curY += (sDy / sDist) * wavePush;
            dynamicAlpha = Math.min(0.96, dynamicAlpha + 0.38);
            isHighlighted = true;
          }
        }

        // Draw dot with active theme palette
        const [r, g, b] = isHighlighted ? [rH, gH, bH] : [rB, gB, bB];

        ctx.beginPath();
        ctx.arc(curX, curY, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${dynamicAlpha})`;
        ctx.fill();
      }

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [interactive, speed, theme, rippleIntensity, disruptionCount, glassBlurLevel]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ display: 'block' }}
    />
  );
};
