import React, { useState } from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useTheme } from '../../theme/ThemeProvider';
import { useSettingsStore, selectSettingsState } from '../../store/settingsStore';
import { useRecordsStore } from '../../store/recordsStore';
import { useToast } from '../../components/ToastProvider';
import { Card } from '../../components/Card';
import { exportBackup } from '../../features/backup/logic/exportBackup';
import { pickAndValidateBackup, confirmDestructiveImport } from '../../features/backup/logic/importBackup';
import { COPY } from '../../copy';

export function BackupRestoreSection() {
  const { theme } = useTheme();
  const settingsState = useSettingsStore(useShallow(selectSettingsState));
  const records = useRecordsStore((s) => s.records);
  const restoreSettings = useSettingsStore((s) => s.restoreSettings);
  const restoreRecords = useRecordsStore((s) => s.restoreRecords);
  const { showToast } = useToast();
  const [busy, setBusy] = useState(false);

  async function handleExport() {
    setBusy(true);
    try {
      await exportBackup(settingsState, records);
      showToast(COPY.settings.backup.toastExported);
    } catch {
      showToast(COPY.settings.backup.toastExportFailed);
    } finally {
      setBusy(false);
    }
  }

  async function handleImport() {
    setBusy(true);
    try {
      const result = await pickAndValidateBackup();
      if (result.status === 'cancelled') return;
      if (result.status === 'invalidJson') {
        showToast(COPY.settings.backup.toastInvalidJson);
        return;
      }
      if (result.status === 'invalidShape') {
        showToast(COPY.settings.backup.toastInvalidShape);
        return;
      }
      const confirmed = await confirmDestructiveImport();
      if (confirmed) {
        restoreSettings(result.payload.settings);
        restoreRecords(result.payload.records);
        showToast(COPY.settings.backup.toastRestored);
      }
    } catch {
      showToast(COPY.settings.backup.toastImportFailed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <Pressable disabled={busy} onPress={handleExport} style={[styles.row, { opacity: busy ? 0.5 : 1 }]}>
        <Text style={{ fontFamily: theme.fonts.bodyMedium, fontSize: 14 * theme.textScale, color: theme.colors.textHi, flex: 1 }}>{COPY.settings.backup.export}</Text>
        <Text style={{ color: theme.colors.textLow }}>→</Text>
      </Pressable>
      <Pressable disabled={busy} onPress={handleImport} style={[styles.row, styles.linkRow, { borderTopColor: theme.colors.hairline, opacity: busy ? 0.5 : 1 }]}>
        <Text style={{ fontFamily: theme.fonts.bodyMedium, fontSize: 14 * theme.textScale, color: theme.colors.textHi, flex: 1 }}>{COPY.settings.backup.import}</Text>
        <Text style={{ color: theme.colors.textLow }}>→</Text>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  linkRow: { borderTopWidth: 1 },
});
