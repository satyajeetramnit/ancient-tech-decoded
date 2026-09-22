import * as THREE from 'three';
import { PerformanceTier } from '@/types/performance';
import { VisualModeController } from '../engine/VisualModeController';
import { disposeGeometry, disposeMaterial, disposeObject3D } from '../engine/disposal';

/**
 * Colonnade & Architectural Environment Elements
 * Uses InstancedMesh and shared geometries/materials to render monumental
 * ancient Indian temple-inspired architecture with high performance.
 * Materials feature procedural noise-based roughness for basalt/obsidian depth.
 *
 * Epistemic Status: INTERPRETIVE (Artistic Synthesis)
 */
export class Colonnade {
  public group: THREE.Group;

  // Geometries
  private columnGeometry: THREE.BufferGeometry | null = null;
  private plinthGeometry: THREE.BoxGeometry | null = null;
  private axialPathGeometry: THREE.PlaneGeometry | null = null;
  private daisGeometry: THREE.CylinderGeometry | null = null;
  private architraveGeometry: THREE.BoxGeometry | null = null;
  private pylonGeometry: THREE.BufferGeometry | null = null;

  // Materials — differentiated tonalities
  private basaltPlinthMaterial!: THREE.MeshStandardMaterial;  // Dark basalt for plinth
  private templeShaftMaterial!: THREE.MeshStandardMaterial;   // Carved stone for column shafts
  private capitalBronzeMaterial!: THREE.MeshStandardMaterial; // Oxidized bronze for capitals
  private accentGoldMaterial!: THREE.MeshStandardMaterial;
  private darkGraniteMaterial!: THREE.MeshStandardMaterial;
  private daisCoreMaterial!: THREE.MeshStandardMaterial;
  private wireframeOverlayMaterial!: THREE.MeshBasicMaterial;

  // Procedural textures for disposal
  private noiseTextures: THREE.CanvasTexture[] = [];

  // Meshes
  private columnsInstancedMesh: THREE.InstancedMesh | null = null;
  private plinthMesh: THREE.Mesh | null = null;
  private axialPathMesh: THREE.Mesh | null = null;
  private daisMesh: THREE.Mesh | null = null;
  private daisStepMesh: THREE.Mesh | null = null;
  private architravesInstancedMesh: THREE.InstancedMesh | null = null;
  private pylonsInstancedMesh: THREE.InstancedMesh | null = null;
  private wireframePylonsMesh: THREE.InstancedMesh | null = null;

  // Radial mandala floor
  private floorMandalaGeometry: THREE.CircleGeometry | null = null;
  private floorMandalaMesh: THREE.Mesh | null = null;
  private floorMandalaMaterial: THREE.MeshStandardMaterial | null = null;

  private currentTier: PerformanceTier = 'HIGH';

  constructor(tier: PerformanceTier = 'HIGH') {
    this.group = new THREE.Group();
    this.currentTier = tier;

    this.initMaterials(tier);
    this.buildPlinthAndSanctum();
    this.buildFloorMandala(tier);
    this.buildColumns(tier);
    this.buildOverheadArchitraves();
    this.buildElevatedPylons(tier);
  }

  /**
   * Generates a procedural noise roughness map on a canvas for stone surface depth
   */
  private generateNoiseRoughnessMap(size: number, baseRoughness: number, variation: number): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;

