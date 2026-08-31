/**
 * Booth Buddy brand tokens — single source of truth for StyleSheet, SVG, QR, and Tailwind.
 * Sampled from the bear logo / badge lockup.
 */
export const tokens = {
  color: {
    peach: '#FFD9D1',
    pink: '#FFA0C1',
    gray: '#A9A8AF',
    grayLight: '#D5D5D8',
    ink: '#161616',
    white: '#FFFFFF',

    pink50: '#FFF6F9',
    pink100: '#FFE7F0',
    pink200: '#FFD0E0',
    pink300: '#FFB8D0',
    pink400: '#FFA0C1',
    pink500: '#DC8BA7',
    pink600: '#B9778E',

    peach50: '#FFF0ED',
    peach100: '#FFE4DF',
    peach200: '#FFD9D1',
    peach300: '#D0B2AC',
    peach400: '#A28B86',

    gray50: '#DDDCDF',
    gray100: '#C3C2C7',
    gray200: '#A9A8AF',
    gray300: '#8C8B90',
    gray400: '#6E6E72',
    gray500: '#515053',

    ink100: '#DCDCDC',
    ink200: '#ADADAD',
    ink300: '#7F7F7F',
    ink400: '#505050',
    ink500: '#161616',

    success: '#3F9463',
    successDark: '#2F7049',
    successSurface: '#E8F4ED',
    successBorder: '#B8DFC8',

    warning: '#C77A1F',
    warningSurface: '#FFF4E8',
    warningBorder: '#F5DFA0',

    danger: '#C64545',
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
    color: '#161616',
    soft: 'rgba(22, 22, 22, 0.06)',
    medium: 'rgba(22, 22, 22, 0.16)',
    overlay: 'rgba(22, 22, 22, 0.42)',
    scrim: 'rgba(22, 22, 22, 0.35)',
  },
} as const;

export type BrandColor = (typeof tokens.color)[keyof typeof tokens.color];

/** Pick ink or white label color for a filled background (accessibility rule). */
export function textOnBackground(bg: string): typeof tokens.color.ink | typeof tokens.color.white {
  const inkOnFill = new Set<string>([
    tokens.color.pink,
    tokens.color.pink400,
    tokens.color.pink300,
    tokens.color.pink200,
    tokens.color.pink100,
    tokens.color.peach,
    tokens.color.peach200,
    tokens.color.peach100,
    tokens.color.peach50,
    tokens.color.gray,
    tokens.color.gray200,
    tokens.color.gray100,
    tokens.color.gray50,
    tokens.color.grayLight,
    tokens.color.white,
    tokens.color.warning,
    tokens.color.warningSurface,
  ]);
  return inkOnFill.has(bg) ? tokens.color.ink : tokens.color.white;
}
