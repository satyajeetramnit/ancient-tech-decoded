import * as THREE from 'three';

/**
 * Reusable WebGL & Three.js Resource Disposal Utilities
 * Guarantees that textures, geometries, materials, and render targets
 * are explicitly released from GPU memory on unmount or scene change.
 */

export function disposeTexture(texture: THREE.Texture | null | undefined): void {
  if (!texture) return;
  texture.dispose();
}

export function disposeMaterial(material: THREE.Material | THREE.Material[] | null | undefined): void {
  if (!material) return;

  if (Array.isArray(material)) {
    material.forEach((m) => disposeMaterial(m));
    return;
  }

  // Dispose all associated textures attached to material uniforms
  const record = material as unknown as Record<string, unknown>;
  Object.keys(record).forEach((prop) => {
    const value = record[prop];
    if (value && typeof value === 'object' && 'isTexture' in value && (value as { isTexture?: boolean }).isTexture) {
      disposeTexture(value as THREE.Texture);
    }
  });

  material.dispose();
}

export function disposeGeometry(geometry: THREE.BufferGeometry | null | undefined): void {
  if (!geometry) return;
  geometry.dispose();
}

export function disposeObject3D(root: THREE.Object3D | null | undefined): void {
  if (!root) return;

  root.traverse((node) => {
    if ('geometry' in node && node.geometry) {
      disposeGeometry(node.geometry as THREE.BufferGeometry);
    }
    if ('material' in node && node.material) {
      disposeMaterial(node.material as THREE.Material | THREE.Material[]);
    }
  });

  // Clear children
  while (root.children.length > 0) {
    const child = root.children[0];
    root.remove(child);
    disposeObject3D(child);
  }
}

export function disposeRenderTarget(target: THREE.WebGLRenderTarget | null | undefined): void {
  if (!target) return;
  if (target.texture) {
    disposeTexture(target.texture);
  }
  target.dispose();
}

export function disposeScene(scene: THREE.Scene | null | undefined): void {
  if (!scene) return;
  disposeObject3D(scene);
}

export function disposeRenderer(renderer: THREE.WebGLRenderer | null | undefined): void {
  if (!renderer) return;
  renderer.dispose();
  renderer.forceContextLoss();
  const canvas = renderer.domElement;
  if (canvas && canvas.parentElement) {
    canvas.parentElement.removeChild(canvas);
  }
}
