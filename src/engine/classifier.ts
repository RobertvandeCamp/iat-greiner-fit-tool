import { ClassificationBand, Classification } from '@/types/greiner';

/**
 * Classify a fit percentage using a configurable set of bands.
 * Bands are matched from highest `min` downward; the first whose `min` is
 * <= fitPercent wins. A band with min 0 acts as the catch-all.
 * If no band's `min` is <= fitPercent (i.e. there is no catch-all band and the
 * value falls below all of them), returns '—' rather than mislabelling it with
 * the lowest band's label.
 */
export function classify(fitPercent: number, bands: ClassificationBand[]): Classification {
  const sorted = [...bands].sort((a, b) => b.min - a.min);
  for (const band of sorted) {
    if (fitPercent >= band.min) return band.label;
  }
  return '—';
}
