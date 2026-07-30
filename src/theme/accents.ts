import { AccentKey } from '../types/models';

export const ACCENTS: Record<AccentKey, { hex: string; contrastText: string }> = {
  periwinkle: { hex: '#8b85ff', contrastText: '#ffffff' },
  amber: { hex: '#f0b25e', contrastText: '#231705' },
  sage: { hex: '#4f9d7c', contrastText: '#ffffff' },
  blush: { hex: '#e394ad', contrastText: '#2b0e18' },
};

export const ACCENT_ORDER: AccentKey[] = ['periwinkle', 'amber', 'sage', 'blush'];
