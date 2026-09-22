import * as THREE from 'three';
import { PerformanceTier } from '@/types/performance';
import { VisualModeController } from '../engine/VisualModeController';
import { WorldChoreography } from '@/types/camera';
import { Colonnade } from './Colonnade';
import { Mandala } from './Mandala';
import { CosmicSky } from './CosmicSky';
import { BrahmastraArtifact } from '../artifacts/BrahmastraArtifact';
import { disposeObject3D } from '../engine/disposal';

/**
 * TempleEnvironment: Monumental Opening Architecture for The Celestial Archive
 *
 * Epistemic Status:
 * VisualStatus = INTERPRETIVE
 * "Ancient Indian temple-inspired architectural environment created as an artistic synthesis;
 *  not a reconstruction of a specific historical temple."
 */
export const TEMPLE_EPISTEMIC_METADATA = {
  visualStatus: 'INTERPRETIVE' as const,
  statement:
    'Ancient Indian temple-inspired architectural environment created as an artistic synthesis; not a reconstruction of a specific historical temple.',
};

export class TempleEnvironment {
  public rootGroup: THREE.Group;

  // Subsystems
  public colonnade: Colonnade;
  public mandala: Mandala;
  public cosmicSky: CosmicSky;
  public brahmastra: BrahmastraArtifact;

  // Lighting
  private ambientLight!: THREE.AmbientLight;
  private keyDirectionalLight!: THREE.DirectionalLight;
  private sanctumFireLight!: THREE.PointLight;
  private axialAccentLightLeft!: THREE.PointLight;
  private axialAccentLightRight!: THREE.PointLight;

  // Sanctum fire halo (warm pulsing glow ring around altar)
  private sanctumHaloLight!: THREE.PointLight;

  private currentTier: PerformanceTier = 'HIGH';

  // Base lighting intensities (to be modulated by choreography)
  private baseKeyIntensity = 2.2;
  private baseAmbientIntensity = 0.7;
  private baseSanctumIntensity = 2.8;
  private baseBrazierIntensity = 1.2;

  constructor(scene: THREE.Scene, initialTier: PerformanceTier = 'HIGH') {
    this.rootGroup = new THREE.Group();
    scene.add(this.rootGroup);
    this.currentTier = initialTier;

    // 1. Setup Atmospheric Cosmic Sky & Fog
    this.cosmicSky = new CosmicSky(scene, initialTier);
    this.rootGroup.add(this.cosmicSky.group);

    // 2. Setup Monumental Colonnade Architecture
    this.colonnade = new Colonnade(initialTier);
    this.rootGroup.add(this.colonnade.group);

    // 3. Setup Sacred Celestial Mandala
    this.mandala = new Mandala(initialTier);
    this.rootGroup.add(this.mandala.group);

    // 4. Setup Brahmāstra Hero 3D Artifact suspended above sanctum dais
    this.brahmastra = new BrahmastraArtifact(initialTier);
    this.rootGroup.add(this.brahmastra.group);

    // 5. Setup Dual-Family Lighting
    this.setupLighting(scene);
  }

  private setupLighting(scene: THREE.Scene): void {
    // Ambient: Deep darkness with subtle gold warmth
    this.ambientLight = new THREE.AmbientLight(0x18140c, this.baseAmbientIntensity);
    this.rootGroup.add(this.ambientLight);

    // Key Light: High directional light angled down the long ceremonial corridor
    this.keyDirectionalLight = new THREE.DirectionalLight(0xfff5dd, this.baseKeyIntensity);
    this.keyDirectionalLight.position.set(12, 22, 28);
    this.keyDirectionalLight.castShadow = this.currentTier === 'HIGH';
    if (this.keyDirectionalLight.castShadow) {
      this.keyDirectionalLight.shadow.mapSize.width = 1024;
      this.keyDirectionalLight.shadow.mapSize.height = 1024;
      this.keyDirectionalLight.shadow.camera.near = 0.5;
      this.keyDirectionalLight.shadow.camera.far = 80;
    }
    this.rootGroup.add(this.keyDirectionalLight);

    // Sanctum Fire Light: Pulsing warm point light at the central altar dais (0, 1.2, 0)
    // Marks the hover position of the Brahmāstra
    this.sanctumFireLight = new THREE.PointLight(0xd4af37, this.baseSanctumIntensity, 22, 1.2);
    this.sanctumFireLight.position.set(0, 1.8, 0);
    this.rootGroup.add(this.sanctumFireLight);

    // Sanctum warm halo light — wider, softer glow
    this.sanctumHaloLight = new THREE.PointLight(0xd4af37, 1.0, 14, 1.8);
    this.sanctumHaloLight.position.set(0, 0.4, 0);
    this.rootGroup.add(this.sanctumHaloLight);

    // Axial corridor accent braziers — warm contact light on adjacent pillar bases
    this.axialAccentLightLeft = new THREE.PointLight(0xff7700, this.baseBrazierIntensity, 14, 1.5);
    this.axialAccentLightLeft.position.set(-6.5, 4.0, 14);
    this.rootGroup.add(this.axialAccentLightLeft);

    this.axialAccentLightRight = new THREE.PointLight(0xff7700, this.baseBrazierIntensity, 14, 1.5);
    this.axialAccentLightRight.position.set(6.5, 4.0, 14);
    this.rootGroup.add(this.axialAccentLightRight);
  }

