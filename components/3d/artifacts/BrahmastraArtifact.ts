import * as THREE from 'three';
import { PerformanceTier } from '@/types/performance';
import { VisualModeController } from '../engine/VisualModeController';
import { disposeGeometry, disposeMaterial, disposeObject3D } from '../engine/disposal';

/**
 * Brahmāstra 3D Artifact
 * An abstract sacred-mechanical construct suspended in the central sanctum.
 *
 * Epistemic Status:
 * VisualStatus = INTERPRETIVE
 * "Visual interpretation inspired by textual descriptions; no corresponding historical artifact has been identified."
 *
 * Design: Concentric engraved bronze/gold rings, sacred BrahmicFlameMandala glyph petals,
 * and a dual-layer luminous core (concentrated inner emission + translucent outer energy aura)
 * that transforms into wireframe coordinate schematics in System Mode via cinematic
 * multi-stage decomposition.
 */
export class BrahmastraArtifact {
  public group: THREE.Group;

  // Structural Sub-groups for gyroscopic kinematics
  private outerGimbalGroup: THREE.Group;
  private middleGimbalGroup: THREE.Group;
  private innerGimbalGroup: THREE.Group;
  private flameMandalaGroup: THREE.Group;
  private coreGroup: THREE.Group;
  private telemetryAxesGroup: THREE.Group;

  // Meshes
  private outerRingMesh!: THREE.Mesh;
  private outerWireframeRingMesh!: THREE.Mesh;
  private middleRingMesh!: THREE.Mesh;
  private innerRingMesh!: THREE.Mesh;
  private flamePetalsMesh!: THREE.Mesh;
  private coreInnerMesh!: THREE.Mesh;   // Concentrated inner luminous emission
  private coreOuterMesh!: THREE.Mesh;    // Translucent outer energy aura
  private coreCageMesh!: THREE.Mesh;

  // Plinth grounding projection
  private groundingRingMesh!: THREE.Mesh;

  // Materials
  private bronzeMaterial!: THREE.MeshStandardMaterial;
  private goldAccentMaterial!: THREE.MeshStandardMaterial;
  private flameMaterial!: THREE.MeshStandardMaterial;
  private coreInnerMaterial!: THREE.MeshBasicMaterial;
  private coreOuterMaterial!: THREE.MeshBasicMaterial;
  private cageMaterial!: THREE.MeshStandardMaterial;
  private wireframeMaterial!: THREE.MeshBasicMaterial;
  private telemetryLineMaterial!: THREE.LineBasicMaterial;
  private groundingMaterial!: THREE.MeshBasicMaterial;

  // Orbital Motes
  private motesGeometry: THREE.BufferGeometry | null = null;
  private motesMaterial: THREE.PointsMaterial | null = null;
  private motesPoints: THREE.Points | null = null;

  // Tracking for disposal
  private geometries: THREE.BufferGeometry[] = [];
  private currentTier: PerformanceTier = 'HIGH';

  /** Current artifact aura intensity (0.0 = dormant, 1.0 = full radiance) — set by TempleEnvironment */
  public auraIntensity: number = 0.0;

  constructor(tier: PerformanceTier = 'HIGH') {
    this.group = new THREE.Group();
    // Suspended directly above the sanctum altar dais
    this.group.position.set(0, 2.3, 0);
    this.currentTier = tier;

    this.outerGimbalGroup = new THREE.Group();
    this.middleGimbalGroup = new THREE.Group();
    this.innerGimbalGroup = new THREE.Group();
    this.flameMandalaGroup = new THREE.Group();
    this.coreGroup = new THREE.Group();
    this.telemetryAxesGroup = new THREE.Group();

    this.group.add(this.outerGimbalGroup);
    this.outerGimbalGroup.add(this.middleGimbalGroup);
    this.middleGimbalGroup.add(this.innerGimbalGroup);
    this.innerGimbalGroup.add(this.flameMandalaGroup);
    this.group.add(this.coreGroup);
    this.group.add(this.telemetryAxesGroup);

    this.initMaterials();
    this.buildGeometry(tier);
    this.buildGroundingRing();
    this.buildMotes(tier);
    this.buildTelemetryAxes();
  }

