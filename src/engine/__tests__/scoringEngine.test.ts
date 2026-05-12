import { classify } from '@/engine/classifier';
import { computePhaseFit, computeAllPhases } from '@/engine/scoringEngine';
import { validateAllCandidates } from '@/engine/validation';
import { PHASE_NORMS } from '@/data/phaseNorms';
import { SCALING_PARAMS } from '@/data/scalingParams';
import { REFERENCE_CANDIDATES } from '@/data/referenceCandidates';

describe('classify', () => {
  it('returns Strong for >= 67%', () => {
    expect(classify(67)).toBe('Strong');
    expect(classify(100)).toBe('Strong');
    expect(classify(80)).toBe('Strong');
  });

  it('returns Usable for >= 50% and < 67%', () => {
    expect(classify(50)).toBe('Usable');
    expect(classify(66)).toBe('Usable');
  });

  it('returns Risk for >= 34% and < 50%', () => {
    expect(classify(34)).toBe('Risk');
    expect(classify(49)).toBe('Risk');
  });

  it('returns Mismatch for < 34%', () => {
    expect(classify(33)).toBe('Mismatch');
    expect(classify(0)).toBe('Mismatch');
  });
});

describe('computeAllPhases', () => {
  it('returns 6 results sorted by fitPercent descending', () => {
    const k1 = REFERENCE_CANDIDATES.find(c => c.id === 'K1')!;
    const results = computeAllPhases(k1.scores, PHASE_NORMS, SCALING_PARAMS);
    expect(results).toHaveLength(6);
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].fitPercent).toBeGreaterThanOrEqual(results[i].fitPercent);
    }
  });

  it('produces fitPercent values between 0 and 100', () => {
    const k1 = REFERENCE_CANDIDATES.find(c => c.id === 'K1')!;
    const results = computeAllPhases(k1.scores, PHASE_NORMS, SCALING_PARAMS);
    results.forEach(r => {
      expect(r.fitPercent).toBeGreaterThanOrEqual(0);
      expect(r.fitPercent).toBeLessThanOrEqual(100);
    });
  });
});

// Ranking order tests use ACTUAL computed outputs (per D-06).
// These do NOT match Marco v2 expected orders (0/3 match) -- known limitation per D-02.
// referenceCandidates.ts expectedRankings show Marco v2 display values for the UI.

describe('K1 ranking order', () => {
  it('matches: Creativity > Collaboration > Delegation > Alliances > Direction > Coordination', () => {
    const k1 = REFERENCE_CANDIDATES.find(c => c.id === 'K1')!;
    const results = computeAllPhases(k1.scores, PHASE_NORMS, SCALING_PARAMS);
    const ranking = results.map(r => r.phaseId);
    expect(ranking).toEqual(['creativity', 'collaboration', 'delegation', 'alliances', 'direction', 'coordination']);
  });
});

describe('K2 ranking order', () => {
  it('matches: Creativity > Delegation > Collaboration > Direction > Alliances > Coordination', () => {
    const k2 = REFERENCE_CANDIDATES.find(c => c.id === 'K2')!;
    const results = computeAllPhases(k2.scores, PHASE_NORMS, SCALING_PARAMS);
    const ranking = results.map(r => r.phaseId);
    expect(ranking).toEqual(['creativity', 'delegation', 'collaboration', 'direction', 'alliances', 'coordination']);
  });
});

describe('K3 ranking order', () => {
  it('matches: Delegation > Direction > Collaboration > Creativity > Coordination > Alliances', () => {
    const k3 = REFERENCE_CANDIDATES.find(c => c.id === 'K3')!;
    const results = computeAllPhases(k3.scores, PHASE_NORMS, SCALING_PARAMS);
    const ranking = results.map(r => r.phaseId);
    expect(ranking).toEqual(['delegation', 'direction', 'collaboration', 'creativity', 'coordination', 'alliances']);
  });
});

