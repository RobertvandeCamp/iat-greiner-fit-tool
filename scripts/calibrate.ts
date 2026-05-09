/**
 * Calibration script for Greiner phase fit targets and scaling parameters.
 *
 * Usage: npx tsx scripts/calibrate.ts
 *
 * Algorithm:
 * 1. Global coordinate descent over all (phase x dimension) target parameters.
 *    Primary objective: zero intra-candidate ranking violations.
 *    Secondary objective: minimize OLS residuals (accurate percentage prediction).
 * 2. Multi-start with diverse seeds for robustness.
 * 3. OLS fit for scaling (a, b) after targets are found.
 */

import { DimensionWeight } from '../src/types/greiner.ts';

// -------------------------
// Data (inlined -- no @/ alias in tsx scripts)
// -------------------------

const WEIGHT_MATRIX: Record<string, DimensionWeight[]> = {
  creativity:    [3, 1, 3, 1, 0, 1, 1, 3, 3, 0, 1, 1, 3, 1],
  direction:     [3, 1, 3, 3, 0, 1, 1, 3, 1, 1, 0, 1, 1, 3],
  delegation:    [0, 0, 3, 1, 1, 3, 3, 1, 1, 3, 3, 1, 0, 1],
  coordination:  [3, 1, 1, 0, 0, 0, 1, 3, 3, 1, 1, 1, 3, 3],
  collaboration: [1, 1, 0, 0, 1, 3, 1, 1, 3, 3, 1, 3, 1, 3],
  alliances:     [0, 3, 0, 1, 3, 3, 1, 0, 3, 1, 1, 1, 1, 3],
};

const PHASE_IDS = ['creativity', 'direction', 'delegation', 'coordination', 'collaboration', 'alliances'];

const CANDIDATE_SCORES: Record<string, number[]> = {
  K1: [ 2, -1,  0,  0,  1,  0,  0,  0, -2,  3,  0,  2, -2, -1],
  K2: [ 3,  0, -2, -2,  0, -1,  2,  0,  1,  0, -1,  0, -1, -2],
  K3: [-3,  2, -1, -2,  3,  1, -1,  0,  0, -3,  2,  1, -3, -1],
};

// Expected fit percentages per candidate per phase (from Marco's validated data)
const EXPECTED_PERCENTS: Record<string, Record<string, number>> = {
  K1: { creativity: 72, collaboration: 69, alliances: 52, delegation: 41, direction: 28, coordination: 12 },
  K2: { delegation: 68, collaboration: 62, direction: 61, coordination: 47, creativity: 34, alliances: 29 },
  K3: { coordination: 71, direction: 58, collaboration: 33, delegation: 22, alliances: 19, creativity: 18 },
};

// Expected ranking orders per candidate (sorted by descending expected percent)
const EXPECTED_ORDERS: Record<string, string[]> = {
  K1: ['creativity', 'collaboration', 'alliances', 'delegation', 'direction', 'coordination'],
  K2: ['delegation', 'collaboration', 'direction', 'coordination', 'creativity', 'alliances'],
  K3: ['coordination', 'direction', 'collaboration', 'delegation', 'alliances', 'creativity'],
};

// -------------------------
// Core raw fit
// -------------------------

function computeRawFit(scores: number[], targets: number[], weights: DimensionWeight[]): number {
  let simSum = 0;
  let wSum = 0;
  for (let i = 0; i < 14; i++) {
    if (weights[i] > 0) {
      simSum += (1 - Math.abs(scores[i] - targets[i]) / 6) * weights[i];
      wSum += weights[i];
    }
  }
  return wSum > 0 ? simSum / wSum : 0;
}

// -------------------------
// OLS: y = a*x - b  (b can be negative, meaning subtract a negative = add)
// Using standard OLS for y = a*x + c, then b = -c.
// -------------------------

function fitScaling(rawFits: number[], percents: number[]): { a: number; b: number } {
  const n = rawFits.length;
  const sumX = rawFits.reduce((s, x) => s + x, 0);
  const sumY = percents.reduce((s, y) => s + y, 0);
  const sumXX = rawFits.reduce((s, x) => s + x * x, 0);
  const sumXY = rawFits.reduce((s, x, i) => s + x * percents[i], 0);
  const denom = n * sumXX - sumX * sumX;
  if (Math.abs(denom) < 1e-12) {
    return { a: sumX > 0 ? sumY / sumX : 100, b: 0 };
  }
  const a = (n * sumXY - sumX * sumY) / denom;
  const c = (sumY - a * sumX) / n;
  const b = -c; // fit% = a*raw - b = a*raw + c
  return { a, b };
}

// -------------------------
// Compute OLS residuals for current targets
// Returns { a, b, sse } where sse = sum of squared errors
// -------------------------

