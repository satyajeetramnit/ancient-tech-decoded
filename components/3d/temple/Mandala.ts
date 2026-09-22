import * as THREE from 'three';
import { PerformanceTier } from '@/types/performance';
import { VisualModeController } from '../engine/VisualModeController';
import { disposeGeometry, disposeMaterial, disposeObject3D } from '../engine/disposal';

/**
 * Celestial Mandala: Major Sacred Symbolic Geometry
 * Layered, slowly counter-rotating sacred celestial mandala.
 * Blends ancient geometric yantra/padma aesthetics with futuristic technical coordinate schematics.
 *
 * Epistemic Status: INTERPRETIVE (Artistic Synthesis)
 */
export class Mandala {
  public group: THREE.Group;

  // Layer Groups for counter-rotation
  private outerRingGroup: THREE.Group;
  private middleYantraGroup: THREE.Group;
  private innerOrbitalGroup: THREE.Group;
  private coreBinduGroup: THREE.Group;

  // Materials
  private goldLineMaterial!: THREE.LineBasicMaterial;
  private cyanLineMaterial!: THREE.LineBasicMaterial;
  private activeLineMaterial!: THREE.LineBasicMaterial;
  private ringMeshMaterial!: THREE.MeshBasicMaterial;
  private binduMaterial!: THREE.MeshBasicMaterial;

  // Geometries for disposal tracking
  private geometries: THREE.BufferGeometry[] = [];

  private currentTier: PerformanceTier = 'HIGH';

  constructor(tier: PerformanceTier = 'HIGH') {
    this.group = new THREE.Group();
    this.currentTier = tier;

    // Position behind and above the central sanctum dais, framing the focal area
    this.group.position.set(0, 5.5, -8.0);

    this.outerRingGroup = new THREE.Group();
    this.middleYantraGroup = new THREE.Group();
    this.innerOrbitalGroup = new THREE.Group();
    this.coreBinduGroup = new THREE.Group();

    this.group.add(this.outerRingGroup);
    this.group.add(this.middleYantraGroup);
    this.group.add(this.innerOrbitalGroup);
    this.group.add(this.coreBinduGroup);

    this.initMaterials();
    this.buildLayers(tier);
  }

  private initMaterials(): void {
    this.activeLineMaterial = new THREE.LineBasicMaterial({
      color: 0xd4af37,
      transparent: true,
      opacity: 0.85,
    });

    this.ringMeshMaterial = new THREE.MeshBasicMaterial({
      color: 0xd4af37,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    });

    this.binduMaterial = new THREE.MeshBasicMaterial({
      color: 0xff7700,
      transparent: true,
      opacity: 0.9,
    });
  }

  private buildLayers(tier: PerformanceTier): void {
    // -------------------------------------------------------------
    // 1. Outer Ring Group: Astronomical Degree Rim & 64 Radial Ticks
    // -------------------------------------------------------------
    const outerRadius = 6.2;
    const outerRimGeo = new THREE.RingGeometry(outerRadius - 0.04, outerRadius, 96);
    this.geometries.push(outerRimGeo);
    const outerRimMesh = new THREE.Mesh(outerRimGeo, this.ringMeshMaterial);
    this.outerRingGroup.add(outerRimMesh);

    // 64 radial coordinate tick lines
    if (tier !== 'LOW') {
      const tickCount = tier === 'HIGH' ? 64 : 32;
      const tickPositions = new Float32Array(tickCount * 2 * 3);

      for (let i = 0; i < tickCount; i++) {
        const theta = (i / tickCount) * Math.PI * 2;
        const isMajor = i % 8 === 0;
        const innerR = isMajor ? outerRadius - 0.45 : outerRadius - 0.22;

        const x1 = Math.cos(theta) * innerR;
        const y1 = Math.sin(theta) * innerR;
        const x2 = Math.cos(theta) * outerRadius;
        const y2 = Math.sin(theta) * outerRadius;

        const base = i * 6;
        tickPositions[base] = x1;
        tickPositions[base + 1] = y1;
        tickPositions[base + 2] = 0;

        tickPositions[base + 3] = x2;
        tickPositions[base + 4] = y2;
        tickPositions[base + 5] = 0;
      }

      const tickGeo = new THREE.BufferGeometry();
      tickGeo.setAttribute('position', new THREE.BufferAttribute(tickPositions, 3));
      this.geometries.push(tickGeo);
      const tickLines = new THREE.LineSegments(tickGeo, this.activeLineMaterial);
      this.outerRingGroup.add(tickLines);
    }

    // -------------------------------------------------------------
    // 2. Middle Yantra: Ashtadala Padma (Nested 8-point & 16-point star polygons)
    // -------------------------------------------------------------
    const starRadius = 4.5;
    const starPoints = 8;
    const starCoords: number[] = [];

    // Create 8-pointed interleaved star yantra
    for (let i = 0; i <= starPoints * 2; i++) {
      const theta = (i / (starPoints * 2)) * Math.PI * 2;
      const r = i % 2 === 0 ? starRadius : starRadius * 0.58;
      starCoords.push(Math.cos(theta) * r, Math.sin(theta) * r, 0);
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starCoords, 3));
    this.geometries.push(starGeo);
    const starLine = new THREE.Line(starGeo, this.activeLineMaterial);
    this.middleYantraGroup.add(starLine);

