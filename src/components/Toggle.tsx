import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface Props {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

/**
 * react-native-web's Switch renders its thumb as a native OS control and
 * ignores `thumbColor`, so it can't be kept in sync with the app's accent
 * theme there. This is a themed stand-in that renders identically on every
 * platform.
 */
export function Toggle({ value, onValueChange }: Props) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      hitSlop={8}
      style={[styles.track, { backgroundColor: value ? theme.colors.accent : theme.colors.hairline }]}
    >
      <View style={[styles.thumb, value && styles.thumbOn]} />
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
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
  },
  thumbOn: {
    alignSelf: 'flex-end',
  },
});
