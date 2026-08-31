import { forwardRef, useImperativeHandle, useRef } from 'react';
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

  return (
    <View style={styles.group}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable
        accessibilityRole="none"
        onPress={focusInput}
        style={styles.rowWrapper}>
        <View style={styles.row} pointerEvents="none">
          {Array.from({ length }, (_, index) => {
            const filled = index < value.length;
            return (
              <View
                key={index}
                style={[styles.box, filled && styles.boxFilled]}
                accessibilityLabel={`${label} digit ${index + 1}`}
                accessibilityState={{ selected: filled }}>
                {filled ? <View style={styles.dot} /> : null}
              </View>
            );
          })}
        </View>
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={handleChange}
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
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.inkSoft,
  },
  rowWrapper: {
    position: 'relative',
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
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.borderFocus,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxFilled: {
    borderColor: colors.purple,
    backgroundColor: colors.surfaceMuted,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.purple,
  },
});