  public setPerformanceTier(tier: PerformanceTier): void {
    if (this.currentTier === tier) return;
    this.currentTier = tier;

    this.colonnade.setPerformanceTier(tier);
    this.mandala.setPerformanceTier(tier);
    this.cosmicSky.setPerformanceTier(tier);
    this.brahmastra.setPerformanceTier(tier);

    // Configure shadows based on tier
    if (this.keyDirectionalLight) {
      this.keyDirectionalLight.castShadow = tier === 'HIGH';
    }
  }

  public update(delta: number, reducedMotion: boolean, visualMode: VisualModeController, choreography?: WorldChoreography): void {
    const progress = visualMode.currentProgress;

    // Pass choreography aura to Brahmāstra for dormant→awakened staging
    if (choreography) {
      this.brahmastra.auraIntensity = choreography.artifactAura;
    }

    // 1. Update Subsystems
    this.colonnade.update(delta, reducedMotion, visualMode);
    this.mandala.update(delta, reducedMotion, visualMode);
    this.cosmicSky.update(delta, reducedMotion, visualMode, choreography);
    this.brahmastra.update(delta, reducedMotion, visualMode);

    // 2. Choreography-Driven Lighting Modulation
    const lightMul = choreography ? choreography.lightingIntensity : 1.0;

    // Ambient color
    this.ambientLight.color.copy(visualMode.currentAmbient);
    this.ambientLight.intensity = this.baseAmbientIntensity * lightMul;

    // Key light: warm golden sunlight <-> cold crystalline white/cyan
    const mythicKey = new THREE.Color(0xfff2d4);
    const systemKey = new THREE.Color(0xd0f0ff);
    this.keyDirectionalLight.color.copy(mythicKey).lerp(systemKey, progress);
    this.keyDirectionalLight.intensity = this.baseKeyIntensity * lightMul;

    // Sanctum altar focal light: fire gold <-> telemetry cyan
    const mythicSanctum = new THREE.Color(0xd4af37);
    const systemSanctum = new THREE.Color(0x00f0ff);
    this.sanctumFireLight.color.copy(mythicSanctum).lerp(systemSanctum, progress);

    // Sanctum halo light follows same palette
    this.sanctumHaloLight.color.copy(mythicSanctum).lerp(systemSanctum, progress);
    const aura = choreography ? choreography.artifactAura : 0.5;
    this.sanctumHaloLight.intensity = 0.5 + aura * 1.5;

    // Sanctum fire flicker (subtle, halted in reduced motion)
    if (!reducedMotion) {
      const flicker = 1.0 + Math.sin(performance.now() * 0.004) * 0.08;
      this.sanctumFireLight.intensity = (this.baseSanctumIntensity - progress * 0.6) * flicker * lightMul;
    }

    // Corridor accent braziers: warm fire <-> telemetry cyan
    const mythicBrazier = new THREE.Color(0xff7700);
    const systemBrazier = new THREE.Color(0x00b4d8);
    this.axialAccentLightLeft.color.copy(mythicBrazier).lerp(systemBrazier, progress);
    this.axialAccentLightRight.color.copy(mythicBrazier).lerp(systemBrazier, progress);
    this.axialAccentLightLeft.intensity = this.baseBrazierIntensity * lightMul;
    this.axialAccentLightRight.intensity = this.baseBrazierIntensity * lightMul;
  }

  public dispose(): void {
    this.colonnade.dispose();
    this.mandala.dispose();
    this.cosmicSky.dispose();
    this.brahmastra.dispose();
    disposeObject3D(this.rootGroup);
    if (this.rootGroup.parent) {
      this.rootGroup.parent.remove(this.rootGroup);
    }
  }
}
