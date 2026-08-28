/** Typography, spacing, and radii aligned with mocks/screens.html */
export const fonts = {
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
} as const;

export const radii = {
  itemRow: 16,
  cart: 18,
  payOption: 18,
  checkout: 16,
  sellCta: 20,
  settingsRow: 16,
  statsBox: 18,
  exportBtn: 16,
  completeBtn: 18,
  celebrationBadge: 45,
  stepBtn: 12,
} as const;

export const spacing = {
  screen: 16,
  itemListGap: 8,
  itemRowPaddingH: 12,
  itemRowPaddingV: 10,
} as const;

/** iOS HIG minimum; mock add button is 30px but booth use needs larger taps. */
export const touchTargets = {
  minSize: 44,
  addButton: 44,
} as const;
