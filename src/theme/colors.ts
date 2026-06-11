export const lightColors = {
  brand: '#3B6D11',
  brandDark: '#2D5509',
  text: '#111827',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  background: '#FFFFFF',
  cream: '#F7F4EE',
  cardActive: '#F4F8EF',
  surfaceMuted: '#FAFAF8',
} as const;

export const darkColors = {
  brand: '#6BAF3A',
  brandDark: '#3B6D11',
  text: '#F3F4F6',
  textMuted: '#9CA3AF',
  border: '#374151',
  background: '#111827',
  cream: '#0F172A',
  cardActive: '#1F2937',
  surfaceMuted: '#1F2937',
} as const;

export type ThemeColors = {
  readonly brand: string;
  readonly brandDark: string;
  readonly text: string;
  readonly textMuted: string;
  readonly border: string;
  readonly background: string;
  readonly cream: string;
  readonly cardActive: string;
  readonly surfaceMuted: string;
};

/** @deprecated Prefer useTheme().colors inside components */
export const colors = lightColors;
