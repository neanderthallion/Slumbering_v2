import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { SettingsState, NightRecordsMap } from '../../../lib/schemas';
import { todayKey } from '../../../lib/dateMath';

export async function exportBackup(settings: SettingsState, records: NightRecordsMap): Promise<void> {
  const payload = { exportedAt: new Date().toISOString(), settings, records };
  const json = JSON.stringify(payload, null, 2);
  const fileName = `slumbering-backup-${todayKey()}.json`;

  const file = new File(Paths.cache, fileName);
  file.write(json);
  await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: 'Export Slumbering backup' });
}
