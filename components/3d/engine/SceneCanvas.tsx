'use client';

import React, { useEffect, useRef } from 'react';
import { CelestialEngine } from './CelestialEngine';
import { EpisodeState, RenderMode } from '@/types/episodeState';
import { PerformanceTier } from '@/types/performance';

interface SceneCanvasProps {
  episodeState: EpisodeState;
  renderMode: RenderMode;
  performanceTier?: PerformanceTier;
  reducedMotionOverride?: boolean;
  isMuted?: boolean;
  className?: string;
}

export const SceneCanvas: React.FC<SceneCanvasProps> = ({
  episodeState,
  renderMode,
  performanceTier = 'HIGH',
  reducedMotionOverride,
  isMuted = true,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<CelestialEngine | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Detect system prefers-reduced-motion setting
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const isReduced = reducedMotionOverride !== undefined ? reducedMotionOverride : mediaQuery.matches;

    // Initialize 3D engine instance
    const engine = new CelestialEngine({
      canvas: canvasRef.current,
      initialState: episodeState,
      initialMode: renderMode,
      initialTier: performanceTier,
      reducedMotion: isReduced,
    });

    engineRef.current = engine;

    // Listen to OS prefers-reduced-motion changes
    const handleMotionChange = (e: MediaQueryListEvent) => {
      if (reducedMotionOverride === undefined) {
        engine.setReducedMotion(e.matches);
      }
    };
    mediaQuery.addEventListener('change', handleMotionChange);

    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange);
      engine.dispose();
      engineRef.current = null;
    };
  }, []); // Mounts once and handles updates reactively below

  // React to prop changes without remounting the canvas
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setEpisodeState(episodeState);
    }
  }, [episodeState]);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setRenderMode(renderMode);
    }
  }, [renderMode]);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.applyPerformanceTier(performanceTier);
    }
  }, [performanceTier]);

  useEffect(() => {
    if (engineRef.current && reducedMotionOverride !== undefined) {
      engineRef.current.setReducedMotion(reducedMotionOverride);
    }
  }, [reducedMotionOverride]);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setMuted(isMuted);
    }
  }, [isMuted]);

  return (
    <canvas
      ref={canvasRef}
      className={className || 'fixed inset-0 w-full h-full pointer-events-none z-0 block'}
      aria-hidden="true"
    />
  );
};
