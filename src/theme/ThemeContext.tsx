import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { Theme, buildTheme } from './tokens';
import { AccentKey, TextSizeKey, ThemeMode } from '../types/models';
import { useAppData } from '../data/AppDataContext';

interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
  accent: AccentKey;
  textSize: TextSizeKey;
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: AccentKey) => void;
  setTextSize: (size: TextSizeKey) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { settings, updateSettings } = useAppData();
  const { themeMode, accent, textSize } = settings;

  const theme = useMemo(() => buildTheme(themeMode, accent, textSize), [themeMode, accent, textSize]);

  const value: ThemeContextValue = {
    theme,
    mode: themeMode,
    accent,
    textSize,
    setMode: (mode) => updateSettings((prev) => ({ ...prev, themeMode: mode })),
    setAccent: (a) => updateSettings((prev) => ({ ...prev, accent: a })),
    setTextSize: (size) => updateSettings((prev) => ({ ...prev, textSize: size })),
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
