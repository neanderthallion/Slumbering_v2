import React from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeProvider';
import { RootStackParamList } from '../app/navigation.types';

/**
 * Every screen's in-content back control navigates straight to Home. Per
 * CLAUDE.md §3, AddPastRecord is the only exception (it uses goBack()
 * instead) -- it hardcodes that behavior itself rather than this component
 * taking a mode switch, so the exception stays easy to find at its call
 * site instead of being buried in a shared prop.
 */
export function BackRow() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <Pressable onPress={() => navigation.navigate('Home')} style={styles.backRow}>
      <Ionicons name="chevron-back" size={16} color={theme.colors.textMid} />
      <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 13 * theme.textScale, color: theme.colors.textMid }}>
        Home
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 14 },
});
