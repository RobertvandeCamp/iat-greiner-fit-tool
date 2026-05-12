/**
 * Calibration script for Greiner phase fit scaling parameters.
 *
 * Usage: npx tsx scripts/calibrate.ts
 *
 * Algorithm:
 * 1. Compute rawFit for each candidate x phase using fixed theory targets.
 * 2. OLS fit for scaling (a, b) against Marco's v2 expected percentages.
 * 3. Validate rankings match expected orders.
 *
 * Theory targets are NEVER modified by this script.
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

// THEORY-LOCKED: From Marco's Excel (Phase_Norms Doelscore). Read-only input to calibration.
const TARGET_MATRIX: Record<string, number[]> = {
  //                D01  D02  D03  D04  D05  D06  D07  D08  D09  D10  D11  D12  D13  D14
  creativity:    [  3,  -1,  -3,  -1,   0,  -1,  -1,   2,  -3,   0,   1,   1,  -3,  -2],
  direction:     [ -2,  -1,  -2,  -3,   0,  -1,  -1,  -2,   1,  -1,   0,  -1,   1,   2],
  delegation:    [  0,   0,  -2,   0,  -1,   1,  -2,  -1,  -1,  -2,  -2,   1,   0,  -1],
  coordination:  [ -3,   2,   0,   0,   0,   0,   1,  -3,   3,  -2,  -1,  -2,   3,   3],
  collaboration: [  0,  -1,   0,   0,  -1,   1,   1,   1,  -3,  -2,  -2,   2,  -2,  -3],
  alliances:     [  0,  -3,   0,  -1,  -3,  -3,   1,   0,  -3,  -2,  -1,   2,  -1,  -3],
};

const CANDIDATE_SCORES: Record<string, number[]> = {
  K1: [ 2, -1,  0,  0,  1,  0,  0,  0, -2,  3,  0,  2, -2, -1],
  K2: [ 3,  0, -2, -2,  0, -1,  2,  0,  1,  0, -1,  0, -1, -2],
  K3: [-3,  2, -1, -2,  3,  1, -1,  0,  0, -3,  2,  1, -3, -1],
};

// Expected fit percentages per candidate per phase (Marco's v2 document)
const EXPECTED_PERCENTS: Record<string, Record<string, number>> = {
  K1: { creativity: 82, alliances: 71, collaboration: 56, delegation: 49, direction: 28, coordination: 19 },
  K2: { direction: 81, delegation: 73, coordination: 68, alliances: 44, collaboration: 39, creativity: 34 },
  K3: { delegation: 76, creativity: 72, collaboration: 69, alliances: 61, direction: 47, coordination: 33 },
};

// Expected ranking orders per candidate (sorted by descending expected percent, Marco v2)
const EXPECTED_ORDERS: Record<string, string[]> = {
  K1: ['creativity', 'alliances', 'collaboration', 'delegation', 'direction', 'coordination'],
  K2: ['direction', 'delegation', 'coordination', 'alliances', 'collaboration', 'creativity'],
  K3: ['delegation', 'creativity', 'collaboration', 'alliances', 'direction', 'coordination'],
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
  console.log('=== Greiner Phase Fit Calibration (OLS-only) ===\n');

  // Collect all 18 (rawFit, expectedPercent) pairs
  const allRawFits: number[] = [];
  const allPercents: number[] = [];
  for (const cid of ['K1', 'K2', 'K3']) {
    for (const ph of PHASE_IDS) {
      allRawFits.push(computeRawFit(CANDIDATE_SCORES[cid], TARGET_MATRIX[ph], WEIGHT_MATRIX[ph]));
      allPercents.push(EXPECTED_PERCENTS[cid][ph]);
    }
  }

  // OLS fit for scaling (a, b)
  const { a, b } = fitScaling(allRawFits, allPercents);

  console.log(`Raw fit range: [${Math.min(...allRawFits).toFixed(4)}, ${Math.max(...allRawFits).toFixed(4)}]`);
  console.log(`Scaling: a=${a.toFixed(6)}, b=${b.toFixed(6)}`);
  console.log(`Formula: fitPercent = clamp(${a.toFixed(2)} * rawFit - ${b.toFixed(2)}, 0, 100)\n`);

  // Ranking validation and classification comparison
  let classificationMatches = 0;
  let rankingMatchCount = 0;
  const rankingMismatches: string[] = [];

  for (const cid of ['K1', 'K2', 'K3']) {
    const phasePcts: Record<string, number> = {};
    const phaseRaws: Record<string, number> = {};

    for (const ph of PHASE_IDS) {
      const raw = computeRawFit(CANDIDATE_SCORES[cid], TARGET_MATRIX[ph], WEIGHT_MATRIX[ph]);
      phaseRaws[ph] = raw;
      phasePcts[ph] = Math.round(Math.max(0, Math.min(100, a * raw - b)));
    }

    const computedOrder = Object.entries(phasePcts)
      .sort(([, pa], [, pb]) => pb - pa)
      .map(([ph]) => ph);
    const expectedOrder = EXPECTED_ORDERS[cid];
    const rankMatch = computedOrder.every((ph, i) => ph === expectedOrder[i]);
    if (rankMatch) {
      rankingMatchCount++;
    } else {
      rankingMismatches.push(
        `${cid}: computed [${computedOrder.join(' > ')}] vs expected [${expectedOrder.join(' > ')}]`
      );
    }

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

  if (rankingMismatches.length > 0) {
    console.log('\nWARNING: Rankings do not match expected orders');
    for (const msg of rankingMismatches) {
      console.log(`  ${msg}`);
    }
  }

  // Output
  console.log('\n=== CALIBRATION OUTPUT ===\n');
  console.log('// Paste into src/data/scalingParams.ts:');
  console.log(`  a: ${a.toFixed(6)},`);
  console.log(`  b: ${b.toFixed(6)},\n`);
}

main();