function computeOLSError(allTargets: Record<string, number[]>): { a: number; b: number; sse: number } {
  const rawFits: number[] = [];
  const percents: number[] = [];
  for (const cid of ['K1', 'K2', 'K3']) {
    for (const ph of PHASE_IDS) {
      rawFits.push(computeRawFit(CANDIDATE_SCORES[cid], allTargets[ph], WEIGHT_MATRIX[ph]));
      percents.push(EXPECTED_PERCENTS[cid][ph]);
    }
  }
  const { a, b } = fitScaling(rawFits, percents);
  const sse = rawFits.reduce((sum, x, i) => {
    const pred = Math.max(0, Math.min(100, a * x - b));
    const err = pred - percents[i];
    return sum + err * err;
  }, 0);
  return { a, b, sse };
}

// -------------------------
// Ranking violations (intra-candidate ordering)
// -------------------------

function totalViolations(allTargets: Record<string, number[]>): number {
  let violations = 0;
  for (const cid of ['K1', 'K2', 'K3']) {
    const rawFits: Record<string, number> = {};
    for (const ph of PHASE_IDS) {
      rawFits[ph] = computeRawFit(CANDIDATE_SCORES[cid], allTargets[ph], WEIGHT_MATRIX[ph]);
    }
    const expectedOrder = EXPECTED_ORDERS[cid];
    for (let i = 0; i < expectedOrder.length; i++) {
      for (let j = i + 1; j < expectedOrder.length; j++) {
        // expected[i] should rank above expected[j] => rawFit[i] > rawFit[j]
        if (rawFits[expectedOrder[i]] <= rawFits[expectedOrder[j]]) {
          violations++;
        }
      }
    }
  }
  return violations;
}

// -------------------------
// Deep copy
// -------------------------

function copyTargets(t: Record<string, number[]>): Record<string, number[]> {
  const r: Record<string, number[]> = {};
  for (const ph of PHASE_IDS) r[ph] = [...t[ph]];
  return r;
}

// -------------------------
// Global coordinate descent
// Primary: minimize violations
// Secondary (when violations=0): minimize OLS SSE
// -------------------------

function globalCoordinateDescent(
  initial: Record<string, number[]>,
  maxIter = 300,
): Record<string, number[]> {
  let current = copyTargets(initial);
  let improved = true;
  let iter = 0;

  while (improved && iter < maxIter) {
    improved = false;
    iter++;

    for (const ph of PHASE_IDS) {
      const weights = WEIGHT_MATRIX[ph];
      for (let dim = 0; dim < 14; dim++) {
        if (weights[dim] === 0) continue;

        const curViol = totalViolations(current);
        const curErr = curViol === 0 ? computeOLSError(current).sse : Infinity;

        let bestVal = current[ph][dim];
        let bestViol = curViol;
        let bestErr = curErr;

        for (let v = -3; v <= 3; v++) {
          if (v === current[ph][dim]) continue;
          const trial = copyTargets(current);
          trial[ph][dim] = v;
          const viol = totalViolations(trial);
          const err = viol === 0 ? computeOLSError(trial).sse : Infinity;

          const betterViol = viol < bestViol;
          const sameViolBetterErr = viol === bestViol && err < bestErr;

          if (betterViol || sameViolBetterErr) {
            bestViol = viol;
            bestErr = err;
            bestVal = v;
            improved = true;
          }
        }

        current[ph][dim] = bestVal;
      }
    }
  }

  return current;
}

// -------------------------
// Generate diverse seeds
// -------------------------

