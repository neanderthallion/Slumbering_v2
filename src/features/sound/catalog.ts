/**
 * Static catalog for the Sound screen: three sets, each a handful of looping
 * tracks. Cover art is `require()`d literally and bundled (Metro needs static
 * paths). Audio is NOT bundled -- `remoteFile` is appended to the configured
 * base URL (`getSoundAssetBaseUrl()`) and downloaded on first play, then cached
 * to persistent storage (see `logic/audioCache.ts`). Display names are NOT here
 * -- they live in `COPY.sound` keyed by these ids.
 */

export type SoundSetId = 'meditation' | 'colorNoise' | 'ambient';

export type SoundId =
  | 'meditationBodyScanShort'
  | 'meditationBodyScanFull'
  | 'noiseWhite'
  | 'noisePink'
  | 'noiseBrown'
  | 'ambientRain'
  | 'ambientForest'
  | 'ambientBeach';

export interface SoundTrack {
  id: SoundId;
  setId: SoundSetId;
  /**
   * Filename appended to `getSoundAssetBaseUrl()` to fetch the mp3. Hosted as a
   * GitHub Release asset, which is a flat list -- no subdirectories -- so this
   * must stay a bare filename, unique across the whole catalog.
   */
  remoteFile: string;
  /** Bundled cover art (Metro asset module id). */
  image: number;
}

export const SOUND_TRACKS: Record<SoundId, SoundTrack> = {
  meditationBodyScanShort: {
    id: 'meditationBodyScanShort',
    setId: 'meditation',
    remoteFile: 'body-scan-short.mp3',
    image: require('../../../assets/sound-covers/meditation-body-scan-short.jpg'),
  },
  meditationBodyScanFull: {
    id: 'meditationBodyScanFull',
    setId: 'meditation',
    remoteFile: 'body-scan-full.mp3',
    image: require('../../../assets/sound-covers/meditation-body-scan-full.jpg'),
  },
  noiseWhite: {
    id: 'noiseWhite',
    setId: 'colorNoise',
    remoteFile: 'white.mp3',
    image: require('../../../assets/sound-covers/white.jpg'),
  },
  noisePink: {
    id: 'noisePink',
    setId: 'colorNoise',
    remoteFile: 'pink.mp3',
    image: require('../../../assets/sound-covers/pink.jpg'),
  },
  noiseBrown: {
    id: 'noiseBrown',
    setId: 'colorNoise',
    remoteFile: 'brown.mp3',
    image: require('../../../assets/sound-covers/brown.jpg'),
  },
  ambientRain: {
    id: 'ambientRain',
    setId: 'ambient',
    remoteFile: 'rain.mp3',
    image: require('../../../assets/sound-covers/rain.jpg'),
  },
  ambientForest: {
    id: 'ambientForest',
    setId: 'ambient',
    remoteFile: 'forest.mp3',
    image: require('../../../assets/sound-covers/forest.jpg'),
  },
  ambientBeach: {
    id: 'ambientBeach',
    setId: 'ambient',
    remoteFile: 'beach.mp3',
    image: require('../../../assets/sound-covers/beach.jpg'),
  },
};

export interface SoundSet {
  id: SoundSetId;
  trackIds: SoundId[];
}

export const SOUND_SETS: SoundSet[] = [
  { id: 'meditation', trackIds: ['meditationBodyScanShort', 'meditationBodyScanFull'] },
  { id: 'colorNoise', trackIds: ['noiseWhite', 'noisePink', 'noiseBrown'] },
  { id: 'ambient', trackIds: ['ambientRain', 'ambientForest', 'ambientBeach'] },
];

export const ALL_SOUND_IDS: SoundId[] = SOUND_SETS.flatMap((s) => s.trackIds);

/** Type guard used when reconciling on-disk filenames back to catalog ids. */
export function isSoundId(value: string): value is SoundId {
  return Object.prototype.hasOwnProperty.call(SOUND_TRACKS, value);
}
