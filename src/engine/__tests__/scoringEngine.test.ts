import { classify } from '@/engine/classifier';
import {
  baseFit,
  wrongPoleAmount,
  dimensionFit,
  computePhaseFit,
  computeAllPhases,
} from '@/engine/scoringEngine';
import { bandIndex } from '@/lib/bandColor';
import { DEFAULT_CONFIG, DEFAULT_BANDS, PHASE_ORDER, cloneDefaultConfig } from '@/data/defaultConfig';
import type { DimensionId, DimensionScore } from '@/types/greiner';

const idealFor = (phase: keyof typeof DEFAULT_CONFIG.phases) => {
  const dims = DEFAULT_CONFIG.phases[phase].dimensions;
  return Object.fromEntries(
    (Object.keys(dims) as DimensionId[]).map((id) => [id, dims[id].target]),
  ) as Record<DimensionId, DimensionScore>;
};

const neutral = Object.fromEntries(
  (Object.keys(DEFAULT_CONFIG.phases.Creativity.dimensions) as DimensionId[]).map((id) => [id, 0]),
) as Record<DimensionId, DimensionScore>;

describe('classify with configurable bands', () => {
  it('matches highest band first', () => {
    expect(classify(75, DEFAULT_BANDS)).toBe('Sterke fit');
    expect(classify(74, DEFAULT_BANDS)).toBe('Goede fit');
    expect(classify(55, DEFAULT_BANDS)).toBe('Goede fit');
    expect(classify(40, DEFAULT_BANDS)).toBe('Risicofit');
    expect(classify(39, DEFAULT_BANDS)).toBe('Mismatch');
    expect(classify(0, DEFAULT_BANDS)).toBe('Mismatch');
  });

  it('respects custom labels', () => {
    const bands = [{ min: 50, label: 'Pass' }, { min: 0, label: 'Fail' }];
    expect(classify(60, bands)).toBe('Pass');
    expect(classify(10, bands)).toBe('Fail');
  });

  it('returns — when below all bands (no catch-all)', () => {
    expect(classify(10, [{ min: 50, label: 'Pass' }])).toBe('—');
  });
});

describe('bandIndex (colours follow configurable bands)', () => {
  it('maps each default band to a distinct palette tier', () => {
    expect(bandIndex(80, DEFAULT_BANDS)).toBe(0); // Sterke fit
    expect(bandIndex(60, DEFAULT_BANDS)).toBe(1); // Goede fit
    expect(bandIndex(45, DEFAULT_BANDS)).toBe(2); // Risicofit
    expect(bandIndex(10, DEFAULT_BANDS)).toBe(3); // Mismatch
  });
  it('returns -1 below all bands and 0 for a single band', () => {
    expect(bandIndex(10, [{ min: 50, label: 'Pass' }])).toBe(-1);
    expect(bandIndex(60, [{ min: 50, label: 'Pass' }])).toBe(0);
  });
});

describe('baseFit', () => {
  it('is 1 at exact target, 0 at opposite extreme', () => {
    expect(baseFit(-3, -3)).toBe(1);
    expect(baseFit(3, -3)).toBe(0);
    expect(baseFit(0, 0)).toBe(1);
  });
  it('is symmetric and linear', () => {
    expect(baseFit(0, -2)).toBeCloseTo(1 - 2 / 6, 6);
    expect(baseFit(-1, 1)).toBeCloseTo(1 - 2 / 6, 6);
  });
});

describe('wrongPoleAmount', () => {
  it('counts only the opposite pole', () => {
    expect(wrongPoleAmount(3, -2)).toBe(3);
    expect(wrongPoleAmount(-1, -2)).toBe(0);
    expect(wrongPoleAmount(0, -2)).toBe(0);
    expect(wrongPoleAmount(2, 3)).toBe(0);
    expect(wrongPoleAmount(0, 0)).toBe(0);
  });
});

describe('dimensionFit penalty', () => {
  it('equals baseFit when penalty is 0', () => {
    expect(dimensionFit(0, -2, 0)).toBeCloseTo(baseFit(0, -2), 6);
  });
  it('penalizes opposite pole but not neutral', () => {
    const t = -2;
    expect(dimensionFit(0, t, 1)).toBeCloseTo(baseFit(0, t), 6);
    expect(dimensionFit(2, t, 1)).toBeLessThan(baseFit(2, t));
  });
  it('never goes below 0', () => {
    expect(dimensionFit(3, -3, 1)).toBeGreaterThanOrEqual(0);
  });
});

describe('computeAllPhases', () => {
  it('returns 6 phases in fixed order', () => {
    const results = computeAllPhases(neutral, DEFAULT_CONFIG, PHASE_ORDER);
    expect(results.map((r) => r.phaseId)).toEqual([
      'Creativity', 'Direction', 'Delegation', 'Coordination', 'Collaboration', 'Alliances',
    ]);
  });

  it('keeps fitPercent within 0..100', () => {
    const results = computeAllPhases(idealFor('Direction'), DEFAULT_CONFIG, PHASE_ORDER);
    for (const r of results) {
      expect(r.fitPercent).toBeGreaterThanOrEqual(0);
      expect(r.fitPercent).toBeLessThanOrEqual(100);
    }
  });

  it('scores the ideal profile for a phase at 100% for that phase', () => {
    const creativity = computePhaseFit(
      idealFor('Creativity'),
      DEFAULT_CONFIG.phases.Creativity,
      DEFAULT_CONFIG.scoring,
      DEFAULT_CONFIG.bands,
    );
    expect(creativity.fitPercent).toBe(100);
    expect(creativity.criticalMismatches).toHaveLength(0);
  });

  it('ranks the matching phase first for its ideal profile', () => {
    const results = computeAllPhases(idealFor('Coordination'), DEFAULT_CONFIG, PHASE_ORDER);
    const top = [...results].sort((a, b) => b.fitPercent - a.fitPercent)[0];
    expect(top.phaseId).toBe('Coordination');
  });

  it('flags critical mismatches on the opposite pole', () => {
    const scores = { ...idealFor('Coordination'), careful_flexible: 3 as DimensionScore };
    const res = computePhaseFit(scores, DEFAULT_CONFIG.phases.Coordination, DEFAULT_CONFIG.scoring, DEFAULT_CONFIG.bands);
    expect(res.criticalMismatches).toContain('careful_flexible');
  });

  it('floor normalization lowers a neutral profile vs raw', () => {
    const cfg = cloneDefaultConfig();
    const withFloor = computePhaseFit(neutral, cfg.phases.Creativity, { ...cfg.scoring, floorNormalize: true }, cfg.bands);
    const noFloor = computePhaseFit(neutral, cfg.phases.Creativity, { ...cfg.scoring, floorNormalize: false }, cfg.bands);
    expect(withFloor.fitPercent).toBeLessThan(noFloor.fitPercent);
  });
});
