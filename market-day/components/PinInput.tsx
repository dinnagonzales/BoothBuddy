import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';

import { colors } from '@/constants/theme';
import { fonts } from '@/constants/visual';
import { tokens } from '@/theme/tokens';

export type PinInputHandle = {
  focus: () => void;
};

type PinInputProps = {
  label: string;
  value: string;
  length: number;
  onChange: (value: string) => void;
  autoComplete?: TextInputProps['autoComplete'];
  autoFocus?: boolean;
};

export const PinInput = forwardRef<PinInputHandle, PinInputProps>(function PinInput(
  { label, value, length, onChange, autoComplete = 'off', autoFocus = false },
  ref,
) {
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
  }));

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const handleChange = (text: string) => {
    onChange(text.replace(/[^\d]/g, '').slice(0, length));
  };

  const activeIndex = Math.min(value.length, length - 1);

  return (
    <View style={styles.group}>
      {label ? <Text style={[styles.label, isFocused && styles.labelFocused]}>{label}</Text> : null}
      <Pressable
        accessibilityRole="none"
        onPress={focusInput}
        style={[styles.rowWrapper, isFocused && styles.rowWrapperFocused]}>
        <View style={styles.row} pointerEvents="none">
          {Array.from({ length }, (_, index) => {
            const filled = index < value.length;
            const isActive = isFocused && index === activeIndex;
            return (
              <View
                key={index}
                style={[
                  styles.box,
                  filled && styles.boxFilled,
                  !filled && !isActive && styles.boxIdle,
                  isActive && styles.boxActive,
                ]}
                accessibilityLabel={`${label} digit ${index + 1}`}
                accessibilityState={{ selected: filled || isActive }}>
                {filled ? <View style={styles.dot} /> : null}
                {isActive && !filled ? <View style={styles.cursor} /> : null}
              </View>
            );
          })}
        </View>
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          keyboardType="number-pad"
          inputMode="numeric"
          maxLength={length}
          caretHidden
          autoFocus={autoFocus}
          autoCorrect={false}
          spellCheck={false}
          contextMenuHidden
          importantForAutofill="no"
          textContentType="none"
          autoComplete={autoComplete}
          accessibilityLabel={label}
          style={styles.overlayInput}
        />
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  group: {
    gap: 8,
  },
  label: {
    fontFamily: fonts.body.bold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.inkSoft,
    textAlign: 'center',
  },
  labelFocused: {
    color: colors.ink,
  },
  rowWrapper: {
    position: 'relative',
    borderRadius: tokens.radius.md,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  rowWrapperFocused: {
    backgroundColor: colors.surfaceSubtle,
  },
  overlayInput: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0,
    fontSize: 16,
    ...Platform.select({
      ios: { padding: 0 },
      default: {},
    }),
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  box: {
    width: 52,
    height: 52,
    backgroundColor: colors.white,
    borderRadius: tokens.radius.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxIdle: {
    borderColor: colors.border,
  },
  boxFilled: {
    borderColor: colors.pink,
    backgroundColor: colors.surfaceMuted,
  },
  boxActive: {
    borderColor: colors.pink,
    borderWidth: 3,
    backgroundColor: colors.white,
    ...Platform.select({
      ios: {
        shadowColor: tokens.shadow.color,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
      },
      android: { elevation: 3 },
      default: {},
    }),
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.ink,
  },
  cursor: {
    width: 2,
    height: 22,
    borderRadius: 1,
    backgroundColor: colors.pink,
  },
});
