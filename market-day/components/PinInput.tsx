import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors } from '@/constants/theme';

export type PinInputHandle = {
  focus: () => void;
};

type PinInputProps = {
  label: string;
  value: string;
  length: number;
  onChange: (value: string) => void;
};

export const PinInput = forwardRef<PinInputHandle, PinInputProps>(function PinInput(
  { label, value, length, onChange },
  ref,
) {
  const inputRef = useRef<TextInput>(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
  }));

  const focus = () => {
    inputRef.current?.focus();
  };

  const handleChange = (text: string) => {
    onChange(text.replace(/[^\d]/g, '').slice(0, length));
  };

  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.rowWrapper}>
        <View style={styles.row} pointerEvents="box-none">
          {Array.from({ length }, (_, index) => {
            const filled = index < value.length;
            return (
              <Pressable
                key={index}
                style={[styles.box, filled && styles.boxFilled]}
                onPress={focus}
                accessibilityLabel={`${label} digit ${index + 1}`}
                accessibilityState={{ selected: filled }}>
                {filled ? <View style={styles.dot} /> : null}
              </Pressable>
            );
          })}
        </View>
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={handleChange}
          keyboardType="number-pad"
          maxLength={length}
          secureTextEntry
          caretHidden
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
          accessibilityLabel={label}
          style={styles.overlayInput}
        />
      </View>
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
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  box: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxFilled: {
    borderColor: colors.purple,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.purple,
  },
  overlayInput: {
    ...StyleSheet.absoluteFill,
    opacity: 0,
    color: 'transparent',
  },
});
