import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { colors } from '@/constants/theme';
import { fonts } from '@/constants/visual';
import { tokens } from '@/theme/tokens';

type BrandInputProps = TextInputProps;

/** Shared text input for StyleSheet screens — Fredoka/Nunito, brand borders. */
export function BrandInput({ style, ...props }: BrandInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.inkSoft}
      style={[styles.input, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    fontFamily: fonts.body.regular,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: tokens.radius.sm,
    paddingHorizontal: tokens.spacing[3],
    paddingVertical: tokens.spacing[3],
    minHeight: tokens.touchTarget.min,
  },
});
