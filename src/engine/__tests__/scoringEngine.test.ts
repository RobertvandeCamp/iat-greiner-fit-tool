import { classify } from '@/engine/classifier';
import { computePhaseFit, computeAllPhases } from '@/engine/scoringEngine';
import { validateAllCandidates } from '@/engine/validation';
import { PHASE_NORMS } from '@/data/phaseNorms';
import { REFERENCE_CANDIDATES } from '@/data/referenceCandidates';

// NOTE: Full snapshot values and ranking expectations will be calibrated in Phase 41.
// These tests verify correct structure, compile-time types, and basic invariants.

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

// NOTE: Ranking order and fitPercent snapshot tests are deferred to Phase 41.
// The v2 formula produces different outputs than v1; snapshot values must be
// calibrated after visual verification of the scoring engine results.

describe('validation structure', () => {
  it('returns a FullValidationResult with 3 candidates', () => {
    const validation = validateAllCandidates(REFERENCE_CANDIDATES, PHASE_NORMS);
    expect(validation.candidates).toHaveLength(3);
    expect(typeof validation.allRankingsMatch).toBe('boolean');
    expect(typeof validation.classificationMatchCount).toBe('number');
  });
});
