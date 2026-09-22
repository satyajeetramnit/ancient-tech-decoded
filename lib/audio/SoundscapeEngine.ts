import { EpisodeState } from '@/types/episodeState';

/**
 * SoundscapeEngine: Zero-dependency Web Audio API procedural ambient soundscape.
 *
 * Generates:
 *   - Temple Drone: 55 Hz fundamental sine wave with subtle sub-bass harmonics
 *     and slow LFO (~0.05 Hz) mimicking sacred stone chamber resonance.
 *   - Artifact Hum: Harmonically rich dual-oscillator drone (110 Hz + 220 Hz octave
 *     with subtle beating) that swells during artifact focus.
 *   - Telemetry Pulses: Delicate high-frequency granular ticks when in System Mode.
 *   - Research Silence: Near-complete silence during text and reality-check states.
 *
 * Audio Design Guardrails:
 *   - No cinematic 'power-up', weapon, sci-fi charging, or explosive audio cues.
 *   - Audio is OFF by default (muted). Must be explicitly toggled on.
 *   - All sounds are subtle ambient textures, not dramatic sound effects.
 */
export class SoundscapeEngine {
  private ctx: AudioContext | null = null;

  // Temple drone oscillators
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;
  private droneLfo: OscillatorNode | null = null;
  private droneLfoGain: GainNode | null = null;

  // Artifact hum oscillators
  private humOsc1: OscillatorNode | null = null;
  private humOsc2: OscillatorNode | null = null;
  private humGain: GainNode | null = null;

  // Telemetry pulse
  private telemetryGain: GainNode | null = null;
  private telemetryOsc: OscillatorNode | null = null;

  // Master output
  private masterGain: GainNode | null = null;

  private isMuted: boolean = true;
  private isInitialized: boolean = false;
  private currentState: EpisodeState = 'intro';

  // Target gain levels for smooth transitions
  private targetDroneLevel: number = 0.12;
  private targetHumLevel: number = 0.0;
  private targetTelemetryLevel: number = 0.0;
  private targetMasterLevel: number = 0.0;