  private initMaterials(): void {
    // Patinated antique bronze / gold for outer gimbals
    this.bronzeMaterial = new THREE.MeshStandardMaterial({
      color: 0x8a6d3b,
      metalness: 0.88,
      roughness: 0.28,
    });

    // Radiant antique gold
    this.goldAccentMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.92,
      roughness: 0.22,
    });

    // Brahmic flame mandala petals
    this.flameMaterial = new THREE.MeshStandardMaterial({
      color: 0xf39c12,
      emissive: 0x7a3e00,
      emissiveIntensity: 0.6,
      metalness: 0.7,
      roughness: 0.35,
      side: THREE.DoubleSide,
    });

    // Dual-layer luminous core: concentrated inner emission
    this.coreInnerMaterial = new THREE.MeshBasicMaterial({
      color: 0xff7700,
    });

    // Dual-layer luminous core: translucent outer energy aura
    this.coreOuterMaterial = new THREE.MeshBasicMaterial({
      color: 0xff9933,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    // Translucent dielectric outer cage
    this.cageMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      wireframe: true,
      transparent: true,
      opacity: 0.7,
      metalness: 0.9,
      roughness: 0.1,
    });

    // System mode wireframe overlay
    this.wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x00d9e8,
      wireframe: true,
      transparent: true,
      opacity: 0.0,
    });

    // System telemetry coordinate axes
    this.telemetryLineMaterial = new THREE.LineBasicMaterial({
      color: 0x00d9e8,
      transparent: true,
      opacity: 0.0,
    });

    // Grounding ring material
    this.groundingMaterial = new THREE.MeshBasicMaterial({
      color: 0xd4af37,
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
  }

  private buildGeometry(tier: PerformanceTier): void {
    // -------------------------------------------------------------
    // Layer 1: Outer Gyroscopic Horizon Ring (Radius ~1.65)
    // -------------------------------------------------------------
    const outerGeo = new THREE.TorusGeometry(1.65, 0.035, 16, tier === 'LOW' ? 48 : 80);
    this.geometries.push(outerGeo);
    this.outerRingMesh = new THREE.Mesh(outerGeo, this.bronzeMaterial);
    this.outerRingMesh.rotation.x = Math.PI / 2;
    this.outerGimbalGroup.add(this.outerRingMesh);

    // System mode wireframe companion ring
    this.outerWireframeRingMesh = new THREE.Mesh(outerGeo, this.wireframeMaterial);
    this.outerWireframeRingMesh.rotation.x = Math.PI / 2;
    this.outerGimbalGroup.add(this.outerWireframeRingMesh);

    // 4 Cardinal anchor hubs on outer ring
    const hubGeo = new THREE.OctahedronGeometry(0.09, 0);
    this.geometries.push(hubGeo);
    const angles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
    angles.forEach((angle) => {
      const hub = new THREE.Mesh(hubGeo, this.goldAccentMaterial);
      hub.position.set(Math.cos(angle) * 1.65, 0, Math.sin(angle) * 1.65);
      this.outerGimbalGroup.add(hub);
    });

    // -------------------------------------------------------------
    // Layer 2: Middle Interlocking Gimbal Ring (Radius ~1.3)
    // -------------------------------------------------------------
    const midGeo = new THREE.TorusGeometry(1.3, 0.03, 16, tier === 'LOW' ? 40 : 64);
    this.geometries.push(midGeo);
    this.middleRingMesh = new THREE.Mesh(midGeo, this.goldAccentMaterial);
    this.middleGimbalGroup.add(this.middleRingMesh);

    // -------------------------------------------------------------
    // Layer 3: Inner Gimbal Ring (Radius ~0.95)
    // -------------------------------------------------------------
    const innerGeo = new THREE.TorusGeometry(0.95, 0.025, 12, tier === 'LOW' ? 32 : 56);
    this.geometries.push(innerGeo);
    this.innerRingMesh = new THREE.Mesh(innerGeo, this.bronzeMaterial);
    this.innerRingMesh.rotation.y = Math.PI / 4;
    this.innerGimbalGroup.add(this.innerRingMesh);

    // -------------------------------------------------------------
    // Layer 4: Brahmic Flame Mandala Glyph (Ashtadala 8-fold flame petals)
    // -------------------------------------------------------------
    const petalCount = tier === 'LOW' ? 6 : 8;
    const flameShape = new THREE.Shape();
    flameShape.moveTo(0, 0.35);
    flameShape.quadraticCurveTo(0.18, 0.55, 0.12, 0.82);
    flameShape.quadraticCurveTo(0.04, 0.95, 0, 1.05);
    flameShape.quadraticCurveTo(-0.04, 0.95, -0.12, 0.82);
    flameShape.quadraticCurveTo(-0.18, 0.55, 0, 0.35);

    const flameGeo = new THREE.ShapeGeometry(flameShape, 8);
    this.geometries.push(flameGeo);

    // Composite merged flame petal mandala
    const mandalaCompositeGroup = new THREE.Group();
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      const petalMesh = new THREE.Mesh(flameGeo, this.flameMaterial);
      petalMesh.rotation.z = angle;
      mandalaCompositeGroup.add(petalMesh);
    }

    const mergedFlameGeo = this.mergeGroupGeometries(mandalaCompositeGroup);
    this.geometries.push(mergedFlameGeo);
    this.flamePetalsMesh = new THREE.Mesh(mergedFlameGeo, this.flameMaterial);
    this.flameMandalaGroup.add(this.flamePetalsMesh);

    // -------------------------------------------------------------
    // Layer 5: Dual-Layer Luminous Core
    //   - Inner: Concentrated luminous emission sphere (Radius 0.32)
    //   - Outer: Translucent energy aura sphere (Radius 0.52)
    // -------------------------------------------------------------
    const coreInnerGeo = new THREE.SphereGeometry(0.32, 32, 32);
    this.geometries.push(coreInnerGeo);
    this.coreInnerMesh = new THREE.Mesh(coreInnerGeo, this.coreInnerMaterial);
    this.coreGroup.add(this.coreInnerMesh);

    const coreOuterGeo = new THREE.SphereGeometry(0.52, 24, 24);
    this.geometries.push(coreOuterGeo);
    this.coreOuterMesh = new THREE.Mesh(coreOuterGeo, this.coreOuterMaterial);
    this.coreGroup.add(this.coreOuterMesh);

    // Translucent dielectric icosahedral containment cage
    const cageGeo = new THREE.IcosahedronGeometry(0.48, 1);
    this.geometries.push(cageGeo);
    this.coreCageMesh = new THREE.Mesh(cageGeo, this.cageMaterial);
    this.coreGroup.add(this.coreCageMesh);
  }

  /**
   * Plinth grounding projection ring — connects the floating artifact to the sanctum altar dais
   */
  private buildGroundingRing(): void {
    const groundGeo = new THREE.RingGeometry(0.3, 1.6, 32);
    this.geometries.push(groundGeo);
    this.groundingRingMesh = new THREE.Mesh(groundGeo, this.groundingMaterial);
    this.groundingRingMesh.rotation.x = -Math.PI / 2;
    // Position below the artifact at the dais surface level
    this.groundingRingMesh.position.set(0, -1.55, 0);
    this.group.add(this.groundingRingMesh);
  }

  /**
   * Constructs System Mode 3-axis coordinate guides and angle measurement ticks
   */
  private buildTelemetryAxes(): void {
    const axesPositions: number[] = [];
    const span = 1.9;

    // X axis (Red/Cyan vector)
    axesPositions.push(-span, 0, 0, span, 0, 0);
    // Y axis (Vertical vector)
    axesPositions.push(0, -span, 0, 0, span, 0);
    // Z axis (Axial vector)
    axesPositions.push(0, 0, -span, 0, 0, span);

    // Circular radian tick marks on equatorial plane
    const ticks = 24;
    for (let i = 0; i < ticks; i++) {
      const a = (i / ticks) * Math.PI * 2;
      const r1 = 1.62;
      const r2 = i % 4 === 0 ? 1.72 : 1.67;
      axesPositions.push(Math.cos(a) * r1, 0, Math.sin(a) * r1);
      axesPositions.push(Math.cos(a) * r2, 0, Math.sin(a) * r2);
    }

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(axesPositions, 3));
    this.geometries.push(lineGeo);

    const axesLines = new THREE.LineSegments(lineGeo, this.telemetryLineMaterial);
    this.telemetryAxesGroup.add(axesLines);
  }

  /**
   * Micro-orbital motes orbiting the artifact in tilted elliptical paths
   */
  private buildMotes(tier: PerformanceTier): void {
    if (tier === 'LOW') return;

    const count = tier === 'HIGH' ? 120 : 60;
    this.motesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const radius = 0.8 + Math.random() * 0.9;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * 0.8;

      positions[i * 3] = Math.cos(theta) * radius;
      positions[i * 3 + 1] = Math.sin(phi) * radius;
      positions[i * 3 + 2] = Math.sin(theta) * radius;
    }

    this.motesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    this.motesMaterial = new THREE.PointsMaterial({
      color: 0xd4af37,
      size: 0.045,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    this.motesPoints = new THREE.Points(this.motesGeometry, this.motesMaterial);
    this.group.add(this.motesPoints);
  }

  private mergeGroupGeometries(group: THREE.Group): THREE.BufferGeometry {
    const geometries: THREE.BufferGeometry[] = [];
    group.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry) {
        const cloned = child.geometry.clone();
        cloned.applyMatrix4(child.matrix);
        geometries.push(cloned);
      }
    });

    if (geometries.length === 0) return new THREE.BufferGeometry();

    let totalPos = 0;
    geometries.forEach((g) => {
      const pos = g.getAttribute('position');
      if (pos) totalPos += pos.count * 3;
    });

    const mergedPositions = new Float32Array(totalPos);
    let offset = 0;
    geometries.forEach((g) => {
      const pos = g.getAttribute('position');
      if (pos) {
        mergedPositions.set(pos.array as Float32Array, offset);
        offset += pos.count * 3;
      }
      g.dispose();
    });

    const merged = new THREE.BufferGeometry();
    merged.setAttribute('position', new THREE.BufferAttribute(mergedPositions, 3));
    merged.computeVertexNormals();
    return merged;
  }

  public setPerformanceTier(tier: PerformanceTier): void {
    if (this.currentTier === tier) return;
    this.currentTier = tier;

    if (this.motesPoints) {
      this.group.remove(this.motesPoints);
      disposeGeometry(this.motesGeometry);
      disposeMaterial(this.motesMaterial);
      this.motesPoints = null;
    }

    this.buildMotes(tier);
  }

  public update(delta: number, reducedMotion: boolean, visualMode: VisualModeController): void {
    const progress = visualMode.currentProgress;
    const aura = this.auraIntensity;

    // ═══════════════════════════════════════════════════════
    // MULTI-STAGE DECOMPOSITION — Cinematic Mythic→System
    // ═══════════════════════════════════════════════════════

    // Stage 1: Decomposition (0.0→0.3) — Gimbal radial separation
    // Uses normalized parameter (0→1), not a hardcoded 15% value
    const decomp = visualMode.decompositionProgress;

    // Stage 2: Grid & Vector Ignition (0.3→0.7) — wireframe/axes fade in
    const gridIgnition = visualMode.gridIgnitionProgress;

    // Stage 3: Material Shift (0.7→1.0) — bronze dissolves to cyan
    const matShift = visualMode.materialShiftProgress;

    // ═══════════════════════════════════════════════════════
    // 1. MATERIAL INTERPOLATION (driven by matShift stage 3)
    // ═══════════════════════════════════════════════════════

    // Bronze/Gold Gimbals <-> Graphite Slate with Cyan Speculars
    const mythicBronze = new THREE.Color(0x8a6d3b);
    const systemSlate = new THREE.Color(0x131a22);
    this.bronzeMaterial.color.copy(mythicBronze).lerp(systemSlate, matShift);
    this.goldAccentMaterial.color.copy(visualMode.currentColor);

    // Brahmic Flame Petals: Fire Saffron <-> Telemetry Cyan
    const saffron = new THREE.Color(0xf39c12);
    const cyan = new THREE.Color(0x00d9e8);
    this.flameMaterial.color.copy(saffron).lerp(cyan, matShift);

    const flameEmissiveMythic = new THREE.Color(0x7a3e00);
    const flameEmissiveSystem = new THREE.Color(0x004d55);
    this.flameMaterial.emissive.copy(flameEmissiveMythic).lerp(flameEmissiveSystem, matShift);

    // Luminous Core: Sacred Solar Orange <-> Concentrated Telemetry Cyan
    const coreMythic = new THREE.Color(0xff7700);
    const coreSystem = new THREE.Color(0x00f0ff);
    this.coreInnerMaterial.color.copy(coreMythic).lerp(coreSystem, matShift);

    const auraColorMythic = new THREE.Color(0xff9933);
    const auraColorSystem = new THREE.Color(0x00ccdd);
    this.coreOuterMaterial.color.copy(auraColorMythic).lerp(auraColorSystem, matShift);
    // Aura intensity: modulated by both narrative aura and mode
    this.coreOuterMaterial.opacity = 0.15 + aura * 0.25 * (1.0 - progress * 0.3);

    // Cage color
    this.cageMaterial.color.copy(visualMode.currentColor);

    // ═══════════════════════════════════════════════════════
    // 2. WIREFRAME / TELEMETRY OVERLAY (driven by gridIgnition stage 2)
    // ═══════════════════════════════════════════════════════
    this.wireframeMaterial.opacity = gridIgnition * 0.65;
    this.telemetryLineMaterial.opacity = gridIgnition * 0.75;

    // Orbital motes color
    if (this.motesMaterial) {
      this.motesMaterial.color.copy(visualMode.currentColor);
      // Motes brighten with aura
      this.motesMaterial.opacity = 0.3 + aura * 0.5;
    }

    // Grounding ring: pulses subtly with aura
    if (this.groundingMaterial) {
      this.groundingMaterial.color.copy(visualMode.currentColor);
      this.groundingMaterial.opacity = 0.03 + aura * 0.08;
    }

    // ═══════════════════════════════════════════════════════
    // 3. SACRED-MECHANICAL KINEMATICS (Halted in prefers-reduced-motion)
    // ═══════════════════════════════════════════════════════
    if (!reducedMotion) {
      const speed = 1.0 - progress * 0.35; // slightly calmer in system analysis mode

      // Stage 1 decomposition: gimbal radial expansion
      // Scale outward along each axis using decomp (0→1) as a normalized parameter
      const expandFactor = 1.0 + decomp * 0.18; // max ~18% radial separation
      this.outerGimbalGroup.scale.set(expandFactor, expandFactor, expandFactor);

      // Outer ring slow precession
      this.outerGimbalGroup.rotation.y += delta * 0.15 * speed;
      this.outerGimbalGroup.rotation.z = Math.sin(performance.now() * 0.0008) * 0.12;

      // Middle ring counter-rotation
      this.middleGimbalGroup.rotation.x += delta * 0.28 * speed;

      // Inner ring high-angle tumble
      this.innerGimbalGroup.rotation.y -= delta * 0.35 * speed;

      // Brahmic flame mandala subtle breathing rotation
      this.flameMandalaGroup.rotation.z += delta * 0.08 * speed;
      const flamePulse = 1.0 + Math.sin(performance.now() * 0.0022) * 0.06;
      this.flameMandalaGroup.scale.set(flamePulse, flamePulse, flamePulse);

      // Core luminous emission pulsing — modulated by aura intensity
      const corePulse = 1.0 + Math.sin(performance.now() * 0.0035) * 0.05 * (0.4 + aura * 0.6);
      this.coreInnerMesh.scale.set(corePulse, corePulse, corePulse);

      // Outer aura breathing
      const auraPulse = 1.0 + Math.sin(performance.now() * 0.002) * 0.08 * aura;
      this.coreOuterMesh.scale.set(auraPulse, auraPulse, auraPulse);

      // Outer cage slow tumbling
      this.coreCageMesh.rotation.x += delta * 0.4 * speed;
      this.coreCageMesh.rotation.y += delta * 0.5 * speed;

      // Orbital motes revolving — speed responds to aura
      if (this.motesPoints) {
        this.motesPoints.rotation.y += delta * (0.12 + aura * 0.15);
        this.motesPoints.rotation.x += delta * 0.08;
      }
    }
  }

  public dispose(): void {
    disposeObject3D(this.group);
    this.geometries.forEach((g) => g.dispose());
    this.geometries = [];

    disposeMaterial(this.bronzeMaterial);
    disposeMaterial(this.goldAccentMaterial);
    disposeMaterial(this.flameMaterial);
    disposeMaterial(this.coreInnerMaterial);
    disposeMaterial(this.coreOuterMaterial);
    disposeMaterial(this.cageMaterial);
    disposeMaterial(this.wireframeMaterial);
    disposeMaterial(this.telemetryLineMaterial);
    disposeMaterial(this.groundingMaterial);

    disposeGeometry(this.motesGeometry);
    disposeMaterial(this.motesMaterial);
  }
}
