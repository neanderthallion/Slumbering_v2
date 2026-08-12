import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../theme/ThemeProvider';

interface Props {
  checked: boolean;
  onPress?: () => void;
  disabled?: boolean;
}

export function Checkbox({ checked, onPress, disabled }: Props) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      style={[
        styles.box,
        {
          borderColor: checked ? theme.colors.accent : theme.colors.hairline,
          backgroundColor: checked ? theme.colors.accent : 'transparent',
          opacity: disabled ? 0.35 : 1,
        },
      ]}
    >
      {checked && (
        <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
          <Path d="M20 6L9 17l-5-5" stroke={theme.colors.accentContrastText} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
