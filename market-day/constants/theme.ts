import { tokens } from '@/theme/tokens';

const { color: c } = tokens;

/**
 * Semantic color aliases for StyleSheet screens. Values come from theme/tokens.ts.
 * Legacy names (purple, green, etc.) map to brand tokens so existing imports keep working.
 */
export const colors = {
  peach: c.peach,
  pink: c.pink,
  gray: c.gray,
  grayLight: c.grayLight,
  ink: c.ink,
  white: c.white,

  /** Screen canvas — soft lavender */
  screen: c.peach50,
  /** Card / sheet backdrop — light purple behind white rows */
  background: c.peach100,
  /** Soft accent for tips, callouts, empty states */
  cream: c.cream,

  /** Muted body text */
  inkSoft: c.gray400,

  /** Primary brand actions */
  purple: c.purple,
  purpleDark: c.purpleDark,
  pinkDark: c.purpleDark,
  pink600: c.pink600,

  /** POS functional */
  green: c.success,
  greenDark: c.successDark,
  success: c.success,
  warning: c.warning,
  danger: c.danger,
  red: c.danger,
  redDark: c.dangerDark,
  redLight: c.dangerSurface,
  yellow: c.yellow,
  yellowDark: c.yellowDark,

  /** Secondary / chart accents */
  blue: c.blue,
  blueDark: c.blueDark,
  amber: c.warning,
  amberDark: c.warningDark,
  amberBorder: c.warningBorder,

  /** Surfaces & borders */
  surfaceMuted: c.pink50,
  surfaceSubtle: c.cream,
  border: c.grayLight,
  borderSubtle: c.peach100,
  borderFocus: c.purple,
  borderDanger: c.dangerBorder,
  borderSuccess: c.successBorder,
  successSurface: c.successSurface,
  dangerSurface: c.dangerSurface,
  warningSurface: c.warningSurface,
  warningBorder: c.warningBorder,
} as const;

export { tokens };
