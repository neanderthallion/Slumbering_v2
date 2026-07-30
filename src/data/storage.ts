import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  settings: 'slumbering.settings.v1',
  nightRecords: 'slumbering.nightRecords.v1',
} as const;

async function readJson<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  if (raw == null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function writeJson<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  keys: KEYS,
  readJson,
  writeJson,
};
