import { PhaseNorm, DimensionWeight } from '@/types/greiner';

// Weight structure from Marco briefing (Excel, unchanged)
// K = Critical (3), S = Supporting (1), - = Neutral (0)
//
// Phase -> [D01, D02, D03, D04, D05, D06, D07, D08, D09, D10, D11, D12, D13, D14]
const WEIGHT_MATRIX: Record<string, DimensionWeight[]> = {
  creativity:    [3, 1, 3, 1, 0, 1, 1, 3, 3, 0, 1, 1, 3, 1],
  direction:     [3, 1, 3, 3, 0, 1, 1, 3, 1, 1, 0, 1, 1, 3],
  delegation:    [0, 0, 3, 1, 1, 3, 3, 1, 1, 3, 3, 1, 0, 1],
  coordination:  [3, 1, 1, 0, 0, 0, 1, 3, 3, 1, 1, 1, 3, 3],
  collaboration: [1, 1, 0, 0, 1, 3, 1, 1, 3, 3, 1, 3, 1, 3],
  alliances:     [0, 3, 0, 1, 3, 3, 1, 0, 3, 1, 1, 1, 1, 3],
};

// THEORY-LOCKED: These targets are from Marco's Excel (Phase_Norms Doelscore). Never modify via calibration.
const TARGET_MATRIX: Record<string, number[]> = {
  //                D01  D02  D03  D04  D05  D06  D07  D08  D09  D10  D11  D12  D13  D14
  creativity:    [  3,  -1,  -3,  -1,   0,  -1,  -1,   2,  -3,   0,   1,   1,  -3,  -2],
  direction:     [ -2,  -1,  -2,  -3,   0,  -1,  -1,  -2,   1,  -1,   0,  -1,   1,   2],
  delegation:    [  0,   0,  -2,   0,  -1,   1,  -2,  -1,  -1,  -2,  -2,   1,   0,  -1],
  coordination:  [ -3,   2,   0,   0,   0,   0,   1,  -3,   3,  -2,  -1,  -2,   3,   3],
  collaboration: [  0,  -1,   0,   0,  -1,   1,   1,   1,  -3,  -2,  -2,   2,  -2,  -3],
  alliances:     [  0,  -3,   0,  -1,  -3,  -3,   1,   0,  -3,  -2,  -1,   2,  -1,  -3],
};

const PHASE_META: Record<string, { name: string; label: string }> = {
  creativity:    { name: 'Creativity',    label: 'Creativity -- Speed & Innovation' },
  direction:     { name: 'Direction',     label: 'Direction -- Structure & Control' },
  delegation:    { name: 'Delegation',    label: 'Delegation -- Autonomy & Trust' },
  coordination:  { name: 'Coordination',  label: 'Coordination -- Systems & Efficiency' },
  collaboration: { name: 'Collaboration', label: 'Collaboration -- Alignment & Adaptivity' },
  alliances:     { name: 'Alliances',     label: 'Alliances -- External Focus & Influence' },
};

const DIMENSION_IDS = ['D01','D02','D03','D04','D05','D06','D07','D08','D09','D10','D11','D12','D13','D14'];

export const PHASE_NORMS: PhaseNorm[] = Object.keys(WEIGHT_MATRIX).map(phaseId => ({
  phaseId,
  phaseName: PHASE_META[phaseId].name,
  phaseLabel: PHASE_META[phaseId].label,
  dimensions: DIMENSION_IDS.map((dimId, i) => ({
    dimensionId: dimId,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    target: TARGET_MATRIX[phaseId][i] as any,
    weight: WEIGHT_MATRIX[phaseId][i],
  })),
}));

// Re-export for calibration script access
export { WEIGHT_MATRIX, TARGET_MATRIX, PHASE_META, DIMENSION_IDS };
