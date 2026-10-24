import { SOUND_TRACKS, SoundId } from '../catalog';

/**
 * Builds the download URL for a track: the configured base URL joined to the
 * track's `remoteFile`. Pure -- the base URL is passed in (from
 * `getSoundAssetBaseUrl()`) so this stays testable.
 */
export function remoteAudioUrl(id: SoundId, baseUrl: string): string {
  const base = baseUrl.replace(/\/+$/, '');
  return `${base}/${SOUND_TRACKS[id].remoteFile}`;
}
