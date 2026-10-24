import { ALL_SOUND_IDS, isSoundId, SOUND_SETS, SOUND_TRACKS, SoundId } from './catalog';
import { COPY } from '../../copy';

describe('sound catalog', () => {
  const allTrackIds = Object.keys(SOUND_TRACKS) as SoundId[];

  it('every set references only known, non-empty track ids', () => {
    for (const set of SOUND_SETS) {
      expect(set.trackIds.length).toBeGreaterThan(0);
      for (const id of set.trackIds) {
        expect(SOUND_TRACKS[id]).toBeDefined();
        expect(SOUND_TRACKS[id].setId).toBe(set.id);
      }
    }
  });

  it('every track in SOUND_TRACKS appears in exactly one set', () => {
    const listed = SOUND_SETS.flatMap((s) => s.trackIds);
    expect([...listed].sort()).toEqual([...allTrackIds].sort());
    expect(new Set(listed).size).toBe(listed.length);
  });

  it('every track has bundled cover art', () => {
    for (const id of allTrackIds) {
      expect(SOUND_TRACKS[id].image).toBeTruthy();
    }
  });

  it('every track has a unique, flat .mp3 remote filename', () => {
    // Hosted as GitHub Release assets, which have no subdirectories.
    const paths = allTrackIds.map((id) => SOUND_TRACKS[id].remoteFile);
    for (const path of paths) {
      expect(path).toMatch(/^[a-z0-9-]+\.mp3$/);
    }
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('isSoundId recognizes catalog ids and rejects anything else', () => {
    for (const id of allTrackIds) expect(isSoundId(id)).toBe(true);
    expect(isSoundId('notATrack')).toBe(false);
    expect(isSoundId('toString')).toBe(false);
  });

  it('ALL_SOUND_IDS covers the whole catalog', () => {
    expect([...ALL_SOUND_IDS].sort()).toEqual([...allTrackIds].sort());
  });

  it('every set id and track id has a Vietnamese name in COPY', () => {
    for (const set of SOUND_SETS) {
      expect(COPY.sound.setTitles[set.id]).toBeTruthy();
    }
    for (const id of allTrackIds) {
      expect(COPY.sound.trackNames[id]).toBeTruthy();
    }
  });
});
