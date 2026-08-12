import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { Theme, buildTheme } from './tokens';
import { ThemeMode, TextSizeKey } from '../types/domain';
import { useSettingsStore } from '../store/settingsStore';

interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
  textSize: TextSizeKey;
  setMode: (mode: ThemeMode) => void;
  setTextSize: (size: TextSizeKey) => void;
}

const ThemeProviderContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const mode = useSettingsStore((s) => s.theme);
  const textSize = useSettingsStore((s) => s.textSize);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const setTextSize = useSettingsStore((s) => s.setTextSize);

  const theme = useMemo(() => buildTheme(mode, textSize), [mode, textSize]);

  const value: ThemeContextValue = {
    theme,
    mode,
    textSize,
    setMode: setTheme,
    setTextSize,
  };

  return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeProviderContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
