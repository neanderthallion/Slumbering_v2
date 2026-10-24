import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme/ThemeProvider';
import { TimelineRail } from './TimelineRail';

interface Props {
  text: string;
}

export function AchievementEntry({ text }: Props) {
  const { theme } = useTheme();
  const color = theme.colors.sage;

  return (
    <View style={styles.row}>
      <TimelineRail color={color} />
      <View style={styles.content}>
        <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 18 * theme.textScale, color }}>{`✧ ${text}`}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', paddingBottom: 22 },
  content: { flex: 1, paddingLeft: 12, flexDirection: 'row', alignItems: 'center', gap: 6 },
});