function generateSeeds(): Record<string, number[]>[] {
  const seeds: Record<string, number[]>[] = [];

  // Seed 1: For each phase, use the top candidate's scores
  const seed1: Record<string, number[]> = {};
  for (const ph of PHASE_IDS) {
    const topCand = ['K1','K2','K3'].reduce((best, cid) =>
      EXPECTED_PERCENTS[cid][ph] > EXPECTED_PERCENTS[best][ph] ? cid : best, 'K1');
    seed1[ph] = [...CANDIDATE_SCORES[topCand]];
  }
  seeds.push(seed1);

  // Seed 2: Negative of bottom candidate
  const seed2: Record<string, number[]> = {};
  for (const ph of PHASE_IDS) {
    const botCand = ['K1','K2','K3'].reduce((worst, cid) =>
      EXPECTED_PERCENTS[cid][ph] < EXPECTED_PERCENTS[worst][ph] ? cid : worst, 'K1');
    seed2[ph] = CANDIDATE_SCORES[botCand].map(s => Math.max(-3, Math.min(3, -s)));
  }
  seeds.push(seed2);

  // Seed 3: Midpoint top - bottom
  const seed3: Record<string, number[]> = {};
  for (const ph of PHASE_IDS) {
    const sorted = ['K1','K2','K3'].sort((a, b) =>
      EXPECTED_PERCENTS[b][ph] - EXPECTED_PERCENTS[a][ph]);
    const top = CANDIDATE_SCORES[sorted[0]];
    const bot = CANDIDATE_SCORES[sorted[2]];
    seed3[ph] = top.map((s, i) =>
      Math.max(-3, Math.min(3, Math.round((s - bot[i]) / 2))));
  }
  seeds.push(seed3);

  // Seed 4: All zeros
  const seed4: Record<string, number[]> = {};
  for (const ph of PHASE_IDS) seed4[ph] = new Array(14).fill(0);
  seeds.push(seed4);

  // Seed 5: Analytically designed using top candidate for critical dims
  const seed5: Record<string, number[]> = {};
  for (const ph of PHASE_IDS) {
    const sorted = ['K1','K2','K3'].sort((a, b) =>
      EXPECTED_PERCENTS[b][ph] - EXPECTED_PERCENTS[a][ph]);
    const top = CANDIDATE_SCORES[sorted[0]];
    const bot = CANDIDATE_SCORES[sorted[2]];
    const weights = WEIGHT_MATRIX[ph];
    seed5[ph] = Array.from({ length: 14 }, (_, i) => {
      if (weights[i] === 0) return 0;
      const alpha = weights[i] === 3 ? 1.0 : 0.5;
      return Math.max(-3, Math.min(3, Math.round(alpha * top[i] - (1 - alpha) * bot[i])));
    });
  }
  seeds.push(seed5);

  // Seed 6: Phase-specific top candidates (different per phase)
  seeds.push({
    creativity:    [...CANDIDATE_SCORES['K1']],
    direction:     [...CANDIDATE_SCORES['K3']],
    delegation:    [...CANDIDATE_SCORES['K2']],
    coordination:  [...CANDIDATE_SCORES['K3']],
    collaboration: [...CANDIDATE_SCORES['K1']],
    alliances:     [...CANDIDATE_SCORES['K1']],
  });

  // Seed 7: Negated for phases where K3 is top (coordination, direction)
  seeds.push({
    creativity:    [...CANDIDATE_SCORES['K1']],
    direction:     CANDIDATE_SCORES['K3'].map(s => -s as number),
    delegation:    [...CANDIDATE_SCORES['K2']],
    coordination:  CANDIDATE_SCORES['K1'].map(s => -s as number),
    collaboration: [...CANDIDATE_SCORES['K1']],
    alliances:     [...CANDIDATE_SCORES['K1']],
  });

  // Seed 8: Stress separate phases from each other
  const seed8: Record<string, number[]> = {};
  for (const ph of PHASE_IDS) {
    // Use heavily weighted average toward what discriminates this phase
    const sorted = ['K1','K2','K3'].sort((a, b) =>
      EXPECTED_PERCENTS[b][ph] - EXPECTED_PERCENTS[a][ph]);
    const top1 = CANDIDATE_SCORES[sorted[0]];
    const top2 = CANDIDATE_SCORES[sorted[1]];
    const bot = CANDIDATE_SCORES[sorted[2]];
    seed8[ph] = Array.from({ length: 14 }, (_, i) => {
      const centroid = (2 * top1[i] + top2[i]) / 3;
      const target = centroid - 0.3 * bot[i];
      return Math.max(-3, Math.min(3, Math.round(target)));
    });
  }
  seeds.push(seed8);

  // Seed 9: All +2
  const seed9: Record<string, number[]> = {};
  for (const ph of PHASE_IDS) seed9[ph] = new Array(14).fill(2);
  seeds.push(seed9);

  // Seed 10: All -2
  const seed10: Record<string, number[]> = {};
  for (const ph of PHASE_IDS) seed10[ph] = new Array(14).fill(-2);
  seeds.push(seed10);

  return seeds;
}

// -------------------------
// Classification
// -------------------------

function classify(pct: number): string {
  if (pct >= 67) return 'Strong';
  if (pct >= 50) return 'Usable';
  if (pct >= 34) return 'Risk';
  return 'Mismatch';
}

// -------------------------
// Main
// -------------------------

