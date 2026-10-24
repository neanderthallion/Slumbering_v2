import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme/ThemeProvider';
import { TimelineRail } from './TimelineRail';

export function MilestoneEntry({ text }: { text: string }) {
  const { theme } = useTheme();
  return (
    <View style={styles.row}>
      <TimelineRail color={theme.colors.amber} />
      <View style={styles.content}>
        <Text style={{ fontFamily: theme.fonts.display, fontSize: 15 * theme.textScale, color: theme.colors.amber }}>✦ {text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', paddingBottom: 22 },
  content: { flex: 1, paddingLeft: 12, justifyContent: 'center' },
});
