/**
 * Ancient Tech Decoded — Episode State Machine Architecture
 * Strict typed progression: 80% visual world, 20% contextual telemetry
 */

export type EpisodeState =
  | 'intro'          // Cosmic prologue & thematic hook
  | 'temple'         // Ancient Indian temple-inspired architectural entrance (legacy / overview)
  | 'templeApproach' // Sweeping axial approach along the monumental colonnade
  | 'templeReveal'   // Elevation looking up at stepped architectural towers and celestial mandala
  | 'templeSanctum'  // Inner sanctum framing the elevated dais (future Brahmastra location)
  | 'artifact'       // Reveal of the Brahmastra suspended in 3D containment
  | 'myth'           // Epic narration of the Kurukshetra standoff
  | 'text'           // Sanskrit shlokas, transliteration, translations & citations
  | 'phenomenology'  // Categorized physical, atmospheric & ecological attributes
  | 'reconstruction' // Transition: Mythic Mode -> System Schematics Mode
  | 'science'        // Material constraints, physical laws, potential modern analogies
  | 'skeptic'        // Dialectic: The Interpreter vs. The Skeptic
  | 'reality-check'  // Minimalist, high-legibility black-background audit matrix
  | 'what-if'        // Speculative engineering sandbox & order-of-magnitude analysis
  | 'exit';          // Return to The Celestial Archive portal map

export type RenderMode = 'mythic' | 'system';

export type PresentationMode = 'cinematic' | 'research';

export interface StateMetadata {
  state: EpisodeState;
  title: string;
  subtitle: string;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  renderMode: RenderMode;
  fogDensity: number;
  bloomIntensity: number;
  ambientTrack?: string;
}

export interface StateMachineContext {
  currentState: EpisodeState;
  previousState: EpisodeState | null;
  renderMode: RenderMode;
  presentationMode: PresentationMode;
  isSourcesOverlayOpen: boolean;
  isMuted: boolean;
  activePassageId: string | null;
  activeClaimId: string | null;
}
