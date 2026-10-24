import Constants from 'expo-constants';

/**
 * Base URL the Sound screen's mp3s are fetched from. Set via
 * `app.json` -> `expo.extra.soundAssetBaseUrl`. The host isn't decided yet, so
 * this defaults to `''` -- an empty value makes the Sound screen show a
 * "chưa sẵn sàng" toast instead of attempting a download.
 */
export function getSoundAssetBaseUrl(): string {
  const value = Constants.expoConfig?.extra?.soundAssetBaseUrl;
  return typeof value === 'string' ? value.trim() : '';
}
