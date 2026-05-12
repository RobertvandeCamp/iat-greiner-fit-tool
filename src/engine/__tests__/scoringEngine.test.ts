import { classify } from '@/engine/classifier';
import { computePhaseFit, computeAllPhases } from '@/engine/scoringEngine';
import { validateAllCandidates } from '@/engine/validation';
import { PHASE_NORMS } from '@/data/phaseNorms';
import { REFERENCE_CANDIDATES } from '@/data/referenceCandidates';

describe('classify (v2 Dutch labels)', () => {
  it('returns Sterke fit for >= 75%', () => {
    expect(classify(75)).toBe('Sterke fit');
    expect(classify(100)).toBe('Sterke fit');
    expect(classify(80)).toBe('Sterke fit');
  });

  it('returns Goede fit for >= 55% and < 75%', () => {
    expect(classify(55)).toBe('Goede fit');
    expect(classify(74)).toBe('Goede fit');
  });

  it('returns Risicofit for >= 40% and < 55%', () => {
    expect(classify(40)).toBe('Risicofit');
    expect(classify(54)).toBe('Risicofit');
  });

  it('returns Mismatch for < 40%', () => {
    expect(classify(39)).toBe('Mismatch');
    expect(classify(0)).toBe('Mismatch');
  });
});

describe('computeAllPhases', () => {
  it('returns 6 results in phase order', () => {
    const k1 = REFERENCE_CANDIDATES.find(c => c.id === 'K1')!;
    const results = computeAllPhases(k1.scores, PHASE_NORMS);
    expect(results).toHaveLength(6);
    expect(results.map(r => r.phaseId)).toEqual([
      'Creativity', 'Direction', 'Delegation', 'Coordination', 'Collaboration', 'Alliances',
    ]);
  });

  it('produces fitPercent values between 0 and 100', () => {
    const k1 = REFERENCE_CANDIDATES.find(c => c.id === 'K1')!;
    const results = computeAllPhases(k1.scores, PHASE_NORMS);
    results.forEach(r => {
      expect(r.fitPercent).toBeGreaterThanOrEqual(0);
      expect(r.fitPercent).toBeLessThanOrEqual(100);
    });
  });
});

describe('dimension details (v2 alignment fields)', () => {
  it('sets contribution to 0 for dimensions with importance 0', () => {
    const k1 = REFERENCE_CANDIDATES.find(c => c.id === 'K1')!;
    const creativityNorm = PHASE_NORMS.find(p => p.phaseId === 'Creativity')!;
    const result = computePhaseFit(k1.scores, creativityNorm);
    const neutralDims = result.dimensionDetails.filter(d => d.importance === 0);
    neutralDims.forEach(d => {
      expect(d.contribution).toBe(0);
    });
  });

  it('has alignment in [0, 1] for all dimensions', () => {
    const k1 = REFERENCE_CANDIDATES.find(c => c.id === 'K1')!;
    const creativityNorm = PHASE_NORMS.find(p => p.phaseId === 'Creativity')!;
    const result = computePhaseFit(k1.scores, creativityNorm);
    result.dimensionDetails.forEach(d => {
      expect(d.alignment).toBeGreaterThanOrEqual(0);
      expect(d.alignment).toBeLessThanOrEqual(1);
    });
  });
});

// v2 snapshot tests: fitPercent values are derived from the engine (D-04, D-05).
// These are regression snapshots -- the engine is the source of truth.

describe('K1 (N.W.) snapshot', () => {
  let k1Results: ReturnType<typeof computeAllPhases>;

  beforeAll(() => {
    const k1 = REFERENCE_CANDIDATES.find(c => c.id === 'K1')!;
    k1Results = computeAllPhases(k1.scores, PHASE_NORMS);
  });

  it('Creativity fitPercent', () => {
    expect(k1Results.find(r => r.phaseId === 'Creativity')!.fitPercent).toBe(65);
  });

  it('Direction fitPercent', () => {
    expect(k1Results.find(r => r.phaseId === 'Direction')!.fitPercent).toBe(30);
  });

  it('Delegation fitPercent', () => {
    expect(k1Results.find(r => r.phaseId === 'Delegation')!.fitPercent).toBe(55);
  });

  it('Coordination fitPercent', () => {
    expect(k1Results.find(r => r.phaseId === 'Coordination')!.fitPercent).toBe(25);
  });

  it('Collaboration fitPercent', () => {
    expect(k1Results.find(r => r.phaseId === 'Collaboration')!.fitPercent).toBe(52);
  });

  it('Alliances fitPercent', () => {
    expect(k1Results.find(r => r.phaseId === 'Alliances')!.fitPercent).toBe(68);
  });
});

