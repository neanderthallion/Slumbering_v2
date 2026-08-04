import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { BadgeIcon } from '../../components/BadgeIcon';

interface Props {
  kind: 'engagementMilestone' | 'badge';
  text: string;
}

export function AchievementEntry({ kind, text }: Props) {
  const { theme } = useTheme();
  const color = kind === 'badge' ? theme.colors.amber : theme.colors.sage;

  return (
    <View style={styles.wrap}>
      <View style={[styles.dot, { backgroundColor: color, borderColor: theme.colors.bgBase }]} />
      <View style={styles.row}>
        {kind === 'badge' && <BadgeIcon size={16} color={color} />}
        <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 18 * theme.textScale, color }}>
          {kind === 'badge' ? text : `✧ ${text}`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingLeft: 22, paddingBottom: 22, position: 'relative' },
  dot: { position: 'absolute', left: -4.5, top: 4, width: 9, height: 9, borderRadius: 5, borderWidth: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
