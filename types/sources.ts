/**
 * Ancient Tech Decoded — Multidimensional Evidence & Source Schema
 * Strict separation of primary textual evidence, archaeological consensus,
 * scientific phenomena, analogical parallels, and speculative models.
 */

export type EvidenceType =
  | 'TEXTUAL'          // Primary Sanskrit texts (Mahabharata, Vedas, etc.)
  | 'HISTORICAL'       // Ancient chronicles, inscriptions, historical records
  | 'ARCHAEOLOGICAL'   // Excavations, carbon dating, material stratigraphy
  | 'SCIENTIFIC'       // Validated laws of physics, chemistry, geology
  | 'SPECULATIVE';     // Hypothetical engineering and systems thought experiments

export type Confidence =
  | 'HIGH'             // Direct passage attestation or broad scholarly consensus
  | 'MODERATE'         // Supported by notable scholars, open questions remain
  | 'LOW'              // Tentative translation or contested reading
  | 'UNKNOWN';         // Unverified, untranslated, or insufficient data

export type ClaimStatus =
  | 'SUPPORTED'        // Directly established by cited verified passage
  | 'CONTESTED'        // Subject to active scholarly debate
  | 'ANALOGICAL'       // Conceptual parallel; not a historical equivalence
  | 'HYPOTHETICAL'     // Exploratory engineering / speculative model
  | 'UNSUPPORTED';     // Internet myth or claim lacking credible evidence

export type VisualStatus =
  | 'DOCUMENTED'       // Direct historical or archaeological artifact
  | 'RECONSTRUCTED'    // Scholarly physical reconstruction from material remains
  | 'INTERPRETIVE'     // Visual art inspired by textual descriptions (no material artifact)
  | 'SPECULATIVE'      // Hypothetical technological / futurist conceptual model
  | 'FICTIONAL';       // Creative narrative visualization

export type ValidationStatus =
  | 'VERIFIED'           // Authenticated in BORI Critical Edition / primary witness
  | 'NEEDS_REVIEW'       // Textual reference exists but variant or verse needs confirmation
  | 'DISPUTED_NUMBERING' // Authenticated text with known numbering divergence across recensions
  | 'INSUFFICIENT_SOURCE';// Disqualified from factual presentation

export type SourceType =
  | 'primary-text'
  | 'translation'
  | 'academic'
  | 'archaeological'
  | 'scientific'
  | 'secondary';

export interface AssetProvenance {
  id: string;
  type: 'procedural' | 'original' | 'licensed' | 'public-domain' | 'generated';
  creator?: string;
  license: string;
  attribution: string;
  visualStatus: VisualStatus;
  notes?: string;
}

export interface Source {
  id: string;
  title: string;
  type: SourceType;
  author?: string;
  translator?: string;
  publication?: string;
  publisher?: string;
  year?: number;
  citation?: string;
  url?: string;
  description?: string;
  scholarlyStanding?: string;
}

export interface PassageReference {
  id: string;
  sourceId: string;
  work: string;            // e.g. "Mahābhārata"
  edition: string;         // e.g. "BORI Critical Edition (Vol. 11)"
  parva?: string;          // e.g. "Sauptika Parva"
  canto?: string;
  chapter: number | string;// e.g. 15
  section?: number | string;
  verse: string;          // e.g. "10.15.23"
  concordance?: string;    // e.g. "Gita Press 10.15.23, Ganguli Section 15"
  originalText: string;    // Devanagari Sanskrit
  transliteration: string; // IAST
  translation: string;
  literalReadingNotes?: string;
  validationStatus: ValidationStatus;
  provenanceNotes?: string;
}

export interface Claim {
  id: string;
  statement: string;
  evidenceType: EvidenceType;
  confidence: Confidence;
  status: ClaimStatus;
  sourceIds: string[];
  passageIds: string[];    // Direct link to validated passages
  notes?: string;
  validationStatus: ValidationStatus;
}

export interface Interpretation {
  id: string;
  statement: string;
  basisClaimIds: string[];
  supportingArguments: string[];
  counterArguments: string[];
  sourceIds: string[];
  status: 'analogical' | 'hypothetical' | 'contested';
}

/** Future Graph visualization capability */
export interface EvidenceGraphNode {
  id: string;
  type:
    | 'artifact'
    | 'primary-text'
    | 'passage'
    | 'claim'
    | 'interpretation'
    | 'scientific-analogy'
    | 'counterargument'
    | 'source';
  label: string;
  status?: ClaimStatus;
  evidenceType?: EvidenceType;
  validationStatus?: ValidationStatus;
  connections: string[]; // Directed edge target IDs
}
