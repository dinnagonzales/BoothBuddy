import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { colors } from '@/constants/theme';
import { fonts, touchTargets } from '@/constants/visual';
import { tokens } from '@/theme/tokens';

export type BrandButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';

type BrandButtonProps = PressableProps & {
  variant?: BrandButtonVariant;
  label: string;
  labelStyle?: TextStyle;
  style?: ViewStyle;
  /** 3D press depth (primary/secondary/success/danger). Default true for filled variants. */
  depth?: boolean;
};

const depthShadow = (shadowColor: string) =>
  Platform.select({
    web: { boxShadow: `0 5px 0 ${shadowColor}` },
    default: {
      shadowColor,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 0,
    },
  });

const depthShadowPressed = (shadowColor: string) =>
  Platform.select({
    web: { boxShadow: `0 2px 0 ${shadowColor}` },
    default: { shadowOffset: { width: 0, height: 2 } },
  });

function variantStyles(variant: BrandButtonVariant) {
  switch (variant) {
    case 'secondary':
      return {
        outer: { backgroundColor: colors.blueDark, paddingBottom: 5 },
        inner: { backgroundColor: colors.blue },
        label: { color: colors.ink },
        shadow: depthShadow(colors.blueDark),
        shadowColor: colors.blueDark,
      };
    case 'ghost':
      return {
        outer: { backgroundColor: 'transparent' as const, paddingBottom: 0 },
        inner: { backgroundColor: 'transparent' as const },
        label: { color: colors.purpleDark },
        shadow: undefined,
        shadowColor: colors.purpleDark,
      };
    case 'danger':
      return {
        outer: { backgroundColor: colors.redDark, paddingBottom: 5 },
        inner: { backgroundColor: colors.danger },
        label: { color: colors.white },
        shadow: depthShadow(colors.redDark),
        shadowColor: colors.redDark,
      };
    case 'success':
      return {
        outer: { backgroundColor: colors.greenDark, paddingBottom: 6 },
        inner: { backgroundColor: colors.green },
        label: { color: colors.white },
        shadow: depthShadow(colors.greenDark),
        shadowColor: colors.greenDark,
      };
    case 'primary':
    default:
      return {
        outer: { backgroundColor: colors.purpleDark, paddingBottom: 5 },
        inner: { backgroundColor: colors.purple },
        label: { color: colors.white },
        shadow: depthShadow(colors.purpleDark),
        shadowColor: colors.purpleDark,
      };
  }
}

export function BrandButton({
  variant = 'primary',
  label,
  labelStyle,
  style,
  depth = variant === 'primary' ||
    variant === 'secondary' ||
    variant === 'success' ||
    variant === 'danger',
  disabled,
  ...props
}: BrandButtonProps) {
  const v = variantStyles(variant);

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.outer,
        depth ? v.outer : null,
        depth && v.shadow,
        depth && pressed ? styles.outerPressed : null,
        depth && pressed ? depthShadowPressed(v.shadowColor) : null,
        disabled ? styles.disabled : null,
        style,
      ]}
      {...props}>
      {({ pressed }) => (
        <View style={[styles.inner, v.inner, depth && pressed ? styles.innerPressed : null]}>
          <Text style={[styles.label, v.label, labelStyle]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: tokens.radius.lg,
    minHeight: touchTargets.minSize,
  },
  outerPressed: {
    transform: [{ translateY: 3 }],
  },
  inner: {
    borderRadius: tokens.radius.lg,
    paddingVertical: 18,
    paddingHorizontal: tokens.spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: touchTargets.minSize,
  },
  innerPressed: {
    marginTop: 0,
  },
  label: {
    fontFamily: fonts.heading.semiBold,
    fontSize: 17,
  },
  disabled: {
    opacity: 0.5,
  },
});
