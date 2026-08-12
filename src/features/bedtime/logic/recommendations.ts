import { NightRecordsMap } from '../../../types/domain';
import { addDays, todayKey, parseTimeToMinutes } from '../../../lib/dateMath';
import { pickFromPool } from '../../../lib/dateSeed';
import { RECOMMENDATION_POOLS, RecommendationCategory } from '../pools/recommendationPools';
import { BedtimePeriod, buildBedtimeSeries, buildWakeSeries, buildDurationSeries, averageMinutes, normalizeBedtimeMinutes } from './series';
import { computeRegularity, RegularityLabel } from './regularity';

export interface Recommendation {
  category: RecommendationCategory;
  text: string;
}

const RECOMMENDED_DURATION_MINUTES = 8 * 60; // lower bound of the "8-10 hours" duration copy
const LATE_THRESHOLD_MINUTES = 30;

function isIrregular(label: RegularityLabel | null): boolean {
  return label === 'Irregular' || label === 'Severely Irregular';
}

function pickWithinCategory(category: RecommendationCategory, period: BedtimePeriod, todayStr: string): string {
  const yesterdayStr = addDays(todayStr, -1);
  const yesterdayText = pickFromPool(RECOMMENDATION_POOLS[category], `${yesterdayStr}-${period}-${category}`);
  return pickFromPool(RECOMMENDATION_POOLS[category], `${todayStr}-${period}-${category}`, yesterdayText);
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
  todayStr: string = todayKey()
): Recommendation {
  const durationSeries = buildDurationSeries(records, period, todayStr);
  const avgDuration = averageMinutes(durationSeries);
  if (avgDuration != null && avgDuration < RECOMMENDED_DURATION_MINUTES) {
    return { category: 'duration', text: pickWithinCategory('duration', period, todayStr) };
  }

  const bedtimeSeries = buildBedtimeSeries(records, period, todayStr);
  const wakeSeries = buildWakeSeries(records, period, todayStr);
  const bedtimeRegularity = computeRegularity(bedtimeSeries);
  const wakeRegularity = computeRegularity(wakeSeries);
  if (isIrregular(bedtimeRegularity.label) || isIrregular(wakeRegularity.label)) {
    return { category: 'regularity', text: pickWithinCategory('regularity', period, todayStr) };
  }

  const avgBedtime = averageMinutes(bedtimeSeries);
  const targetBedtimeMinutes = normalizeBedtimeMinutes(parseTimeToMinutes(targetBedtime));
  if (avgBedtime != null && avgBedtime - targetBedtimeMinutes > LATE_THRESHOLD_MINUTES) {
    return { category: 'bedtime', text: pickWithinCategory('bedtime', period, todayStr) };
  }

  const avgWake = averageMinutes(wakeSeries);
  const targetWakeMinutes = parseTimeToMinutes(targetWakeTime);
  if (avgWake != null && avgWake - targetWakeMinutes > LATE_THRESHOLD_MINUTES) {
    return { category: 'wakeUp', text: pickWithinCategory('wakeUp', period, todayStr) };
  }

  return { category: 'tips', text: pickWithinCategory('tips', period, todayStr) };
}
