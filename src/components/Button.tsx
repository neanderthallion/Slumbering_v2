import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ label, onPress, variant = 'primary', disabled, style }: Props) {
  const { theme } = useTheme();
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: isPrimary ? theme.colors.accent : theme.colors.bgCard,
          borderColor: isPrimary ? 'transparent' : theme.colors.hairline,
          borderWidth: isPrimary ? 0 : 1,
          borderRadius: theme.radii.sm,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      <Text
        style={{
          fontFamily: theme.fonts.bodyBold,
          fontSize: 14 * theme.textScale,
          color: isPrimary ? theme.colors.accentContrastText : theme.colors.textHi,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 13,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
});