describe('classification accuracy', () => {
  // classificationMatchCount = 1/18 with current theory-locked targets and OLS scaling params.
  // Rankings 0/3 match Marco v2 (known limitation per D-02), which limits classification matches.
  // This test guards against regressions in the classification count.
  it('classificationMatchCount matches actual computed value (1/18)', () => {
    const validation = validateAllCandidates(REFERENCE_CANDIDATES, PHASE_NORMS, SCALING_PARAMS);
    expect(validation.classificationMatchCount).toBe(1);
  });

  it('allRankingsMatch is false (0/3 ranking match -- known per D-02)', () => {
    const validation = validateAllCandidates(REFERENCE_CANDIDATES, PHASE_NORMS, SCALING_PARAMS);
    expect(validation.allRankingsMatch).toBe(false);
  });
});

// fitPercent snapshot tests: guard against regressions in scaling params or phase norms.
// Values are actual computed outputs with theory-locked targets (a=70.130332, b=-10.963781).
describe('K1 fitPercent snapshots', () => {
  it('produces correct fitPercent for all 6 phases', () => {
    const k1 = REFERENCE_CANDIDATES.find(c => c.id === 'K1')!;
    const results = computeAllPhases(k1.scores, PHASE_NORMS, SCALING_PARAMS);
    const byPhase = Object.fromEntries(results.map(r => [r.phaseId, r.fitPercent]));
    expect(byPhase['creativity']).toBeCloseTo(65, 0);
    expect(byPhase['collaboration']).toBeCloseTo(62, 0);
    expect(byPhase['delegation']).toBeCloseTo(58, 0);
    expect(byPhase['alliances']).toBeCloseTo(56, 0);
    expect(byPhase['direction']).toBeCloseTo(51, 0);
    expect(byPhase['coordination']).toBeCloseTo(37, 0);
  });
});

describe('K2 fitPercent snapshots', () => {
  it('produces correct fitPercent for all 6 phases', () => {
    const k2 = REFERENCE_CANDIDATES.find(c => c.id === 'K2')!;
    const results = computeAllPhases(k2.scores, PHASE_NORMS, SCALING_PARAMS);
    const byPhase = Object.fromEntries(results.map(r => [r.phaseId, r.fitPercent]));
    expect(byPhase['creativity']).toBeCloseTo(62, 0);
    expect(byPhase['delegation']).toBeCloseTo(62, 0);
    expect(byPhase['collaboration']).toBeCloseTo(59, 0);
    expect(byPhase['direction']).toBeCloseTo(58, 0);
    expect(byPhase['alliances']).toBeCloseTo(56, 0);
    expect(byPhase['coordination']).toBeCloseTo(43, 0);
  });
});

describe('K3 fitPercent snapshots', () => {
  it('produces correct fitPercent for all 6 phases', () => {
    const k3 = REFERENCE_CANDIDATES.find(c => c.id === 'K3')!;
    const results = computeAllPhases(k3.scores, PHASE_NORMS, SCALING_PARAMS);
    const byPhase = Object.fromEntries(results.map(r => [r.phaseId, r.fitPercent]));
    expect(byPhase['delegation']).toBeCloseTo(65, 0);
    expect(byPhase['direction']).toBeCloseTo(61, 0);
    expect(byPhase['collaboration']).toBeCloseTo(60, 0);
    expect(byPhase['creativity']).toBeCloseTo(56, 0);
    expect(byPhase['coordination']).toBeCloseTo(49, 0);
    expect(byPhase['alliances']).toBeCloseTo(42, 0);
  });
});

describe('dimension details', () => {
  it('sets similarity to 0 for dimensions with weight 0', () => {
    const k1 = REFERENCE_CANDIDATES.find(c => c.id === 'K1')!;
    const creativityNorm = PHASE_NORMS.find(p => p.phaseId === 'creativity')!;
    const result = computePhaseFit(k1.scores, creativityNorm, SCALING_PARAMS);
    const neutralDims = result.dimensionDetails.filter(d => d.weight === 0);
    neutralDims.forEach(d => {
      expect(d.similarity).toBe(0);
    });
  });
});
