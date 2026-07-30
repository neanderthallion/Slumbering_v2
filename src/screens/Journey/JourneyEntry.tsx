import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { NightRecord } from '../../types/models';
import { formatFriendlyDate } from '../../utils/date';

export function JourneyEntry({ record }: { record: NightRecord }) {
  const { theme } = useTheme();
  return (
    <View style={styles.wrap}>
      <View style={[styles.dot, { backgroundColor: theme.colors.accent, borderColor: theme.colors.bgBase }]} />
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
        {record.source === 'backfilled' ? ' · added later' : ''}
      </Text>
      {record.goals.map((g) => (
        <View key={g.goalId} style={styles.goalRow}>
          <Text style={{ color: g.achieved ? theme.colors.sage : theme.colors.textLow, fontSize: 12 }}>
            {g.achieved ? '●' : '○'}
          </Text>
          <Text style={{ fontFamily: theme.fonts.body, fontSize: 13.5 * theme.textScale, color: theme.colors.textMid }}>
            {g.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingLeft: 22, paddingBottom: 22, position: 'relative' },
  dot: { position: 'absolute', left: -4.5, top: 4, width: 9, height: 9, borderRadius: 5, borderWidth: 2 },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
});
