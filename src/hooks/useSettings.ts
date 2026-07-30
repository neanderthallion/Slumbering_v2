import { useCallback, useEffect, useState } from 'react';
import { AppSettings } from '../types/models';
import { loadSettings, saveSettings, createDefaultSettings } from '../data/settings';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(createDefaultSettings());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    loadSettings().then((loaded) => {
      if (mounted) {
        setSettings(loaded);
        setIsLoaded(true);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const updateSettings = useCallback((updater: (prev: AppSettings) => AppSettings) => {
    setSettings((prev) => {
      const next = updater(prev);
      saveSettings(next);
      return next;
    });
  }, []);

  return { settings, isLoaded, updateSettings };
}
