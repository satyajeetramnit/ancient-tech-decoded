/**
 * Ancient Tech Decoded — Performance Tier Architecture
 */

export type PerformanceTier = 'HIGH' | 'MEDIUM' | 'LOW';

export interface PerformanceConfig {
  tier: PerformanceTier;
  maxPixelRatio: number;
  particleCount: number;
  enablePostProcessing: boolean;
  enableShadows: boolean;
  enableVolumetricFog: boolean;
  textureAnisotropy: number;
  targetFPS: number;
}

export const PERFORMANCE_CONFIGS: Record<PerformanceTier, PerformanceConfig> = {
  HIGH: {
    tier: 'HIGH',
    maxPixelRatio: 2.0,
    particleCount: 600,
    enablePostProcessing: true,
    enableShadows: true,
    enableVolumetricFog: true,
    textureAnisotropy: 8,
    targetFPS: 60,
  },
  MEDIUM: {
    tier: 'MEDIUM',
    maxPixelRatio: 1.5,
    particleCount: 300,
    enablePostProcessing: true,
    enableShadows: false,
    enableVolumetricFog: false,
    textureAnisotropy: 4,
    targetFPS: 60,
  },
  LOW: {
    tier: 'LOW',
    maxPixelRatio: 1.0,
    particleCount: 100,
    enablePostProcessing: false,
    enableShadows: false,
    enableVolumetricFog: false,
    textureAnisotropy: 1,
    targetFPS: 30,
  },
};
