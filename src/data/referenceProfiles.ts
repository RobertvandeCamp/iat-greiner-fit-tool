import { DimensionId, DimensionScore } from '@/types/greiner'
import { DIMENSIONS } from '@/data/dimensions'

/**
 * Quick-fill reference profiles for the Score Input step.
 *
 * These are the three example candidates used in earlier explorations (by their
 * initials). They are ONLY convenience presets to speed up manual testing /
 * calibration — the model is NOT calibrated against them and does not score
 * relative to them. Values are in dimension order (D1..D14) and mapped to the
 * canonical DimensionId keys so they can never drift out of order.
 */

function vec(scores: number[]): Record<DimensionId, DimensionScore> {
  return Object.fromEntries(
    DIMENSIONS.map((d, i) => [d.id, (scores[i] ?? 0) as DimensionScore]),
  ) as Record<DimensionId, DimensionScore>
}

export interface ReferenceProfile {
  id: string
  label: string
  scores: Record<DimensionId, DimensionScore>
}

//                          D1  D2  D3  D4  D5  D6  D7  D8  D9 D10 D11 D12 D13 D14
export const REFERENCE_PROFILES: ReferenceProfile[] = [
  { id: 'K1', label: 'K1 · N.W.', scores: vec([ 2, -1,  0,  0,  1,  0,  0,  0, -2,  3,  0,  2, -2, -1]) },
  { id: 'K2', label: 'K2 · K.D.', scores: vec([ 3,  0, -2, -2,  0, -1,  2,  0,  1,  0, -1,  0, -1, -2]) },
  { id: 'K3', label: 'K3 · M.A.', scores: vec([-3,  2, -1, -2,  3,  1, -1,  0,  0, -3,  2,  1, -3, -1]) },
]
