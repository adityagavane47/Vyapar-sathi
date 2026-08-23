import React, { useEffect, useState } from 'react';
import { LiquidTheme } from './DynamicLiquidBackground';

export interface LiquidGlassOverlayProps {
  theme?: LiquidTheme;
  blurLevel?: 'low' | 'medium' | 'high';
  showCaustics?: boolean;
  mouseSpotlight?: boolean;
}

export const LiquidGlassOverlay: React.FC<LiquidGlassOverlayProps> = ({
  theme = 'opal-pearl',
  showCaustics = true,
  mouseSpotlight = true,
}) => {
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    if (!mouseSpotlight) return;

    let rafId: number;
    let targetX = -1000;
    let targetY = -1000;
    let currentX = -1000;
    let currentY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const animate = () => {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      setMousePos({ x: Math.round(currentX), y: Math.round(currentY) });
      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, [mouseSpotlight]);

  const spotlightColors: Record<LiquidTheme, string> = {
    'opal-pearl': 'rgba(99, 102, 241, 0.08)',
    'glacial-cyan': 'rgba(14, 165, 233, 0.08)',
    'sakura-blush': 'rgba(244, 63, 94, 0.06)',
    'solar-ivory': 'rgba(245, 158, 11, 0.08)',
    'cyber-aurora': 'rgba(79, 70, 229, 0.08)',
    'emerald-nexus': 'rgba(16, 185, 129, 0.08)',
  };

  const rimColors: Record<LiquidTheme, string> = {
    'opal-pearl': 'from-indigo-300/15 via-sky-200/5 to-transparent',
    'glacial-cyan': 'from-cyan-300/15 via-sky-200/5 to-transparent',
    'sakura-blush': 'from-rose-300/15 via-pink-200/5 to-transparent',
    'solar-ivory': 'from-amber-300/15 via-yellow-200/5 to-transparent',
    'cyber-aurora': 'from-indigo-300/15 via-sky-200/5 to-transparent',
    'emerald-nexus': 'from-emerald-300/15 via-teal-200/5 to-transparent',
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Subtle Ambient Caustic Light */}
      {showCaustics && (
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.12) 0%, transparent 60%)`,
          }}
        />
      )}

      {/* Ambient Top Rim Lighting */}
      <div
        className={`absolute top-0 inset-x-0 h-40 bg-gradient-to-b ${rimColors[theme]} pointer-events-none`}
      />

      {/* Interactive Subtle Spotlight following Cursor */}
      {mouseSpotlight && mousePos.x > -500 && (
        <div
          className="absolute rounded-full pointer-events-none transition-transform duration-75 ease-out"
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y}px`,
            width: '450px',
            height: '450px',
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(circle, ${spotlightColors[theme]} 0%, transparent 70%)`,
            filter: 'blur(40px)',
          }}
        />
      )}
    </div>
  );
};
