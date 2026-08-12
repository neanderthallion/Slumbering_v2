import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeProvider';
import { useToast } from '../../components/ToastProvider';
import { Card } from '../../components/Card';
import { RootStackParamList } from '../../app/navigation.types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

const LINKS = [
  { key: 'sleepScience', label: 'Sleep science references' },
  { key: 'termsOfService', label: 'Terms of service' },
  { key: 'contactUs', label: 'Contact us' },
  { key: 'feedback', label: 'Feedback' },
] as const;

export function AppInfoSection() {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const navigation = useNavigation<Nav>();

  return (
    <Card>
      <View style={styles.row}>
        <Text style={{ fontFamily: theme.fonts.bodyMedium, fontSize: 14 * theme.textScale, color: theme.colors.textHi, flex: 1 }}>Version</Text>
        <Text style={{ fontFamily: theme.fonts.body, fontSize: 13 * theme.textScale, color: theme.colors.textLow }}>1.0.0</Text>
      </View>
      {LINKS.map(({ key, label }) => (
        <Pressable
          key={key}
          onPress={() => (key === 'sleepScience' ? navigation.navigate('SleepScience') : showToast(`Opening ${label}`))}
          style={[styles.row, styles.linkRow, { borderTopColor: theme.colors.hairline }]}
        >
          <Text style={{ fontFamily: theme.fonts.bodyMedium, fontSize: 14 * theme.textScale, color: theme.colors.textHi, flex: 1 }}>{label}</Text>
          <Text style={{ color: theme.colors.textLow }}>→</Text>
        </Pressable>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  linkRow: { borderTopWidth: 1 },
});
