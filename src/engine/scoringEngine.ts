import {
  DimensionId,
  DimensionScore,
  DimensionDetail,
  FitResult,
  PhaseConfig,
  ScoringOptions,
  ModelConfig,
  WEIGHT_VALUES,
} from '@/types/greiner';
import { classify } from '@/engine/classifier';
import { DIMENSION_IDS } from '@/data/defaultConfig';

const NEUTRAL_CELL = { target: 0 as DimensionScore, weight: 'Neutral' as const, rationale: '' };

const SCALE_SPAN = 6; // -3..+3

/** Symmetric distance-to-target fit, in [0,1]. 1 = exact, 0 = opposite extreme. */
export function baseFit(score: number, target: number): number {
  return 1 - Math.abs(score - target) / SCALE_SPAN;
}

/**
 * How far the candidate sits on the OPPOSITE pole from the target, 0..3.
 * 0 when the target is neutral, or when the candidate is on the target's side
 * (or at neutral). Only the opposite pole counts.
 */
export function wrongPoleAmount(score: number, target: number): number {
  if (target > 0) return Math.max(0, -score);
  if (target < 0) return Math.max(0, score);
  return 0;
}

/**
 * Penalized per-dimension fit, in [0,1].
 * penalty = 0 → pure symmetric distance.
 * penalty > 0 → subtract up to `penalty` extra credit when fully on the
 * opposite pole (proportional to wrongPoleAmount / 3).
 */
export function dimensionFit(score: number, target: number, penalty: number): number {
  const g0 = baseFit(score, target);
  if (penalty <= 0) return g0;
  const extra = penalty * (wrongPoleAmount(score, target) / 3);
  return Math.max(0, Math.min(1, g0 - extra));
}

/** Worst achievable fit for a dimension (used as the normalization floor). */
function worstFit(target: number, penalty: number): number {
  // Opposite extreme is worst for non-zero targets; for target 0 either ±3 is
  // equally worst. Take the min over both extremes to be safe.
  return Math.min(dimensionFit(-3, target, penalty), dimensionFit(3, target, penalty));
}

export function computePhaseFit(
  scores: Record<DimensionId, DimensionScore>,
  phase: PhaseConfig,
  scoring: ScoringOptions,
  bands: ModelConfig['bands'],
): FitResult {
  const penalty = scoring.wrongPolePenalty;
  let sumWeightedFit = 0;
  let sumWeights = 0;
  let sumWeightedWorst = 0;
  const dimensionDetails: DimensionDetail[] = [];
  const criticalMismatches: DimensionId[] = [];

  // Iterate the canonical 14 dimensions only — ignore any stray keys an
  // imported config might carry, and tolerate a missing one as Neutral.
  for (const dimId of DIMENSION_IDS) {
    const cell = phase.dimensions[dimId] ?? NEUTRAL_CELL;
    const score = (scores[dimId] ?? 0) as DimensionScore;
    const weight = WEIGHT_VALUES[cell.weight];
    const fit = dimensionFit(score, cell.target, penalty);
    const g0 = baseFit(score, cell.target);
    const onWrongPole = wrongPoleAmount(score, cell.target) > 0;

    if (weight > 0) {
      sumWeightedFit += weight * fit;
      sumWeights += weight;
      sumWeightedWorst += weight * worstFit(cell.target, penalty);
      if (cell.weight === 'Critical' && onWrongPole) criticalMismatches.push(dimId);
    }

    dimensionDetails.push({
      dimensionId: dimId,
      candidateScore: score,
      target: cell.target,
      weightTier: cell.weight,
      weight,
      baseFit: g0,
      wrongPole: onWrongPole,
      fit,
      contribution: weight * fit,
    });
  }

  const rawRatio = sumWeights > 0 ? sumWeightedFit / sumWeights : 0;
  const floor = scoring.floorNormalize && sumWeights > 0 ? sumWeightedWorst / sumWeights : 0;
  const denom = 1 - floor;
  const normalized = denom > 0 ? (rawRatio - floor) / denom : rawRatio;
  const fitPercent = Math.round(Math.max(0, Math.min(100, normalized * 100)));

  return {
    phaseId: phase.phaseId,
    phaseName: phase.phaseName,
    phaseLabel: phase.phaseLabel,
    extrapolated: !!phase.extrapolated,
    fitPercent,
    classification: classify(fitPercent, bands),
    rawRatio,
    floor,
    criticalMismatches,
    dimensionDetails,
  };
}

/** Compute fit for all phases, in fixed Greiner order. */
export function computeAllPhases(
  scores: Record<DimensionId, DimensionScore>,
  config: ModelConfig,
  phaseOrder: FitResult['phaseId'][],
): FitResult[] {
  // The map key is authoritative for identity — override any mismatched
  // nested phaseId so results, lookups and React keys stay correct.
  return phaseOrder.map(phaseId => ({
    ...computePhaseFit(scores, config.phases[phaseId], config.scoring, config.bands),
    phaseId,
  }));
}
