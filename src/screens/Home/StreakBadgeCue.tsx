import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { COPY, fmt } from '../../copy';

interface Props {
  streak: number;
  milestoneProgressText: string | null;
}

/** Compact at-a-glance cue: current streak plus how close the nearest streak milestone is. Hidden entirely when there's nothing to show yet (brand new user, streak 0 and no milestone progress). */
export function StreakBadgeCue({ streak, milestoneProgressText }: Props) {
  const { theme } = useTheme();
  if (streak === 0 && !milestoneProgressText) return null;

  return (
    <View style={[styles.pill, { backgroundColor: theme.colors.accentSoft }]}>
      {streak > 0 && (
        <View style={styles.segment}>
          <Ionicons name="flame" size={13} color={theme.colors.amber} />
          <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 12.5 * theme.textScale, color: theme.colors.textHi, marginLeft: 4 }}>
            {fmt(COPY.home.streak, { count: streak })}
          </Text>
        </View>
      )}
      {streak > 0 && milestoneProgressText && (
        <Text style={{ fontFamily: theme.fonts.body, fontSize: 12.5 * theme.textScale, color: theme.colors.textLow, marginHorizontal: 6 }}>·</Text>
      )}
      {milestoneProgressText && (
        <Text style={{ fontFamily: theme.fonts.body, fontSize: 12.5 * theme.textScale, color: theme.colors.textMid, flexShrink: 1 }}>
          {milestoneProgressText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    marginBottom: 14,
  },
  segment: { flexDirection: 'row', alignItems: 'center' },
});
