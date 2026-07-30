import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useToast } from '../../components/ToastProvider';
import { Card } from '../../components/Card';

const LINKS = ['Sleep science references', 'Terms of service', 'Contact us', 'Feedback'];

export function AppInfoSection() {
  const { theme } = useTheme();
  const { showToast } = useToast();

  return (
    <Card>
      <View style={styles.row}>
        <Text style={{ fontFamily: theme.fonts.bodyMedium, fontSize: 14 * theme.textScale, color: theme.colors.textHi, flex: 1 }}>
          Version
        </Text>
        <Text style={{ fontFamily: theme.fonts.body, fontSize: 13 * theme.textScale, color: theme.colors.textLow }}>1.0.0</Text>
      </View>
      {LINKS.map((label) => (
        <Pressable
          key={label}
          onPress={() => showToast(`Opening ${label.toLowerCase()}`)}
          style={[styles.row, styles.linkRow, { borderTopColor: theme.colors.hairline }]}
        >
          <Text style={{ fontFamily: theme.fonts.bodyMedium, fontSize: 14 * theme.textScale, color: theme.colors.textHi, flex: 1 }}>
            {label}
          </Text>
          <Text style={{ color: theme.colors.textLow }}>{'→'}</Text>
        </Pressable>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  linkRow: { borderTopWidth: 1 },
});
