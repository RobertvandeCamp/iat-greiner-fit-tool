import { DimensionId, DimensionScore, DimensionDetail, FitResult, PhaseNorm } from '@/types/greiner';
import { classify } from '@/engine/classifier';

/**
 * Compute direction-based alignment for a single dimension.
 *
 * - target != 0: alignment = (score * target + 3) / 6
 * - target == 0: alignment = 1 - abs(score) / 3
 *
 * Result is in [0, 1].
 */
function dimensionAlignment(score: DimensionScore, target: number): number {
  if (target !== 0) {
    return (score * target + 3) / 6;
  }
  return 1 - Math.abs(score) / 3;
}

export function computePhaseFit(
  scores: Record<DimensionId, DimensionScore>,
  phaseNorm: PhaseNorm,
): FitResult {
  let sumContributions = 0;
  let sumImportances = 0;
  const dimensionDetails: DimensionDetail[] = [];

  for (const dim of phaseNorm.dimensions) {
    const candidateScore = (scores[dim.dimensionId] ?? 0) as DimensionScore;
    const importance = Math.abs(dim.spec.numeric);
    const alignment = dimensionAlignment(candidateScore, dim.spec.target);

    let contribution = 0;
    if (importance !== 0) {
      contribution = importance * alignment;
      sumContributions += contribution;
      sumImportances += importance;
    }

    dimensionDetails.push({
      dimensionId: dim.dimensionId,
      candidateScore,
      target: dim.spec.target,
      importance,
      alignment,
      contribution,
    });
  }

  const rawRatio = sumImportances > 0 ? sumContributions / sumImportances : 0;
  const fitPercent = Math.round(Math.max(0, Math.min(100, rawRatio * 100)));
  const classification = classify(fitPercent);

  return {
    phaseId: phaseNorm.phaseId,
    phaseName: phaseNorm.phaseName,
    fitPercent,
    classification,
    dimensionDetails,
  };
}

export function computeAllPhases(
  scores: Record<DimensionId, DimensionScore>,
  phaseNorms: PhaseNorm[],
): FitResult[] {
  return phaseNorms.map(norm => computePhaseFit(scores, norm));
}
