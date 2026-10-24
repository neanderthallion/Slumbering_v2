export interface Typography {
  /** reserved for the literal "Slumbering" wordmark only -- see GreetingHeader.tsx */
  brand: string;
  display: string;
  displayItalic: string;
  body: string;
  bodyMedium: string;
  bodyBold: string;
}

export const FONTS: Typography = {
  brand: 'Quicksand_700Bold',
  display: 'Quicksand_700Bold',
  displayItalic: 'Quicksand_700Bold',
  body: 'Quicksand_500Medium',
  bodyMedium: 'Quicksand_600SemiBold',
  bodyBold: 'Quicksand_700Bold',
};

export type TextSizeKey = 'small' | 'medium' | 'large';

export const TEXT_SCALES: Record<TextSizeKey, number> = {
  small: 0.92,
  medium: 1,
  large: 1.15,
};