    for (let i = 0; i < size * size; i++) {
      // Perlin-like noise approximation via multiple octaves of random
      const noise = (Math.random() * 0.5 + Math.random() * 0.3 + Math.random() * 0.2);
      const roughnessValue = Math.min(255, Math.max(0,
        (baseRoughness + (noise - 0.5) * variation) * 255
      ));
      const idx = i * 4;
      data[idx] = roughnessValue;
      data[idx + 1] = roughnessValue;
      data[idx + 2] = roughnessValue;
      data[idx + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    this.noiseTextures.push(texture);
    return texture;
  }

  /**
   * Generates the procedural radial mandala floor texture
   */
  private generateFloorMandalaTexture(size: number): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const cx = size / 2;
    const cy = size / 2;
    const maxR = size / 2;

    // Base: very dark polished stone
    ctx.fillStyle = '#0a0908';
    ctx.fillRect(0, 0, size, size);

    // Concentric rings with subtle roughness variation
    const ringCount = 16;
    for (let i = 0; i < ringCount; i++) {
      const r = (maxR / ringCount) * (i + 1);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = i % 4 === 0
        ? 'rgba(212, 175, 55, 0.18)'   // Major gold ring
        : 'rgba(180, 160, 120, 0.06)'; // Subtle stone ring
      ctx.lineWidth = i % 4 === 0 ? 2.0 : 0.8;
      ctx.stroke();
    }

    // 16-point yantra petals
    const petalCount = 16;
    const petalInner = maxR * 0.25;
    const petalOuter = maxR * 0.75;

    ctx.strokeStyle = 'rgba(212, 175, 55, 0.12)';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < petalCount; i++) {
      const theta = (i / petalCount) * Math.PI * 2;
      const nextTheta = ((i + 1) / petalCount) * Math.PI * 2;
      const midTheta = (theta + nextTheta) / 2;

      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(theta) * petalInner, cy + Math.sin(theta) * petalInner);
      ctx.quadraticCurveTo(
        cx + Math.cos(midTheta) * petalOuter * 1.1,
        cy + Math.sin(midTheta) * petalOuter * 1.1,
        cx + Math.cos(nextTheta) * petalInner,
        cy + Math.sin(nextTheta) * petalInner
      );
      ctx.stroke();
    }

    // Axial alignment lines (4 cardinal + 4 ordinal)
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.08)';
    ctx.lineWidth = 0.6;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * maxR, cy + Math.sin(a) * maxR);
      ctx.stroke();
    }

    // Central bindu dot
    const binduGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR * 0.06);
    binduGrad.addColorStop(0, 'rgba(212, 175, 55, 0.25)');
    binduGrad.addColorStop(1, 'rgba(212, 175, 55, 0.0)');
    ctx.fillStyle = binduGrad;
    ctx.fillRect(cx - maxR * 0.06, cy - maxR * 0.06, maxR * 0.12, maxR * 0.12);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    this.noiseTextures.push(texture);
    return texture;
  }

  private initMaterials(tier: PerformanceTier): void {
    const useNoiseMaps = tier !== 'LOW';

    // Dark textured basalt for foundation plinth
    this.basaltPlinthMaterial = new THREE.MeshStandardMaterial({
      color: 0x141210,
      roughness: 0.85,
      metalness: 0.12,
      roughnessMap: useNoiseMaps ? this.generateNoiseRoughnessMap(256, 0.85, 0.2) : null,
    });

    // Carved temple stone for column shafts — slightly warmer with gold edge highlights
    this.templeShaftMaterial = new THREE.MeshStandardMaterial({
      color: 0x1c1814,
      roughness: 0.72,
      metalness: 0.18,
      roughnessMap: useNoiseMaps ? this.generateNoiseRoughnessMap(256, 0.72, 0.15) : null,
    });

    // Oxidized dark bronze for capitals and corbels with selective emissive filigree
    this.capitalBronzeMaterial = new THREE.MeshStandardMaterial({
      color: 0x523d21,
      roughness: 0.45,
      metalness: 0.75,
      emissive: 0x1a0e00,
      emissiveIntensity: 0.15,
      roughnessMap: useNoiseMaps ? this.generateNoiseRoughnessMap(128, 0.45, 0.12) : null,
    });

    // Antique gold / Telemetry cyan accent material
    this.accentGoldMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.3,
      metalness: 0.85,
    });

    // Polished dark obsidian floor path
    this.darkGraniteMaterial = new THREE.MeshStandardMaterial({
      color: 0x09090c,
      roughness: 0.4,
      metalness: 0.5,
    });

    // Sanctum Dais central focal pad (emissive rim)
    this.daisCoreMaterial = new THREE.MeshStandardMaterial({
      color: 0x221a10,
      emissive: 0x442605,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.9,
    });

    // System mode wireframe overlay
    this.wireframeOverlayMaterial = new THREE.MeshBasicMaterial({
      color: 0x00d9e8,
      wireframe: true,
      transparent: true,
      opacity: 0.0,
    });
  }

  /**
   * Builds the stepped foundation plinth and central sanctum dais
   */
  private buildPlinthAndSanctum(): void {
    // 1. Massive foundation floor plinth running along central axis
    this.plinthGeometry = new THREE.BoxGeometry(26, 1.2, 70);
    this.plinthMesh = new THREE.Mesh(this.plinthGeometry, this.basaltPlinthMaterial);
    this.plinthMesh.position.set(0, -0.6, 10);
    this.plinthMesh.receiveShadow = true;
    this.group.add(this.plinthMesh);

    // 2. Ceremonial axial walkway with gold geometric side borders
    this.axialPathGeometry = new THREE.PlaneGeometry(5.0, 68);
    this.axialPathMesh = new THREE.Mesh(this.axialPathGeometry, this.darkGraniteMaterial);
    this.axialPathMesh.rotation.x = -Math.PI / 2;
    this.axialPathMesh.position.set(0, 0.01, 10);
    this.axialPathMesh.receiveShadow = true;
    this.group.add(this.axialPathMesh);

    // Gold inlaid central guideline
    const spineGeo = new THREE.PlaneGeometry(0.12, 68);
    const spineMesh = new THREE.Mesh(spineGeo, this.accentGoldMaterial);
    spineMesh.rotation.x = -Math.PI / 2;
    spineMesh.position.set(0, 0.02, 10);
    this.group.add(spineMesh);

    // 3. Central Sanctum Altar Dais at (0, 0, 0)
    // Lower tier step (octagonal)
    this.daisGeometry = new THREE.CylinderGeometry(3.6, 4.0, 0.4, 16);
    this.daisStepMesh = new THREE.Mesh(this.daisGeometry, this.basaltPlinthMaterial);
    this.daisStepMesh.position.set(0, 0.2, 0);
    this.group.add(this.daisStepMesh);

    // Upper altar dais (with gold trim)
    const upperDaisGeo = new THREE.CylinderGeometry(2.4, 2.7, 0.35, 16);
    this.daisMesh = new THREE.Mesh(upperDaisGeo, this.daisCoreMaterial);
    this.daisMesh.position.set(0, 0.55, 0);
    this.group.add(this.daisMesh);

    // Dais concentric gold inlay rings
    const ringGeo = new THREE.RingGeometry(1.8, 1.95, 32);
    const ringMesh = new THREE.Mesh(ringGeo, this.accentGoldMaterial);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.set(0, 0.73, 0);
    this.group.add(ringMesh);
  }

  /**
   * Builds the radial mandala floor engraved into the plinth stone
   */
  private buildFloorMandala(tier: PerformanceTier): void {
    const texSize = tier === 'HIGH' ? 1024 : tier === 'MEDIUM' ? 512 : 256;
    const mandalaTexture = this.generateFloorMandalaTexture(texSize);

    this.floorMandalaGeometry = new THREE.CircleGeometry(12, 64);
    this.floorMandalaMaterial = new THREE.MeshStandardMaterial({
      map: mandalaTexture,
      roughness: 0.35,
      metalness: 0.45,
      transparent: true,
      opacity: 0.9,
    });

    this.floorMandalaMesh = new THREE.Mesh(this.floorMandalaGeometry, this.floorMandalaMaterial);
    this.floorMandalaMesh.rotation.x = -Math.PI / 2;
    this.floorMandalaMesh.position.set(0, 0.015, 0);
    this.floorMandalaMesh.receiveShadow = true;
    this.group.add(this.floorMandalaMesh);
  }

  /**
   * Constructs the modular column geometry and instanced colonnades flanking the axis
   * Uses differentiated materials: basalt base, temple stone shaft, bronze capital
   */
  private buildColumns(tier: PerformanceTier): void {
    // Merge modular parts of a single column: base + faceted shaft + moulding ring + bracket capital
    const columnGroup = new THREE.Group();

    // 1. Stepped octagonal base
    const baseGeo = new THREE.CylinderGeometry(1.05, 1.3, 1.0, 8);
    const baseMesh = new THREE.Mesh(baseGeo);
    baseMesh.position.y = 0.5;
    columnGroup.add(baseMesh);

    // 2. Multi-faceted fluted shaft
    const shaftGeo = new THREE.CylinderGeometry(0.72, 0.88, 8.0, tier === 'LOW' ? 8 : 12);
    const shaftMesh = new THREE.Mesh(shaftGeo);
    shaftMesh.position.y = 5.0;
    columnGroup.add(shaftMesh);

    // 3. Ornamental mouldings / kalasha ring
    const ringGeo = new THREE.TorusGeometry(0.85, 0.12, 8, 16);
    const ringMesh = new THREE.Mesh(ringGeo);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = 7.8;
    columnGroup.add(ringMesh);

    // 4. Tiered bracket capital (carved overhang holding the ceiling)
    const capitalGeo = new THREE.BoxGeometry(1.8, 0.8, 1.8);
    const capitalMesh = new THREE.Mesh(capitalGeo);
    capitalMesh.position.y = 9.2;
    columnGroup.add(capitalMesh);

    // Convert group to single merged BufferGeometry
    this.columnGeometry = this.mergeGroupGeometries(columnGroup);

    // 16 columns (8 pairs flanking left and right)
    const columnCount = tier === 'LOW' ? 10 : 16;
    this.columnsInstancedMesh = new THREE.InstancedMesh(this.columnGeometry, this.templeShaftMaterial, columnCount);

    const dummy = new THREE.Object3D();
    let idx = 0;

    const zSpacing = 4.8;
    const zStart = -6.0;
    const pairs = columnCount / 2;

    for (let i = 0; i < pairs; i++) {
      const zPos = zStart + i * zSpacing;

      // Left column (X = -6.5)
      dummy.position.set(-6.8, 0.0, zPos);
      dummy.scale.set(1, 1, 1);
      dummy.rotation.set(0, (i % 2) * 0.4, 0);
      dummy.updateMatrix();
      this.columnsInstancedMesh.setMatrixAt(idx++, dummy.matrix);

      // Right column (X = +6.5)
      dummy.position.set(6.8, 0.0, zPos);
      dummy.scale.set(1, 1, 1);
      dummy.rotation.set(0, -(i % 2) * 0.4, 0);
      dummy.updateMatrix();
      this.columnsInstancedMesh.setMatrixAt(idx++, dummy.matrix);
    }

    this.columnsInstancedMesh.instanceMatrix.needsUpdate = true;
    this.group.add(this.columnsInstancedMesh);
  }

  /**
   * Overhead horizontal architraves spanning along the colonnade rows
   */
  private buildOverheadArchitraves(): void {
    // Overhead lintels connecting the columns along the Z axis
    this.architraveGeometry = new THREE.BoxGeometry(1.4, 0.9, 42);
    this.architravesInstancedMesh = new THREE.InstancedMesh(this.architraveGeometry, this.capitalBronzeMaterial, 2);

    const dummy = new THREE.Object3D();

    // Left architrave
    dummy.position.set(-6.8, 9.7, 10);
    dummy.updateMatrix();
    this.architravesInstancedMesh.setMatrixAt(0, dummy.matrix);

    // Right architrave
    dummy.position.set(6.8, 9.7, 10);
    dummy.updateMatrix();
    this.architravesInstancedMesh.setMatrixAt(1, dummy.matrix);

    this.architravesInstancedMesh.instanceMatrix.needsUpdate = true;
    this.group.add(this.architravesInstancedMesh);
  }

  /**
   * Elevated stepped architectural pylons (shikhara / vimana-inspired stepped geometry)
   */
  private buildElevatedPylons(tier: PerformanceTier): void {
    const pylonGroup = new THREE.Group();

    // Stepped tiers of a monumental pylon
    const tier1 = new THREE.BoxGeometry(4.0, 3.0, 4.0);
    const m1 = new THREE.Mesh(tier1);
    m1.position.y = 1.5;
    pylonGroup.add(m1);

    const tier2 = new THREE.BoxGeometry(3.2, 3.0, 3.2);
    const m2 = new THREE.Mesh(tier2);
    m2.position.y = 4.5;
    pylonGroup.add(m2);

    const tier3 = new THREE.BoxGeometry(2.4, 3.0, 2.4);
    const m3 = new THREE.Mesh(tier3);
    m3.position.y = 7.5;
    pylonGroup.add(m3);

    const tier4 = new THREE.BoxGeometry(1.6, 2.5, 1.6);
    const m4 = new THREE.Mesh(tier4);
    m4.position.y = 10.2;
    pylonGroup.add(m4);

    this.pylonGeometry = this.mergeGroupGeometries(pylonGroup);

    // 6 elevated pylons flanking the exterior grounds
    const pylonCount = tier === 'LOW' ? 4 : 6;
    this.pylonsInstancedMesh = new THREE.InstancedMesh(this.pylonGeometry, this.basaltPlinthMaterial, pylonCount);
    this.wireframePylonsMesh = new THREE.InstancedMesh(this.pylonGeometry, this.wireframeOverlayMaterial, pylonCount);

    const dummy = new THREE.Object3D();
    let idx = 0;

    const zPositions = [-4.0, 10.0, 24.0];
    const limit = pylonCount / 2;

    for (let i = 0; i < limit; i++) {
      const z = zPositions[i];

      // Left outer pylon
      dummy.position.set(-13.0, 0, z);
      dummy.updateMatrix();
      this.pylonsInstancedMesh.setMatrixAt(idx, dummy.matrix);
      this.wireframePylonsMesh.setMatrixAt(idx, dummy.matrix);
      idx++;

      // Right outer pylon
      dummy.position.set(13.0, 0, z);
      dummy.updateMatrix();
      this.pylonsInstancedMesh.setMatrixAt(idx, dummy.matrix);
      this.wireframePylonsMesh.setMatrixAt(idx, dummy.matrix);
      idx++;
    }

    this.pylonsInstancedMesh.instanceMatrix.needsUpdate = true;
    this.wireframePylonsMesh.instanceMatrix.needsUpdate = true;

    this.group.add(this.pylonsInstancedMesh);
    this.group.add(this.wireframePylonsMesh);
  }

  /**
   * Helper to bake multiple group children into a single BufferGeometry
   */
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

    // Calculate total vertices
    let totalPos = 0;
    let totalNorm = 0;

    geometries.forEach((g) => {
      const pos = g.getAttribute('position');
      if (pos) totalPos += pos.count * 3;
      const norm = g.getAttribute('normal');
      if (norm) totalNorm += norm.count * 3;
    });

    const mergedPositions = new Float32Array(totalPos);
    const mergedNormals = new Float32Array(totalNorm);

    let posOffset = 0;
    let normOffset = 0;

    geometries.forEach((g) => {
      const pos = g.getAttribute('position');
      if (pos) {
        mergedPositions.set(pos.array as Float32Array, posOffset);
        posOffset += pos.count * 3;
      }
      const norm = g.getAttribute('normal');
      if (norm) {
        mergedNormals.set(norm.array as Float32Array, normOffset);
        normOffset += norm.count * 3;
      }
      g.dispose();
    });

    const merged = new THREE.BufferGeometry();
    merged.setAttribute('position', new THREE.BufferAttribute(mergedPositions, 3));
    if (totalNorm > 0) {
      merged.setAttribute('normal', new THREE.BufferAttribute(mergedNormals, 3));
    } else {
      merged.computeVertexNormals();
    }

    return merged;
  }

  public setPerformanceTier(tier: PerformanceTier): void {
    if (this.currentTier === tier) return;
    this.currentTier = tier;

    // Clean up existing columns and pylons and rebuild for new tier
    if (this.columnsInstancedMesh) {
      this.group.remove(this.columnsInstancedMesh);
      disposeGeometry(this.columnGeometry);
    }
    if (this.pylonsInstancedMesh) {
      this.group.remove(this.pylonsInstancedMesh);
      if (this.wireframePylonsMesh) {
        this.group.remove(this.wireframePylonsMesh);
      }
      disposeGeometry(this.pylonGeometry);
    }

    this.buildColumns(tier);
    this.buildElevatedPylons(tier);
  }

  public update(delta: number, reducedMotion: boolean, visualMode: VisualModeController): void {
    const progress = visualMode.currentProgress;

    // Stone tint modulation: warm terracotta/obsidian <-> cool tech slate
    const mythicBasalt = new THREE.Color(0x141210);
    const systemBasalt = new THREE.Color(0x0a0e14);
    this.basaltPlinthMaterial.color.copy(mythicBasalt).lerp(systemBasalt, progress);

    const mythicShaft = new THREE.Color(0x1c1814);
    const systemShaft = new THREE.Color(0x0c1117);
    this.templeShaftMaterial.color.copy(mythicShaft).lerp(systemShaft, progress);

    const mythicCapital = new THREE.Color(0x523d21);
    const systemCapital = new THREE.Color(0x182028);
    this.capitalBronzeMaterial.color.copy(mythicCapital).lerp(systemCapital, progress);
    this.capitalBronzeMaterial.emissiveIntensity = 0.15 * (1.0 - progress * 0.7);

    // Accent gold <-> telemetry cyan
    this.accentGoldMaterial.color.copy(visualMode.currentColor);

    // Dais focal pad emissive glow
    const mythicEmissive = new THREE.Color(0x553008);
    const systemEmissive = new THREE.Color(0x003b44);
    this.daisCoreMaterial.emissive.copy(mythicEmissive).lerp(systemEmissive, progress);

    // Wireframe overlay in System mode
    this.wireframeOverlayMaterial.opacity = progress * 0.4;
  }

  public dispose(): void {
    disposeObject3D(this.group);
    disposeGeometry(this.columnGeometry);
    disposeGeometry(this.plinthGeometry);
    disposeGeometry(this.axialPathGeometry);
    disposeGeometry(this.daisGeometry);
    disposeGeometry(this.architraveGeometry);
    disposeGeometry(this.pylonGeometry);
    disposeGeometry(this.floorMandalaGeometry);
    disposeMaterial(this.basaltPlinthMaterial);
    disposeMaterial(this.templeShaftMaterial);
    disposeMaterial(this.capitalBronzeMaterial);
    disposeMaterial(this.accentGoldMaterial);
    disposeMaterial(this.darkGraniteMaterial);
    disposeMaterial(this.daisCoreMaterial);
    disposeMaterial(this.wireframeOverlayMaterial);
    disposeMaterial(this.floorMandalaMaterial);
    this.noiseTextures.forEach(t => t.dispose());
    this.noiseTextures = [];
  }
}
