'use client';

import React, { useState } from 'react';
import brahmastraData from '@/content/episodes/brahmastra.json';
import { EpisodeData } from '@/types/episode';
import { PresentationMode, RenderMode, EpisodeState } from '@/types/episodeState';
import { PerformanceTier, PERFORMANCE_CONFIGS } from '@/types/performance';
import { CAMERA_WAYPOINTS } from '@/types/camera';
import { CelestialNav } from '@/components/ui/CelestialNav';
import { SourcesDrawer } from '@/components/ui/SourcesDrawer';
import { ResearchModeView } from '@/components/ui/ResearchModeView';
import { ContextualOverlay } from '@/components/ui/ContextualOverlay';
import { EvidenceBadge } from '@/components/ui/EvidenceBadge';
import { SceneCanvas } from '@/components/3d/engine/SceneCanvas';
import { ArrowRight, ArrowLeft, Activity, Cpu, Sliders, Eye, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { assertResearchIntegrity } from '@/lib/validate-research';

// Development & Build-time assertion: fails loudly if any research relationship breaks
assertResearchIntegrity(brahmastraData as unknown as EpisodeData);

export default function HomePage() {
  const data = brahmastraData as unknown as EpisodeData;
  const [presentationMode, setPresentationMode] = useState<PresentationMode>('cinematic');
  const [renderMode, setRenderMode] = useState<RenderMode>('mythic');
  const [performanceTier, setPerformanceTier] = useState<PerformanceTier>('HIGH');
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [isSourcesOpen, setIsSourcesOpen] = useState(false);
  const [inspectPassageId, setInspectPassageId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [currentState, setCurrentState] = useState<EpisodeState>('intro');
  const [showDiagnosticHUD, setShowDiagnosticHUD] = useState<boolean>(false);

  const handleInspectPassage = (passageId: string) => {
    setInspectPassageId(passageId);
    setIsSourcesOpen(true);
  };

  // Sub-state selections for deep investigative exploration
  const [activePassageIndex, setActivePassageIndex] = useState<number>(1); // default to 10.13.18-19
  const [activeAnalogyIndex, setActiveAnalogyIndex] = useState<number>(0);
  const [activeDialecticTab, setActiveDialecticTab] = useState<'interpreter' | 'skeptic'>('interpreter');
  const [whatIfEnergy, setWhatIfEnergy] = useState<string>('nucl');
  const [whatIfDelivery, setWhatIfDelivery] = useState<string>('guided');
  const [whatIfYield, setWhatIfYield] = useState<string>('strategic');

  const statesOrder: EpisodeState[] = [
    'intro',
    'templeApproach',
    'templeReveal',
    'templeSanctum',
    'artifact',
    'myth',
    'text',
    'phenomenology',
    'reconstruction',
    'science',
    'skeptic',
    'reality-check',
    'what-if',
    'exit',
  ];

  const currentIdx = statesOrder.indexOf(currentState);
  const currentWaypoint = CAMERA_WAYPOINTS[currentState] || CAMERA_WAYPOINTS['intro'];
  const tierConfig = PERFORMANCE_CONFIGS[performanceTier];

  const nextState = () => {
    if (currentIdx < statesOrder.length - 1) {
      const next = statesOrder[currentIdx + 1];
      setCurrentState(next);
      if (next === 'reconstruction' || next === 'science') {
        setRenderMode('system');
      } else if (
        next === 'temple' ||
        next === 'templeApproach' ||
        next === 'templeReveal' ||
        next === 'templeSanctum' ||
        next === 'myth' ||
        next === 'text'
      ) {
        setRenderMode('mythic');
      }
    }
  };

  const prevState = () => {
    if (currentIdx > 0) {
      const prev = statesOrder[currentIdx - 1];
      setCurrentState(prev);
      if (
        prev === 'temple' ||
        prev === 'templeApproach' ||
        prev === 'templeReveal' ||
        prev === 'templeSanctum' ||
        prev === 'myth' ||
        prev === 'text'
      ) {
        setRenderMode('mythic');
      }
    }
  };

  // Keyboard navigation & hotkeys across the entire investigative experience
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextState();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevState();
      } else if (e.key === 'm' || e.key === 'M') {
        setRenderMode((prev) => (prev === 'mythic' ? 'system' : 'mythic'));
      } else if (e.key === 'r' || e.key === 'R') {
        setPresentationMode((prev) => (prev === 'cinematic' ? 'research' : 'cinematic'));
      } else if (e.key === 's' || e.key === 'S') {
        setIsSourcesOpen((prev) => !prev);
      } else if (e.key === 'd' || e.key === 'D') {
        setShowDiagnosticHUD((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsSourcesOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIdx, currentState]);

  return (
    <div className="relative min-h-screen bg-obsidian text-gray-100 overflow-hidden font-sans">
      {/* 1. Celestial Navigation HUD */}
      <CelestialNav
        currentStageName={currentState.toUpperCase().replace('-', ' ')}
        presentationMode={presentationMode}
        onTogglePresentationMode={() =>
          setPresentationMode((prev) => (prev === 'cinematic' ? 'research' : 'cinematic'))
        }
        renderMode={renderMode}
        onToggleRenderMode={() =>
          setRenderMode((prev) => (prev === 'mythic' ? 'system' : 'mythic'))
        }
        visualStatus={data.artifact.visualStatus}
        isMuted={isMuted}
        onToggleAudio={() => setIsMuted((prev) => !prev)}
        onOpenSources={() => setIsSourcesOpen(true)}
        sourcesCount={data.sources.length + data.passages.length}
      />

      {/* 2. Slide-Over Sources Drawer */}
      <SourcesDrawer
        isOpen={isSourcesOpen}
        onClose={() => {
          setIsSourcesOpen(false);
          setInspectPassageId(null);
        }}
        sources={data.sources}
        passages={data.passages}
        activePassageId={inspectPassageId}
      />

      {/* 3. View Switcher: Research Mode vs. Cinematic 3D */}
      {presentationMode === 'research' ? (
        <ResearchModeView
          data={data}
          onOpenSources={() => setIsSourcesOpen(true)}
          onInspectPassage={handleInspectPassage}
        />
      ) : (
        <div className="relative w-full h-screen overflow-hidden select-none">
          {/* Active Three.js WebGL Engine Canvas (Milestone 1 Diagnostic Scene) */}
          <SceneCanvas
            episodeState={currentState}
            renderMode={renderMode}
            performanceTier={performanceTier}
            reducedMotionOverride={reducedMotion}
            isMuted={isMuted}
          />

          {/* Diagnostic Engine Telemetry Drawer (Top-Left) */}
          {showDiagnosticHUD && (
            <aside aria-label="Engine Telemetry HUD" className="fixed top-20 left-6 z-30 pointer-events-auto w-80 p-3.5 rounded-sm bg-obsidian-300/80 backdrop-blur-md border border-white/10 text-xs font-mono text-gray-300 shadow-xl space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-white/10 text-gold-warm">
                <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px]">
                  <Activity className="w-3.5 h-3.5 text-telemetry-cyan" /> 3D Engine Core Diagnostics
                </span>
                <button
                  onClick={() => setShowDiagnosticHUD(false)}
                  className="text-gray-400 hover:text-white text-[10px]"
                >
                  [Hide]
                </button>
              </div>

              {/* Camera Telemetry */}
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between text-gray-400">
                  <span>Camera State:</span>
                  <span className="text-white font-semibold">{currentState}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Camera Pos:</span>
                  <span className="text-telemetry-cyan font-mono">
                    [{currentWaypoint.position.map((p) => p.toFixed(1)).join(', ')}]
                  </span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>FOV / Damping:</span>
                  <span className="text-white">{currentWaypoint.fov}° / {currentWaypoint.damping}</span>
                </div>
              </div>

              {/* Performance Tier Controls */}
              <div className="pt-2 border-t border-white/10 space-y-1.5">
                <div className="flex items-center justify-between text-gray-400 text-[11px]">
                  <span className="flex items-center gap-1"><Cpu className="w-3 h-3 text-gold-warm" /> Performance:</span>
                  <span className="text-white font-semibold">{tierConfig.particleCount} pts ({performanceTier})</span>
                </div>
                <div className="flex gap-1">
                  {(['HIGH', 'MEDIUM', 'LOW'] as PerformanceTier[]).map((tier) => (
                    <button
                      key={tier}
                      onClick={() => setPerformanceTier(tier)}
                      className={cn(
                        'flex-1 py-1 rounded text-[10px] font-bold border transition-colors',
                        performanceTier === tier
                          ? 'border-telemetry-cyan bg-telemetry-cyan/20 text-telemetry-cyan'
                          : 'border-white/10 text-gray-400 hover:text-white'
                      )}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reduced Motion Toggle */}
              <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[11px]">
                <span className="text-gray-400">Reduced Motion:</span>
                <button
                  onClick={() => setReducedMotion((prev) => !prev)}
                  className={cn(
                    'px-2 py-0.5 rounded text-[10px] border font-bold transition-colors',
                    reducedMotion
                      ? 'border-purple-400 bg-purple-950/60 text-purple-300'
                      : 'border-white/10 text-gray-400 hover:text-white'
                  )}
                >
                  {reducedMotion ? 'ON (Rotation Halted)' : 'OFF (Dynamic)'}
                </button>
              </div>
            </aside>
          )}

          {!showDiagnosticHUD && (
            <button
              onClick={() => setShowDiagnosticHUD(true)}
              className="fixed top-20 left-6 z-30 pointer-events-auto px-2.5 py-1 rounded-sm bg-obsidian-200/80 border border-white/10 text-[11px] font-mono text-gray-400 hover:text-white backdrop-blur-md"
            >
              [Show Engine Telemetry]
            </button>
          )}

          {/* Contextual Overlay Shell (The 20% Minimalist Interface Component) */}
          <ContextualOverlay position="bottom-center" visible={true}>
            {/* Phase 1: Intro */}
            {currentState === 'intro' && (
              <div className="space-y-2 text-center">
                <span className="text-xs font-mono tracking-widest text-gold-warm uppercase">
                  Ancient Tech Decoded // Season 1
                </span>
                <h2 className="text-2xl font-cinzel font-bold text-white tracking-wide">
                  {data.title}
                </h2>
                <p className="text-sm font-garamond italic text-gray-300 max-w-xl mx-auto">
                  "{data.subtitle}"
                </p>
                <p className="text-xs text-gray-400 max-w-md mx-auto pt-1 font-sans">
                  Investigating whether ancient descriptions reflect technological memory, religious allegory, or natural catastrophic phenomena.
                </p>
              </div>
            )}

            {/* Phase 2: Temple Architectural Sequence */}
            {(currentState === 'temple' ||
              currentState === 'templeApproach' ||
              currentState === 'templeReveal' ||
              currentState === 'templeSanctum') && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gold-warm uppercase tracking-wider">
                      TEMPLE VANTAGE // {currentState === 'templeApproach' ? 'AXIAL APPROACH' : currentState === 'templeReveal' ? 'ARCHITECTURAL REVEAL' : 'INNER SANCTUM'}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950/60 border border-purple-500/40 text-purple-300">
                      INTERPRETIVE
                    </span>
                  </div>
                  {/* Temple Vantage Sub-nav */}
                  <div className="flex items-center gap-1 text-[10px] font-mono">
                    <button
                      onClick={() => setCurrentState('templeApproach')}
                      className={cn(
                        'px-2 py-0.5 rounded border transition-colors',
                        currentState === 'templeApproach'
                          ? 'bg-gold-warm/20 border-gold-warm text-gold-warm font-bold'
                          : 'border-white/10 text-gray-400 hover:text-white'
                      )}
                    >
                      Approach
                    </button>
                    <button
                      onClick={() => setCurrentState('templeReveal')}
                      className={cn(
                        'px-2 py-0.5 rounded border transition-colors',
                        currentState === 'templeReveal'
                          ? 'bg-gold-warm/20 border-gold-warm text-gold-warm font-bold'
                          : 'border-white/10 text-gray-400 hover:text-white'
                      )}
                    >
                      Reveal
                    </button>
                    <button
                      onClick={() => setCurrentState('templeSanctum')}
                      className={cn(
                        'px-2 py-0.5 rounded border transition-colors',
                        currentState === 'templeSanctum'
                          ? 'bg-gold-warm/20 border-gold-warm text-gold-warm font-bold'
                          : 'border-white/10 text-gray-400 hover:text-white'
                      )}
                    >
                      Sanctum
                    </button>
                  </div>
                </div>

                {currentState === 'templeApproach' && (
                  <>
                    <h3 className="text-lg font-cinzel text-white">The Colonnade of Celestial Silence</h3>
                    <p className="text-xs text-gray-300 font-sans leading-relaxed">
                      Entering along the deep central axis. Monumental rock-cut pillars flank the obsidian walkway, cast in dramatic raking shadows from high celestial illumination.
                    </p>
                  </>
                )}

                {currentState === 'templeReveal' && (
                  <>
                    <h3 className="text-lg font-cinzel text-white">Elevated Architectural Layers & Celestial Mandala</h3>
                    <p className="text-xs text-gray-300 font-sans leading-relaxed">
                      The camera tilts upward to reveal monumental stepped pylons and the slowly counter-rotating Ashtadala padma mandala, glowing with sacred gold and subtle coordinate markings.
                    </p>
                  </>
                )}

                {(currentState === 'templeSanctum' || currentState === 'temple') && (
                  <>
                    <h3 className="text-lg font-cinzel text-white">The Inner Sanctum Dais</h3>
                    <p className="text-xs text-gray-300 font-sans leading-relaxed">
                      At the focal heart of the archive: an elevated stepped stone altar illuminated by warm ceremonial fire, positioned directly before the cosmic mandala where the Brahmāstra will hover.
                    </p>
                  </>
                )}

                <p className="text-[10px] font-mono text-gray-500 italic pt-1 border-t border-white/5">
                  Epistemic Note: Ancient Indian temple-inspired architectural environment created as an artistic synthesis; not a reconstruction of a specific historical temple.
                </p>
              </div>
            )}

            {/* Phase 3: Artifact */}
            {currentState === 'artifact' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gold-warm uppercase tracking-wider">
                      CAMERA: FOCAL ORBIT // {data.artifact.name.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950/60 border border-purple-500/40 text-purple-300">
                      {data.artifact.visualStatus}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400">
                    GLYPH: {data.artifact.iconGlyph}
                  </span>
                </div>

                <h3 className="text-lg font-cinzel text-white">
                  {data.artifact.name}: The Sacred Geometric Suspension
                </h3>
                <p className="text-xs text-gray-300 font-sans leading-relaxed">
                  An abstract, sacred-mechanical construct suspended in equilibrium above the altar dais. Multi-layered engraved bronze gimbals and the Ashtadala <em>BrahmicFlameMandala</em> petal structure encase a dual-layer luminous core with concentrated inner emission and translucent outer energy aura.
                </p>
                <div className="p-2 rounded bg-black/40 border border-white/10 text-[11px] font-sans text-gray-300 space-y-1">
                  <div className="text-gold-warm font-mono text-[10px] uppercase tracking-wider">
                    Interpretive Modes:
                  </div>
                  <div>
                    <strong className="text-amber-200">Mythic:</strong> Patinated bronze, sacred fire glow (*yugāntānala*), and ceremonial harmonics.
                  </div>
                  <div>
                    <strong className="text-telemetry-cyan">System:</strong> Wireframe cage, coordinate axes, and telemetry radial division ticks.
                  </div>
                </div>
                <p className="text-[10px] font-mono text-gray-500 italic pt-1 border-t border-white/5">
                  Epistemic Disclaimer: {data.artifact.visualDisclaimer}
                </p>
              </div>
            )}

            {/* Phase 4: Myth */}
            {currentState === 'myth' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-gold-warm uppercase tracking-wider">
                    CAMERA: DRAMATIC FLANK // THE NARRATIVE CONTEXT
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300">
                    MAHABHARATA // SAUPTIKA
                  </span>
                </div>
                <h3 className="text-lg font-cinzel text-white">The Standoff on the Bhagirathi</h3>
                <p className="text-xs text-gray-300 font-sans leading-relaxed">
                  Surrounded on the riverbanks after the slaughter of the sleeping camp, the son of Drona reaches for a weapon of absolute last resort. Deprived of normal weapons, he seizes an ordinary stalk of reed grass and recites the ancient consecration mantras to direct it against the lineage of his enemies.
                </p>
                <div className="p-2 rounded bg-black/40 border border-white/5 text-[11px] font-sans text-gray-400 italic">
                  "What did the ancient epic actually record in its original Sanskrit text?"
                </div>
              </div>
            )}

            {/* Phase 5: Text */}
            {currentState === 'text' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gold-warm uppercase tracking-wider">
                      PRIMARY SANSKRIT WITNESS
                    </span>
                    <EvidenceBadge
                      evidenceType="TEXTUAL"
                      status="SUPPORTED"
                      validationStatus={data.passages[activePassageIndex]?.validationStatus || 'VERIFIED'}
                      passageRef={data.passages[activePassageIndex]?.verse || 'Sauptika Parva'}
                    />
                  </div>
                  <button
                    onClick={() => handleInspectPassage(data.passages[activePassageIndex].id)}
                    className="text-[10px] font-mono text-telemetry-cyan hover:underline flex items-center gap-1"
                  >
                    <span>Inspect Passage →</span>
                  </button>
                </div>

                {/* Interactive Passage Selector */}
                <div className="flex gap-1 border-b border-white/10 pb-1.5 overflow-x-auto">
                  {data.passages.map((p, idx) => (
                    <button
                      key={p.id}
                      onClick={() => setActivePassageIndex(idx)}
                      className={cn(
                        'px-2 py-0.5 rounded text-[10px] font-mono transition-colors whitespace-nowrap',
                        activePassageIndex === idx
                          ? 'bg-gold-warm/20 text-gold-warm border border-gold-warm/50 font-bold'
                          : 'text-gray-400 hover:text-white border border-transparent'
                      )}
                    >
                      {p.verse}
                    </button>
                  ))}
                </div>

                {/* Active Passage Display */}
                {data.passages[activePassageIndex] && (
                  <div className="space-y-2">
                    <div className="p-2.5 rounded bg-black/50 border border-gold-antique/20 space-y-1">
                      <p className="font-sanskrit text-sm md:text-base text-amber-100 whitespace-pre-line leading-relaxed">
                        {data.passages[activePassageIndex].originalText}
                      </p>
                      <p className="text-[10px] font-mono text-gray-400 italic">
                        {data.passages[activePassageIndex].transliteration}
                      </p>
                    </div>
                    <p className="text-xs font-sans text-gray-200 border-l-2 border-gold-warm pl-2.5 py-0.5 italic">
                      "{data.passages[activePassageIndex].translation}"
                    </p>
                    <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-gray-400">
                      <span><strong>Concordance:</strong> {data.passages[activePassageIndex].concordance}</span>
                      <button
                        onClick={() => handleInspectPassage(data.passages[activePassageIndex].id)}
                        className="text-gold-warm hover:underline flex items-center gap-0.5"
                      >
                        <Bookmark className="w-2.5 h-2.5" />
                        <span>Sources Archive</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Phase 6: Phenomenology */}
            {currentState === 'phenomenology' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-gold-warm uppercase tracking-wider">
                    DECONSTRUCTED PROPERTIES // PHYSICAL RECORD
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
                    STRICT TEXTUAL WITNESS
                  </span>
                </div>
                <h3 className="text-lg font-cinzel text-white">Attributed Physical Display</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-300">
                  {data.phenomenology.map((cat, idx) => (
                    <div key={idx} className="p-2 rounded bg-black/40 border border-white/10 space-y-1">
                      <span className="text-gold-warm font-mono text-[10px] uppercase font-semibold block">
                        {cat.category}:
                      </span>
                      <ul className="text-[11px] space-y-0.5 text-gray-300">
                        {cat.attributedProperties.map((p, pIdx) => (
                          <li key={pIdx} className="leading-tight">• {p}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Phase 7: Reconstruction */}
            {currentState === 'reconstruction' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-telemetry-cyan uppercase tracking-wider">
                    SYSTEM SCHEMATICS // SPECULATIVE RECONSTRUCTION
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-telemetry-cyan/10 border border-telemetry-cyan/40 text-telemetry-cyan">
                    ENGINEERING WHAT-IF
                  </span>
                </div>
                <h3 className="text-lg font-cinzel text-white">Speculative System Architecture</h3>
                <p className="text-xs text-gray-300 font-sans leading-relaxed">
                  Translating the textual phenomena into theoretical technological equivalents reveals severe physical contradictions. The mythic reed vector cannot contain high-energy plasma without artificial containment physics unknown to ancient metallurgy.
                </p>
                <div className="p-2.5 rounded bg-obsidian-200/80 border border-telemetry-cyan/30 text-[11px] font-mono text-gray-300 space-y-1">
                  <div className="text-telemetry-cyan uppercase font-bold text-[10px]">
                    Identified Contradiction:
                  </div>
                  <div>
                    Organic reed fibers vaporize at 300°C; containment of high-energy plasma or radioactive payload requires Coulomb barrier stabilization absent from second-millennium BCE archaeological records.
                  </div>
                </div>
              </div>
            )}

            {/* Phase 8: Science */}
            {currentState === 'science' && (
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-telemetry-cyan uppercase tracking-wider">
                      MODERN SCIENTIFIC ANALOGIES
                    </span>
                    <EvidenceBadge
                      evidenceType={data.potentialModernAnalogies[activeAnalogyIndex]?.evidenceType || 'SCIENTIFIC'}
                      status={data.potentialModernAnalogies[activeAnalogyIndex]?.status || 'ANALOGICAL'}
                      confidence={data.potentialModernAnalogies[activeAnalogyIndex]?.confidence || 'MODERATE'}
                    />
                  </div>
                  <div className="flex gap-1 text-[9px] font-mono">
                    <span className="px-1.5 py-0.5 rounded bg-telemetry-cyan/10 border border-telemetry-cyan/30 text-telemetry-cyan">
                      MODERN ANALOGY
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-300">
                      NOT IDENTIFICATION
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-300">
                      NOT HISTORICAL EVIDENCE
                    </span>
                  </div>
                </div>

                {/* Analogy Tabs */}
                <div className="flex gap-1 border-b border-white/10 pb-1.5 overflow-x-auto">
                  {data.potentialModernAnalogies.map((analogy, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveAnalogyIndex(idx)}
                      className={cn(
                        'px-2 py-0.5 rounded text-[10px] font-mono transition-colors whitespace-nowrap',
                        activeAnalogyIndex === idx
                          ? 'bg-telemetry-cyan/20 text-telemetry-cyan border border-telemetry-cyan/50 font-bold'
                          : 'text-gray-400 hover:text-white border border-transparent'
                      )}
                    >
                      {analogy.concept}
                    </button>
                  ))}
                </div>

                {/* 4 Required Facets */}
                {data.potentialModernAnalogies[activeAnalogyIndex] && (
                  <div className="space-y-1.5 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                      <div className="p-2 rounded bg-black/40 border border-emerald-500/25 space-y-0.5">
                        <span className="text-emerald-400 font-mono text-[9px] uppercase font-bold block">
                          1. What Resembles the Text:
                        </span>
                        <p className="text-gray-200 text-[10.5px] leading-snug">
                          {data.potentialModernAnalogies[activeAnalogyIndex].whatResembles}
                        </p>
                      </div>
                      <div className="p-2 rounded bg-black/40 border border-rose-500/25 space-y-0.5">
                        <span className="text-rose-400 font-mono text-[9px] uppercase font-bold block">
                          2. What Does Not Match:
                        </span>
                        <p className="text-gray-200 text-[10.5px] leading-snug">
                          {data.potentialModernAnalogies[activeAnalogyIndex].whatDoesNotMatch}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                      <div className="p-2 rounded bg-black/40 border border-amber-500/25 space-y-0.5">
                        <span className="text-amber-300 font-mono text-[9px] uppercase font-bold block">
                          3. What Would Be Required:
                        </span>
                        <p className="text-gray-200 text-[10.5px] leading-snug">
                          {data.potentialModernAnalogies[activeAnalogyIndex].whatWouldBeRequired}
                        </p>
                      </div>
                      <div className="p-2 rounded bg-black/40 border border-blue-500/25 space-y-0.5">
                        <span className="text-blue-300 font-mono text-[9px] uppercase font-bold block">
                          4. What the Text Does Not Establish:
                        </span>
                        <p className="text-gray-200 text-[10.5px] leading-snug">
                          {data.potentialModernAnalogies[activeAnalogyIndex].whatTextDoesNotEstablish}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-mono text-gray-400 pt-0.5">
                      <span>Motivated by: {data.potentialModernAnalogies[activeAnalogyIndex].motivatedByClaimIds.join(', ')}</span>
                      <span className="italic text-gray-500">Co-existing & Non-Ranked Heuristics</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Phase 9: Skeptic */}
            {currentState === 'skeptic' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-gold-warm uppercase tracking-wider">
                    THE DIALECTIC DEBATE // COMPETING PERSPECTIVES
                  </span>
                  <div className="flex gap-1 text-[10px] font-mono">
                    <button
                      onClick={() => setActiveDialecticTab('interpreter')}
                      className={cn(
                        'px-2 py-0.5 rounded border transition-colors',
                        activeDialecticTab === 'interpreter'
                          ? 'bg-gold-warm/20 border-gold-warm text-gold-warm font-bold'
                          : 'border-white/10 text-gray-400 hover:text-white'
                      )}
                    >
                      Interpreter
                    </button>
                    <button
                      onClick={() => setActiveDialecticTab('skeptic')}
                      className={cn(
                        'px-2 py-0.5 rounded border transition-colors',
                        activeDialecticTab === 'skeptic'
                          ? 'bg-blue-900/40 border-blue-400 text-blue-300 font-bold'
                          : 'border-white/10 text-gray-400 hover:text-white'
                      )}
                    >
                      Skeptic
                    </button>
                  </div>
                </div>

                {activeDialecticTab === 'interpreter' ? (
                  <div className="p-3 rounded bg-black/40 border border-gold-antique/30 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-gold-warm font-mono text-xs font-semibold">
                        {data.dialectics.interpreter.perspective}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400">
                        Supports: {data.dialectics.interpreter.supportingClaimIds?.join(', ')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-200 leading-relaxed italic">
                      "{data.dialectics.interpreter.thesis}"
                    </p>
                    <ul className="text-[11px] text-gray-300 space-y-1 pt-1 border-t border-white/5">
                      {data.dialectics.interpreter.keyPoints.map((pt, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-gold-warm">•</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="p-3 rounded bg-black/40 border border-blue-500/30 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-300 font-mono text-xs font-semibold">
                        {data.dialectics.skeptic.perspective}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400">
                        Challenges: {data.dialectics.skeptic.challengingClaimIds?.join(', ')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-200 leading-relaxed italic">
                      "{data.dialectics.skeptic.thesis}"
                    </p>
                    <ul className="text-[11px] text-gray-300 space-y-1 pt-1 border-t border-white/5">
                      {data.dialectics.skeptic.keyPoints.map((pt, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-blue-400">•</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Phase 10: Reality Check */}
            {currentState === 'reality-check' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between border-b border-white/10 pb-1">
                  <span className="text-xs font-mono text-white font-bold uppercase tracking-wider">
                    THE REALITY CHECK AUDIT // SUMMARY MATRIX
                  </span>
                  <button
                    onClick={() => setPresentationMode('research')}
                    className="text-[10px] font-mono text-telemetry-cyan hover:underline"
                  >
                    View Full Audit →
                  </button>
                </div>
                <p className="text-xs text-gray-300 font-sans leading-relaxed">
                  {data.realityCheck.summary}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 pt-1">
                  {data.realityCheck.matrix.map((row) => (
                    <div key={row.id} className="p-2 rounded bg-black/40 border border-white/10 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-gold-warm uppercase font-bold">
                          {row.category}
                        </span>
                        <EvidenceBadge
                          evidenceType={row.badge.type}
                          status={row.badge.status}
                          confidence={row.badge.confidence}
                        />
                      </div>
                      <p className="text-[11px] text-gray-200 leading-tight font-medium">{row.finding}</p>
                      {row.explanation && (
                        <p className="text-[10px] text-gray-400 leading-snug line-clamp-2">{row.explanation}</p>
                      )}
                      {row.passageIds && row.passageIds.length > 0 && (
                        <button
                          onClick={() => handleInspectPassage(row.passageIds![0])}
                          className="text-[9px] font-mono text-gold-warm hover:underline pt-0.5 block"
                        >
                          Inspect Passage →
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Phase 11: What-If */}
            {currentState === 'what-if' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-purple-300 uppercase tracking-wider">
                      THE WHAT-IF SPECULATIVE SANDBOX
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950/80 border border-purple-500/40 text-purple-300">
                      SPECULATIVE MODEL
                    </span>
                  </div>
                </div>

                {/* Parameter Selectors */}
                <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
                  {/* Energy Selector */}
                  <div className="space-y-1">
                    <span className="text-gray-400 block">Energy Source:</span>
                    <select
                      value={whatIfEnergy}
                      onChange={(e) => setWhatIfEnergy(e.target.value)}
                      className="w-full p-1 rounded bg-obsidian-200 border border-white/20 text-white text-[10px]"
                    >
                      {data.whatIfSandbox.energyOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Delivery Selector */}
                  <div className="space-y-1">
                    <span className="text-gray-400 block">Delivery Vector:</span>
                    <select
                      value={whatIfDelivery}
                      onChange={(e) => setWhatIfDelivery(e.target.value)}
                      className="w-full p-1 rounded bg-obsidian-200 border border-white/20 text-white text-[10px]"
                    >
                      {data.whatIfSandbox.deliveryOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Yield Selector */}
                  <div className="space-y-1">
                    <span className="text-gray-400 block">Yield Class:</span>
                    <select
                      value={whatIfYield}
                      onChange={(e) => setWhatIfYield(e.target.value)}
                      className="w-full p-1 rounded bg-obsidian-200 border border-white/20 text-white text-[10px]"
                    >
                      {data.whatIfSandbox.yieldOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Dynamic Constraint Feedback */}
                <div className="p-2 rounded bg-black/40 border border-purple-500/30 text-[11px] font-sans text-gray-300 space-y-1">
                  <div className="text-purple-300 font-mono text-[10px] uppercase font-bold">
                    Thermodynamic & Material Constraints:
                  </div>
                  <p className="text-[11px] text-gray-300 leading-relaxed">
                    Organic reed fibers vaporize at 300°C; containing {whatIfEnergy === 'nucl' ? 'fissile/fusion cores' : whatIfEnergy === 'chem' ? 'high-explosive charges' : 'plasma fields'} in grass violates Coulomb barrier physics without artificial containment fields. No cited archaeological evidence in this investigation establishes industrial metallurgy or anomalous energy systems in second-millennium BCE South Asia.
                  </p>
                </div>
                <p className="text-[10px] font-mono text-gray-500 italic">
                  Disclaimer: {data.whatIfSandbox.disclaimer}
                </p>
              </div>
            )}

            {/* Phase 12: Exit */}
            {currentState === 'exit' && (
              <div className="space-y-3 text-center">
                <span className="text-xs font-mono text-gold-warm uppercase tracking-widest">
                  THE CELESTIAL ARCHIVE // INVESTIGATION COMPLETE
                </span>
                <h3 className="text-xl font-cinzel font-bold text-white">
                  Returning to the Cosmos
                </h3>
                <p className="text-xs text-gray-300 font-sans max-w-lg mx-auto leading-relaxed">
                  The Brahmāstra investigation synthesizes primary textual records (verified against cited BORI Critical Edition references), phenomenological extractions, and modern scientific stress testing. The epic records memories of supreme catastrophic destruction and ethical restraint.
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={() => setCurrentState('intro')}
                    className="px-4 py-1.5 rounded-sm bg-gold-antique/20 text-gold-warm border border-gold-antique/40 hover:bg-gold-antique/30 text-xs font-mono uppercase tracking-wider transition-colors"
                  >
                    Restart Investigation
                  </button>
                  <button
                    onClick={() => setPresentationMode('research')}
                    className="px-4 py-1.5 rounded-sm bg-obsidian-200 border border-white/20 text-white hover:border-gold-warm text-xs font-mono uppercase tracking-wider transition-colors"
                  >
                    Open Scholar Research Mode
                  </button>
                </div>
              </div>
            )}

            {/* Stepper Navigation Controls & Hotkey Hints */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-3 text-xs font-mono">
              <button
                onClick={prevState}
                disabled={currentIdx === 0}
                className="px-3 py-1 rounded text-gray-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-1.5 overflow-x-auto max-w-xs py-1">
                {statesOrder.map((s, idx) => (
                  <button
                    key={s}
                    onClick={() => setCurrentState(s)}
                    className={cn(
                      'w-2 h-2 rounded-full transition-all duration-300',
                      idx === currentIdx
                        ? 'bg-gold-warm w-5 shadow-[0_0_8px_#F3C64F]'
                        : 'bg-white/20 hover:bg-white/50'
                    )}
                    title={`Jump to ${s}`}
                  />
                ))}
              </div>

              <button
                onClick={nextState}
                disabled={currentIdx === statesOrder.length - 1}
                className="px-3 py-1 rounded bg-gold-antique/20 text-gold-warm border border-gold-antique/40 hover:bg-gold-antique/30 disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1"
              >
                <span>Continue</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Subtle Keyboard Hotkey Hints */}
            <div className="hidden md:flex justify-between items-center text-[10px] font-mono text-gray-500 pt-1">
              <span>Keys: [← / → Step] [Space Next] [M Mode] [R Research] [S Sources] [D Diagnostics] [Esc Close]</span>
              <span>80% World / 20% Context</span>
            </div>
          </ContextualOverlay>
        </div>
      )}
    </div>
  );
}
