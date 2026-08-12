import { SeriesPoint } from './series';

export type RegularityLabel = 'High Regularity' | 'Moderate Regularity' | 'Irregular' | 'Severely Irregular';

export interface RegularityResult {
  sdMinutes: number | null;
  label: RegularityLabel | null;
}

// Proxy bands for a Sleep-Regularity-Index-like qualitative read, since a true
// SRI needs continuous sleep/wake epoch data this app doesn't collect. Built
// instead from the standard deviation of a single time series (bedtime or
// wake time) across the selected window.
export const HIGH_REGULARITY_MAX_MINUTES = 30;
export const MODERATE_REGULARITY_MAX_MINUTES = 60;
export const IRREGULAR_MAX_MINUTES = 90;

function regularityLabel(sdMinutes: number): RegularityLabel {
  if (sdMinutes <= HIGH_REGULARITY_MAX_MINUTES) return 'High Regularity';
  if (sdMinutes <= MODERATE_REGULARITY_MAX_MINUTES) return 'Moderate Regularity';
  if (sdMinutes <= IRREGULAR_MAX_MINUTES) return 'Irregular';
  return 'Severely Irregular';
}

/** Population standard deviation of a series' confirmed minutes, bucketed into a qualitative regularity label. Null when fewer than 2 confirmed nights exist -- a single point has no meaningful spread. */
export function computeRegularity(series: SeriesPoint[]): RegularityResult {
  const values = series.map((p) => p.minutes).filter((v): v is number => v != null);
  if (values.length < 2) return { sdMinutes: null, label: null };
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  const sdMinutes = Math.round(Math.sqrt(variance));
  return { sdMinutes, label: regularityLabel(sdMinutes) };
}
