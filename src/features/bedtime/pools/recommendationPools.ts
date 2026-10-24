import { COPY } from '../../../copy';

/** Bedtime-page sleep-education tip pools. Copy lives in `COPY.bedtime.recommendationPools`. */
export const RECOMMENDATION_POOLS = COPY.bedtime.recommendationPools;

export type RecommendationCategory = keyof typeof RECOMMENDATION_POOLS;