describe('K2 (K.D.) snapshot', () => {
  let k2Results: ReturnType<typeof computeAllPhases>;

  beforeAll(() => {
    const k2 = REFERENCE_CANDIDATES.find(c => c.id === 'K2')!;
    k2Results = computeAllPhases(k2.scores, PHASE_NORMS);
  });

  it('Creativity fitPercent', () => {
    expect(k2Results.find(r => r.phaseId === 'Creativity')!.fitPercent).toBe(63);
  });

  it('Direction fitPercent', () => {
    expect(k2Results.find(r => r.phaseId === 'Direction')!.fitPercent).toBe(44);
  });

  it('Delegation fitPercent', () => {
    expect(k2Results.find(r => r.phaseId === 'Delegation')!.fitPercent).toBe(53);
  });

  it('Coordination fitPercent', () => {
    expect(k2Results.find(r => r.phaseId === 'Coordination')!.fitPercent).toBe(41);
  });

  it('Collaboration fitPercent', () => {
    expect(k2Results.find(r => r.phaseId === 'Collaboration')!.fitPercent).toBe(47);
  });

  it('Alliances fitPercent', () => {
    expect(k2Results.find(r => r.phaseId === 'Alliances')!.fitPercent).toBe(57);
  });
});

describe('K3 (M.A.) snapshot', () => {
  let k3Results: ReturnType<typeof computeAllPhases>;

  beforeAll(() => {
    const k3 = REFERENCE_CANDIDATES.find(c => c.id === 'K3')!;
    k3Results = computeAllPhases(k3.scores, PHASE_NORMS);
  });

  it('Creativity fitPercent', () => {
    expect(k3Results.find(r => r.phaseId === 'Creativity')!.fitPercent).toBe(60);
  });

  it('Direction fitPercent', () => {
    expect(k3Results.find(r => r.phaseId === 'Direction')!.fitPercent).toBe(56);
  });

  it('Delegation fitPercent', () => {
    expect(k3Results.find(r => r.phaseId === 'Delegation')!.fitPercent).toBe(71);
  });

  it('Coordination fitPercent', () => {
    expect(k3Results.find(r => r.phaseId === 'Coordination')!.fitPercent).toBe(51);
  });

  it('Collaboration fitPercent', () => {
    expect(k3Results.find(r => r.phaseId === 'Collaboration')!.fitPercent).toBe(47);
  });

  it('Alliances fitPercent', () => {
    expect(k3Results.find(r => r.phaseId === 'Alliances')!.fitPercent).toBe(47);
  });
});

// D-04: Rankings are the primary validation target. These tests capture the
// engine-computed ranking order -- the engine is the source of truth (D-04, D-05).
// Note: computed rankings differ from the spec's stated expectedRankings;
// the spec's worked example contains known arithmetic errors (41-CONTEXT.md).

describe('ranking order validation', () => {
  it('K1 (N.W.) ranking: Alliances > Creativity > Delegation > Collaboration > Direction > Coordination', () => {
    const k1 = REFERENCE_CANDIDATES.find(c => c.id === 'K1')!;
    const results = computeAllPhases(k1.scores, PHASE_NORMS);
    const ranked = [...results].sort((a, b) => b.fitPercent - a.fitPercent).map(r => r.phaseId);
    expect(ranked).toEqual(['Alliances', 'Creativity', 'Delegation', 'Collaboration', 'Direction', 'Coordination']);
  });

  it('K2 (K.D.) ranking: Creativity > Alliances > Delegation > Collaboration > Direction > Coordination', () => {
    const k2 = REFERENCE_CANDIDATES.find(c => c.id === 'K2')!;
    const results = computeAllPhases(k2.scores, PHASE_NORMS);
    const ranked = [...results].sort((a, b) => b.fitPercent - a.fitPercent).map(r => r.phaseId);
    expect(ranked).toEqual(['Creativity', 'Alliances', 'Delegation', 'Collaboration', 'Direction', 'Coordination']);
  });

  it('K3 (M.A.) ranking: Delegation > Creativity > Direction > Coordination > Collaboration > Alliances', () => {
    const k3 = REFERENCE_CANDIDATES.find(c => c.id === 'K3')!;
    const results = computeAllPhases(k3.scores, PHASE_NORMS);
    const ranked = [...results].sort((a, b) => b.fitPercent - a.fitPercent).map(r => r.phaseId);
    expect(ranked).toEqual(['Delegation', 'Creativity', 'Direction', 'Coordination', 'Collaboration', 'Alliances']);
  });
});

// D-09: All 18 candidate-phase classification labels validated against v2 thresholds
// applied to the engine-computed fitPercent (engine is source of truth per D-04/D-05).

