import * as THREE from 'three';
import { RenderMode } from '@/types/episodeState';

/**
 * VisualModeController
 * Manages smooth interpolation between Mythic Mode (0.0) and System Schematics Mode (1.0).
 * Provides multi-stage decomposition progress for cinematic Mythic→System transitions:
 *   - Decomposition (0.0→0.3): Gimbal ring radial separation
 *   - Grid & Vector Ignition (0.3→0.7): Coordinate axes, wireframe envelopes fade in
 *   - Material Shift (0.7→1.0): Bronze dissolves into telemetry cyan vectors
 */
export class VisualModeController {
  public targetMode: RenderMode = 'mythic';
  public currentProgress: number = 0.0; // 0.0 = Mythic, 1.0 = System
  public targetProgress: number = 0.0;

  // Pre-allocated color values for zero garbage collection
  private mythicGold: THREE.Color = new THREE.Color('#D4AF37');
  private systemCyan: THREE.Color = new THREE.Color('#00D9E8');

  private mythicAmbient: THREE.Color = new THREE.Color('#1f1505');
  private systemAmbient: THREE.Color = new THREE.Color('#02151b');

  public currentColor: THREE.Color = new THREE.Color('#D4AF37');
  public currentAmbient: THREE.Color = new THREE.Color('#1f1505');

  public transitionSpeed: number = 3.5; // Damping speed

  constructor(initialMode: RenderMode = 'mythic') {
    this.setMode(initialMode, true);
  }

  public setMode(mode: RenderMode, immediate: boolean = false): void {
    this.targetMode = mode;
    this.targetProgress = mode === 'system' ? 1.0 : 0.0;

    if (immediate) {
      this.currentProgress = this.targetProgress;
      this.updateColors();
    }
  }

  public update(delta: number): void {
    if (Math.abs(this.currentProgress - this.targetProgress) > 0.001) {
      const factor = Math.min(1.0, delta * this.transitionSpeed);
      this.currentProgress += (this.targetProgress - this.currentProgress) * factor;
      this.updateColors();
    }
  }

  private updateColors(): void {
    this.currentColor.copy(this.mythicGold).lerp(this.systemCyan, this.currentProgress);
    this.currentAmbient.copy(this.mythicAmbient).lerp(this.systemAmbient, this.currentProgress);
  }

  public getWireframeAlpha(): number {
    return this.currentProgress;
  }

  /**
   * Multi-stage decomposition sub-progress values (normalized 0→1 within each stage)
   * Used by BrahmastraArtifact to choreograph the Mythic→System cinematic transition.
   */

  /** Stage 1: Gimbal ring radial separation (active during progress 0.0→0.3) */
  public get decompositionProgress(): number {
    return Math.min(1.0, Math.max(0.0, this.currentProgress / 0.3));
  }

  /** Stage 2: Grid/vector/wireframe ignition (active during progress 0.3→0.7) */
  public get gridIgnitionProgress(): number {
    return Math.min(1.0, Math.max(0.0, (this.currentProgress - 0.3) / 0.4));
  }

  /** Stage 3: Material bronze→cyan dissolution (active during progress 0.7→1.0) */
  public get materialShiftProgress(): number {
    return Math.min(1.0, Math.max(0.0, (this.currentProgress - 0.7) / 0.3));
  }
}
