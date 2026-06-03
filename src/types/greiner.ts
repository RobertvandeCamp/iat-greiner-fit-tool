/** Score on -3 to +3 scale (7-point: displayed as 1..7 = score + 4) */
export type DimensionScore = -3 | -2 | -1 | 0 | 1 | 2 | 3;

/** Greiner Growth Model phase names */
export type GreinerPhase =
  | 'Creativity'
  | 'Direction'
  | 'Delegation'
  | 'Coordination'
  | 'Collaboration'
  | 'Alliances';

/** Semantic dimension identifiers */
export type DimensionId =
  | 'analytical_intuitive'
  | 'conceptual_practical'
  | 'decisive_deliberate'
  | 'assertive_reflective'
  | 'sociable_reserved'
  | 'persuasive_dialogue'
  | 'performance_sustainable'
  | 'careful_flexible'
  | 'adaptive_consistent'
  | 'stable_expressive'
  | 'collaborative_independent'
  | 'integrity_contextual'
  | 'innovative_structured'
  | 'open_principled';

/** Weight tier. Values are fixed; only the per-dimension assignment is variable. */
export type WeightTier = 'Critical' | 'Supporting' | 'Neutral';

/** Fixed numeric value of each weight tier. */
export const WEIGHT_VALUES: Record<WeightTier, number> = {
  Critical: 3,
  Supporting: 1,
  Neutral: 0,
};

/** Editable per-phase, per-dimension config cell. */
export interface PhaseDimensionConfig {
  /** Target pole/strength the phase demands, -3..+3. */
  target: DimensionScore;
  /** Trait-activation relevance tier. */
  weight: WeightTier;
  /** Free-text justification (literature rationale). */
  rationale: string;
}

/** Complete editable config for one Greiner phase. */
export interface PhaseConfig {
  phaseId: GreinerPhase;
  phaseName: string;
  phaseLabel: string;
  /** True for Phase 6 (Alliances) — no Greiner table, theory-extrapolated. */
  extrapolated?: boolean;
  dimensions: Record<DimensionId, PhaseDimensionConfig>;
}

/** One classification band. `min` is the inclusive lower bound in fit %. */
export interface ClassificationBand {
  min: number;
  label: string;
}

/** Tunable scoring options. */
export interface ScoringOptions {
  /**
   * Wrong-pole penalty, 0..1. 0 = symmetric distance-to-target.
   * Higher values subtract extra fit credit when the candidate sits on the
   * opposite pole from the target (proportional to how far past neutral).
   */
  wrongPolePenalty: number;
  /**
   * When true, normalize each phase's raw fit against that phase's theoretical
   * floor (worst-possible profile) so 0% = maximally opposed, 100% = exact target.
   */
  floorNormalize: boolean;
}

/** The full, editable model configuration. */
export interface ModelConfig {
  version: number;
  phases: Record<GreinerPhase, PhaseConfig>;
  bands: ClassificationBand[];
  scoring: ScoringOptions;
}

/** One dimension definition (static metadata). */
export interface DimensionDef {
  id: DimensionId;
  index: number;       // 0-13
  leftTrait: string;   // negative-pole trait (score -3)
  rightTrait: string;  // positive-pole trait (score +3)
  shortLabel: string;  // e.g. "Analytical vs Intuitive"
}

/** Classification label (text comes from the active band set). */
export type Classification = string;

/** Per-dimension breakdown within a phase fit calculation. */
export interface DimensionDetail {
  dimensionId: DimensionId;
  candidateScore: DimensionScore;
  target: DimensionScore;
  weightTier: WeightTier;
  weight: number;        // WEIGHT_VALUES[weightTier]
  baseFit: number;       // symmetric distance fit, 0..1
  wrongPole: boolean;    // candidate on opposite pole of a non-zero target
  fit: number;           // penalized fit, 0..1
  contribution: number;  // weight * fit
}

/** Scoring result for one phase. */
export interface FitResult {
  phaseId: GreinerPhase;
  phaseName: string;
  phaseLabel: string;
  extrapolated: boolean;
  fitPercent: number;    // 0-100
  classification: Classification;
  rawRatio: number;      // weighted-mean fit before floor-normalization
  floor: number;         // theoretical floor used for normalization (0 if disabled)
  /** Critical dimensions where the candidate is on the opposite pole. */
  criticalMismatches: DimensionId[];
  dimensionDetails: DimensionDetail[];
}