function main() {
  console.log('=== Greiner Phase Fit Calibration ===\n');

  const seeds = generateSeeds();
  let bestTargets: Record<string, number[]> | null = null;
  let bestViol = Infinity;
  let bestSSE = Infinity;

  for (let si = 0; si < seeds.length; si++) {
    const result = globalCoordinateDescent(seeds[si]);
    const viol = totalViolations(result);
    const { sse } = viol === 0 ? computeOLSError(result) : { sse: Infinity };

    const improved =
      bestTargets === null ||
      viol < bestViol ||
      (viol === bestViol && sse < bestSSE);

    if (improved) {
      bestViol = viol;
      bestSSE = sse;
      bestTargets = result;
    }

    console.log(`Seed ${si + 1}/${seeds.length}: violations=${viol}, sse=${sse === Infinity ? 'N/A' : sse.toFixed(1)}`);

    if (bestViol === 0 && si >= 2) {
      // Keep searching for better SSE, but stop if SSE is very low
      if (sse < 50) {
        console.log('  -> Excellent solution found, stopping early');
        break;
      }
    }
  }

  if (!bestTargets) {
    console.error('ERROR: No solution found');
    process.exit(1);
  }

  console.log(`\nBest: violations=${bestViol}, sse=${bestSSE === Infinity ? 'N/A' : bestSSE.toFixed(1)}`);

  if (bestViol > 0) {
    console.log(`WARNING: ${bestViol} ranking violations could not be eliminated`);
  }

  // Compute final scaling
  const allRawFits: number[] = [];
  const allPercents: number[] = [];
  for (const cid of ['K1', 'K2', 'K3']) {
    for (const ph of PHASE_IDS) {
      allRawFits.push(computeRawFit(CANDIDATE_SCORES[cid], bestTargets[ph], WEIGHT_MATRIX[ph]));
      allPercents.push(EXPECTED_PERCENTS[cid][ph]);
    }
  }
  const { a, b } = fitScaling(allRawFits, allPercents);

  console.log(`\nRaw fit range: [${Math.min(...allRawFits).toFixed(4)}, ${Math.max(...allRawFits).toFixed(4)}]`);
  console.log(`Scaling: a=${a.toFixed(6)}, b=${b.toFixed(6)}`);
  console.log(`Formula: fitPercent = clamp(${a.toFixed(2)} * rawFit - ${b.toFixed(2)}, 0, 100)\n`);

  // Detailed evaluation
  let classificationMatches = 0;
  let rankingMatchCount = 0;

  for (const cid of ['K1', 'K2', 'K3']) {
    const phasePcts: Record<string, number> = {};
    const phaseRaws: Record<string, number> = {};

    for (const ph of PHASE_IDS) {
      const raw = computeRawFit(CANDIDATE_SCORES[cid], bestTargets[ph], WEIGHT_MATRIX[ph]);
      phaseRaws[ph] = raw;
      phasePcts[ph] = Math.round(Math.max(0, Math.min(100, a * raw - b)));
    }

    const computedOrder = Object.entries(phasePcts)
      .sort(([, pa], [, pb]) => pb - pa)
      .map(([ph]) => ph);
    const expectedOrder = EXPECTED_ORDERS[cid];
    const rankMatch = computedOrder.every((ph, i) => ph === expectedOrder[i]);
    if (rankMatch) rankingMatchCount++;

    console.log(`${cid} ranking: ${rankMatch ? 'CORRECT' : 'WRONG'}`);
    console.log(`  Computed: ${computedOrder.join(' > ')}`);
    console.log(`  Expected: ${expectedOrder.join(' > ')}`);

    for (const ph of expectedOrder) {
      const cPct = phasePcts[ph];
      const ePct = EXPECTED_PERCENTS[cid][ph];
      const cClass = classify(cPct);
      const eClass = classify(ePct);
      const match = cClass === eClass;
      if (match) classificationMatches++;
      const diff = Math.abs(cPct - ePct);
      console.log(
        `  ${ph.padEnd(14)}: ${String(cPct).padStart(3)}% ${cClass.padEnd(8)}` +
        ` | expected ${String(ePct).padStart(3)}% ${eClass.padEnd(8)}` +
        ` raw=${phaseRaws[ph].toFixed(4)} diff=${diff} ${match ? 'OK' : 'MISMATCH'}`
      );
    }
    console.log('');
  }

  console.log(`Rankings correct:       ${rankingMatchCount}/3`);
  console.log(`Classification matches: ${classificationMatches}/18`);

  // Output
  console.log('\n=== CALIBRATION OUTPUT ===\n');
  console.log('// Paste into src/data/phaseNorms.ts (replace TARGET_MATRIX):');
  console.log('const TARGET_MATRIX: Record<string, number[]> = {');
  for (const ph of PHASE_IDS) {
    const tgt = bestTargets[ph];
    console.log(`  ${ph.padEnd(14)}: [${tgt.map(t => String(t).padStart(2)).join(', ')}],`);
  }
  console.log('};\n');

  console.log('// Paste into src/data/scalingParams.ts:');
  console.log(`  a: ${a.toFixed(6)},`);
  console.log(`  b: ${b.toFixed(6)},\n`);

  const passed = bestViol === 0 && classificationMatches >= 16;
  if (passed) {
    console.log('CALIBRATION PASSED');
  } else {
    console.log('CALIBRATION FAILED');
    if (bestViol > 0) console.log(`  -> ${bestViol} ranking violations remain`);
    if (classificationMatches < 16) {
      console.log(`  -> Only ${classificationMatches}/18 classifications match (need >= 16)`);
    }
  }
}

main();
