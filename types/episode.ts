import { Claim, PassageReference, Source, VisualStatus, ClaimStatus, EvidenceType } from './sources';

export interface ArtifactMetadata {
  name: string;
  domain: string;
  iconGlyph: string;
  visualStatus: VisualStatus;
  visualDisclaimer: string;
}

export interface PhenomenologicalCategory {
  category: string;
  attributedProperties: string[];
}

export interface PotentialModernAnalogy {
  id: string;
  concept: string;
  observedSimilarities: string;
  criticalDifferences: string;
  whatResembles: string;
  whatDoesNotMatch: string;
  whatWouldBeRequired: string;
  whatTextDoesNotEstablish: string;
  evidenceType: EvidenceType;
  confidence: 'HIGH' | 'MODERATE' | 'LOW' | 'UNKNOWN';
  status: ClaimStatus;
  sourceIds: string[];
  motivatedByClaimIds: string[];
}

export interface ScientificStressTest {
  establishedScientificPrinciples: string[];
  materialAndPhysicalConstraints: string[];
  unresolvedQuestions: string[];
}

export interface DialecticPerspective {
  perspective: string;
  thesis: string;
  keyPoints: string[];
  supportingClaimIds?: string[];
  challengingClaimIds?: string[];
  methodologicalNotes?: string[];
}

export interface Dialectics {
  interpreter: DialecticPerspective;
  skeptic: DialecticPerspective;
}

export interface RealityCheckItem {
  id: string;
  category: string;
  finding: string;
  explanation: string;
  badge: {
    type: EvidenceType;
    confidence: 'HIGH' | 'MODERATE' | 'LOW' | 'UNKNOWN';
    status: ClaimStatus;
  };
  claimIds?: string[];
  passageIds?: string[];
  sourceIds?: string[];
}

export interface RealityCheck {
  summary: string;
  matrix: RealityCheckItem[];
}

export interface SpeculativeOption {
  id: string;
  label: string;
  category?: string;
}

export interface WhatIfSandbox {
  disclaimer: string;
  energyOptions: SpeculativeOption[];
  deliveryOptions: SpeculativeOption[];
  yieldOptions: SpeculativeOption[];
}

export interface EpisodeData {
  id: string;
  title: string;
  subtitle: string;
  season: number;
  episode: number;
  artifact: ArtifactMetadata;
  sources: Source[];
  passages: PassageReference[];
  textualObservations: Claim[];
  phenomenology: PhenomenologicalCategory[];
  potentialModernAnalogies: PotentialModernAnalogy[];
  scientificStressTest: ScientificStressTest;
  dialectics: Dialectics;
  realityCheck: RealityCheck;
  whatIfSandbox: WhatIfSandbox;
}
