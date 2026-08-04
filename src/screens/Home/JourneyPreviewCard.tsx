import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Card } from '../../components/Card';
import { MoonIcon } from '../../components/MoonIcon';
import { PastNightSummary } from '../../data/selectors';

interface Props {
  pastNights: PastNightSummary[];
  streak: number;
  totalNights: number;
  milestone?: { date: string; text: string };
  onPress: () => void;
}

export function JourneyPreviewCard({ pastNights, streak, totalNights, milestone, onPress }: Props) {
  const { theme } = useTheme();

  return (
    <Card onPress={onPress}>
      <View style={styles.headerRow}>
        <Text
          style={{
            fontFamily: theme.fonts.bodyBold,
            fontSize: 11 * theme.textScale,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            color: theme.colors.textLow,
          }}
        >
          Journey · Past week
        </Text>
        <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 12.5 * theme.textScale, color: theme.colors.accent }}>
          See all →
        </Text>
      </View>

      <View style={styles.moonRow}>
        {pastNights.map((n) => (
          <MoonIcon key={n.date} phase={n.phase} size={22} />
        ))}
      </View>

      {totalNights === 0 ? (
        <Text style={{ fontFamily: theme.fonts.body, fontSize: 13 * theme.textScale, color: theme.colors.textMid, marginTop: 12 }}>
          Your journey starts tonight.
        </Text>
      ) : milestone ? (
        <Text
          style={{
            fontFamily: theme.fonts.displayItalic,
            fontSize: 14.5 * theme.textScale,
            color: theme.colors.amber,
            marginTop: 12,
          }}
        >
          ✦ {milestone.text}
        </Text>
      ) : (
        <Text style={{ fontFamily: theme.fonts.body, fontSize: 13 * theme.textScale, color: theme.colors.textMid, marginTop: 12 }}>
          {streak > 0
            ? `${streak}-night streak · ${totalNights} night${totalNights > 1 ? 's' : ''} logged`
            : `${totalNights} night${totalNights > 1 ? 's' : ''} logged`}
        </Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  moonRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
});
