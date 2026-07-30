import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface Props {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
  onPress?: () => void;
  strong?: boolean;
}

export function Card({ children, style, onPress, strong }: Props) {
  const { theme } = useTheme();
  const cardStyle = [
    styles.base,
    {
      backgroundColor: strong ? theme.colors.bgCardStrong : theme.colors.bgCard,
      borderColor: theme.colors.hairline,
      borderRadius: theme.radii.lg,
      padding: theme.spacing(5),
    },
    style,
  ];

  if (onPress) {
    return (
      <Pressable style={({ pressed }) => [cardStyle, pressed && styles.pressed]} onPress={onPress}>
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    marginBottom: 14,
  },
  pressed: {
    opacity: 0.85,
  },
});
