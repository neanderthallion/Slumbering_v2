import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { createAudioPlayer, useAudioPlayerStatus, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

import { COPY } from '../../copy';
import { useToast } from '../../components/ToastProvider';
import { SOUND_TRACKS, SoundId, SoundTrack } from './catalog';
import { getSoundAssetBaseUrl } from './config';
import {
  ensureAudioDownloaded,
  scanDownloadedSounds,
  SoundBaseUrlNotConfiguredError,
} from './logic/audioCache';

interface SoundPlayerContextValue {
  currentId: SoundId | null;
  currentTrack: SoundTrack | null;
  isPlaying: boolean;
  /** Tracks whose mp3 is already cached on disk -- drives the "downloaded" dot. */
  downloadedIds: Set<SoundId>;
  /** The track currently downloading, if any. Only one download runs at a time. */
  downloadingId: SoundId | null;
  /** Tap a track: starts it, or toggles play/pause if it's already the current one. */
  playTrack: (id: SoundId) => void;
  /** Play/pause the current track. No-op when nothing is selected. */
  toggle: () => void;
}

const SoundPlayerContext = createContext<SoundPlayerContextValue | null>(null);

/**
 * One looping audio player for the whole app, created imperatively (not the
 * component-scoped `useAudioPlayer` hook) so it lives for the app's lifetime and
 * keeps playing across tab switches and while backgrounded. Background playback
 * is enabled via `app.json`'s `expo-audio` plugin (`enableBackgroundPlayback:
 * true`) plus the `setAudioModeAsync` call below -- see CLAUDE.md §1/§5.
 *
 * The mp3s are not bundled: the first tap on a track downloads it to persistent
 * storage (`logic/audioCache.ts`) and every later tap plays the cached file.
 */
export function SoundPlayerProvider({ children }: { children: ReactNode }) {
  // Lazy `useState` init creates the player exactly once and keeps a stable ref
  // to it for the provider's lifetime.
  const [player] = useState<AudioPlayer>(() => {
    const p = createAudioPlayer(null, { updateInterval: 500 });
    p.loop = true; // seamless native repeat
    return p;
  });

  const { showToast } = useToast();
  const [currentId, setCurrentId] = useState<SoundId | null>(null);
  // Seeded from whatever survived the last app run -- the scan is a synchronous
  // directory read, so it belongs in the lazy initializer rather than an effect.
  const [downloadedIds, setDownloadedIds] = useState<Set<SoundId>>(scanDownloadedSounds);
  const [downloadingId, setDownloadingId] = useState<SoundId | null>(null);
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    // `doNotMix` is what makes the lock-screen / notification transport controls work.
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    }).catch(() => {});
    return () => {
      player.remove();
    };
  }, [player]);

  const toggle = useCallback(() => {
    if (!currentId) return;
    if (status.playing) player.pause();
    else player.play();
  }, [currentId, status.playing, player]);

  const start = useCallback(
    (id: SoundId, uri: string) => {
      // `replace` swaps the media source but keeps player-level flags, so the
      // `loop = true` set at creation still applies.
      player.replace(uri);
      player.play();
      setCurrentId(id);
    },
    [player]
  );

  const playTrack = useCallback(
    (id: SoundId) => {
      if (id === currentId) {
        toggle();
        return;
      }
      // One download at a time -- ignore taps while another track is fetching.
      if (downloadingId) return;

      // Always go through `ensureAudioDownloaded`, even for a track already
      // marked downloaded: it re-validates the cached file every time and
      // transparently re-fetches it if it turns out to be corrupt (e.g. an
      // HTML error page saved as an mp3 by a past misconfigured host), so a
      // poisoned cache heals itself on the next tap instead of staying
      // silently unplayable forever.
      setDownloadingId(id);
      ensureAudioDownloaded(id, getSoundAssetBaseUrl())
        .then((uri) => {
          setDownloadedIds((prev) => new Set(prev).add(id));
          start(id, uri);
        })
        .catch((err) => {
          setDownloadedIds((prev) => {
            if (!prev.has(id)) return prev;
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
          showToast(
            err instanceof SoundBaseUrlNotConfiguredError
              ? COPY.sound.downloadUnavailable
              : COPY.sound.downloadFailed
          );
        })
        .finally(() => {
          setDownloadingId(null);
        });
    },
    [currentId, downloadingId, showToast, start, toggle]
  );

  const value: SoundPlayerContextValue = {
    currentId,
    currentTrack: currentId ? SOUND_TRACKS[currentId] : null,
    isPlaying: status.playing,
    downloadedIds,
    downloadingId,
    playTrack,
    toggle,
  };

  return <SoundPlayerContext.Provider value={value}>{children}</SoundPlayerContext.Provider>;
}

export function useSoundPlayer(): SoundPlayerContextValue {
  const ctx = useContext(SoundPlayerContext);
  if (!ctx) throw new Error('useSoundPlayer must be used within SoundPlayerProvider');
  return ctx;
}
