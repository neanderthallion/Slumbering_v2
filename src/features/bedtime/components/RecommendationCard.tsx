import React from 'react';
import { Text } from 'react-native';
import { useTheme } from '../../../theme/ThemeProvider';
import { Card } from '../../../components/Card';
import { Recommendation } from '../logic/recommendations';
import { COPY } from '../../../copy';

const CATEGORY_LABELS = COPY.bedtime.recommendationCategories;

interface Props {
  recommendation: Recommendation;
}

export function RecommendationCard({ recommendation }: Props) {
  const { theme } = useTheme();
  return (
    <Card variant="plain">
      <Text
        style={{
          fontFamily: theme.fonts.bodyBold,
          fontSize: 11 * theme.textScale,
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          color: theme.colors.accent,
          marginBottom: 6,
        }}
      >
        {CATEGORY_LABELS[recommendation.category]}
      </Text>
      <Text style={{ fontFamily: theme.fonts.body, fontSize: 14 * theme.textScale, lineHeight: 20, color: theme.colors.textHi }}>
        {recommendation.text}
      </Text>
    </Card>
  );
}
