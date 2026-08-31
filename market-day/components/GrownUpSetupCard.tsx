import { BoothBuddyLogo } from '@/components/BoothBuddyLogo';
import { BrandButton } from '@/components/ui/BrandButton';
import { BrandCard } from '@/components/ui/BrandCard';
import { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PinInput, type PinInputHandle } from '@/components/PinInput';
import { colors } from '@/constants/theme';
import { fonts } from '@/constants/visual';
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
        <BrandCard surface="peach" style={styles.card}>
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

            <BrandButton
              label="Save Pass Code"
              onPress={onSave}
              disabled={!canSave}
              style={!canSave ? styles.buttonDisabled : undefined}
            />

            <Text style={styles.tip}>
              Tip: pick something easy for you to remember, tricky for staff to guess 😉
            </Text>
          </View>
        </BrandCard>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
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
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 28,
  },
  logoWrap: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 96,
  },
  title: {
    fontFamily: fonts.heading.semiBold,
    fontSize: 22,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtext: {
    fontFamily: fonts.body.regular,
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
    fontFamily: fonts.body.bold,
    fontSize: 13,
    color: colors.pinkDark,
    textAlign: 'center',
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  tip: {
    fontFamily: fonts.body.bold,
    fontSize: 12,
    color: colors.inkSoft,
    textAlign: 'center',
    lineHeight: 17,
  },
});
