/**
 * `expo-file-system` is mocked with a tiny in-memory filesystem so the cache
 * logic (cache hit vs. download, invalid-download cleanup, directory scan) can
 * be exercised without native modules.
 */

type MockFileEntry = { size: number; content?: string };

const mockState: {
  dirExists: boolean;
  files: Map<string, MockFileEntry>;
  downloadImpl: (url: string, name: string) => void;
} = {
  dirExists: false,
  files: new Map(),
  downloadImpl: () => {},
};

jest.mock('expo-file-system', () => {
  const SOUNDS = 'sounds';

  class Directory {
    get exists() {
      return mockState.dirExists;
    }
    create() {
      mockState.dirExists = true;
    }
    delete() {
      mockState.dirExists = false;
      mockState.files.clear();
    }
    list() {
      return [...mockState.files.keys()].map((name) => new File(null, name));
    }
  }

  class File {
    name: string;
    constructor(_dir: unknown, name: string) {
      this.name = name;
    }
    get exists() {
      return mockState.files.has(this.name);
    }
    get size() {
      return mockState.files.get(this.name)?.size ?? null;
    }
    get uri() {
      return `file:///doc/${SOUNDS}/${this.name}`;
    }
    delete() {
      mockState.files.delete(this.name);
    }
    slice(start = 0, end?: number) {
      const content = mockState.files.get(this.name)?.content ?? '';
      const sliced = content.slice(start, end);
      return { text: async () => sliced };
    }
    static downloadFileAsync = jest.fn(async (url: string, destination: { name: string }) => {
      mockState.downloadImpl(url, destination.name);
      return destination;
    });
  }

  return { Directory, File, Paths: { document: '/doc' } };
});

// eslint-disable-next-line import/first
import { File } from 'expo-file-system';
// eslint-disable-next-line import/first
import {
  ensureAudioDownloaded,
  scanDownloadedSounds,
  SoundBaseUrlNotConfiguredError,
} from './audioCache';

const BASE = 'https://cdn.example.com/sounds';

beforeEach(() => {
  mockState.dirExists = false;
  mockState.files = new Map();
  mockState.downloadImpl = (_url, name) =>
    mockState.files.set(name, { size: 2_000_000, content: 'ID3-not-html-audio-bytes' });
  (File.downloadFileAsync as jest.Mock).mockClear();
});

describe('ensureAudioDownloaded', () => {
  it('rejects with SoundBaseUrlNotConfiguredError when the base url is empty', async () => {
    await expect(ensureAudioDownloaded('noisePink', '')).rejects.toBeInstanceOf(
      SoundBaseUrlNotConfiguredError
    );
    expect(File.downloadFileAsync).not.toHaveBeenCalled();
  });

  it('does not require a base url when a valid file is already cached', async () => {
    mockState.dirExists = true;
    mockState.files.set('noisePink.mp3', { size: 500_000, content: 'ID3-real-audio' });
    const uri = await ensureAudioDownloaded('noisePink', '');
    expect(uri).toBe('file:///doc/sounds/noisePink.mp3');
    expect(File.downloadFileAsync).not.toHaveBeenCalled();
  });

  it('downloads the mp3 when it is not cached and returns its local uri', async () => {
    const uri = await ensureAudioDownloaded('noisePink', BASE);
    expect(File.downloadFileAsync).toHaveBeenCalledWith(
      'https://cdn.example.com/sounds/pink.mp3',
      expect.anything(),
      { idempotent: true }
    );
    expect(uri).toBe('file:///doc/sounds/noisePink.mp3');
    expect(mockState.dirExists).toBe(true);
  });

  it('skips the download when a valid file is already cached', async () => {
    mockState.dirExists = true;
    mockState.files.set('noisePink.mp3', { size: 500_000 });
    const uri = await ensureAudioDownloaded('noisePink', BASE);
    expect(File.downloadFileAsync).not.toHaveBeenCalled();
    expect(uri).toBe('file:///doc/sounds/noisePink.mp3');
  });

  it('re-downloads when the cached file is suspiciously small', async () => {
    mockState.dirExists = true;
    mockState.files.set('noisePink.mp3', { size: 12 });
    await ensureAudioDownloaded('noisePink', BASE);
    expect(File.downloadFileAsync).toHaveBeenCalledTimes(1);
  });

  it('deletes the file and throws when the download result is invalid', async () => {
    mockState.downloadImpl = (_url, name) => mockState.files.set(name, { size: 40 });
    await expect(ensureAudioDownloaded('ambientRain', BASE)).rejects.toThrow(/invalid/);
    expect(mockState.files.has('ambientRain.mp3')).toBe(false);
  });

  it('deletes the file and throws when the download is an oversized HTML page (e.g. a misconfigured host)', async () => {
    const htmlPage = `<!DOCTYPE html>${'x'.repeat(2000)}`;
    mockState.downloadImpl = (_url, name) =>
      mockState.files.set(name, { size: htmlPage.length, content: htmlPage });
    await expect(ensureAudioDownloaded('ambientRain', BASE)).rejects.toThrow(/invalid/);
    expect(mockState.files.has('ambientRain.mp3')).toBe(false);
  });

  it('re-downloads when a previously cached file turns out to be an HTML page', async () => {
    const htmlPage = `<html><body>${'x'.repeat(2000)}</body></html>`;
    mockState.dirExists = true;
    mockState.files.set('noisePink.mp3', { size: htmlPage.length, content: htmlPage });
    const uri = await ensureAudioDownloaded('noisePink', BASE);
    expect(File.downloadFileAsync).toHaveBeenCalledTimes(1);
    expect(uri).toBe('file:///doc/sounds/noisePink.mp3');
    // The default mock download now writes valid, non-HTML content.
    expect(mockState.files.get('noisePink.mp3')?.content).toBe('ID3-not-html-audio-bytes');
  });
});

describe('scanDownloadedSounds', () => {
  it('returns an empty set when the directory does not exist', () => {
    expect(scanDownloadedSounds().size).toBe(0);
  });

  it('maps on-disk mp3 filenames back to catalog ids and ignores foreign files', () => {
    mockState.dirExists = true;
    mockState.files.set('noiseWhite.mp3', { size: 300_000 });
    mockState.files.set('ambientForest.mp3', { size: 400_000 });
    mockState.files.set('notATrack.mp3', { size: 1 });
    mockState.files.set('noiseWhite.txt', { size: 1 });

    const found = scanDownloadedSounds();
    expect([...found].sort()).toEqual(['ambientForest', 'noiseWhite']);
  });
});
