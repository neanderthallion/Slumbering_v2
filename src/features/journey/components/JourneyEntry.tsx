import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme/ThemeProvider';
import { NightRecord } from '../../../types/domain';
import { formatFriendlyDate } from '../../../lib/dateMath';
import { TimelineRail } from './TimelineRail';
import { COPY } from '../../../copy';

interface Props {
  record: NightRecord;
  onPress?: () => void;
}

export function JourneyEntry({ record, onPress }: Props) {
  const { theme } = useTheme();
  return (
    <Pressable style={styles.row} onPress={onPress} disabled={!onPress}>
      <TimelineRail color={theme.colors.accent} />
      <View style={styles.content}>
        <Text
          style={{
            fontFamily: theme.fonts.bodyBold,
            fontSize: 11 * theme.textScale,
            letterSpacing: 0.6,
            textTransform: 'uppercase',
            color: theme.colors.textLow,
            marginBottom: 6,
          }}
        >
          {formatFriendlyDate(record.date)}
          {record.source === 'backfilled' ? COPY.journey.addedLater : ''}
        </Text>
        {record.goals.map((g) => (
          <View key={g.goalId} style={styles.goalRow}>
            <Text style={{ color: g.achieved ? theme.colors.sage : theme.colors.textLow, fontSize: 12 }}>{g.achieved ? '●' : '○'}</Text>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 13.5 * theme.textScale, color: theme.colors.textMid }}>{g.label}</Text>
          </View>
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', paddingBottom: 22 },
  content: { flex: 1, paddingLeft: 12 },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
});
