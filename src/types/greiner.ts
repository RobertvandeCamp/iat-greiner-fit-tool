/** Score on -3 to +3 scale */
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

/** Qualitative weight from v2 spec: ++ strong preference, + preference, 0 neutral, - contra, -- strong contra */
export type V2Qualitative = '++' | '+' | '0' | '-' | '--';

/** Target direction: -1 = negative pole optimal, 0 = midpoint optimal, +1 = positive pole optimal */
export type V2Target = -1 | 0 | 1;

/** Per-phase per-dimension specification from v2 spec */
export interface PhaseDimensionSpec {
  qualitative: V2Qualitative;
  numeric: 3 | 2 | 0 | -2 | -4;
  target: V2Target;
}

/** One dimension definition */
export interface DimensionDef {
  id: DimensionId;
  index: number;       // 0-13
  leftTrait: string;   // e.g. "Analytical Thinking"
  rightTrait: string;  // e.g. "Intuitive Thinking"
  shortLabel: string;  // e.g. "Analytical vs Intuitive"
}

/** Per-dimension norm for a single phase */
export interface DimensionNorm {
  dimensionId: DimensionId;
  spec: PhaseDimensionSpec;
}

/** Complete norm profile for one Greiner phase */
export interface PhaseNorm {
  phaseId: GreinerPhase;
  phaseName: string;     // "Creativity", "Direction", etc.
  phaseLabel: string;    // Longer description e.g. "Creativity -- Speed & Innovation"
  dimensions: DimensionNorm[];  // Always 14 entries
}

/** Classification labels in Dutch per v2 spec */
export type Classification = 'Sterke fit' | 'Goede fit' | 'Risicofit' | 'Mismatch';

/** Scoring result for one phase */
export interface FitResult {
  phaseId: GreinerPhase;
  phaseName: string;
  fitPercent: number;    // 0-100, computed as round(raw/max*100)
  classification: Classification;
  dimensionDetails: DimensionDetail[];
}

/** Per-dimension breakdown within a phase fit calculation */
export interface DimensionDetail {
  dimensionId: DimensionId;
  candidateScore: DimensionScore;
  target: V2Target;
  importance: number;    // abs(numeric weight)
  alignment: number;     // 0-1, direction-based alignment score
  contribution: number;  // importance * alignment
}

/** A candidate profile with scores and expected results */
export interface CandidateProfile {
  id: string;
  name: string;
  scores: Record<DimensionId, DimensionScore>;
  expectedRankings: ExpectedRanking[];
}

/** Expected phase ranking for validation */
export interface ExpectedRanking {
  phaseId: GreinerPhase;
  rank: number;          // 1 = best fit
  expectedPercent: number;
  expectedClassification: Classification;
}
