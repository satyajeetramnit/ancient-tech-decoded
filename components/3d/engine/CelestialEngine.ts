import * as THREE from 'three';
import { CameraRig } from './CameraRig';
import { VisualModeController } from './VisualModeController';
import { TempleEnvironment } from '../temple/TempleEnvironment';
import { SoundscapeEngine } from '@/lib/audio/SoundscapeEngine';
import { EpisodeState, RenderMode } from '@/types/episodeState';
import { PerformanceTier, PERFORMANCE_CONFIGS } from '@/types/performance';
import { disposeRenderer, disposeScene } from './disposal';

export interface CelestialEngineOptions {
  canvas: HTMLCanvasElement;
  initialState?: EpisodeState;
  initialMode?: RenderMode;
  initialTier?: PerformanceTier;
  reducedMotion?: boolean;
}

/**
 * CelestialEngine: Master WebGL Lifecycle Coordinator
 * Cleanly decouples 3D rendering from React.
 * Manages Scene, CameraRig, VisualModeController, TempleEnvironment,
 * SoundscapeEngine, Visibility lifecycle, and resource disposal.
 */
export class CelestialEngine {
  private canvas: HTMLCanvasElement;
  public renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public cameraRig: CameraRig;
  public visualMode: VisualModeController;
  public templeEnvironment: TempleEnvironment;
  public soundscape: SoundscapeEngine;

  private currentTier: PerformanceTier;
  public reducedMotion: boolean;

  private animFrameId: number | null = null;
  private lastTime: number = 0;
  private isPaused: boolean = false;

  // Bound event handlers for clean removal
  private handleResizeBound: () => void;
  private handleVisibilityBound: () => void;
  private handleMouseMoveBound: (e: MouseEvent) => void;

  constructor(options: CelestialEngineOptions) {
    this.canvas = options.canvas;
    this.currentTier = options.initialTier || 'HIGH';
    this.reducedMotion = options.reducedMotion || false;

    // 1. Initialize Three.js Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#070709');

    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);

    // 2. Initialize WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: this.currentTier === 'HIGH',
      powerPreference: 'high-performance',
      alpha: false,
    });

    this.applyPerformanceTier(this.currentTier);
    this.renderer.setSize(width, height, false);

    // 3. Initialize Storytelling Subsystems
    this.cameraRig = new CameraRig(this.camera, options.initialState || 'intro');
    this.cameraRig.reducedMotion = this.reducedMotion;

    this.visualMode = new VisualModeController(options.initialMode || 'mythic');
    this.templeEnvironment = new TempleEnvironment(this.scene, this.currentTier);

    // 4. Initialize Procedural Soundscape (stays muted until user toggles)
    this.soundscape = new SoundscapeEngine();
    this.soundscape.setState(options.initialState || 'intro');

    // 5. Attach Event Listeners
    this.handleResizeBound = this.handleResize.bind(this);
    this.handleVisibilityBound = this.handleVisibilityChange.bind(this);
    this.handleMouseMoveBound = this.handleMouseMove.bind(this);

    window.addEventListener('resize', this.handleResizeBound, { passive: true });
    document.addEventListener('visibilitychange', this.handleVisibilityBound);
    window.addEventListener('mousemove', this.handleMouseMoveBound, { passive: true });

    // 6. Start Render Loop
    this.start();
  }

  public setEpisodeState(state: EpisodeState): void {
    this.cameraRig.setState(state);
    this.soundscape.setState(state);
  }

  public setRenderMode(mode: RenderMode): void {
    this.visualMode.setMode(mode);
  }

  public setReducedMotion(reduced: boolean): void {
    this.reducedMotion = reduced;
    this.cameraRig.reducedMotion = reduced;
  }

  public setMuted(muted: boolean): void {
    this.soundscape.setMuted(muted);
  }

  public applyPerformanceTier(tier: PerformanceTier): void {
    this.currentTier = tier;
    const config = PERFORMANCE_CONFIGS[tier];

    const pixelRatio = Math.min(window.devicePixelRatio || 1, config.maxPixelRatio);
    this.renderer.setPixelRatio(pixelRatio);

    if (this.templeEnvironment) {
      this.templeEnvironment.setPerformanceTier(tier);
    }
  }

  private handleResize(): void {
    if (!this.canvas) return;
    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  private handleMouseMove(e: MouseEvent): void {
    if (this.reducedMotion) return;
    const normX = (e.clientX / window.innerWidth) * 2 - 1;
    const normY = -(e.clientY / window.innerHeight) * 2 + 1;
    this.cameraRig.setMouseParallax(normX, normY);
  }

  private handleVisibilityChange(): void {
    if (document.hidden) {
      this.pause();
    } else {
      this.resume();
    }
  }

  public start(): void {
    if (this.animFrameId !== null) return;
    this.lastTime = performance.now();
    this.isPaused = false;
    this.tick();
  }

  public pause(): void {
    this.isPaused = true;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  public resume(): void {
    if (!this.isPaused) return;
    this.lastTime = performance.now();
    this.isPaused = false;
    this.tick();
  }

  private tick(): void {
    if (this.isPaused) return;

    const now = performance.now();
    // Clamp delta to avoid huge time-jumps when unpausing
    const delta = Math.min(0.1, (now - this.lastTime) / 1000);
    this.lastTime = now;

    // 1. Update Subsystems
    this.cameraRig.update(delta);
    this.visualMode.update(delta);
    this.templeEnvironment.update(delta, this.reducedMotion, this.visualMode, this.cameraRig.choreography);

    // 2. Update Soundscape (sync system mode progress)
    this.soundscape.setSystemProgress(this.visualMode.currentProgress);
    this.soundscape.update(delta);

    // 3. Render Frame
    this.renderer.render(this.scene, this.camera);

    this.animFrameId = requestAnimationFrame(() => this.tick());
  }

  public dispose(): void {
    // 1. Stop animation loop
    this.pause();

    // 2. Remove all event listeners
    window.removeEventListener('resize', this.handleResizeBound);
    document.removeEventListener('visibilitychange', this.handleVisibilityBound);
    window.removeEventListener('mousemove', this.handleMouseMoveBound);

    // 3. Explicitly dispose scene objects and geometries
    if (this.templeEnvironment) {
      this.templeEnvironment.dispose();
    }
    if (this.cameraRig) {
      this.cameraRig.dispose();
    }
    if (this.soundscape) {
      this.soundscape.dispose();
    }
    disposeScene(this.scene);
    disposeRenderer(this.renderer);
  }
}
