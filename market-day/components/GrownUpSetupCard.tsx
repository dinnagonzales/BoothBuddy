import { BoothBuddyLogo } from '@/components/BoothBuddyLogo';
import { useRef } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PinInput, type PinInputHandle } from '@/components/PinInput';
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
  const confirmPinRef = useRef<PinInputHandle>(null);

  const handleCodeChange = (value: string) => {
    onCodeChange(value);
    if (value.length === PARENTAL_CODE_MAX_LENGTH) {
      confirmPinRef.current?.focus();
    }
  };

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.center}>
        <View style={styles.card}>
          <View style={styles.logoWrap}>
            <BoothBuddyLogo variant="full" style={styles.logo} />
          </View>

          <Text style={styles.title}>Owner setup</Text>
          <Text style={styles.subtext}>
            Pick a 4-digit Pass Code. You&apos;ll need it every time you open Events.
          </Text>

          <View style={styles.form}>
            <PinInput
              label="Pass Code"
              value={code}
              length={PARENTAL_CODE_MAX_LENGTH}
              autoComplete="off"
              autoFocus
              onChange={handleCodeChange}
            />
            <PinInput
              ref={confirmPinRef}
              label="Type it again"
              value={confirmCode}
              length={PARENTAL_CODE_MAX_LENGTH}
              autoComplete="off"
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
              <Text style={styles.buttonLabel}>Save Pass Code</Text>
            </Pressable>

            <Text style={styles.tip}>
              Tip: pick something easy for you to remember, tricky for staff to guess 😉
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const cardShadow = Platform.select({
  web: { boxShadow: '0 10px 0 rgba(43, 35, 64, 0.06)' },
  default: {
    shadowColor: '#2B2340',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 0,
    elevation: 2,
  },
});

const buttonShadow = Platform.select({
  web: { boxShadow: `0 5px 0 ${colors.purpleDark}` },
  default: {
    shadowColor: colors.purpleDark,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
});

const buttonShadowPressed = Platform.select({
  web: { boxShadow: `0 2px 0 ${colors.purpleDark}` },
  default: {
    shadowOffset: { width: 0, height: 2 },
  },
});

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#EDE9F5',
  },
  center: {
    flex: 1,
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
    ...cardShadow,
  },
  logoWrap: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 96,
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
    ...buttonShadow,
  },
  buttonDisabled: {
    opacity: 0.45,
    ...Platform.select({
      web: { boxShadow: 'none' },
      default: { shadowOpacity: 0 },
    }),
  },
  buttonPressed: {
    transform: [{ translateY: 3 }],
    ...buttonShadowPressed,
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
