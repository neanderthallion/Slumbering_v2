import { Alert } from 'react-native';
import { File } from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { BackupPayloadSchema, BackupPayload } from '../../../lib/schemas';
import { COPY } from '../../../copy';

export type PickBackupResult =
  | { status: 'cancelled' }
  | { status: 'invalidJson' }
  | { status: 'invalidShape' }
  | { status: 'ok'; payload: BackupPayload };

export async function pickAndValidateBackup(): Promise<PickBackupResult> {
  const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
  if (result.canceled) return { status: 'cancelled' };

  const text = await new File(result.assets[0].uri).text();

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { status: 'invalidJson' };
  }

  const validated = BackupPayloadSchema.safeParse(parsed);
  if (!validated.success) return { status: 'invalidShape' };

  return { status: 'ok', payload: validated.data };
}

/**
 * Native destructive-confirm dialog, isolated in its own function so it's mockable in tests
 * independent of the Alert.alert call itself. Returns a promise that resolves once the user
 * responds -- true if they confirmed, false if they cancelled -- so a caller can keep a busy/
 * loading state active for the dialog's full lifetime instead of resetting it the instant the
 * (non-blocking) Alert.alert call returns.
 */
export function confirmDestructiveImport(): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(COPY.settings.backup.confirmTitle, COPY.settings.backup.confirmMessage, [
      { text: COPY.settings.backup.confirmCancel, style: 'cancel', onPress: () => resolve(false) },
      { text: COPY.settings.backup.confirmImport, style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}
