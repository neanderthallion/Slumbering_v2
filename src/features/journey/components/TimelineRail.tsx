import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme/ThemeProvider';

interface Props {
  color: string;
}

export const RAIL_WIDTH = 22;
const DOT_SIZE = 10;

/**
 * A fixed-width column with a dot centered on it, near the top (aligned to
 * the entry's first line of text). The continuous vertical line itself is
 * drawn once by the parent list (TimelineList) behind all entries, so it
 * reads as one unbroken rail instead of resetting per entry.
 */
export function TimelineRail({ color }: Props) {
  const { theme } = useTheme();
  return (
    <View style={styles.rail}>
      <View style={[styles.dot, { backgroundColor: color, borderColor: theme.colors.bgBase }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  rail: { width: RAIL_WIDTH, alignItems: 'center' },
  dot: { marginTop: 4, width: DOT_SIZE, height: DOT_SIZE, borderRadius: DOT_SIZE / 2, borderWidth: 2, zIndex: 1 },
});