    // Second interleaved rotated star yantra
    const star2Coords: number[] = [];
    const offsetTheta = Math.PI / starPoints;
    for (let i = 0; i <= starPoints * 2; i++) {
      const theta = (i / (starPoints * 2)) * Math.PI * 2 + offsetTheta;
      const r = i % 2 === 0 ? starRadius * 0.88 : starRadius * 0.48;
      star2Coords.push(Math.cos(theta) * r, Math.sin(theta) * r, 0);
    }

    const star2Geo = new THREE.BufferGeometry();
    star2Geo.setAttribute('position', new THREE.Float32BufferAttribute(star2Coords, 3));
    this.geometries.push(star2Geo);
    const star2Line = new THREE.Line(star2Geo, this.activeLineMaterial);
    this.middleYantraGroup.add(star2Line);

    // -------------------------------------------------------------
    // 3. Inner Orbital Group: Concentric Rings & Node Glyphs
    // -------------------------------------------------------------
    const innerRadii = [3.2, 2.3, 1.5];
    innerRadii.forEach((r, idx) => {
      const ringGeo = new THREE.RingGeometry(r - 0.025, r, 64);
      this.geometries.push(ringGeo);
      const ring = new THREE.Mesh(ringGeo, this.ringMeshMaterial);
      this.innerOrbitalGroup.add(ring);

      // Node markers along inner rings
      if (tier === 'HIGH') {
        const nodeCount = 4 * (idx + 1);
        const nodePositions = new Float32Array(nodeCount * 3);
        for (let j = 0; j < nodeCount; j++) {
          const a = (j / nodeCount) * Math.PI * 2;
          nodePositions[j * 3] = Math.cos(a) * r;
          nodePositions[j * 3 + 1] = Math.sin(a) * r;
          nodePositions[j * 3 + 2] = 0;
        }
        const nodeGeo = new THREE.BufferGeometry();
        nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
        this.geometries.push(nodeGeo);
        const nodePoints = new THREE.Points(
          nodeGeo,
          new THREE.PointsMaterial({
            color: 0xd4af37,
            size: 0.06,
            transparent: true,
            opacity: 0.8,
          })
        );
        this.innerOrbitalGroup.add(nodePoints);
      }
    });

    // -------------------------------------------------------------
    // 4. Core Bindu Group: Sacred Focal Center
    // -------------------------------------------------------------
    const binduRingGeo = new THREE.RingGeometry(0.7, 0.8, 32);
    this.geometries.push(binduRingGeo);
    const binduRing = new THREE.Mesh(binduRingGeo, this.ringMeshMaterial);
    this.coreBinduGroup.add(binduRing);

    const binduCenterGeo = new THREE.CircleGeometry(0.28, 32);
    this.geometries.push(binduCenterGeo);
    const binduCenter = new THREE.Mesh(binduCenterGeo, this.binduMaterial);
    this.coreBinduGroup.add(binduCenter);
  }

  public setPerformanceTier(tier: PerformanceTier): void {
    if (this.currentTier === tier) return;
    this.currentTier = tier;

    // Clear child groups
    this.clearGroupChildren(this.outerRingGroup);
    this.clearGroupChildren(this.middleYantraGroup);
    this.clearGroupChildren(this.innerOrbitalGroup);
    this.clearGroupChildren(this.coreBinduGroup);

    this.geometries.forEach((g) => g.dispose());
    this.geometries = [];

    this.buildLayers(tier);
  }

  private clearGroupChildren(group: THREE.Group): void {
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if (child instanceof THREE.Mesh || child instanceof THREE.Line || child instanceof THREE.Points) {
        disposeGeometry(child.geometry);
      }
    }
  }

  public update(delta: number, reducedMotion: boolean, visualMode: VisualModeController): void {
    const progress = visualMode.currentProgress;

    // 1. Visual Mode Color Interpolation: Antique Gold/Warm Fire <-> Telemetry Cyan
    const currentColor = visualMode.currentColor;
    this.activeLineMaterial.color.copy(currentColor);
    this.ringMeshMaterial.color.copy(currentColor);

    // Bindu center color: sacred fire saffron <-> telemetry cyan
    const saffron = new THREE.Color(0xff7700);
    const cyan = new THREE.Color(0x00f0ff);
    this.binduMaterial.color.copy(saffron).lerp(cyan, progress);

    // In System Mode, make the outer tick markings crisper and brighter
    this.activeLineMaterial.opacity = 0.85 + progress * 0.15;

    // 2. Slow, Subtle Counter-Rotation (halted when reducedMotion = true)
    if (!reducedMotion) {
      // Outer rim rotates slowly clockwise
      const baseSpeed = 0.025 * (1.0 - progress * 0.3); // slightly slower in system mode
      this.outerRingGroup.rotation.z -= delta * baseSpeed;

      // Middle sacred yantra rotates counter-clockwise
      this.middleYantraGroup.rotation.z += delta * (baseSpeed * 1.4);

      // Inner orbital rings rotate clockwise
      this.innerOrbitalGroup.rotation.z -= delta * (baseSpeed * 1.8);

      // Core bindu subtle pulsing
      const pulse = 1.0 + Math.sin(performance.now() * 0.0018) * 0.05;
      this.coreBinduGroup.scale.set(pulse, pulse, 1);
    }
  }

  public dispose(): void {
    disposeObject3D(this.group);
    this.geometries.forEach((g) => g.dispose());
    this.geometries = [];
    disposeMaterial(this.activeLineMaterial);
    disposeMaterial(this.ringMeshMaterial);
    disposeMaterial(this.binduMaterial);
  }
}
