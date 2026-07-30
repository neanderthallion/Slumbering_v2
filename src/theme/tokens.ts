import { AccentKey, ThemeMode, TextSizeKey } from '../types/models';
import { ACCENTS } from './accents';

export interface Theme {
  mode: ThemeMode;
  colors: {
    bgGradientTop: string;
    bgGradientBottom: string;
    bgBase: string;
    bgCard: string;
    bgCardStrong: string;
    hairline: string;
    headerBg: string;
    moonLight: string;
    moonDark: string;
    textHi: string;
    textMid: string;
    textLow: string;
    accent: string;
    accentContrastText: string;
    accentSoft: string;
    amber: string;
    sage: string;
    danger: string;
  };
  fonts: {
    display: string;
    displayItalic: string;
    body: string;
    bodyMedium: string;
    bodyBold: string;
  };
  radii: { sm: number; md: number; lg: number; pill: number };
  spacing: (n: number) => number;
  textScale: number;
}

const LIGHT_BASE = {
  bgGradientTop: '#eef0fc',
  bgGradientBottom: '#f8f8fb',
  bgBase: '#f6f6fa',
  bgCard: '#e4e7fb',
  bgCardStrong: '#d7dcf9',
  hairline: 'rgba(30,30,60,0.10)',
  headerBg: '#4c56c9',
  moonLight: '#fdf6e3',
  moonDark: '#c9cdec',
  textHi: '#1a1a2e',
  textMid: 'rgba(26,26,46,0.65)',
  textLow: 'rgba(26,26,46,0.42)',
  accentSoft: 'rgba(139,133,255,0.14)',
  amber: '#c97f2e',
  sage: '#3f8464',
  danger: '#c65a4f',
};

const DARK_BASE = {
  bgGradientTop: '#1c1a3f',
  bgGradientBottom: '#12112a',
  bgBase: '#0a0918',
  bgCard: 'rgba(255,255,255,0.055)',
  bgCardStrong: 'rgba(255,255,255,0.09)',
  hairline: 'rgba(255,255,255,0.09)',
  headerBg: 'transparent',
  moonLight: '#f4ecd8',
  moonDark: '#12112a',
  textHi: '#f4f2ff',
  textMid: 'rgba(244,242,255,0.66)',
  textLow: 'rgba(244,242,255,0.4)',
  accentSoft: 'rgba(139,133,255,0.16)',
  amber: '#f0b25e',
  sage: '#8fd3b6',
  danger: '#e08277',
};

const TEXT_SCALES: Record<TextSizeKey, number> = {
  small: 0.92,
  medium: 1,
  large: 1.15,
};

export function buildTheme(mode: ThemeMode, accent: AccentKey, textSize: TextSizeKey): Theme {
  const base = mode === 'dark' ? DARK_BASE : LIGHT_BASE;
  const accentDef = ACCENTS[accent];
  return {
    mode,
    colors: {
      ...base,
      accent: accentDef.hex,
      accentContrastText: accentDef.contrastText,
    },
    fonts: {
      display: 'Fraunces_500Medium',
      displayItalic: 'Fraunces_500Medium_Italic',
      body: 'Manrope_400Regular',
      bodyMedium: 'Manrope_600SemiBold',
      bodyBold: 'Manrope_700Bold',
    },
    radii: { sm: 12, md: 18, lg: 26, pill: 999 },
    spacing: (n: number) => n * 4,
    textScale: TEXT_SCALES[textSize],
  };
}
