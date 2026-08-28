import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PinInput } from '@/components/PinInput';
import { colors } from '@/constants/theme';
import { PARENTAL_CODE_MAX_LENGTH } from '@/lib/parental-gate';

type GrownUpSetupCardProps = {
  code: string;
  confirmCode: string;
  codeError: string | null;
  onCodeChange: (value: string) => void;
  onConfirmCodeChange: (value: string) => void;
  onSave: () => void;
  canSave: boolean;
};

export function GrownUpSetupCard({
  code,
  confirmCode,
  codeError,
  onCodeChange,
  onConfirmCodeChange,
  onSave,
  canSave,
}: GrownUpSetupCardProps) {
  return (
    <View style={styles.page}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconEmoji}>🔒</Text>
        </View>

        <Text style={styles.title}>Grown-up setup</Text>
        <Text style={styles.subtext}>
          Pick a 4-digit code. You'll need it every time you open grown-up settings.
        </Text>

        <View style={styles.form}>
          <PinInput
            label="Code"
            value={code}
            length={PARENTAL_CODE_MAX_LENGTH}
            onChange={onCodeChange}
          />
          <PinInput
            label="Type it again"
            value={confirmCode}
            length={PARENTAL_CODE_MAX_LENGTH}
            onChange={onConfirmCodeChange}
          />

          {codeError ? <Text style={styles.error}>{codeError}</Text> : null}

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSave }}
            disabled={!canSave}
            onPress={onSave}
            style={({ pressed }) => [
              styles.button,
              !canSave && styles.buttonDisabled,
              pressed && canSave && styles.buttonPressed,
            ]}>
            <Text style={styles.buttonLabel}>Save code</Text>
          </Pressable>

          <Text style={styles.tip}>
            Tip: pick something easy for you to remember, tricky for them to guess 😉
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#EDE9F5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.background,
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 28,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 0,
    elevation: 0,
    boxShadow: '0 10px 0 rgba(43, 35, 64, 0.06)',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.purple,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconEmoji: {
    fontSize: 26,
  },
  title: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 22,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtext: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: colors.inkSoft,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  form: {
    gap: 20,
  },
  error: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: colors.pinkDark,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.purple,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: colors.purpleDark,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
    boxShadow: `0 5px 0 ${colors.purpleDark}`,
  },
  buttonDisabled: {
    opacity: 0.45,
    shadowOpacity: 0,
    boxShadow: 'none',
  },
  buttonPressed: {
    transform: [{ translateY: 3 }],
    shadowOffset: { width: 0, height: 2 },
    boxShadow: `0 2px 0 ${colors.purpleDark}`,
  },
  buttonLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 17,
    color: colors.white,
  },
  tip: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: colors.inkSoft,
    textAlign: 'center',
    lineHeight: 17,
  },
});
