import { GreinerPhase, ModelConfig, DimensionId, DimensionScore } from '@/types/greiner';
import { computeAllPhases } from '@/engine/scoringEngine';
import { PHASE_ORDER, DIMENSION_IDS } from '@/data/defaultConfig';

/**
 * Calibration diagnostics — measure how well the model DISCRIMINATES between
 * phases (the Creativity-bias problem). Pure functions; used by tests and the
 * Diagnostics panel. Monte-Carlo uses a seeded PRNG so results are deterministic
 * and reproducible (no Math.random / Date.now).
 */

/** The ideal candidate for a phase = that phase's target vector. */
export function idealProfileFor(
  phaseId: GreinerPhase,
  config: ModelConfig,
): Record<DimensionId, DimensionScore> {
  const dims = config.phases[phaseId].dimensions;
  const out = {} as Record<DimensionId, DimensionScore>;
  for (const id of DIMENSION_IDS) out[id] = dims[id].target;
  return out;
}

export interface ConfusionRow {
  archetype: GreinerPhase;
  fits: Record<GreinerPhase, number>;
  topPhase: GreinerPhase;
  ownFit: number;
  diagonalIsTop: boolean;
  /** ownFit minus the best competing phase (>0 = clean separation). */
  margin: number;
}

export interface ConfusionMatrix {
  rows: ConfusionRow[];
  /** how many archetypes rank their own phase #1 (6 = perfect discrimination). */
  diagonalHits: number;
  /** smallest margin across archetypes (negative = a phase loses to a rival). */
  minMargin: number;
}

/**
 * Feed each phase's own ideal profile through the model and record where it
 * lands. A well-discriminating model has every archetype scoring highest on its
 * own phase (diagonalHits === 6) with healthy positive margins.
 */
export function confusionMatrix(config: ModelConfig): ConfusionMatrix {
  const rows: ConfusionRow[] = PHASE_ORDER.map((archetype) => {
    const profile = idealProfileFor(archetype, config);
    const results = computeAllPhases(profile, config, PHASE_ORDER);
    const fits = {} as Record<GreinerPhase, number>;
    for (const r of results) fits[r.phaseId] = r.fitPercent;
    const top = [...results].sort((a, b) => b.fitPercent - a.fitPercent)[0];
    const ownFit = fits[archetype];
    const bestOther = Math.max(
      ...results.filter((r) => r.phaseId !== archetype).map((r) => r.fitPercent),
    );
    return {
      archetype,
      fits,
      topPhase: top.phaseId,
      ownFit,
      // own phase counts as "top" if it is tied for the highest fit, not only
      // when it strictly wins the (earlier-phase-favouring) tie-break.
      diagonalIsTop: ownFit >= bestOther,
      margin: ownFit - bestOther,
    };
  });
  return {
    rows,
    diagonalHits: rows.filter((r) => r.diagonalIsTop).length,
    minMargin: Math.min(...rows.map((r) => r.margin)),
  };
}

/** Deterministic PRNG (mulberry32) → [0,1). */
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface WinnerDistribution {
  n: number;
  seed: number;
  counts: Record<GreinerPhase, number>;
  percentages: Record<GreinerPhase, number>;
  avgFit: Record<GreinerPhase, number>;
  topPhase: GreinerPhase;
  topShare: number; // % of random profiles whose best fit is topPhase
}

/**
 * Generate n random Reveal-14 profiles (each dimension uniform int −3..+3) and
 * tally which phase each profile fits best. A balanced/defensible model spreads
 * the winners; one phase winning a large majority signals bias (the current
 * Creativity issue). Deterministic for a given (n, seed).
 */
export function winnerDistribution(config: ModelConfig, n = 2000, seed = 12345): WinnerDistribution {
  const rng = mulberry32(seed);
  const counts = {} as Record<GreinerPhase, number>;
  const sumFit = {} as Record<GreinerPhase, number>;
  for (const p of PHASE_ORDER) {
    counts[p] = 0;
    sumFit[p] = 0;
  }

  for (let i = 0; i < n; i++) {
    const profile = {} as Record<DimensionId, DimensionScore>;
    for (const id of DIMENSION_IDS) profile[id] = (Math.floor(rng() * 7) - 3) as DimensionScore;
    const results = computeAllPhases(profile, config, PHASE_ORDER);
    let best = results[0];
    for (const r of results) {
      sumFit[r.phaseId] += r.fitPercent;
      if (r.fitPercent > best.fitPercent) best = r; // first-in-order tie-break
    }
    counts[best.phaseId] += 1;
  }

  const percentages = {} as Record<GreinerPhase, number>;
  const avgFit = {} as Record<GreinerPhase, number>;
  for (const p of PHASE_ORDER) {
    percentages[p] = Math.round((counts[p] / n) * 100);
    avgFit[p] = Math.round(sumFit[p] / n);
  }
  let topPhase = PHASE_ORDER[0];
  for (const p of PHASE_ORDER) if (counts[p] > counts[topPhase]) topPhase = p;

  return { n, seed, counts, percentages, avgFit, topPhase, topShare: Math.round((counts[topPhase] / n) * 100) };
}
