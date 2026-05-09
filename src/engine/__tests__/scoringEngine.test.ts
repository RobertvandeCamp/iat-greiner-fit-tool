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

describe('K1 ranking order', () => {
  it('matches: Creativity > Collaboration > Alliances > Delegation > Direction > Coordination', () => {
    const k1 = REFERENCE_CANDIDATES.find(c => c.id === 'K1')!;
    const results = computeAllPhases(k1.scores, PHASE_NORMS, SCALING_PARAMS);
    const ranking = results.map(r => r.phaseId);
    expect(ranking).toEqual(['creativity', 'collaboration', 'alliances', 'delegation', 'direction', 'coordination']);
  });
});

describe('K2 ranking order', () => {
  it('matches: Delegation > Collaboration > Direction > Coordination > Creativity > Alliances', () => {
    const k2 = REFERENCE_CANDIDATES.find(c => c.id === 'K2')!;
    const results = computeAllPhases(k2.scores, PHASE_NORMS, SCALING_PARAMS);
    const ranking = results.map(r => r.phaseId);
    expect(ranking).toEqual(['delegation', 'collaboration', 'direction', 'coordination', 'creativity', 'alliances']);
  });
});

describe('K3 ranking order', () => {
  it('matches: Coordination > Direction > Collaboration > Delegation > Alliances > Creativity', () => {
    const k3 = REFERENCE_CANDIDATES.find(c => c.id === 'K3')!;
    const results = computeAllPhases(k3.scores, PHASE_NORMS, SCALING_PARAMS);
    const ranking = results.map(r => r.phaseId);
    expect(ranking).toEqual(['coordination', 'direction', 'collaboration', 'delegation', 'alliances', 'creativity']);
  });
});

describe('classification accuracy', () => {
  it('achieves at least 16/18 correct classifications across K1, K2, K3', () => {
    const validation = validateAllCandidates(REFERENCE_CANDIDATES, PHASE_NORMS, SCALING_PARAMS);
    expect(validation.classificationMatchCount).toBeGreaterThanOrEqual(16);
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
