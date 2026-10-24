import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Card } from '../../components/Card';
import { JourneyDotGraph } from '../../features/journey/components/JourneyDotGraph';
import { PastNightSummary } from '../../features/journey/logic/journeyEntries';
import { GoalCategory } from '../../types/domain';
import { COPY, fmt } from '../../copy';

interface Props {
  pastNights: PastNightSummary[];
  totalNights: number;
  strongestCategory: GoalCategory | null;
  onPress: () => void;
}

const CATEGORY_LABELS: Record<GoalCategory, string> = {
  bedtime: COPY.goalCategories.bedtime,
  windDown: COPY.goalCategories.windDown,
  relaxation: COPY.goalCategories.relaxation,
  custom: COPY.goalCategories.custom,
};

export function JourneyPreviewCard({ pastNights, totalNights, strongestCategory, onPress }: Props) {
  const { theme } = useTheme();

  return (
    <Card onPress={onPress}>
      <View style={styles.headerRow}>
        <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 11 * theme.textScale, letterSpacing: 1.2, textTransform: 'uppercase', color: theme.colors.textLow }}>
          {COPY.home.journeyPreview.header}
        </Text>
        <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 12.5 * theme.textScale, color: theme.colors.accent }}>{COPY.home.journeyPreview.seeAll}</Text>
      </View>

      <View style={styles.graphWrap}>
        <JourneyDotGraph nights={pastNights} height={112} />
      </View>

      <Text style={{ fontFamily: theme.fonts.body, fontSize: 13 * theme.textScale, color: theme.colors.textMid, marginTop: 12, textAlign: 'center' }}>
        {totalNights > 0
          ? fmt(COPY.home.journeyPreview.nightsLogged, { count: totalNights })
          : COPY.home.journeyPreview.journeyStartsTonight}
      </Text>

      {strongestCategory && (
        <Text style={{ fontFamily: theme.fonts.displayItalic, fontSize: 13.5 * theme.textScale, color: theme.colors.amber, marginTop: 6, textAlign: 'center' }}>
          {fmt(COPY.home.journeyPreview.strongPoint, { category: CATEGORY_LABELS[strongestCategory] })}
        </Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  graphWrap: { marginTop: 12 },
});
