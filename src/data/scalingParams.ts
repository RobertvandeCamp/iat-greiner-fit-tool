import { ScalingParams } from '@/types/greiner';

// Derived from OLS fit against 18 reference data points (3 candidates x 6 phases)
// Theory targets: fixed from Excel (Phase_Norms Doelscore) -- never modified by calibration
// Reference data: Marco's v2 expected percentages
// Run: npx tsx scripts/calibrate.ts to regenerate
export const SCALING_PARAMS: ScalingParams = {
  a: 70.130332,  // from OLS fit
  b: -10.963781,  // from OLS fit
};
