import { StyleSheet, Text, View, type TextStyle, type ViewStyle } from 'react-native';

import { colors } from '@/constants/theme';
import { fonts } from '@/constants/visual';
import { tokens } from '@/theme/tokens';
import { textOnBackground, type BrandColor } from '@/theme/tokens';

export type BadgeTone = 'brand' | 'success' | 'warning' | 'danger' | 'neutral' | 'muted';

type BadgeProps = {
  label: string;
  tone?: BadgeTone;
  style?: ViewStyle;
  labelStyle?: TextStyle;
};

function toneColors(tone: BadgeTone): { bg: BrandColor; fg: BrandColor } {
  switch (tone) {
    case 'success':
      return { bg: colors.success, fg: textOnBackground(colors.success) };
    case 'warning':
      return { bg: colors.warningSurface, fg: colors.ink };
    case 'danger':
      return { bg: colors.dangerSurface, fg: colors.danger };
    case 'neutral':
      return { bg: colors.gray, fg: textOnBackground(colors.gray) };
    case 'muted':
      return { bg: colors.surfaceMuted, fg: colors.ink };
    case 'brand':
    default:
      return { bg: colors.yellow, fg: colors.ink };
  }
}

/** Wordmark-style pill badge for status tags and labels. */
export function Badge({ label, tone = 'brand', style, labelStyle }: BadgeProps) {
  const { bg, fg } = toneColors(tone);
  return (
    <View style={[styles.pill, { backgroundColor: bg }, style]}>
      <Text style={[styles.label, { color: fg }, labelStyle]}>{label}</Text>
    </View>
  );
}

/** Alias for Badge — echoes the "BOOTH BUDDY" wordmark pill. */
export const Pill = Badge;

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    borderRadius: tokens.radius.full,
    paddingHorizontal: tokens.spacing[3],
    paddingVertical: tokens.spacing[1],
  },
  label: {
    fontFamily: fonts.body.bold,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
