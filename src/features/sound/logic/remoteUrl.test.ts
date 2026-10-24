import { remoteAudioUrl } from './remoteUrl';
import { ALL_SOUND_IDS } from '../catalog';

describe('remoteAudioUrl', () => {
  it('joins base and remoteFile with a single slash', () => {
    expect(remoteAudioUrl('meditationBodyScanShort', 'https://cdn.example.com/sounds')).toBe(
      'https://cdn.example.com/sounds/body-scan-short.mp3'
    );
  });

  it('normalizes trailing slashes on the base url', () => {
    expect(remoteAudioUrl('noisePink', 'https://cdn.example.com/sounds/')).toBe(
      'https://cdn.example.com/sounds/pink.mp3'
    );
    expect(remoteAudioUrl('noisePink', 'https://cdn.example.com/sounds///')).toBe(
      'https://cdn.example.com/sounds/pink.mp3'
    );
  });

  it('is deterministic for the same inputs', () => {
    const a = remoteAudioUrl('ambientBeach', 'https://x.test');
    const b = remoteAudioUrl('ambientBeach', 'https://x.test');
    expect(a).toBe(b);
  });

  it('produces a distinct .mp3 url for every catalog track', () => {
    const urls = ALL_SOUND_IDS.map((id) => remoteAudioUrl(id, 'https://x.test'));
    expect(new Set(urls).size).toBe(ALL_SOUND_IDS.length);
    for (const url of urls) expect(url.endsWith('.mp3')).toBe(true);
  });
});
