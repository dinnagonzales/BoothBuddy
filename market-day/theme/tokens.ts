/**
 * Booth Buddy brand tokens — single source of truth for StyleSheet, SVG, QR, and Tailwind.
 * Soft lavender POS palette with purple primary actions.
 */
export const tokens = {
  color: {
    peach: '#F3E9FF',
    pink: '#FF6B9D',
    purple: '#9B5DE5',
    purpleDark: '#7333BE',
    blue: '#4FC3F7',
    blueDark: '#1E93C6',
    yellow: '#FFD93D',
    yellowDark: '#E0AC00',
    cream: '#FFFDF6',
    gray: '#A9A8AF',
    grayLight: '#D5D5D8',
    ink: '#2B2340',
    white: '#FFFFFF',

    pink50: '#F3E9FF',
    pink100: '#E8D9F8',
    pink200: '#D4B8F0',
    pink300: '#B888E8',
    pink400: '#9B5DE5',
    pink500: '#8550C8',
    pink600: '#7333BE',

    peach50: '#EDE9F5',
    peach100: '#F3E9FF',
    peach200: '#F3E9FF',
    peach300: '#C4B8D4',
    peach400: '#8A7A9A',

    gray50: '#E8E4F0',
    gray100: '#C9C2D4',
    gray200: '#A9A8AF',
    gray300: '#8C8496',
    gray400: '#6E6480',
    gray500: '#4A4356',

    ink100: '#E8E4F0',
    ink200: '#B8B0C4',
    ink300: '#8A8098',
    ink400: '#5A5268',
    ink500: '#2B2340',

    success: '#4CD787',
    successDark: '#1FA85C',
    successSurface: '#E8F8EF',
    successBorder: '#A8E8C4',

    warning: '#FFD93D',
    warningDark: '#E0AC00',
    warningSurface: '#FFFDF6',
    warningBorder: '#F5E6A0',

    danger: '#FF6B6B',
    dangerDark: '#E14545',
    dangerSurface: '#FDEEEE',
    dangerBorder: '#F5C2C2',
  },

  radius: {
    sm: 8,
    md: 14,
    lg: 20,
    full: 999,
  },

  spacing: {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
    12: 48,
  },

  font: {
    heading: {
      medium: 'Fredoka_500Medium',
      semiBold: 'Fredoka_600SemiBold',
      bold: 'Fredoka_700Bold',
    },
    body: {
      regular: 'Nunito_400Regular',
      semiBold: 'Nunito_600SemiBold',
      bold: 'Nunito_700Bold',
      extraBold: 'Nunito_800ExtraBold',
    },
  },

  touchTarget: {
    min: 44,
  },

  shadow: {
    color: '#2B2340',
    soft: 'rgba(43, 35, 64, 0.06)',
    medium: 'rgba(43, 35, 64, 0.16)',
    overlay: 'rgba(43, 35, 64, 0.42)',
    scrim: 'rgba(43, 35, 64, 0.35)',
  },
} as const;

export type BrandColor = (typeof tokens.color)[keyof typeof tokens.color];

/** Pick ink or white label color for a filled background (accessibility rule). */
export function textOnBackground(bg: string): typeof tokens.color.ink | typeof tokens.color.white {
  const inkOnFill = new Set<string>([
    tokens.color.peach,
    tokens.color.peach200,
    tokens.color.peach100,
    tokens.color.peach50,
    tokens.color.cream,
    tokens.color.pink50,
    tokens.color.pink100,
    tokens.color.pink200,
    tokens.color.gray,
    tokens.color.gray200,
    tokens.color.gray100,
    tokens.color.gray50,
    tokens.color.grayLight,
    tokens.color.white,
    tokens.color.yellow,
    tokens.color.warning,
    tokens.color.warningSurface,
    tokens.color.successSurface,
    tokens.color.dangerSurface,
    tokens.color.blue,
  ]);
  return inkOnFill.has(bg) ? tokens.color.ink : tokens.color.white;
}
