import * as THREE from 'three';
import { VisualModeController } from './VisualModeController';
import { PerformanceTier, PERFORMANCE_CONFIGS } from '@/types/performance';
import { disposeGeometry, disposeMaterial, disposeObject3D } from './disposal';

/**
 * DiagnosticScene: Minimal placeholder test scene for Milestone 1
 * Demonstrates:
 * 1. Diagnostic geometric reference rings/torus
 * 2. Visual mode interpolation (Gold/Bronze <-> Cyan/Wireframe)
 * 3. Dynamic particle count scaling across HIGH, MEDIUM, and LOW tiers
 * 4. Reduced-motion responsiveness (halts continuous rotation)
 * 5. Full explicit resource disposal
 */
export class DiagnosticScene {
  public rootGroup: THREE.Group;

  // Placeholder geometric test meshes
  private outerRingMesh!: THREE.Mesh;
  private innerTorusMesh!: THREE.Mesh;
  private coreSphereMesh!: THREE.Mesh;
  private wireframeBoxMesh!: THREE.Mesh;

  // Materials with dynamic uniform properties
  private outerRingMaterial!: THREE.MeshStandardMaterial;
  private innerTorusMaterial!: THREE.MeshStandardMaterial;
  private coreMaterial!: THREE.MeshBasicMaterial;
  private wireframeBoxMaterial!: THREE.MeshBasicMaterial;

  // Instanced / Points Particles
  private particlesMesh: THREE.Points | null = null;
  private particlesGeometry: THREE.BufferGeometry | null = null;
  private particlesMaterial: THREE.PointsMaterial | null = null;

  // Lighting
  private keyLight!: THREE.DirectionalLight;
  private fillLight!: THREE.PointLight;
  private ambientLight!: THREE.AmbientLight;

  private currentTier: PerformanceTier = 'HIGH';

  constructor(scene: THREE.Scene, initialTier: PerformanceTier = 'HIGH') {
    this.rootGroup = new THREE.Group();
    scene.add(this.rootGroup);

    this.setupLighting();
    this.setupPlaceholderGeometry();
    this.setPerformanceTier(initialTier);
  }

  private setupLighting(): void {
    this.ambientLight = new THREE.AmbientLight(0x1a1505, 0.6);
    this.rootGroup.add(this.ambientLight);

    this.keyLight = new THREE.DirectionalLight(0xfff0d0, 1.8);
    this.keyLight.position.set(5, 8, 5);
    this.rootGroup.add(this.keyLight);

    this.fillLight = new THREE.PointLight(0xd4af37, 2.0, 15);
    this.fillLight.position.set(0, 0, 0);
    this.rootGroup.add(this.fillLight);
  }

  private setupPlaceholderGeometry(): void {
    // 1. Diagnostic Outer Reference Ring
    const ringGeo = new THREE.TorusGeometry(2.2, 0.04, 16, 100);
    this.outerRingMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.85,
      roughness: 0.25,
    });
    this.outerRingMesh = new THREE.Mesh(ringGeo, this.outerRingMaterial);
    this.outerRingMesh.rotation.x = Math.PI / 2;
    this.rootGroup.add(this.outerRingMesh);

    // 2. Diagnostic Inner Rotating Torus
    const innerGeo = new THREE.TorusGeometry(1.4, 0.03, 16, 80);
    this.innerTorusMaterial = new THREE.MeshStandardMaterial({
      color: 0xf3c64f,
      metalness: 0.9,
      roughness: 0.2,
    });
    this.innerTorusMesh = new THREE.Mesh(innerGeo, this.innerTorusMaterial);
    this.rootGroup.add(this.innerTorusMesh);

    // 3. Central Diagnostic Core Sphere
    const coreGeo = new THREE.SphereGeometry(0.5, 32, 32);
    this.coreMaterial = new THREE.MeshBasicMaterial({
      color: 0xff7700,
    });
    this.coreSphereMesh = new THREE.Mesh(coreGeo, this.coreMaterial);
    this.rootGroup.add(this.coreSphereMesh);

    // 4. System Mode Wireframe Bounding Cage
    const boxGeo = new THREE.BoxGeometry(3.0, 3.0, 3.0);
    this.wireframeBoxMaterial = new THREE.MeshBasicMaterial({
      color: 0x00d9e8,
      wireframe: true,
      transparent: true,
      opacity: 0.0,
    });
    this.wireframeBoxMesh = new THREE.Mesh(boxGeo, this.wireframeBoxMaterial);
    this.rootGroup.add(this.wireframeBoxMesh);
  }

  public setPerformanceTier(tier: PerformanceTier): void {
    this.currentTier = tier;
    const config = PERFORMANCE_CONFIGS[tier];

    // Rebuild particles based on tier count
    if (this.particlesMesh) {
      this.rootGroup.remove(this.particlesMesh);
      disposeGeometry(this.particlesGeometry);
      disposeMaterial(this.particlesMaterial);
    }

    const count = config.particleCount;
    this.particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Cylindrical/spherical dispersion around center
      const radius = 1.0 + Math.random() * 4.5;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 4.0;

      positions[i * 3] = Math.cos(theta) * radius;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(theta) * radius;
    }

    this.particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    this.particlesMaterial = new THREE.PointsMaterial({
      color: 0xd4af37,
      size: 0.035,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });

    this.particlesMesh = new THREE.Points(this.particlesGeometry, this.particlesMaterial);
    this.rootGroup.add(this.particlesMesh);
  }

  public update(delta: number, reducedMotion: boolean, visualMode: VisualModeController): void {
    // 1. Mythic ↔ System Visual Mode interpolation
    const progress = visualMode.currentProgress;

    // Outer Ring: Gold <-> Cyan
    this.outerRingMaterial.color.copy(visualMode.currentColor);

    // Inner Torus: Warm Gold <-> Cyan
    this.innerTorusMaterial.color.copy(visualMode.currentColor);

    // Central Core: Sacred Saffron <-> Telemetry Cyan
    const saffronColor = new THREE.Color(0xff7700);
    const cyanColor = new THREE.Color(0x00f0ff);
    this.coreMaterial.color.copy(saffronColor).lerp(cyanColor, progress);

    // Wireframe Box Opacity (visible only in System Mode)
    this.wireframeBoxMaterial.opacity = progress * 0.45;

    // Ambient and Point Light colors
    this.ambientLight.color.copy(visualMode.currentAmbient);
    this.fillLight.color.copy(visualMode.currentColor);

    // Particle Color
    if (this.particlesMaterial) {
      this.particlesMaterial.color.copy(visualMode.currentColor);
    }

    // 2. Motion / Animation (Respects prefers-reduced-motion)
    if (!reducedMotion) {
      const rotSpeed = 0.5 * (1.0 - progress * 0.4); // Slower in system mode
      this.innerTorusMesh.rotation.x += delta * rotSpeed;
      this.innerTorusMesh.rotation.y += delta * (rotSpeed * 1.3);

      this.outerRingMesh.rotation.z += delta * (rotSpeed * 0.3);

      if (this.particlesMesh) {
        this.particlesMesh.rotation.y += delta * 0.08;
      }
    }
  }

  public dispose(): void {
    disposeObject3D(this.rootGroup);
    if (this.rootGroup.parent) {
      this.rootGroup.parent.remove(this.rootGroup);
    }
  }
}
