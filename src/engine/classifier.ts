import { ClassificationBand, Classification } from '@/types/greiner';

/**
 * Classify a fit percentage using a configurable set of bands.
 * Bands are matched from highest `min` downward; the first whose `min` is
 * <= fitPercent wins. A band with min 0 acts as the catch-all.
 */
export function classify(fitPercent: number, bands: ClassificationBand[]): Classification {
  const sorted = [...bands].sort((a, b) => b.min - a.min);
  for (const band of sorted) {
    if (fitPercent >= band.min) return band.label;
  }
  return sorted.length ? sorted[sorted.length - 1].label : 'Mismatch';
}
