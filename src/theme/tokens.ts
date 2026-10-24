import { ThemeMode, TextSizeKey } from '../types/domain';
import { FONTS, TEXT_SCALES as SHARED_TEXT_SCALES } from './typography';

interface CornerRadii {
  topLeft: number;
  topRight: number;
  bottomRight: number;
  bottomLeft: number;
}

interface ShadowStyle {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

export interface Theme {
  mode: ThemeMode;
  colors: {
    bgGradientTop: string;
    bgGradientBottom: string;
    bgBase: string;
    bgCard: string;
    bgCardStrong: string;
    bgCardAltFrom: string;
    bgCardAltTo: string;
    hairline: string;
    borderSubtle: string;
    textHi: string;
    textMid: string;
    textLow: string;
    accent: string;
    accentContrastText: string;
    accentSoft: string;
    amber: string;
    sage: string;
    blush: string;
    danger: string;
    // fixed warm CTA gradient -- brand-locked, does not vary with accent or theme
    ctaGradientFrom: string;
    ctaGradientVia: string;
    ctaGradientTo: string;
    ctaText: string;
    // the "night" family: bedtime/sleep panels always render dusk-dark, in both themes
    nightGradientFrom: string;
    nightGradientTo: string;
    nightText: string;
    nightTextDim: string;
    nightAccent: string;
    // moon-phase glyph fills
    moonFull: string;
    moonPartial: string;
    moonEmpty: string;
  };
  fonts: {
    /** reserved for the literal "Slumbering" wordmark only -- see GreetingHeader.tsx */
    brand: string;
    display: string;
    displayItalic: string;
    body: string;
    bodyMedium: string;
    bodyBold: string;
  };
  radii: { sm: number; md: number; lg: number; xl: number; pill: number; organic: CornerRadii };
  shadows: { card: ShadowStyle; panel: ShadowStyle; cta: ShadowStyle; raised: ShadowStyle; pop: ShadowStyle };
  spacing: (n: number) => number;
  textScale: number;
}

const LIGHT_BASE = {
  bgGradientTop: '#fffdf8',
  bgGradientBottom: '#fbf3e4',
  bgBase: '#fbf3e4',
  bgCard: '#fffdf8',
  bgCardStrong: '#f2e8d6',
  bgCardAltFrom: '#ffffff',
  bgCardAltTo: '#fbf3e4',
  hairline: 'rgba(110,95,160,0.16)',
  borderSubtle: 'rgba(110,95,160,0.25)',
  textHi: '#383163',
  textMid: '#6e6390',
  textLow: '#6e5fa0',
  amber: '#c99a3e',
  sage: '#4c7a41',
  blush: '#c65f88',
  danger: '#c65a4f',
  // fixed single brand accent (no user customization) -- dusk-800 on light surfaces
  accent: '#383163',
  accentContrastText: '#fbf3e4',
};

const DARK_BASE = {
  bgGradientTop: '#4c447f',
  bgGradientBottom: '#211c3e',
  bgBase: '#241e42',
  bgCard: '#383163',
  bgCardStrong: '#241e42',
  bgCardAltFrom: '#46406f',
  bgCardAltTo: '#383163',
  hairline: 'rgba(252,226,166,0.1)',
  borderSubtle: 'rgba(252,226,166,0.16)',
  textHi: '#fbf3e4',
  textMid: '#b6aad8',
  textLow: '#8a7bb0',
  amber: '#fce2a6',
  sage: '#8fae86',
  blush: '#f2a5c2',
  danger: '#e08277',
  // fixed single brand accent (no user customization) -- warm gold on dark surfaces
  accent: '#fce2a6',
  accentContrastText: '#40244a',
};

// fixed brand tokens: identical in both themes, per the design system's "single
// dusk-purple + warm accent" identity (see DesignUpdate readme.md)
const BRAND = {
  ctaGradientFrom: '#f4b8c4',
  ctaGradientVia: '#f2a5c2',
  ctaGradientTo: '#fce2a6',
  ctaText: '#40244a',
  nightGradientFrom: '#52487f',
  nightGradientTo: '#241e42',
  nightText: '#fbf3e4',
  nightTextDim: '#b6aad8',
  nightAccent: '#fce2a6',
  moonFull: '#fce2a6',
};

const TEXT_SCALES: Record<TextSizeKey, number> = SHARED_TEXT_SCALES;

const SHADOW_TINT_LIGHT = '#383163';

export function buildTheme(mode: ThemeMode, textSize: TextSizeKey): Theme {
  const base = mode === 'dark' ? DARK_BASE : LIGHT_BASE;
  const shadowTint = mode === 'dark' ? '#000000' : SHADOW_TINT_LIGHT;

  return {
    mode,
    colors: {
      ...base,
      ...BRAND,
      accentSoft: mode === 'dark' ? 'rgba(252,226,166,0.14)' : 'rgba(110,95,160,0.12)',
      // matches the theme's own blush token, per the theme tokens -- not fixed like moonFull
      moonPartial: base.blush,
      moonEmpty: base.textLow,
    },
    fonts: FONTS,
    radii: {
      sm: 8,
      md: 12,
      lg: 16,
      xl: 24,
      pill: 999,
      organic: { topLeft: 34, topRight: 40, bottomRight: 30, bottomLeft: 44 },
    },
    shadows: {
      card: {
        shadowColor: shadowTint,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: mode === 'dark' ? 0.35 : 0.16,
        shadowRadius: 14,
        elevation: 5,
      },
      panel: {
        shadowColor: '#211c3e',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.32,
        shadowRadius: 18,
        elevation: 8,
      },
      cta: {
        shadowColor: '#f4b8c4',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 14,
        elevation: 6,
      },
      raised: {
        shadowColor: '#383163',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 4,
      },
      pop: {
        shadowColor: '#40244a',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 3,
      },
    },
    spacing: (n: number) => n * 4,
    textScale: TEXT_SCALES[textSize],
  };
}
