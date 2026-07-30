import React from 'react';
import { View, Text, Switch, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAppData } from '../../data/AppDataContext';
import { useToast } from '../../components/ToastProvider';
import { Card } from '../../components/Card';

export function BackupRestoreSection() {
  const { theme } = useTheme();
  const { showToast } = useToast();

  return (
    <Card>
      <View style={styles.row}>
        <Text style={{ fontFamily: theme.fonts.bodyMedium, fontSize: 14 * theme.textScale, color: theme.colors.textHi, flex: 1 }}>
          Back up with Dropbox
        </Text>
        <Switch
          value={false}
          onValueChange={() => showToast('Dropbox backup is coming soon')}
          trackColor={{ true: theme.colors.accent, false: theme.colors.hairline }}
        />
      </View>
      <Pressable onPress={() => showToast('CSV export is coming soon')} style={[styles.row, styles.linkRow, { borderTopColor: theme.colors.hairline }]}>
        <Text style={{ fontFamily: theme.fonts.bodyMedium, fontSize: 14 * theme.textScale, color: theme.colors.textHi, flex: 1 }}>
          Export entries to CSV
        </Text>
        <Text style={{ color: theme.colors.textLow }}>{'→'}</Text>
      </Pressable>
      <Pressable onPress={() => showToast('Import from backup is coming soon')} style={[styles.row, styles.linkRow, { borderTopColor: theme.colors.hairline }]}>
        <Text style={{ fontFamily: theme.fonts.bodyMedium, fontSize: 14 * theme.textScale, color: theme.colors.textHi, flex: 1 }}>
          Import entries from backup
        </Text>
        <Text style={{ color: theme.colors.textLow }}>{'→'}</Text>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  linkRow: { borderTopWidth: 1 },
});
