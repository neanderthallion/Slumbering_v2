import { SeriesPoint } from './series';

/**
 * Qualitative regularity buckets. These are identifier keys, not display text --
 * the Vietnamese labels live in `COPY.bedtime.regularity[band]`.
 */
export type RegularityBand = 'verySteady' | 'fairlySteady' | 'aBitVariable' | 'quiteVariable';

export interface RegularityResult {
  sdMinutes: number | null;
  band: RegularityBand | null;
}

// Proxy bands for a Sleep-Regularity-Index-like qualitative read, since a true
// SRI needs continuous sleep/wake epoch data this app doesn't collect. Built
// instead from the standard deviation of a single time series (bedtime or
// wake time) across the selected window.
export const HIGH_REGULARITY_MAX_MINUTES = 30;
export const MODERATE_REGULARITY_MAX_MINUTES = 60;
export const IRREGULAR_MAX_MINUTES = 90;

function regularityBand(sdMinutes: number): RegularityBand {
  if (sdMinutes <= HIGH_REGULARITY_MAX_MINUTES) return 'verySteady';
  if (sdMinutes <= MODERATE_REGULARITY_MAX_MINUTES) return 'fairlySteady';
  if (sdMinutes <= IRREGULAR_MAX_MINUTES) return 'aBitVariable';
  return 'quiteVariable';
}

/** Population standard deviation of a series' confirmed minutes, bucketed into a qualitative regularity band. Null when fewer than 2 confirmed nights exist -- a single point has no meaningful spread. */
export function computeRegularity(series: SeriesPoint[]): RegularityResult {
  const values = series.map((p) => p.minutes).filter((v): v is number => v != null);
  if (values.length < 2) return { sdMinutes: null, band: null };
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  const sdMinutes = Math.round(Math.sqrt(variance));
  return { sdMinutes, band: regularityBand(sdMinutes) };
}

/** The two bands the personalized recommendation treats as "irregular timing". */
export function isIrregularBand(band: RegularityBand | null): boolean {
  return band === 'aBitVariable' || band === 'quiteVariable';
}
