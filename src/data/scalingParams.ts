import { ScalingParams } from '@/types/greiner';

// Derived from least-squares fit against 18 reference data points
// Run: npx tsx scripts/calibrate.ts to regenerate
export const SCALING_PARAMS: ScalingParams = {
  a: 347.995104,  // Derived from OLS fit against 18 reference data points
  b: 217.060057,  // Run: npx tsx scripts/calibrate.ts to regenerate
};
