import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeProvider';

interface Props {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

/** A themed stand-in for RN's Switch, whose thumb color can't be kept in sync with the app's accent theme. */
export function Toggle({ value, onValueChange }: Props) {
  const { theme } = useTheme();

  if (value) {
    return (
      <Pressable onPress={() => onValueChange(false)} hitSlop={8}>
        <LinearGradient
          colors={[theme.colors.ctaGradientFrom, theme.colors.ctaGradientVia, theme.colors.ctaGradientTo]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0.4 }}
          style={styles.track}
        >
          <View style={[styles.thumb, styles.thumbOn, { backgroundColor: '#fffdf8' }]} />
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={() => onValueChange(true)}
      hitSlop={8}
      style={[styles.track, { backgroundColor: theme.colors.bgCardStrong, borderWidth: 1.5, borderColor: theme.colors.borderSubtle }]}
    >
      <View style={[styles.thumb, { backgroundColor: '#fffdf8' }]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 46,
    height: 27,
    borderRadius: 999,
    padding: 3,
    justifyContent: 'center',
  },
  thumb: {
    width: 21,
    height: 21,
    borderRadius: 999,
    alignSelf: 'flex-start',
    shadowColor: '#40244a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  thumbOn: {
    alignSelf: 'flex-end',
  },
});
