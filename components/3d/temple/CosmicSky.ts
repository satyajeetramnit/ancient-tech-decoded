import * as THREE from 'three';
import { PerformanceTier } from '@/types/performance';
import { VisualModeController } from '../engine/VisualModeController';
import { WorldChoreography } from '@/types/camera';
import { disposeGeometry, disposeMaterial, disposeObject3D } from '../engine/disposal';

/**
 * CosmicSky & Atmospheric Depth System
 * Multi-layered atmospheric composition:
 *   Layer 1: Distant celestial starfield on expansive sphere
 *   Layer 2: Cosmic haze billboards for depth silhouettes behind colonnade
 *   Layer 3: Sacred incense & temple dust particulate system with thermal convection
 *   Layer 4: Faint golden sanctum halo surrounding the central altar dais
 */
export class CosmicSky {
  public group: THREE.Group;

  // Layer 1: Starfield
  private starGeometry: THREE.BufferGeometry | null = null;
  private starMaterial: THREE.PointsMaterial | null = null;
  private starPoints: THREE.Points | null = null;

  // Layer 2: Cosmic haze billboard ring
  private hazeGeometries: THREE.BufferGeometry[] = [];
  private hazeMaterial: THREE.MeshBasicMaterial | null = null;
  private hazeGroup: THREE.Group;

  // Layer 3: Sacred incense / temple dust motes
  private dustGeometry: THREE.BufferGeometry | null = null;
  private dustMaterial: THREE.PointsMaterial | null = null;
  private dustPoints: THREE.Points | null = null;

  // Layer 4: Sanctum halo
  private haloGeometry: THREE.RingGeometry | null = null;
  private haloMaterial: THREE.MeshBasicMaterial | null = null;
  private haloMesh: THREE.Mesh | null = null;

  // Scene Fog reference
  private sceneFog: THREE.FogExp2;

  private currentTier: PerformanceTier = 'HIGH';

  constructor(scene: THREE.Scene, tier: PerformanceTier = 'HIGH') {
    this.group = new THREE.Group();
    this.hazeGroup = new THREE.Group();
    this.currentTier = tier;

    // Atmospheric Fog: calibrated to create deep silhouette scale without drowning foreground
    this.sceneFog = new THREE.FogExp2(0x070709, tier === 'LOW' ? 0.015 : 0.022);
    scene.fog = this.sceneFog;

    this.buildStars(tier);
    this.buildCosmicHaze(tier);
    this.buildDust(tier);
    this.buildSanctumHalo();
  }

