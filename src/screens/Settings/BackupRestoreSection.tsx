import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, Alert } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '../../theme/ThemeContext';
import { useAppData } from '../../data/AppDataContext';
import { useToast } from '../../components/ToastProvider';
import { Card } from '../../components/Card';
import { AppSettings, NightRecordsMap } from '../../types/models';
import { todayKey } from '../../utils/date';

interface BackupPayload {
  exportedAt: string;
  settings: AppSettings;
  records: NightRecordsMap;
}

function isBackupPayload(value: unknown): value is BackupPayload {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.settings === 'object' && v.settings != null && typeof v.records === 'object' && v.records != null;
}

export function BackupRestoreSection() {
  const { theme } = useTheme();
  const { settings, records, restoreBackup } = useAppData();
  const { showToast } = useToast();
  const [busy, setBusy] = useState(false);

  async function handleExport() {
    setBusy(true);
    try {
      const payload: BackupPayload = { exportedAt: new Date().toISOString(), settings, records };
      const json = JSON.stringify(payload, null, 2);
      const fileName = `slumbering-backup-${todayKey()}.json`;

      if (Platform.OS === 'web') {
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        const file = new File(Paths.cache, fileName);
        file.write(json);
        await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: 'Export Slumbering backup' });
      }
      showToast('Backup exported');
    } catch {
      showToast('Could not export backup');
    } finally {
      setBusy(false);
    }
  }

  async function handleImport() {
    setBusy(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
      if (result.canceled) return;
      const asset = result.assets[0];

      const text = Platform.OS === 'web' && asset.file ? await asset.file.text() : await new File(asset.uri).text();

      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        showToast('That file is not valid JSON');
        return;
      }
      if (!isBackupPayload(parsed)) {
        showToast("That file doesn't look like a Slumbering backup");
        return;
      }

      const doImport = () => {
        restoreBackup(parsed.settings, parsed.records);
        showToast('Backup restored');
      };

      if (Platform.OS === 'web') {
        // react-native-web's Alert has no confirm affordance; fall back to window.confirm.
        if (window.confirm('Importing will replace all current goals, journey history, and settings. Continue?')) {
          doImport();
        }
      } else {
        Alert.alert(
          'Replace current data?',
          'Importing will replace all current goals, journey history, and settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Import', style: 'destructive', onPress: doImport },
          ]
        );
      }
    } catch {
      showToast('Could not import backup');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <Pressable
        disabled={busy}
        onPress={handleExport}
        style={[styles.row, styles.linkRow, { borderTopColor: theme.colors.hairline, opacity: busy ? 0.5 : 1 }]}
      >
        <Text style={{ fontFamily: theme.fonts.bodyMedium, fontSize: 14 * theme.textScale, color: theme.colors.textHi, flex: 1 }}>
          Export backup
        </Text>
        <Text style={{ color: theme.colors.textLow }}>{'→'}</Text>
      </Pressable>
      <Pressable
        disabled={busy}
        onPress={handleImport}
        style={[styles.row, styles.linkRow, { borderTopColor: theme.colors.hairline, opacity: busy ? 0.5 : 1 }]}
      >
        <Text style={{ fontFamily: theme.fonts.bodyMedium, fontSize: 14 * theme.textScale, color: theme.colors.textHi, flex: 1 }}>
          Import backup
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
