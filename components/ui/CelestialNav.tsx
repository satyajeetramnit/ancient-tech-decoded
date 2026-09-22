'use client';

import React from 'react';
import { Volume2, VolumeX, BookOpen, Layers, Eye, Compass, Shield } from 'lucide-react';
import { PresentationMode, RenderMode } from '@/types/episodeState';
import { VisualStatus } from '@/types/sources';
import { cn } from '@/lib/utils';

interface CelestialNavProps {
  currentStageName?: string;
  presentationMode: PresentationMode;
  onTogglePresentationMode: () => void;
  renderMode?: RenderMode;
  onToggleRenderMode?: () => void;
  visualStatus?: VisualStatus;
  isMuted: boolean;
  onToggleAudio: () => void;
  onOpenSources: () => void;
  sourcesCount: number;
}

export const CelestialNav: React.FC<CelestialNavProps> = ({
  currentStageName = 'PROLOGUE',
  presentationMode,
  onTogglePresentationMode,
  renderMode,
  onToggleRenderMode,
  visualStatus = 'INTERPRETIVE',
  isMuted,
  onToggleAudio,
  onOpenSources,
  sourcesCount,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-6 py-4 flex items-center justify-between pointer-events-none transition-all duration-300">
      {/* Left: Branding & Epistemic Breadcrumb */}
      <div className="pointer-events-auto flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-obsidian-300/80 backdrop-blur-md border border-gold-antique/20 shadow-lg">
          <div className="w-2 h-2 rounded-full bg-gold-antique shadow-[0_0_8px_#D4AF37] animate-pulse" />
          <span className="font-cinzel tracking-widest text-xs font-bold text-white uppercase">
            Ancient Tech Decoded
          </span>
          <span className="text-gray-500 text-xs">/</span>
          <span className="font-mono text-[11px] text-gold-warm uppercase tracking-wider">
            {currentStageName}
          </span>
        </div>

        {/* Visual Status Indicator with explicit Epistemic Clarification */}
        <div
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-obsidian-200/60 backdrop-blur-md border border-purple-500/30 text-[10px] font-mono text-purple-200 cursor-help group relative"
          title="Ancient Indian temple-inspired architectural environment created as an artistic synthesis; not a reconstruction of a specific historical temple."
        >
          <Shield className="w-3 h-3 text-purple-400" />
          <span>VISUAL: <strong className="text-purple-300 font-bold">{visualStatus}</strong></span>
          <span className="hidden group-hover:block absolute left-0 top-full mt-1 w-72 p-2 rounded bg-obsidian-300/95 border border-purple-500/40 text-[10px] font-sans text-gray-200 shadow-2xl z-50 pointer-events-none">
            Ancient Indian temple-inspired architectural environment created as an artistic synthesis; not a reconstruction of a specific historical temple.
          </span>
        </div>
      </div>

      {/* Right: Minimalist Controls */}
      <div className="pointer-events-auto flex items-center gap-2">
        {/* Render Mode Toggle (Mythic vs. System Schematics) - only in 3D cinematic mode */}
        {presentationMode === 'cinematic' && onToggleRenderMode && (
          <button
            onClick={onToggleRenderMode}
            className={cn(
              'px-3 py-1.5 rounded-sm text-xs font-mono uppercase tracking-wider border transition-all duration-300 flex items-center gap-1.5 backdrop-blur-md',
              renderMode === 'system'
                ? 'bg-telemetry-cyan/15 text-telemetry-cyan border-telemetry-cyan/50 shadow-cyan-glow'
                : 'bg-obsidian-200/80 text-gold-warm border-gold-antique/30 hover:border-gold-warm/60'
            )}
            title="Switch between Mythic Atmosphere and System Schematics Mode"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{renderMode === 'system' ? 'System Mode' : 'Mythic Mode'}</span>
          </button>
        )}

        {/* Presentation Mode: Cinematic 3D vs. Research View */}
        <button
          onClick={onTogglePresentationMode}
          className={cn(
            'px-3 py-1.5 rounded-sm text-xs font-mono uppercase tracking-wider border transition-all duration-300 flex items-center gap-1.5 backdrop-blur-md',
            presentationMode === 'research'
              ? 'bg-amber-950/60 text-amber-300 border-amber-500/40 shadow-gold-glow'
              : 'bg-obsidian-200/80 text-gray-300 border-white/10 hover:text-white hover:border-white/30'
          )}
          title="Switch between Cinematic 3D experience and Scholar Research reading mode"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{presentationMode === 'research' ? 'Research View' : 'Cinematic 3D'}</span>
        </button>

        {/* Sources Drawer Toggle */}
        <button
          onClick={onOpenSources}
          className="px-3 py-1.5 rounded-sm bg-obsidian-200/80 text-gray-300 hover:text-gold-pale border border-white/10 hover:border-gold-antique/40 text-xs font-mono uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 backdrop-blur-md"
          title="Inspect verified Sanskrit passages and primary sources"
        >
          <BookOpen className="w-3.5 h-3.5 text-gold-warm" />
          <span>Sources</span>
          <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-[10px] text-gray-300 font-bold">{sourcesCount}</span>
        </button>

        {/* Audio Ambient Toggle (Zero autoplay by default) */}
        <button
          onClick={onToggleAudio}
          className={cn(
            'p-2 rounded-sm border transition-all duration-200 backdrop-blur-md',
            isMuted
              ? 'bg-obsidian-200/60 text-gray-500 border-white/10 hover:text-gray-300'
              : 'bg-gold-antique/15 text-gold-warm border-gold-antique/40 shadow-gold-glow'
          )}
          title={isMuted ? 'Unmute atmospheric audio' : 'Mute audio'}
          aria-label={isMuted ? 'Unmute atmospheric audio' : 'Mute audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-pulse" />}
        </button>
      </div>
    </header>
  );
};
