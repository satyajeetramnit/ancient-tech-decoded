import { EpisodeState } from './episodeState';

export interface WorldChoreography {
  /** Multiplier for directional + ambient light intensity (0.0–1.5) */
  lightingIntensity: number;
  /** FogExp2 density override for this state */
  fogDensity: number;
  /** Artifact aura brightness (0.0 = dormant silhouette, 1.0 = full radiance) */
  artifactAura: number;
  /** Ambient incense/dust particle opacity (0.0–1.0) */
  ambientDustOpacity: number;
}

export interface CameraWaypoint {
  state: EpisodeState;
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
  damping: number; // Interpolation damping coefficient (lower = smoother/slower)
  choreography: WorldChoreography;
}

export const CAMERA_WAYPOINTS: Record<EpisodeState, CameraWaypoint> = {
  intro: {
    state: 'intro',
    position: [0, 10.0, 32.0],
    target: [0, 2.0, 0.0],
    fov: 48,
    damping: 2.0,
    choreography: { lightingIntensity: 0.6, fogDensity: 0.028, artifactAura: 0.0, ambientDustOpacity: 0.2 },
  },
  temple: {
    state: 'temple',
    position: [0, 3.2, 16.0],
    target: [0, 2.5, 0.0],
    fov: 46,
    damping: 2.2,
    choreography: { lightingIntensity: 0.8, fogDensity: 0.024, artifactAura: 0.15, ambientDustOpacity: 0.5 },
  },
  templeApproach: {
    state: 'templeApproach',
    position: [0, 1.8, 24.0],
    target: [0, 2.0, 0.0],
    fov: 48,
    damping: 1.8,
    choreography: { lightingIntensity: 0.75, fogDensity: 0.026, artifactAura: 0.1, ambientDustOpacity: 0.55 },
  },
  templeReveal: {
    state: 'templeReveal',
    position: [0, 3.5, 14.0],
    target: [0, 5.2, -5.0],
    fov: 52,
    damping: 1.9,
    choreography: { lightingIntensity: 0.85, fogDensity: 0.022, artifactAura: 0.2, ambientDustOpacity: 0.6 },
  },
  templeSanctum: {
    state: 'templeSanctum',
    position: [0, 1.7, 7.5],
    target: [0, 1.2, 0.0],
    fov: 42,
    damping: 2.2,
    choreography: { lightingIntensity: 0.9, fogDensity: 0.02, artifactAura: 0.4, ambientDustOpacity: 0.65 },
  },
  artifact: {
    state: 'artifact',
    position: [0.6, 2.4, 4.8],
    target: [0, 2.3, 0.0],
    fov: 40,
    damping: 2.6,
    choreography: { lightingIntensity: 0.7, fogDensity: 0.018, artifactAura: 1.0, ambientDustOpacity: 0.4 },
  },
  myth: {
    state: 'myth',
    position: [2.8, 2.6, 5.4],
    target: [0, 2.3, 0.0],
    fov: 42,
    damping: 2.5,
    choreography: { lightingIntensity: 0.75, fogDensity: 0.02, artifactAura: 0.7, ambientDustOpacity: 0.5 },
  },
  text: {
    state: 'text',
    position: [-2.6, 2.1, 4.6],
    target: [0.4, 2.3, 0.0],
    fov: 38,
    damping: 2.4,
    choreography: { lightingIntensity: 0.6, fogDensity: 0.016, artifactAura: 0.5, ambientDustOpacity: 0.25 },
  },
  phenomenology: {
    state: 'phenomenology',
    position: [2.2, 3.6, 5.8],
    target: [0, 2.3, 0.0],
    fov: 44,
    damping: 2.6,
    choreography: { lightingIntensity: 0.8, fogDensity: 0.02, artifactAura: 0.6, ambientDustOpacity: 0.45 },
  },
  reconstruction: {
    state: 'reconstruction',
    position: [0, 5.2, 3.6],
    target: [0, 2.3, 0.0],
    fov: 42,
    damping: 2.8,
    choreography: { lightingIntensity: 0.85, fogDensity: 0.018, artifactAura: 0.85, ambientDustOpacity: 0.35 },
  },
  science: {
    state: 'science',
    position: [3.6, 2.4, 4.2],
    target: [0, 2.3, 0.0],
    fov: 38,
    damping: 2.5,
    choreography: { lightingIntensity: 0.7, fogDensity: 0.016, artifactAura: 0.75, ambientDustOpacity: 0.3 },
  },
  skeptic: {
    state: 'skeptic',
    position: [-3.5, -0.4, 5.5],
    target: [0, 0.3, 0.0],
    fov: 42,
    damping: 2.6,
    choreography: { lightingIntensity: 0.55, fogDensity: 0.02, artifactAura: 0.3, ambientDustOpacity: 0.3 },
  },
  'reality-check': {
    state: 'reality-check',
    position: [0, 0.2, 10.5],
    target: [0, 0.0, 0.0],
    fov: 35,
    damping: 2.0,
    choreography: { lightingIntensity: 0.5, fogDensity: 0.014, artifactAura: 0.2, ambientDustOpacity: 0.15 },
  },
  'what-if': {
    state: 'what-if',
    position: [0, 3.5, 14.0],
    target: [0, 0.0, 0.0],
    fov: 48,
    damping: 2.4,
    choreography: { lightingIntensity: 0.65, fogDensity: 0.022, artifactAura: 0.4, ambientDustOpacity: 0.3 },
  },
  exit: {
    state: 'exit',
    position: [0, 8.0, 24.0],
    target: [0, 0.0, 0.0],
    fov: 54,
    damping: 2.0,
    choreography: { lightingIntensity: 0.5, fogDensity: 0.03, artifactAura: 0.05, ambientDustOpacity: 0.15 },
  },
};
