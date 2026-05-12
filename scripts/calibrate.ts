/**
 * Calibration script for Greiner Phase Fit Tool (v2 Direction-Based Alignment).
 *
 * Usage: npx tsx scripts/calibrate.ts
 *
 * Purpose: Validate the production scoring engine against 3 reference candidates
 * (K1, K2, K3) by printing computed vs expected fit percentages, ranking orders,
 * and classification matches for all 6 Greiner phases.
 *
 * Imports directly from production code paths -- no duplicate formula.
 * Uses relative imports because tsx cannot resolve @/ path aliases.
 */

import { computeAllPhases } from '../src/engine/scoringEngine.ts';
import { validateAllCandidates } from '../src/engine/validation.ts';
import { REFERENCE_CANDIDATES } from '../src/data/referenceCandidates.ts';
import { PHASE_NORMS } from '../src/data/phaseNorms.ts';

// -------------------------
// Main
// -------------------------

function main() {
  console.log('=== Greiner Phase Fit Calibration (v2 Direction-Based Alignment) ===\n');

  let totalRankingsCorrect = 0;
  let totalClassificationMatches = 0;

  for (const candidate of REFERENCE_CANDIDATES) {
    const computedResults = computeAllPhases(candidate.scores, PHASE_NORMS);

    // Sort computed results by fitPercent descending
    const computedOrder = [...computedResults]
      .sort((a, b) => b.fitPercent - a.fitPercent)
      .map(r => r.phaseId);

    // Sort expected rankings by rank ascending
    const expectedOrder = [...candidate.expectedRankings]
      .sort((a, b) => a.rank - b.rank)
      .map(e => e.phaseId);

    const rankingMatch = computedOrder.every((phaseId, i) => phaseId === expectedOrder[i]);
    if (rankingMatch) totalRankingsCorrect++;

    console.log(`--- ${candidate.name} ---`);
    console.log(`Ranking: ${rankingMatch ? 'CORRECT' : 'WRONG'}`);
    console.log(`  Computed: ${computedOrder.join(' > ')}`);
    console.log(`  Expected: ${expectedOrder.join(' > ')}`);
    console.log('');

    // Print per-phase table header
    console.log(
      'Phase'.padEnd(15) +
      'Computed%'.padStart(10) +
      ' Computed Class'.padEnd(18) +
      'Expected%'.padStart(10) +
      ' Expected Class'.padEnd(18) +
      'Match'.padStart(8)
    );
    console.log('-'.repeat(80));

    // Print per-phase rows in expected ranking order
    for (const expectedEntry of [...candidate.expectedRankings].sort((a, b) => a.rank - b.rank)) {
      const computed = computedResults.find(r => r.phaseId === expectedEntry.phaseId);
      if (!computed) continue;

      const classMatch = computed.classification === expectedEntry.expectedClassification;
      if (classMatch) totalClassificationMatches++;

      console.log(
        computed.phaseId.padEnd(15) +
        String(computed.fitPercent).padStart(9) + '%' +
        (' ' + computed.classification).padEnd(18) +
        String(expectedEntry.expectedPercent).padStart(9) + '%' +
        (' ' + expectedEntry.expectedClassification).padEnd(18) +
        (classMatch ? 'OK' : 'MISMATCH').padStart(8)
      );
    }
    console.log('');
  }

  // -------------------------
  // Aggregate summary via validateAllCandidates
  // -------------------------
  const fullResult = validateAllCandidates(REFERENCE_CANDIDATES, PHASE_NORMS);

  console.log('=== Summary ===');
  console.log(`Rankings correct:       ${totalRankingsCorrect}/3`);
  console.log(`Classification matches: ${totalClassificationMatches}/18`);
  console.log(`Overall:                ${fullResult.passed ? 'PASSED' : 'FAILED'}`);

  if (!fullResult.allRankingsMatch) {
    console.log('\nWARNING: One or more ranking orders do not match expected orders.');
    for (const r of fullResult.candidates) {
      if (!r.rankingMatch) {
        const computedOrder = [...r.computedResults]
          .sort((a, b) => b.fitPercent - a.fitPercent)
          .map(res => res.phaseId);
        const expectedOrder = [...r.expectedRankings]
          .sort((a, b) => a.rank - b.rank)
          .map(e => e.phaseId);
        console.log(`  ${r.candidateId}: computed [${computedOrder.join(' > ')}] vs expected [${expectedOrder.join(' > ')}]`);
      }
    }
  }

  // Exit 0 always -- this is a diagnostic/reporting tool.
  // Use the PASSED/FAILED output above to evaluate engine correctness.
}

main();
