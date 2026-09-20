import { Delete } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { UiIcon } from '@/components/ui/UiIcon';
import { colors } from '@/constants/theme';
import { fonts, touchTargets } from '@/constants/visual';

type PasscodeKeypadProps = {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  disabled?: boolean;
};

const ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', 'back'],
] as const;

export function PasscodeKeypad({ onDigit, onBackspace, disabled }: PasscodeKeypadProps) {
  return (
    <View style={styles.grid}>
      {ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((key, keyIndex) => {
            if (key === '') {
              return <View key={`spacer-${keyIndex}`} style={styles.key} />;
            }
            if (key === 'back') {
              return (
                <Pressable
                  key="back"
                  accessibilityRole="button"
                  accessibilityLabel="Delete"
                  disabled={disabled}
                  onPress={onBackspace}
                  style={({ pressed }) => [
                    styles.key,
                    pressed && !disabled ? styles.keyPressed : null,
                    disabled ? styles.keyDisabled : null,
                  ]}>
                  <UiIcon icon={Delete} size={22} color={colors.ink} />
                </Pressable>
              );
            }
            return (
              <Pressable
                key={key}
                accessibilityRole="button"
                accessibilityLabel={key}
                disabled={disabled}
                onPress={() => onDigit(key)}
                style={({ pressed }) => [
                  styles.key,
                  pressed && !disabled ? styles.keyPressed : null,
                  disabled ? styles.keyDisabled : null,
                ]}>
                <Text style={styles.digit}>{key}</Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: 8,
    width: '100%',
    maxWidth: 320,
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  key: {
    flex: 1,
    minHeight: touchTargets.minSize,
    maxWidth: 96,
    borderRadius: 16,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyPressed: {
    backgroundColor: colors.surfaceMuted,
    transform: [{ scale: 0.97 }],
  },
  keyDisabled: {
    opacity: 0.45,
  },
  digit: {
    fontFamily: fonts.heading.semiBold,
    fontSize: 24,
    color: colors.ink,
  },
});
