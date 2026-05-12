import { CandidateProfile, DimensionScore } from '@/types/greiner';

export const REFERENCE_CANDIDATES: CandidateProfile[] = [
  {
    id: 'K1',
    name: 'K1 (N.W.)',
    scores: {
      analytical_intuitive:      2  as DimensionScore,
      conceptual_practical:     -1  as DimensionScore,
      decisive_deliberate:       0  as DimensionScore,
      assertive_reflective:      0  as DimensionScore,
      sociable_reserved:         1  as DimensionScore,
      persuasive_dialogue:       0  as DimensionScore,
      performance_sustainable:   0  as DimensionScore,
      careful_flexible:          0  as DimensionScore,
      adaptive_consistent:      -2  as DimensionScore,
      stable_expressive:         3  as DimensionScore,
      collaborative_independent: 0  as DimensionScore,
      integrity_contextual:      2  as DimensionScore,
      innovative_structured:    -2  as DimensionScore,
      open_principled:          -1  as DimensionScore,
    },
    // Marco v2 expected rankings per reveal_greiner_scoring_model_spec_v2.md
    // Candidate mapping: K1=N.W. (D-08)
    expectedRankings: [
      { phaseId: 'Creativity',    rank: 1, expectedPercent: 82, expectedClassification: 'Sterke fit' },
      { phaseId: 'Alliances',     rank: 2, expectedPercent: 71, expectedClassification: 'Goede fit' },
      { phaseId: 'Collaboration', rank: 3, expectedPercent: 56, expectedClassification: 'Goede fit' },
      { phaseId: 'Delegation',    rank: 4, expectedPercent: 49, expectedClassification: 'Risicofit' },
      { phaseId: 'Direction',     rank: 5, expectedPercent: 28, expectedClassification: 'Mismatch' },
      { phaseId: 'Coordination',  rank: 6, expectedPercent: 19, expectedClassification: 'Mismatch' },
    ],
  },
  {
    id: 'K2',
    name: 'K2 (K.D.)',
    scores: {
      analytical_intuitive:      3  as DimensionScore,
      conceptual_practical:      0  as DimensionScore,
      decisive_deliberate:      -2  as DimensionScore,
      assertive_reflective:     -2  as DimensionScore,
      sociable_reserved:         0  as DimensionScore,
      persuasive_dialogue:      -1  as DimensionScore,
      performance_sustainable:   2  as DimensionScore,
      careful_flexible:          0  as DimensionScore,
      adaptive_consistent:       1  as DimensionScore,
      stable_expressive:         0  as DimensionScore,
      collaborative_independent:-1  as DimensionScore,
      integrity_contextual:      0  as DimensionScore,
      innovative_structured:    -1  as DimensionScore,
      open_principled:          -2  as DimensionScore,
    },
    // Marco v2 expected rankings per reveal_greiner_scoring_model_spec_v2.md
    // Candidate mapping: K2=K.D. (D-08)
    expectedRankings: [
      { phaseId: 'Direction',     rank: 1, expectedPercent: 81, expectedClassification: 'Sterke fit' },
      { phaseId: 'Delegation',    rank: 2, expectedPercent: 73, expectedClassification: 'Goede fit' },
      { phaseId: 'Coordination',  rank: 3, expectedPercent: 68, expectedClassification: 'Goede fit' },
      { phaseId: 'Alliances',     rank: 4, expectedPercent: 44, expectedClassification: 'Risicofit' },
      { phaseId: 'Collaboration', rank: 5, expectedPercent: 39, expectedClassification: 'Mismatch' },
      { phaseId: 'Creativity',    rank: 6, expectedPercent: 34, expectedClassification: 'Mismatch' },
    ],
  },
  {
    id: 'K3',
    name: 'K3 (M.A.)',
    scores: {
      analytical_intuitive:     -3  as DimensionScore,
      conceptual_practical:      2  as DimensionScore,
      decisive_deliberate:      -1  as DimensionScore,
      assertive_reflective:     -2  as DimensionScore,
      sociable_reserved:         3  as DimensionScore,
      persuasive_dialogue:       1  as DimensionScore,
      performance_sustainable:  -1  as DimensionScore,
      careful_flexible:          0  as DimensionScore,
      adaptive_consistent:       0  as DimensionScore,
      stable_expressive:        -3  as DimensionScore,
      collaborative_independent: 2  as DimensionScore,
      integrity_contextual:      1  as DimensionScore,
      innovative_structured:    -3  as DimensionScore,
      open_principled:          -1  as DimensionScore,
    },
    // Marco v2 expected rankings per reveal_greiner_scoring_model_spec_v2.md
    // Candidate mapping: K3=M.A. (D-08)
    expectedRankings: [
      { phaseId: 'Delegation',    rank: 1, expectedPercent: 76, expectedClassification: 'Sterke fit' },
      { phaseId: 'Creativity',    rank: 2, expectedPercent: 72, expectedClassification: 'Goede fit' },
      { phaseId: 'Collaboration', rank: 3, expectedPercent: 69, expectedClassification: 'Goede fit' },
      { phaseId: 'Alliances',     rank: 4, expectedPercent: 61, expectedClassification: 'Goede fit' },
      { phaseId: 'Direction',     rank: 5, expectedPercent: 47, expectedClassification: 'Risicofit' },
      { phaseId: 'Coordination',  rank: 6, expectedPercent: 33, expectedClassification: 'Mismatch' },
    ],
  },
];
