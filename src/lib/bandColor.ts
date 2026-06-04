import type { ClassificationBand } from '@/types/greiner'

/**
 * Colour by the band the value actually falls into (consistent with classify),
 * NOT by fixed percentage cutoffs — so colours follow the configurable bands.
 *
 * Bands are ranked highest-min first; the matching band's rank is mapped onto a
 * top→bottom palette (green → blue → amber → red). Values below all bands get a
 * neutral colour.
 */

const TEXT = [
  'bg-green-100 text-green-800 border-green-200',
  'bg-blue-100 text-blue-800 border-blue-200',
  'bg-amber-100 text-amber-800 border-amber-200',
  'bg-red-100 text-red-800 border-red-200',
]
const CHART = [
  { fill: '#dcfce7', stroke: '#166534' },
  { fill: '#dbeafe', stroke: '#1e40af' },
  { fill: '#fef3c7', stroke: '#92400e' },
  { fill: '#fee2e2', stroke: '#991b1b' },
]
const NEUTRAL_TEXT = 'bg-muted text-muted-foreground border-border'
const NEUTRAL_CHART = { fill: '#e5e7eb', stroke: '#6b7280' }

/** Palette index 0..3 for the matching band, or -1 if below all bands. */
export function bandIndex(fitPercent: number, bands: ClassificationBand[]): number {
  const sorted = [...bands].sort((a, b) => b.min - a.min)
  const n = sorted.length
  const k = sorted.findIndex((b) => fitPercent >= b.min)
  if (k < 0 || n === 0) return -1
  if (n === 1) return 0
  return Math.round((k / (n - 1)) * (TEXT.length - 1))
}

export function bandTextClass(fitPercent: number, bands: ClassificationBand[]): string {
  const i = bandIndex(fitPercent, bands)
  return i < 0 ? NEUTRAL_TEXT : TEXT[i]
}

export function bandChartColor(fitPercent: number, bands: ClassificationBand[]): { fill: string; stroke: string } {
  const i = bandIndex(fitPercent, bands)
  return i < 0 ? NEUTRAL_CHART : CHART[i]
}
