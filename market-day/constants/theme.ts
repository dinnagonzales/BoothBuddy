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

  /** Screen canvas — soft peach tint */
  screen: c.peach50,
  /** Card / sheet backdrop */
  background: c.peach100,
  cream: c.white,

  /** Muted body text */
  inkSoft: c.gray400,

  /** Primary brand actions (formerly purple) */
  purple: c.pink,
  purpleDark: c.pink600,
  pinkDark: c.pink600,
  pink600: c.pink600,

  /** POS functional */
  green: c.success,
  greenDark: c.successDark,
  success: c.success,
  warning: c.warning,
  danger: c.danger,
  red: c.danger,
  redDark: c.danger,
  redLight: c.dangerSurface,
  yellow: c.warning,

  /** Secondary / chart accents */
  blue: c.gray300,
  blueDark: c.gray400,
  amber: c.warning,
  amberDark: c.warning,
  amberBorder: c.warningBorder,

  /** Surfaces & borders */
  surfaceMuted: c.pink50,
  surfaceSubtle: c.peach50,
  border: c.grayLight,
  borderSubtle: c.peach100,
  borderFocus: c.pink,
  borderDanger: c.dangerBorder,
  borderSuccess: c.successBorder,
  successSurface: c.successSurface,
  dangerSurface: c.dangerSurface,
  warningSurface: c.warningSurface,
} as const;

export { tokens };