  /**
   * Initializes Web Audio context and creates the procedural sound graph.
   * MUST be called from a user gesture (click/tap) to satisfy browser autoplay policy.
   */
  public initialize(): void {
    if (this.isInitialized) return;

    try {
      this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch {
      console.warn('SoundscapeEngine: Web Audio API not supported.');
      return;
    }

    const ctx = this.ctx;

    // Master output gain
    this.masterGain = ctx.createGain();
    this.masterGain.gain.value = 0;
    this.masterGain.connect(ctx.destination);

    // ═══════════════════════════════════════════════
    // Temple Drone: 55 Hz fundamental + 82.5 Hz fifth
    // ═══════════════════════════════════════════════
    this.droneGain = ctx.createGain();
    this.droneGain.gain.value = 0.12;
    this.droneGain.connect(this.masterGain);

    this.droneOsc1 = ctx.createOscillator();
    this.droneOsc1.type = 'sine';
    this.droneOsc1.frequency.value = 55;
    this.droneOsc1.connect(this.droneGain);
    this.droneOsc1.start();

    this.droneOsc2 = ctx.createOscillator();
    this.droneOsc2.type = 'sine';
    this.droneOsc2.frequency.value = 82.5; // Perfect fifth harmonic
    const droneOsc2Gain = ctx.createGain();
    droneOsc2Gain.gain.value = 0.04;
    this.droneOsc2.connect(droneOsc2Gain);
    droneOsc2Gain.connect(this.droneGain);
    this.droneOsc2.start();

    // Slow LFO modulating drone amplitude (~0.05 Hz = 20 second period)
    this.droneLfo = ctx.createOscillator();
    this.droneLfo.type = 'sine';
    this.droneLfo.frequency.value = 0.05;
    this.droneLfoGain = ctx.createGain();
    this.droneLfoGain.gain.value = 0.03;
    this.droneLfo.connect(this.droneLfoGain);
    this.droneLfoGain.connect(this.droneGain.gain);
    this.droneLfo.start();

    // ═══════════════════════════════════════════════
    // Artifact Hum: 110 Hz + 220 Hz with subtle beating
    // ═══════════════════════════════════════════════
    this.humGain = ctx.createGain();
    this.humGain.gain.value = 0.0;
    this.humGain.connect(this.masterGain);

    this.humOsc1 = ctx.createOscillator();
    this.humOsc1.type = 'sine';
    this.humOsc1.frequency.value = 110;
    this.humOsc1.connect(this.humGain);
    this.humOsc1.start();

    this.humOsc2 = ctx.createOscillator();
    this.humOsc2.type = 'sine';
    this.humOsc2.frequency.value = 220.5; // +0.5 Hz detuning for subtle beating
    const humOsc2Gain = ctx.createGain();
    humOsc2Gain.gain.value = 0.5;
    this.humOsc2.connect(humOsc2Gain);
    humOsc2Gain.connect(this.humGain);
    this.humOsc2.start();

    // ═══════════════════════════════════════════════
    // Telemetry Pulses: Delicate high-frequency granular ticks
    // ═══════════════════════════════════════════════
    this.telemetryGain = ctx.createGain();
    this.telemetryGain.gain.value = 0.0;
    this.telemetryGain.connect(this.masterGain);

    this.telemetryOsc = ctx.createOscillator();
    this.telemetryOsc.type = 'triangle';
    this.telemetryOsc.frequency.value = 2200;
    this.telemetryOsc.connect(this.telemetryGain);
    this.telemetryOsc.start();

    this.isInitialized = true;
  }

  /**
   * Sets the episode state, which determines which layers are audible
   */
  public setState(state: EpisodeState): void {
    this.currentState = state;
    this.computeTargetLevels();
  }

  /**
   * Sets System Mode progress (0→1) to modulate telemetry pulse level
   */
  public setSystemProgress(progress: number): void {
    // Telemetry pulses emerge proportionally to system mode
    this.targetTelemetryLevel = progress * 0.015;
  }

  private computeTargetLevels(): void {
    const s = this.currentState;

    // Default: temple drone at moderate level
    this.targetDroneLevel = 0.12;
    this.targetHumLevel = 0.0;

    // State-specific tunings
    switch (s) {
      case 'intro':
        this.targetDroneLevel = 0.06;
        break;
      case 'templeApproach':
      case 'templeReveal':
      case 'temple':
        this.targetDroneLevel = 0.14;
        break;
      case 'templeSanctum':
        this.targetDroneLevel = 0.12;
        this.targetHumLevel = 0.03;
        break;
      case 'artifact':
        this.targetDroneLevel = 0.08;
        this.targetHumLevel = 0.09; // Artifact hum swells
        break;
      case 'myth':
        this.targetDroneLevel = 0.1;
        this.targetHumLevel = 0.04;
        break;
      case 'text':
      case 'reality-check':
        // Near-complete silence for cognitive focus
        this.targetDroneLevel = 0.02;
        this.targetHumLevel = 0.0;
        this.targetTelemetryLevel = 0.0;
        break;
      case 'phenomenology':
        this.targetDroneLevel = 0.08;
        this.targetHumLevel = 0.03;
        break;
      case 'reconstruction':
      case 'science':
        this.targetDroneLevel = 0.06;
        this.targetHumLevel = 0.02;
        break;
      case 'skeptic':
        this.targetDroneLevel = 0.04;
        break;
      case 'what-if':
        this.targetDroneLevel = 0.05;
        this.targetHumLevel = 0.01;
        break;
      case 'exit':
        this.targetDroneLevel = 0.04;
        break;
    }
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    this.targetMasterLevel = muted ? 0.0 : 1.0;

    // Initialize on first unmute (user gesture requirement)
    if (!muted && !this.isInitialized) {
      this.initialize();
    }

    // Resume suspended AudioContext
    if (!muted && this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Smooth update called each frame — interpolates gain levels without pops
   */
  public update(delta: number): void {
    if (!this.isInitialized || !this.ctx) return;

    const smoothFactor = Math.min(1.0, delta * 3.0);

    // Smooth master
    if (this.masterGain) {
      const current = this.masterGain.gain.value;
      this.masterGain.gain.value = current + (this.targetMasterLevel - current) * smoothFactor;
    }

    // Smooth drone
    if (this.droneGain) {
      const current = this.droneGain.gain.value;
      this.droneGain.gain.value = current + (this.targetDroneLevel - current) * smoothFactor;
    }

    // Smooth artifact hum
    if (this.humGain) {
      const current = this.humGain.gain.value;
      this.humGain.gain.value = current + (this.targetHumLevel - current) * smoothFactor;
    }

    // Smooth telemetry
    if (this.telemetryGain) {
      const current = this.telemetryGain.gain.value;
      this.telemetryGain.gain.value = current + (this.targetTelemetryLevel - current) * smoothFactor;
    }
  }

  public dispose(): void {
    if (!this.ctx) return;

    try {
      this.droneOsc1?.stop();
      this.droneOsc2?.stop();
      this.droneLfo?.stop();
      this.humOsc1?.stop();
      this.humOsc2?.stop();
      this.telemetryOsc?.stop();
      this.ctx.close();
    } catch {
      // Ignore errors during disposal
    }

    this.isInitialized = false;
    this.ctx = null;
  }
}
