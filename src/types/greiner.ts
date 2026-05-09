/** Score on -3 to +3 scale */
export type DimensionScore = -3 | -2 | -1 | 0 | 1 | 2 | 3;

/** Weight: 0=Neutral, 1=Supporting, 3=Critical */
export type DimensionWeight = 0 | 1 | 3;

/** Classification thresholds */
export type Classification = 'Strong' | 'Usable' | 'Risk' | 'Mismatch';

/** One dimension definition */
export interface DimensionDef {
  id: string;          // "D01" through "D14"
  index: number;       // 0-13
  leftTrait: string;   // e.g. "Analytical Thinking"
  rightTrait: string;  // e.g. "Intuitive Thinking"
  shortLabel: string;  // e.g. "Analytical vs Intuitive"
}

/** Per-dimension norm for a single phase */
export interface DimensionNorm {
  dimensionId: string;   // "D01" through "D14"
  target: DimensionScore;
  weight: DimensionWeight;
}

/** Complete norm profile for one Greiner phase */
export interface PhaseNorm {
  phaseId: string;       // "creativity", "direction", etc.
  phaseName: string;     // "Creativity", "Direction", etc.
  phaseLabel: string;    // Longer description e.g. "Creativity -- Speed & Innovation"
  dimensions: DimensionNorm[];  // Always 14 entries
}

/** Scoring result for one phase */
export interface FitResult {
  phaseId: string;
  phaseName: string;
  rawFit: number;        // 0-1 range before scaling
  fitPercent: number;    // 0-100 after linear scaling
  classification: Classification;
  dimensionDetails: DimensionDetail[];
}

/** Per-dimension breakdown within a phase fit calculation */
export interface DimensionDetail {
  dimensionId: string;
  candidateScore: DimensionScore;
  target: DimensionScore;
  weight: DimensionWeight;
  distance: number;      // |score - target|
  similarity: number;    // (1 - distance/6) * weight
}

/** A candidate profile with scores and expected results */
export interface CandidateProfile {
  id: string;            // "K1", "K2", "K3"
  name: string;          // Display name
  scores: Record<string, DimensionScore>;  // keyed by "D01"-"D14"
  expectedRankings: ExpectedRanking[];
}

/** Expected phase ranking for validation */
export interface ExpectedRanking {
  phaseId: string;
  rank: number;          // 1 = best fit
  expectedPercent: number;
  expectedClassification: Classification;
}

/** Linear scaling parameters */
export interface ScalingParams {
  a: number;  // slope
  b: number;  // intercept (subtracted: fit% = a*raw - b)
}