  private buildStars(tier: PerformanceTier): void {
    const starCount = tier === 'HIGH' ? 1200 : tier === 'MEDIUM' ? 600 : 200;
    this.starGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    // Distribute stars on a distant spherical shell (radius 50 to 90)
    for (let i = 0; i < starCount; i++) {
      const radius = 50 + Math.random() * 40;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = Math.abs(radius * Math.cos(phi)) + 1.0; // keep above horizon
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

      // Vary star sizes for depth
      sizes[i] = 0.06 + Math.random() * 0.1;
    }

    this.starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    this.starMaterial = new THREE.PointsMaterial({
      color: 0xefd8a8,
      size: 0.12,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    this.starPoints = new THREE.Points(this.starGeometry, this.starMaterial);
    this.group.add(this.starPoints);
  }

  /**
   * Layer 2: Cosmic haze billboards — soft radial glow geometry behind the distant colonnade
   * Creates depth silhouettes and an impression of deep space beyond the temple walls
   */
  private buildCosmicHaze(tier: PerformanceTier): void {
    if (tier === 'LOW') return;

    this.hazeMaterial = new THREE.MeshBasicMaterial({
      color: 0x1a1428,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const hazeCount = tier === 'HIGH' ? 8 : 4;
    for (let i = 0; i < hazeCount; i++) {
      const theta = (i / hazeCount) * Math.PI * 2;
      const radius = 28 + Math.random() * 12;
      const size = 8 + Math.random() * 6;

      const geo = new THREE.PlaneGeometry(size, size * 0.6);
      this.hazeGeometries.push(geo);
      const mesh = new THREE.Mesh(geo, this.hazeMaterial);
      mesh.position.set(
        Math.cos(theta) * radius,
        4 + Math.random() * 6,
        Math.sin(theta) * radius
      );
      // Face toward center
      mesh.lookAt(0, mesh.position.y, 0);
      this.hazeGroup.add(mesh);
    }

    this.group.add(this.hazeGroup);
  }

  private buildDust(tier: PerformanceTier): void {
    if (tier === 'LOW') return; // Zero ambient dust for low tier

    const dustCount = tier === 'HIGH' ? 400 : 200;
    this.dustGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(dustCount * 3);

    // Distribute dust along the central axis and sanctum dais (X: -10 to 10, Y: 0 to 9, Z: -8 to 30)
    for (let i = 0; i < dustCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = 0.3 + Math.random() * 8.5;
      positions[i * 3 + 2] = -8 + Math.random() * 38;
    }

    this.dustGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    this.dustMaterial = new THREE.PointsMaterial({
      color: 0xd4af37,
      size: 0.04,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });

    this.dustPoints = new THREE.Points(this.dustGeometry, this.dustMaterial);
    this.group.add(this.dustPoints);
  }

  /**
   * Layer 4: Faint golden sanctum halo surrounding the central altar dais
   */
  private buildSanctumHalo(): void {
    this.haloGeometry = new THREE.RingGeometry(2.0, 5.5, 48);
    this.haloMaterial = new THREE.MeshBasicMaterial({
      color: 0xd4af37,
      transparent: true,
      opacity: 0.06,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.haloMesh = new THREE.Mesh(this.haloGeometry, this.haloMaterial);
    this.haloMesh.rotation.x = -Math.PI / 2;
    this.haloMesh.position.set(0, 0.08, 0);
    this.group.add(this.haloMesh);
  }

  public setPerformanceTier(tier: PerformanceTier): void {
    if (this.currentTier === tier) return;
    this.currentTier = tier;

    // Clean up
    if (this.starPoints) {
      this.group.remove(this.starPoints);
      disposeGeometry(this.starGeometry);
      disposeMaterial(this.starMaterial);
    }
    if (this.dustPoints) {
      this.group.remove(this.dustPoints);
      disposeGeometry(this.dustGeometry);
      disposeMaterial(this.dustMaterial);
      this.dustPoints = null;
    }
    // Clean haze
    while (this.hazeGroup.children.length > 0) {
      const child = this.hazeGroup.children[0];
      this.hazeGroup.remove(child);
    }
    this.hazeGeometries.forEach(g => g.dispose());
    this.hazeGeometries = [];
    if (this.hazeMaterial) {
      this.hazeMaterial.dispose();
      this.hazeMaterial = null;
    }

    this.sceneFog.density = tier === 'LOW' ? 0.015 : 0.022;
    this.buildStars(tier);
    this.buildCosmicHaze(tier);
    this.buildDust(tier);
  }

  public update(delta: number, reducedMotion: boolean, visualMode: VisualModeController, choreography?: WorldChoreography): void {
    const progress = visualMode.currentProgress;

    // 1. Dynamic Fog Modulation based on choreography + visual mode
    if (choreography) {
      this.sceneFog.density = choreography.fogDensity;
    }
    const mythicFog = new THREE.Color(0x070709);
    const systemFog = new THREE.Color(0x04080d);
    this.sceneFog.color.copy(mythicFog).lerp(systemFog, progress);

    // 2. Modulate Dust & Star colors
    const dustTargetOpacity = choreography ? choreography.ambientDustOpacity : (0.45 - progress * 0.15);
    if (this.dustMaterial) {
      this.dustMaterial.color.copy(visualMode.currentColor);
      this.dustMaterial.opacity = dustTargetOpacity;
    }
    if (this.starMaterial) {
      const starMythic = new THREE.Color(0xefd8a8);
      const starSystem = new THREE.Color(0x7fe3ed);
      this.starMaterial.color.copy(starMythic).lerp(starSystem, progress);
    }

    // 3. Cosmic haze tint
    if (this.hazeMaterial) {
      const hazeMythic = new THREE.Color(0x1a1428);
      const hazeSystem = new THREE.Color(0x081018);
      this.hazeMaterial.color.copy(hazeMythic).lerp(hazeSystem, progress);
    }

    // 4. Sanctum halo color/intensity
    if (this.haloMaterial) {
      const haloMythic = new THREE.Color(0xd4af37);
      const haloSystem = new THREE.Color(0x00b8d4);
      this.haloMaterial.color.copy(haloMythic).lerp(haloSystem, progress);
      const auraIntensity = choreography ? choreography.artifactAura : 0.5;
      this.haloMaterial.opacity = 0.03 + auraIntensity * 0.06;
    }

    // 5. Motion
    if (!reducedMotion) {
      // Extremely slow celestial drift
      if (this.starPoints) {
        this.starPoints.rotation.y += delta * 0.003;
      }
      // Floating dust motes — gentle thermal convection
      if (this.dustPoints && this.dustGeometry) {
        const positions = this.dustGeometry.attributes.position.array as Float32Array;
        const count = positions.length / 3;
        for (let i = 0; i < count; i++) {
          // Rise gently with slight lateral drift
          positions[i * 3 + 1] += delta * 0.06;
          positions[i * 3] += Math.sin(performance.now() * 0.0005 + i * 0.3) * delta * 0.008;
          if (positions[i * 3 + 1] > 9.0) {
            positions[i * 3 + 1] = 0.3;
          }
        }
        this.dustGeometry.attributes.position.needsUpdate = true;
      }
    }
  }

  public dispose(): void {
    disposeObject3D(this.group);
    disposeGeometry(this.starGeometry);
    disposeMaterial(this.starMaterial);
    disposeGeometry(this.dustGeometry);
    disposeMaterial(this.dustMaterial);
    this.hazeGeometries.forEach(g => g.dispose());
    disposeMaterial(this.hazeMaterial);
    disposeGeometry(this.haloGeometry);
    disposeMaterial(this.haloMaterial);
  }
}
