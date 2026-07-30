import { Platform } from 'react-native';

/**
 * Real system Do Not Disturb control needs a native module (Android's
 * ACCESS_NOTIFICATION_POLICY + NotificationManager.setInterruptionFilter has
 * no Expo-managed JS API, and iOS exposes no public API for this at all).
 * That module requires an EAS development build and is deferred to a later
 * pass -- see the plan's Sleep Mode phase. This stub keeps the rest of the
 * app (Expo Go compatible) working today, with the toggle visibly labeled
 * "not available" in Settings rather than silently doing nothing.
 */
export const dndAvailable = false;

export async function isDndAccessGranted(): Promise<boolean> {
  return false;
}

export async function requestDndAccess(): Promise<boolean> {
  return false;
}

export async function setDndEnabled(_enabled: boolean): Promise<boolean> {
  return false;
}

export const dndPlatformNote =
  Platform.OS === 'ios'
    ? 'iOS has no public API for apps to toggle Do Not Disturb.'
    : 'Requires a development build with Do Not Disturb access granted (coming soon).';
