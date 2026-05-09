import { DimensionScore, DimensionDetail, FitResult, PhaseNorm, ScalingParams } from '@/types/greiner';
import { classify } from '@/engine/classifier';

export function computePhaseFit(
  scores: Record<string, DimensionScore>,
  phaseNorm: PhaseNorm,
  scalingParams: ScalingParams,
): FitResult {
  let similaritySum = 0;
  let weightSum = 0;
  const dimensionDetails: DimensionDetail[] = [];

  for (const dim of phaseNorm.dimensions) {
    const candidateScore = scores[dim.dimensionId] ?? 0 as DimensionScore;
    const distance = Math.abs(candidateScore - dim.target);

    let similarity = 0;
    if (dim.weight > 0) {
      similarity = (1 - distance / 6) * dim.weight;
      similaritySum += similarity;
      weightSum += dim.weight;
    }

    dimensionDetails.push({
      dimensionId: dim.dimensionId,
      candidateScore: candidateScore as DimensionScore,
      target: dim.target,
      weight: dim.weight,
      distance,
      similarity,
    });
  }

  const rawFit = weightSum > 0 ? similaritySum / weightSum : 0;
  const fitPercentRaw = scalingParams.a * rawFit - scalingParams.b;
  const fitPercent = Math.round(Math.max(0, Math.min(100, fitPercentRaw)));
  const classification = classify(fitPercent);

  return {
    phaseId: phaseNorm.phaseId,
    phaseName: phaseNorm.phaseName,
    rawFit,
    fitPercent,
    classification,
    dimensionDetails,
  };
}

export function computeAllPhases(
  scores: Record<string, DimensionScore>,
  phaseNorms: PhaseNorm[],
  scalingParams: ScalingParams,
): FitResult[] {
  return phaseNorms
    .map(norm => computePhaseFit(scores, norm, scalingParams))
    .sort((a, b) => b.fitPercent - a.fitPercent);
}
