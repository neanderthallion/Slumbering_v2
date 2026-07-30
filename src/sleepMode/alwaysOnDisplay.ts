/**
 * Neither iOS nor Android exposes a public API for an app to toggle
 * Always-on Display. Kept as a labeled no-op toggle in Settings rather than
 * removed, so the setting isn't silently dropped from the UI.
 */
export const alwaysOnDisplayAvailable = false;

export async function setAlwaysOnDisplay(_enabled: boolean): Promise<boolean> {
  return false;
}

export const alwaysOnDisplayPlatformNote = 'Not available on this platform.';
