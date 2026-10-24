import React, { ReactNode } from 'react';
import { ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';

interface Props {
  children: ReactNode;
  contentStyle?: ViewStyle;
  keyboardShouldPersistTaps?: 'always' | 'handled' | 'never';
  /** Rendered as a sibling of the ScrollView (not scrolled with content) -- for a floating FAB, a full-screen modal, etc. */
  overlay?: ReactNode;
}

export function ScreenContainer({ children, contentStyle, keyboardShouldPersistTaps, overlay }: Props) {
  const { theme } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bgBase }} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={[styles.content, contentStyle]}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      >
        {children}
      </ScrollView>
      {overlay}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 60 },
});
