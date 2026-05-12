import { CandidateProfile, DimensionScore, Classification } from '@/types/greiner';

export const REFERENCE_CANDIDATES: CandidateProfile[] = [
  {
    id: 'K1',
    name: 'K1 (N.W.)',
    scores: {
      D01: 2, D02: -1, D03: 0, D04: 0, D05: 1, D06: 0, D07: 0,
      D08: 0, D09: -2, D10: 3, D11: 0, D12: 2, D13: -2, D14: -1,
    } as Record<string, DimensionScore>,
    // Marco v2 expected rankings (display values -- what the expert assessment says SHOULD be)
    // Source: reveal_greiner_assessment_bundle_markdown.md v2
    // NOTE: Actual computed rankings differ (0/3 match) -- known limitation per D-02
    expectedRankings: [
      { phaseId: 'creativity',    rank: 1, expectedPercent: 82, expectedClassification: 'Strong' as Classification },
      { phaseId: 'alliances',     rank: 2, expectedPercent: 71, expectedClassification: 'Strong' as Classification },
      { phaseId: 'collaboration', rank: 3, expectedPercent: 56, expectedClassification: 'Usable' as Classification },
      { phaseId: 'delegation',    rank: 4, expectedPercent: 49, expectedClassification: 'Risk' as Classification },
      { phaseId: 'direction',     rank: 5, expectedPercent: 28, expectedClassification: 'Mismatch' as Classification },
      { phaseId: 'coordination',  rank: 6, expectedPercent: 19, expectedClassification: 'Mismatch' as Classification },
    ],
  },
  {
    id: 'K2',
    name: 'K2 (K.D.)',
    scores: {
      D01: 3, D02: 0, D03: -2, D04: -2, D05: 0, D06: -1, D07: 2,
      D08: 0, D09: 1, D10: 0, D11: -1, D12: 0, D13: -1, D14: -2,
    } as Record<string, DimensionScore>,
    // Marco v2 expected rankings (display values -- what the expert assessment says SHOULD be)
    // Source: reveal_greiner_assessment_bundle_markdown.md v2
    // NOTE: Actual computed rankings differ (0/3 match) -- known limitation per D-02
    expectedRankings: [
      { phaseId: 'direction',     rank: 1, expectedPercent: 81, expectedClassification: 'Strong' as Classification },
      { phaseId: 'delegation',    rank: 2, expectedPercent: 73, expectedClassification: 'Strong' as Classification },
      { phaseId: 'coordination',  rank: 3, expectedPercent: 68, expectedClassification: 'Strong' as Classification },
      { phaseId: 'alliances',     rank: 4, expectedPercent: 44, expectedClassification: 'Risk' as Classification },
      { phaseId: 'collaboration', rank: 5, expectedPercent: 39, expectedClassification: 'Risk' as Classification },
      { phaseId: 'creativity',    rank: 6, expectedPercent: 34, expectedClassification: 'Risk' as Classification },
    ],
  },
  {
    id: 'K3',
    name: 'K3 (M.A.)',
    scores: {
      D01: -3, D02: 2, D03: -1, D04: -2, D05: 3, D06: 1, D07: -1,
      D08: 0, D09: 0, D10: -3, D11: 2, D12: 1, D13: -3, D14: -1,
    } as Record<string, DimensionScore>,
    // Marco v2 expected rankings (display values -- what the expert assessment says SHOULD be)
    // Source: reveal_greiner_assessment_bundle_markdown.md v2
    // NOTE: Actual computed rankings differ (0/3 match) -- known limitation per D-02
    expectedRankings: [
      { phaseId: 'delegation',    rank: 1, expectedPercent: 76, expectedClassification: 'Strong' as Classification },
      { phaseId: 'creativity',    rank: 2, expectedPercent: 72, expectedClassification: 'Strong' as Classification },
      { phaseId: 'collaboration', rank: 3, expectedPercent: 69, expectedClassification: 'Strong' as Classification },
      { phaseId: 'alliances',     rank: 4, expectedPercent: 61, expectedClassification: 'Usable' as Classification },
      { phaseId: 'direction',     rank: 5, expectedPercent: 47, expectedClassification: 'Risk' as Classification },
      { phaseId: 'coordination',  rank: 6, expectedPercent: 33, expectedClassification: 'Mismatch' as Classification },
    ],
  },
];
