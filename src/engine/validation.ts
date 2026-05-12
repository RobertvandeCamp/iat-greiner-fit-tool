import { CandidateProfile, FitResult, PhaseNorm } from '@/types/greiner';
import { computeAllPhases } from '@/engine/scoringEngine';
import { REFERENCE_CANDIDATES } from '@/data/referenceCandidates';

export interface ValidationResult {
  candidateId: string;
  rankingMatch: boolean;
  classificationMatches: number;
  totalPhases: number;
  computedResults: FitResult[];
  expectedRankings: CandidateProfile['expectedRankings'];
}

export interface FullValidationResult {
  candidates: ValidationResult[];
  allRankingsMatch: boolean;
  classificationMatchCount: number;
  totalClassifications: number;
  passed: boolean;
}

export function validateCandidate(
  candidate: CandidateProfile,
  phaseNorms: PhaseNorm[],
): ValidationResult {
  const computedResults = computeAllPhases(candidate.scores, phaseNorms);

  // Check ranking order: sort computed by fitPercent desc, compare against expected
  const computedOrder = [...computedResults]
    .sort((a, b) => b.fitPercent - a.fitPercent)
    .map(r => r.phaseId);
  const expectedOrder = [...candidate.expectedRankings]
    .sort((a, b) => a.rank - b.rank)
    .map(e => e.phaseId);

  const rankingMatch = computedOrder.every((phaseId, i) => phaseId === expectedOrder[i]);

  // Count classification matches
  let classificationMatches = 0;
  for (const expected of candidate.expectedRankings) {
    const computed = computedResults.find(r => r.phaseId === expected.phaseId);
    if (computed && computed.classification === expected.expectedClassification) {
      classificationMatches++;
    }
  }

  return {
    candidateId: candidate.id,
    rankingMatch,
    classificationMatches,
    totalPhases: phaseNorms.length,
    computedResults,
    expectedRankings: candidate.expectedRankings,
  };
}

export function validateAllCandidates(
  candidates: CandidateProfile[],
  phaseNorms: PhaseNorm[],
): FullValidationResult {
  const results = candidates.map(c => validateCandidate(c, phaseNorms));
  const allRankingsMatch = results.every(r => r.rankingMatch);
  const classificationMatchCount = results.reduce((sum, r) => sum + r.classificationMatches, 0);
  const totalClassifications = results.reduce((sum, r) => sum + r.totalPhases, 0);

  return {
    candidates: results,
    allRankingsMatch,
    classificationMatchCount,
    totalClassifications,
    passed: allRankingsMatch && classificationMatchCount >= 16,
  };
}

// Convenience: validate against the built-in reference candidates
export { REFERENCE_CANDIDATES };
