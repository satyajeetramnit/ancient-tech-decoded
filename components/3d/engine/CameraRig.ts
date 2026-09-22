import * as THREE from 'three';
import { EpisodeState } from '@/types/episodeState';
import { CAMERA_WAYPOINTS, CameraWaypoint, WorldChoreography } from '@/types/camera';

/**
 * CameraRig: Deterministic Storytelling Camera System
 * Smoothly interpolates position, look-at target, field-of-view, and world choreography
 * across all episode states.
 * Respects prefers-reduced-motion by suppressing aggressive camera movement and parallax.
 */
export class CameraRig {
  public camera: THREE.PerspectiveCamera;
  private currentWaypoint: CameraWaypoint;
  private targetPosition: THREE.Vector3;
  private currentTargetLookAt: THREE.Vector3;
  private targetLookAt: THREE.Vector3;
  private currentFov: number;
  private targetFov: number;

  /** Current interpolated choreography values for the environment to consume */
  public choreography: WorldChoreography;
  private targetChoreography: WorldChoreography;

  public reducedMotion: boolean = false;
  private mouseParallax: THREE.Vector2 = new THREE.Vector2(0, 0);

  constructor(camera: THREE.PerspectiveCamera, initialState: EpisodeState = 'intro') {
    this.camera = camera;
    this.currentWaypoint = CAMERA_WAYPOINTS[initialState] || CAMERA_WAYPOINTS.intro;

    this.targetPosition = new THREE.Vector3(...this.currentWaypoint.position);
    this.currentTargetLookAt = new THREE.Vector3(...this.currentWaypoint.target);
    this.targetLookAt = new THREE.Vector3(...this.currentWaypoint.target);

    this.currentFov = this.currentWaypoint.fov;
    this.targetFov = this.currentWaypoint.fov;

    // Initialize choreography
    this.choreography = { ...this.currentWaypoint.choreography };
    this.targetChoreography = { ...this.currentWaypoint.choreography };

    // Set initial position
    this.camera.position.copy(this.targetPosition);
    this.camera.lookAt(this.currentTargetLookAt);
    this.camera.fov = this.currentFov;
    this.camera.updateProjectionMatrix();
  }

  public setState(state: EpisodeState): void {
    const waypoint = CAMERA_WAYPOINTS[state];
    if (!waypoint) return;

    this.currentWaypoint = waypoint;
    this.targetPosition.set(...waypoint.position);
    this.targetLookAt.set(...waypoint.target);
    this.targetFov = waypoint.fov;
    this.targetChoreography = { ...waypoint.choreography };
  }

  public setMouseParallax(normalizedX: number, normalizedY: number): void {
    if (this.reducedMotion) {
      this.mouseParallax.set(0, 0);
      return;
    }
    // Subtle, restrained parallax (max 0.25 units)
    this.mouseParallax.set(normalizedX * 0.25, normalizedY * 0.15);
  }

  public update(delta: number): void {
    const damping = this.reducedMotion ? 1.0 : this.currentWaypoint.damping;
    // Exponential smoothing factor: 1 - e^(-damping * dt)
    const factor = Math.min(1.0, 1.0 - Math.exp(-damping * delta * 2.5));

    // Calculate desired position including parallax
    const desiredPos = this.targetPosition.clone();
    if (!this.reducedMotion) {
      desiredPos.x += this.mouseParallax.x;
      desiredPos.y += this.mouseParallax.y;
    }

    // Smoothly interpolate position
    this.camera.position.lerp(desiredPos, factor);

    // Smoothly interpolate lookAt target
    this.currentTargetLookAt.lerp(this.targetLookAt, factor);
    this.camera.lookAt(this.currentTargetLookAt);

    // Smoothly interpolate FOV
    if (Math.abs(this.camera.fov - this.targetFov) > 0.05) {
      this.camera.fov += (this.targetFov - this.camera.fov) * factor;
      this.camera.updateProjectionMatrix();
    }

    // Smoothly interpolate world choreography parameters
    const choreoFactor = Math.min(1.0, factor * 1.5); // slightly faster convergence for atmosphere
    this.choreography.lightingIntensity += (this.targetChoreography.lightingIntensity - this.choreography.lightingIntensity) * choreoFactor;
    this.choreography.fogDensity += (this.targetChoreography.fogDensity - this.choreography.fogDensity) * choreoFactor;
    this.choreography.artifactAura += (this.targetChoreography.artifactAura - this.choreography.artifactAura) * choreoFactor;
    this.choreography.ambientDustOpacity += (this.targetChoreography.ambientDustOpacity - this.choreography.ambientDustOpacity) * choreoFactor;
  }

  public dispose(): void {
    // No persistent listeners inside class; state is passive
  }
}
