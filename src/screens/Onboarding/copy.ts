import { COPY } from '../../copy';

// Ionicons names paired positionally with the loop-step labels in COPY.
const LOOP_ICONS = ['list-outline', 'moon-outline', 'checkmark-circle-outline'] as const;

/**
 * Re-shapes the flat `COPY.onboarding` block into the nested structure the
 * onboarding step components expect (loop steps carry an icon, evening/morning
 * are grouped). All display strings still originate from `COPY`.
 */
export const ONBOARDING_COPY = {
  ...COPY.onboarding,
  orient: {
    ...COPY.onboarding.orient,
    loop: COPY.onboarding.orient.loop.map((label, i) => ({ label, icon: LOOP_ICONS[i] })),
  },
  dailyActions: {
    headline: COPY.onboarding.dailyActions.headline,
    evening: {
      label: COPY.onboarding.dailyActions.eveningLabel,
      body: COPY.onboarding.dailyActions.eveningBody,
    },
    morning: {
      label: COPY.onboarding.dailyActions.morningLabel,
      body: COPY.onboarding.dailyActions.morningBody,
    },
    reassurance: COPY.onboarding.dailyActions.reassurance,
  },
};