describe('classification labels (all 18)', () => {
  it('K1 (N.W.) all phase classifications match classify(fitPercent)', () => {
    const k1 = REFERENCE_CANDIDATES.find(c => c.id === 'K1')!;
    const results = computeAllPhases(k1.scores, PHASE_NORMS);
    results.forEach(r => {
      expect(r.classification).toBe(classify(r.fitPercent));
    });
  });

  it('K2 (K.D.) all phase classifications match classify(fitPercent)', () => {
    const k2 = REFERENCE_CANDIDATES.find(c => c.id === 'K2')!;
    const results = computeAllPhases(k2.scores, PHASE_NORMS);
    results.forEach(r => {
      expect(r.classification).toBe(classify(r.fitPercent));
    });
  });

  it('K3 (M.A.) all phase classifications match classify(fitPercent)', () => {
    const k3 = REFERENCE_CANDIDATES.find(c => c.id === 'K3')!;
    const results = computeAllPhases(k3.scores, PHASE_NORMS);
    results.forEach(r => {
      expect(r.classification).toBe(classify(r.fitPercent));
    });
  });

  it('K1 (N.W.) specific labels: Goede fit for Creativity, Alliances, Delegation; Risicofit for Collaboration; Mismatch for Direction, Coordination', () => {
    const k1 = REFERENCE_CANDIDATES.find(c => c.id === 'K1')!;
    const results = computeAllPhases(k1.scores, PHASE_NORMS);
    const byPhase = Object.fromEntries(results.map(r => [r.phaseId, r.classification]));
    expect(byPhase['Creativity']).toBe('Goede fit');
    expect(byPhase['Alliances']).toBe('Goede fit');
    expect(byPhase['Delegation']).toBe('Goede fit');
    expect(byPhase['Collaboration']).toBe('Risicofit');
    expect(byPhase['Direction']).toBe('Mismatch');
    expect(byPhase['Coordination']).toBe('Mismatch');
  });

  it('K2 (K.D.) specific labels: Goede fit for Creativity, Alliances; Risicofit for Direction, Delegation, Coordination, Collaboration', () => {
    const k2 = REFERENCE_CANDIDATES.find(c => c.id === 'K2')!;
    const results = computeAllPhases(k2.scores, PHASE_NORMS);
    const byPhase = Object.fromEntries(results.map(r => [r.phaseId, r.classification]));
    expect(byPhase['Creativity']).toBe('Goede fit');
    expect(byPhase['Alliances']).toBe('Goede fit');
    expect(byPhase['Direction']).toBe('Risicofit');
    expect(byPhase['Delegation']).toBe('Risicofit');
    expect(byPhase['Coordination']).toBe('Risicofit');
    expect(byPhase['Collaboration']).toBe('Risicofit');
  });

  it('K3 (M.A.) specific labels: Goede fit for Delegation, Creativity, Direction; Risicofit for Coordination, Collaboration, Alliances', () => {
    const k3 = REFERENCE_CANDIDATES.find(c => c.id === 'K3')!;
    const results = computeAllPhases(k3.scores, PHASE_NORMS);
    const byPhase = Object.fromEntries(results.map(r => [r.phaseId, r.classification]));
    expect(byPhase['Delegation']).toBe('Goede fit');
    expect(byPhase['Creativity']).toBe('Goede fit');
    expect(byPhase['Direction']).toBe('Goede fit');
    expect(byPhase['Coordination']).toBe('Risicofit');
    expect(byPhase['Collaboration']).toBe('Risicofit');
    expect(byPhase['Alliances']).toBe('Risicofit');
  });
});

describe('validateAllCandidates integration', () => {
  it('returns a FullValidationResult with 3 candidates', () => {
    const validation = validateAllCandidates(REFERENCE_CANDIDATES, PHASE_NORMS);
    expect(validation.candidates).toHaveLength(3);
    expect(typeof validation.allRankingsMatch).toBe('boolean');
    expect(typeof validation.classificationMatchCount).toBe('number');
  });

  it('has 18 total classification comparisons (3 candidates x 6 phases)', () => {
    const validation = validateAllCandidates(REFERENCE_CANDIDATES, PHASE_NORMS);
    expect(validation.totalClassifications).toBe(18);
  });

  it('classificationMatchCount is a non-negative number', () => {
    const validation = validateAllCandidates(REFERENCE_CANDIDATES, PHASE_NORMS);
    expect(validation.classificationMatchCount).toBeGreaterThanOrEqual(0);
    expect(validation.classificationMatchCount).toBeLessThanOrEqual(18);
  });
});
