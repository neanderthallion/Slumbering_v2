import { NightRecordsMap } from '../../../types/domain';
import { addDays, todayKey, parseTimeToMinutes } from '../../../lib/dateMath';
import { pickFromPool } from '../../../lib/dateSeed';
import { RECOMMENDATION_POOLS, RecommendationCategory } from '../pools/recommendationPools';
import { BedtimePeriod, buildBedtimeSeries, buildWakeSeries, buildDurationSeries, averageMinutes, normalizeBedtimeMinutes } from './series';
import { computeRegularity, isIrregularBand } from './regularity';

export interface Recommendation {
  category: RecommendationCategory;
  text: string;
}

const RECOMMENDED_DURATION_MINUTES = 8 * 60; // lower bound of the "8-10 hours" duration copy
const LATE_THRESHOLD_MINUTES = 30;

function pickWithinCategory(category: RecommendationCategory, period: BedtimePeriod, seedDate: string): string {
  const yesterdayStr = addDays(seedDate, -1);
  const yesterdayText = pickFromPool(RECOMMENDATION_POOLS[category], `${yesterdayStr}-${period}-${category}`);
  return pickFromPool(RECOMMENDATION_POOLS[category], `${seedDate}-${period}-${category}`, yesterdayText);
}

/**
 * Priority chain: short average duration outranks irregular timing, which
 * outranks a late average bedtime/wake time vs. the user's planned schedule,
 * falling back to a general tip when nothing stands out. Only the single
 * highest-priority category is surfaced, so the page shows one focused tip
 * instead of a wall of copy.
 */
export function pickRecommendation(
  records: NightRecordsMap,
  period: BedtimePeriod,
  targetBedtime: string,
  targetWakeTime: string,
  anchor: string = todayKey()
): Recommendation {
  const durationSeries = buildDurationSeries(records, period, anchor);
  const avgDuration = averageMinutes(durationSeries);
  if (avgDuration != null && avgDuration < RECOMMENDED_DURATION_MINUTES) {
    return { category: 'duration', text: pickWithinCategory('duration', period, anchor) };
  }

  const bedtimeSeries = buildBedtimeSeries(records, period, anchor);
  const wakeSeries = buildWakeSeries(records, period, anchor);
  const bedtimeRegularity = computeRegularity(bedtimeSeries);
  const wakeRegularity = computeRegularity(wakeSeries);
  if (isIrregularBand(bedtimeRegularity.band) || isIrregularBand(wakeRegularity.band)) {
    return { category: 'regularity', text: pickWithinCategory('regularity', period, anchor) };
  }

  const avgBedtime = averageMinutes(bedtimeSeries);
  const targetBedtimeMinutes = normalizeBedtimeMinutes(parseTimeToMinutes(targetBedtime));
  if (avgBedtime != null && avgBedtime - targetBedtimeMinutes > LATE_THRESHOLD_MINUTES) {
    return { category: 'bedtime', text: pickWithinCategory('bedtime', period, anchor) };
  }

  const avgWake = averageMinutes(wakeSeries);
  const targetWakeMinutes = parseTimeToMinutes(targetWakeTime);
  if (avgWake != null && avgWake - targetWakeMinutes > LATE_THRESHOLD_MINUTES) {
    return { category: 'wakeUp', text: pickWithinCategory('wakeUp', period, anchor) };
  }

  return { category: 'tips', text: pickWithinCategory('tips', period, anchor) };
}
