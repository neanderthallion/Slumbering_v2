import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

interface Props {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
  onPress?: () => void;
  /** plain: default soft card. organic: asymmetric blob radius, one per screen. night: dusk tone, used for bedtime/sleep content regardless of theme. */
  variant?: 'plain' | 'organic' | 'night';
}

export function Card({ children, style, onPress, variant = 'plain' }: Props) {
  const { theme } = useTheme();
  const isNight = variant === 'night';
  const radius =
    variant === 'organic'
      ? theme.radii.organic
      : {
          topLeft: theme.radii.lg,
          topRight: theme.radii.lg,
          bottomRight: theme.radii.lg,
          bottomLeft: theme.radii.lg,
        };

  const radiusStyle = {
    borderTopLeftRadius: radius.topLeft,
    borderTopRightRadius: radius.topRight,
    borderBottomRightRadius: radius.bottomRight,
    borderBottomLeftRadius: radius.bottomLeft,
  };

  const backgroundColor = isNight ? theme.colors.nightGradientFrom : theme.colors.bgCard;

  // Shadow lives on the outer wrapper (shadows are clipped by overflow:hidden on
  // iOS), while the background + rounded corners live on an inner clipped layer.
  // Plain View + backgroundColor (no LinearGradient) so the layer has an intrinsic
  // size from its content instead of depending on the gradient node's own layout,
  // which is what was causing cards to stretch to fill unbounded height on web.
  const content = (
    <View style={[styles.shadowWrap, radiusStyle, isNight ? theme.shadows.panel : theme.shadows.card, style]}>
      <View style={[styles.surface, radiusStyle, { backgroundColor, padding: theme.spacing(5) }]}>{children}</View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  shadowWrap: {
    marginBottom: 14,
  },
  surface: {
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.9,
  },
});
