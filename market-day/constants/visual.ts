import { tokens } from '@/theme/tokens';

/** Typography, spacing, and radii for staff-facing POS screens. */
export const fonts = tokens.font;

export const radii = {
  itemRow: 16,
  cart: 18,
  payOption: 18,
  checkout: 16,
  sellCta: tokens.radius.lg,
  settingsRow: 16,
  statsBox: 18,
  exportBtn: 16,
  completeBtn: 18,
  celebrationBadge: 45,
  stepBtn: tokens.radius.sm,
} as const;

export const spacing = {
  screen: tokens.spacing[4],
  itemListGap: tokens.spacing[2],
  itemRowPaddingH: tokens.spacing[4],
  itemRowPaddingV: 14,
} as const;

/** iOS HIG minimum; booth use needs larger taps. */
export const touchTargets = {
  minSize: tokens.touchTarget.min,
  addButton: tokens.touchTarget.min,
} as const;

export { tokens };
