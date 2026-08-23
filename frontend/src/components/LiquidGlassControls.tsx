import React, { useState } from 'react';
import {
  Droplets,
  Layers,
  Zap,
  ChevronDown,
  Sparkles,
  Sun,
  Activity,
} from 'lucide-react';
import { LiquidTheme } from './DynamicLiquidBackground';

export interface LiquidGlassSettings {
  theme: LiquidTheme;
  interactive: boolean;
  rippleIntensity: number;
  speed: number;
  blurLevel: 'low' | 'medium' | 'high';
  showCaustics: boolean;
  mouseSpotlight: boolean;
  reactiveDisruptions: boolean;
}

interface LiquidGlassControlsProps {
  settings: LiquidGlassSettings;
  onChangeSettings: (newSettings: Partial<LiquidGlassSettings>) => void;
  activeDisruptionsCount?: number;
}

export const LiquidGlassControls: React.FC<LiquidGlassControlsProps> = ({
  settings,
  onChangeSettings,
  activeDisruptionsCount = 0,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const themeOptions: { id: LiquidTheme; label: string; color: string; desc: string }[] = [
    { id: 'opal-pearl', label: 'Opal Pearl', color: 'from-indigo-400 via-sky-300 to-pink-300', desc: 'Iridescent pearl & floating indigo dots' },
    { id: 'glacial-cyan', label: 'Glacial Cyan', color: 'from-cyan-400 via-sky-300 to-teal-300', desc: 'Arctic aqua & turquoise dots' },
    { id: 'sakura-blush', label: 'Sakura Blush', color: 'from-rose-400 via-pink-300 to-amber-200', desc: 'Blush floral & rose quartz dots' },
    { id: 'solar-ivory', label: 'Solar Ivory', color: 'from-amber-400 via-yellow-300 to-orange-300', desc: 'Warm ivory & golden amber dots' },
    { id: 'cyber-aurora', label: 'Cyber Aurora', color: 'from-indigo-500 via-purple-400 to-cyan-400', desc: 'Airy electric violet & sapphire dots' },
    { id: 'emerald-nexus', label: 'Emerald Nexus', color: 'from-emerald-400 via-teal-300 to-cyan-300', desc: 'Fresh mint & emerald dots' },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Expanded Control Modal */}
      {isOpen ? (
        <div className="w-84 sm:w-96 rounded-3xl bg-white/90 backdrop-blur-2xl border border-slate-200/90 shadow-2xl p-5 text-slate-800 animate-in fade-in zoom-in-95 duration-200 ring-1 ring-slate-900/5">
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-400 via-indigo-500 to-pink-400 flex items-center justify-center shadow-md shadow-indigo-500/25">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-wide flex items-center gap-1.5">
                  Lighter Reactive Atmosphere
                </h3>
                <p className="text-[11px] text-slate-500">Reactive Floating Dots & Light Glass</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              title="Minimize panel"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4 pt-3.5 max-h-[72vh] overflow-y-auto pr-1">
            {/* Theme Presets */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Light Palette & Dots Aura
              </label>
              <div className="grid grid-cols-2 gap-2">
                {themeOptions.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onChangeSettings({ theme: t.id })}
                    className={`flex items-center space-x-2 p-2.5 rounded-xl border text-xs font-medium transition-all duration-200 text-left ${
                      settings.theme === t.id
                        ? 'bg-indigo-50/90 border-indigo-400 shadow-sm text-indigo-950 ring-1 ring-indigo-400/40 font-bold'
                        : 'bg-white/80 border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full bg-gradient-to-tr ${t.color} shrink-0 ring-1 ring-slate-900/10`} />
                    <span className="truncate">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Glass Blur Depth */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  Glass Refraction & Blur
                </label>
                <span className="text-[11px] font-mono text-indigo-600 font-bold capitalize">{settings.blurLevel}</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
                {(['low', 'medium', 'high'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => onChangeSettings({ blurLevel: level })}
                    className={`py-1.5 text-xs rounded-lg font-medium transition-all ${
                      settings.blurLevel === level
                        ? 'bg-indigo-600 text-white shadow-sm font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {level === 'low' ? 'Subtle' : level === 'medium' ? 'Balanced' : 'Crystal'}
                  </button>
                ))}
              </div>
            </div>

            {/* Floating Dots Speed */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                  Floating Dots Drift Speed
                </label>
                <span className="text-[11px] font-mono text-emerald-600 font-bold">{settings.speed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="2.5"
                step="0.1"
                value={settings.speed}
                onChange={(e) => onChangeSettings({ speed: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>

            {/* Mouse Shockwave Ripple */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  Click Shockwave Radius
                </label>
                <span className="text-[11px] font-mono text-amber-600 font-bold">
                  {Math.round(settings.rippleIntensity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.3"
                max="2.0"
                step="0.1"
                value={settings.rippleIntensity}
                onChange={(e) => onChangeSettings({ rippleIntensity: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
            </div>

            {/* Feature Toggles */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              {/* Interactive Cursor Repulsion */}
              <button
                onClick={() => onChangeSettings({ interactive: !settings.interactive })}
                className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs transition-colors"
              >
                <span className="text-slate-700 flex items-center gap-2 font-medium">
                  <Droplets className="w-3.5 h-3.5 text-indigo-600" />
                  Magnetic Dots Interaction
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                    settings.interactive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {settings.interactive ? 'ENABLED' : 'DISABLED'}
                </span>
              </button>

              {/* Cursor Spotlight */}
              <button
                onClick={() => onChangeSettings({ mouseSpotlight: !settings.mouseSpotlight })}
                className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs transition-colors"
              >
                <span className="text-slate-700 flex items-center gap-2 font-medium">
                  <Sun className="w-3.5 h-3.5 text-amber-600" />
                  Light Caustic Spotlight
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                    settings.mouseSpotlight ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {settings.mouseSpotlight ? 'ACTIVE' : 'OFF'}
                </span>
              </button>

              {/* Reactive Disruption Pulse */}
              <button
                onClick={() => onChangeSettings({ reactiveDisruptions: !settings.reactiveDisruptions })}
                className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs transition-colors"
              >
                <span className="text-slate-700 flex items-center gap-2 font-medium">
                  <Activity className="w-3.5 h-3.5 text-rose-600" />
                  Disruption Reactive Energy
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                    settings.reactiveDisruptions
                      ? activeDisruptionsCount > 0
                        ? 'bg-rose-100 text-rose-700 animate-pulse'
                        : 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {settings.reactiveDisruptions
                    ? activeDisruptionsCount > 0
                      ? `${activeDisruptionsCount} ACTIVE`
                      : 'READY'
                    : 'OFF'}
                </span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Floating Compact Glass Pill */
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center space-x-2.5 px-4 py-2.5 rounded-2xl bg-white/90 hover:bg-white backdrop-blur-2xl border border-slate-200/90 shadow-xl transition-all duration-300 hover:scale-105 ring-1 ring-slate-900/5"
        >
          {/* Soft Glow */}
          <div className="absolute -inset-0.5 rounded-2xl blur opacity-25 group-hover:opacity-60 transition duration-300 bg-gradient-to-r from-sky-400 via-indigo-400 to-pink-400" />

          <div className="relative flex items-center space-x-2 text-slate-800">
            <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 group-hover:rotate-12 transition-transform" />
            </div>
            <span className="text-xs font-bold tracking-wide text-slate-800">
              Floating Dots
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping ml-1" />
          </div>
        </button>
      )}
    </div>
  );
};
