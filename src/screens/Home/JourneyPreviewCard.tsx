import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Card } from '../../components/Card';
import { JourneyDotGraph } from '../../features/journey/components/JourneyDotGraph';
import { PastNightSummary } from '../../features/journey/logic/journeyEntries';
import { GoalCategory } from '../../types/domain';
import { GOAL_CATEGORIES } from '../../features/goals/logic/suggestedGoals';

interface Props {
  pastNights: PastNightSummary[];
  totalNights: number;
  strongestCategory: GoalCategory | null;
  onPress: () => void;
}

const CATEGORY_LABELS: Record<GoalCategory, string> = {
  ...Object.fromEntries(GOAL_CATEGORIES.map((c) => [c.key, c.label])),
  custom: 'Your own goals',
} as Record<GoalCategory, string>;

export function JourneyPreviewCard({ pastNights, totalNights, strongestCategory, onPress }: Props) {
  const { theme } = useTheme();

  return (
    <Card onPress={onPress}>
      <View style={styles.headerRow}>
        <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 11 * theme.textScale, letterSpacing: 1.2, textTransform: 'uppercase', color: theme.colors.textLow }}>
          Journey · Past week
        </Text>
        <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 12.5 * theme.textScale, color: theme.colors.accent }}>See all →</Text>
      </View>

      <View style={styles.graphWrap}>
        <JourneyDotGraph nights={pastNights} height={64} />
      </View>

      <Text style={{ fontFamily: theme.fonts.body, fontSize: 13 * theme.textScale, color: theme.colors.textMid, marginTop: 12, textAlign: 'center' }}>
        {totalNights > 0 ? `${totalNights} night(s) logged, drawn among the stars` : 'Your journey starts tonight.'}
      </Text>

      {strongestCategory && (
        <Text style={{ fontFamily: theme.fonts.displayItalic, fontSize: 13.5 * theme.textScale, color: theme.colors.amber, marginTop: 6, textAlign: 'center' }}>
          {`Strong point: ${CATEGORY_LABELS[strongestCategory]}`}
        </Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  graphWrap: { marginTop: 12 },
});
