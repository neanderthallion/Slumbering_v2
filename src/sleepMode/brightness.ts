import * as Brightness from 'expo-brightness';

const SLEEP_MODE_BRIGHTNESS = 0.12;

/**
 * Uses the app-level brightness API (no OS permission prompt), which only
 * dims the screen while Slumbering is in the foreground -- an intentional,
 * documented limitation rather than a bug: neither iOS nor Android lets an
 * Expo-managed app persistently change system brightness without extra
 * permissions.
 */
export async function lowerBrightness(): Promise<number | null> {
  try {
    const previous = await Brightness.getBrightnessAsync();
    await Brightness.setBrightnessAsync(SLEEP_MODE_BRIGHTNESS);
    return previous;
  } catch {
    return null;
  }
}

export async function restoreBrightness(previous: number | null): Promise<void> {
  if (previous == null) return;
  try {
    await Brightness.setBrightnessAsync(previous);
  } catch {
    // best-effort restore
  }
}
