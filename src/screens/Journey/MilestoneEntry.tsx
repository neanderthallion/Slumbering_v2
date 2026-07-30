import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

export function MilestoneEntry({ text }: { text: string }) {
  const { theme } = useTheme();
  return (
    <View style={styles.wrap}>
      <View style={[styles.dot, { backgroundColor: theme.colors.amber, borderColor: theme.colors.bgBase }]} />
      <Text style={{ fontFamily: theme.fonts.displayItalic, fontSize: 15 * theme.textScale, color: theme.colors.amber }}>
        ✦ {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingLeft: 22, paddingBottom: 22, position: 'relative' },
  dot: { position: 'absolute', left: -4.5, top: 4, width: 9, height: 9, borderRadius: 5, borderWidth: 2 },
});
