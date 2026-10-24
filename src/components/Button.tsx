import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeProvider';

interface Props {
  label: string;
  onPress: () => void;
  /** primary: the fixed warm CTA gradient. ghost: bordered secondary pill (renamed in spirit from the old text-only ghost look to match the design system's "secondary" button). */
  variant?: 'primary' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ label, onPress, variant = 'primary', disabled, style }: Props) {
  const { theme } = useTheme();
  const isPrimary = variant === 'primary';

  const text = (
    <Text
      style={{
        fontFamily: theme.fonts.bodyBold,
        fontSize: 14 * theme.textScale,
        color: isPrimary ? theme.colors.ctaText : theme.colors.textHi,
      }}
    >
      {label}
    </Text>
  );

  if (isPrimary) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.shadowWrap,
          theme.shadows.cta,
          { opacity: disabled ? 0.45 : pressed ? 0.94 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
          style,
        ]}
      >
        <LinearGradient
          colors={[theme.colors.ctaGradientFrom, theme.colors.ctaGradientVia, theme.colors.ctaGradientTo]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0.4 }}
          style={styles.base}
        >
          {text}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: theme.colors.bgCard,
          borderColor: theme.colors.borderSubtle,
          borderWidth: 1.5,
          opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {text}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    alignSelf: 'center',
    borderRadius: 999,
  },
  base: {
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
});
