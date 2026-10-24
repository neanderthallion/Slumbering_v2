import { Directory, File, Paths } from 'expo-file-system';

import { isSoundId, SoundId } from '../catalog';
import { remoteAudioUrl } from './remoteUrl';

/** Subdirectory of the persistent document dir where downloaded mp3s live. */
const SUBDIR = 'sounds';
/** A real mp3 is comfortably larger than this; a smaller "download" is an error page. */
const MIN_VALID_BYTES = 1024;
const EXT = '.mp3';
/** How many leading bytes to sniff to catch an HTML error/redirect page saved as an mp3. */
const HTML_SNIFF_LENGTH = 20;

/** Thrown by `ensureAudioDownloaded` specifically when `baseUrl` is empty, so callers can tell this apart from a failed/invalid download. */
export class SoundBaseUrlNotConfiguredError extends Error {}

/**
 * A misconfigured or redirected host can return an HTML page instead of
 * audio; unlike a truncated/error response it's often well over
 * `MIN_VALID_BYTES`, so size alone can't catch it. Sniff the leading bytes
 * instead of trusting size.
 */
async function looksLikeHtml(file: File): Promise<boolean> {
  try {
    const head = await file.slice(0, HTML_SNIFF_LENGTH).text();
    return /^\s*<(!doctype html|html)/i.test(head);
  } catch {
    return false;
  }
}

/**
 * `Paths.document` survives app restarts and is not evicted by the OS (unlike
 * `Paths.cache`), so a track downloaded once stays available.
 */
function soundsDir(): Directory {
  return new Directory(Paths.document, SUBDIR);
}

/** The on-disk `File` handle for a track (may or may not exist yet). */
export function localAudioFile(id: SoundId): File {
  return new File(soundsDir(), `${id}${EXT}`);
}

/**
 * Reconcile the download directory against the catalog: which tracks are
 * already on disk. Used once at `SoundPlayerProvider` mount to seed the
 * "downloaded" indicators. Never throws.
 */
export function scanDownloadedSounds(): Set<SoundId> {
  const found = new Set<SoundId>();
  try {
    const dir = soundsDir();
    if (!dir.exists) return found;
    for (const entry of dir.list()) {
      const { name } = entry;
      if (!name.endsWith(EXT)) continue;
      const stem = name.slice(0, -EXT.length);
      if (isSoundId(stem)) found.add(stem);
    }
  } catch {
    // An unreadable directory means "nothing downloaded" -- callers can retry.
  }
  return found;
}

/**
 * Returns a local `file://` URI for the track, downloading it first if it isn't
 * already cached. Throws when `baseUrl` is empty, the HTTP request fails, or the
 * downloaded file looks invalid (in which case the bad file is removed).
 */
export async function ensureAudioDownloaded(id: SoundId, baseUrl: string): Promise<string> {
  const dir = soundsDir();
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });

  const file = localAudioFile(id);
  if (file.exists && (file.size ?? 0) > MIN_VALID_BYTES && !(await looksLikeHtml(file))) {
    return file.uri;
  }

  if (!baseUrl) throw new SoundBaseUrlNotConfiguredError('sound asset base url is not configured');

  await File.downloadFileAsync(remoteAudioUrl(id, baseUrl), file, { idempotent: true });

  if (!file.exists || (file.size ?? 0) < MIN_VALID_BYTES || (await looksLikeHtml(file))) {
    try {
      file.delete();
    } catch {
      // best effort
    }
    throw new Error(`downloaded audio for "${id}" looks invalid`);
  }
  return file.uri;
}

/** Delete every cached mp3. Not wired to UI yet; kept for future/debug use. Never throws. */
export function deleteAllDownloads(): void {
  try {
    const dir = soundsDir();
    if (dir.exists) dir.delete();
  } catch {
    // best effort
  }
}
