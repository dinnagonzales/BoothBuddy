import { useId, useState, type RefObject } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/constants/theme';
import { fonts, touchTargets } from '@/constants/visual';
import { tokens } from '@/theme/tokens';

type FloatingLabelInputProps = TextInputProps & {
  label: string;
  error?: string | null;
  inputRef?: RefObject<TextInput | null>;
};

export function FloatingLabelInput({
  label,
  error,
  value,
  onFocus,
  onBlur,
  inputRef,
  style,
  placeholder,
  ...props
}: FloatingLabelInputProps) {
  const generatedId = useId();
  const errorId = `${generatedId}-error`;
  const [focused, setFocused] = useState(false);
  const filled = Boolean(value && String(value).length > 0);
  const floated = focused || filled;
  const labelProgress = useSharedValue(floated ? 1 : 0);

  const syncLabel = (nextFloated: boolean) => {
    labelProgress.value = withTiming(nextFloated ? 1 : 0, { duration: 160 });
  };

  const labelStyle = useAnimatedStyle(() => ({
    top: 18 - labelProgress.value * 12,
    fontSize: 16 - labelProgress.value * 4,
  }));

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.field,
          focused && !error ? styles.fieldFocused : null,
          error ? styles.fieldError : null,
        ]}>
        <Animated.Text
          pointerEvents="none"
          style={[styles.label, floated && styles.labelFloated, labelStyle]}>
          {label}
        </Animated.Text>
        <TextInput
          ref={inputRef}
          value={value}
          placeholder={floated ? placeholder : undefined}
          placeholderTextColor={colors.inkSoft}
          accessibilityLabel={label}
          accessibilityHint={error ?? undefined}
          // RN equivalent of aria-describedby: error text is live-region + linked via hint.
          style={[styles.input, style]}
          onFocus={(event) => {
            setFocused(true);
            syncLabel(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            syncLabel(Boolean(value && String(value).length > 0));
            onBlur?.(event);
          }}
          {...props}
        />
      </View>
      {error ? (
        <Text
          nativeID={errorId}
          accessibilityLiveRegion="polite"
          style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
  field: {
    position: 'relative',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: tokens.radius.md,
    minHeight: touchTargets.minSize + 8,
    justifyContent: 'flex-end',
  },
  fieldFocused: {
    borderColor: colors.borderFocus,
  },
  fieldError: {
    borderColor: colors.borderDanger,
  },
  label: {
    position: 'absolute',
    left: tokens.spacing[3],
    fontFamily: fonts.body.semiBold,
    color: colors.inkSoft,
    zIndex: 1,
  },
  labelFloated: {
    color: colors.purpleDark,
  },
  input: {
    fontFamily: fonts.body.regular,
    fontSize: 16,
    color: colors.ink,
    paddingHorizontal: tokens.spacing[3],
    paddingTop: 22,
    paddingBottom: 12,
    minHeight: touchTargets.minSize + 8,
  },
  error: {
    fontFamily: fonts.body.bold,
    fontSize: 13,
    color: colors.danger,
    paddingHorizontal: 4,
  },
});
