import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PinInput } from '@/components/PinInput';
import { colors } from '@/constants/theme';
import {
  getParentalCodeLengthError,
  PARENTAL_CODE_MAX_LENGTH,
} from '@/lib/parental-gate';

type ParentalGatePromptProps = {
  title: string;
  errorText: string;
  submitLabel: string;
  autoSubmit?: boolean;
  compact?: boolean;
  onSubmit: (code: string) => Promise<boolean>;
  onForgotCode?: () => Promise<void>;
};

export function ParentalGatePrompt({
  title,
  errorText,
  submitLabel,
  autoSubmit = false,
  compact = false,
  onSubmit,
  onForgotCode,
}: ParentalGatePromptProps) {
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showForgotConfirm, setShowForgotConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);
  const lastSubmittedCode = useRef('');

  const submit = useCallback(
    async (nextCode = code) => {
      const lengthError = getParentalCodeLengthError(nextCode);
      if (lengthError) {
        setErrorMessage(lengthError);
        return;
      }
      if (busy) return;

      setBusy(true);
      const ok = await onSubmit(nextCode);
      setBusy(false);
      if (!ok) {
        setErrorMessage(errorText);
        lastSubmittedCode.current = nextCode;
        return;
      }
      setErrorMessage(null);
      setCode('');
      lastSubmittedCode.current = '';
    },
    [busy, code, errorText, onSubmit],
  );

  useEffect(() => {
    if (!autoSubmit) return;
    if (code.length !== PARENTAL_CODE_MAX_LENGTH) return;
    if (busy) return;
    if (code === lastSubmittedCode.current) return;
    void submit(code);
  }, [autoSubmit, busy, code, submit]);

  const confirmForgotCode = async () => {
    if (!onForgotCode) return;
    setResetting(true);
    await onForgotCode();
    setResetting(false);
  };

  if (showForgotConfirm) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Forgot Pass Code?</Text>
        <Text style={styles.body}>
          There is no way to recover the old code. You can erase everything on this device and set
          up Market Day again from scratch.
        </Text>
        <Pressable
          accessibilityRole="button"
          disabled={resetting}
          onPress={confirmForgotCode}
          style={({ pressed }) => [styles.dangerButton, pressed && styles.buttonPressed]}>
          <Text style={styles.dangerButtonLabel}>
            {resetting ? 'Erasing…' : 'Erase everything and start over'}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={resetting}
          onPress={() => setShowForgotConfirm(false)}
          style={styles.cancelLink}>
          <Text style={styles.cancelLinkLabel}>Cancel</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <PinInput
        label={compact ? '' : 'Pass Code'}
        value={code}
        length={PARENTAL_CODE_MAX_LENGTH}
        autoComplete="off"
        autoFocus
        onChange={(value) => {
          setCode(value);
          setErrorMessage(null);
        }}
      />
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      {busy ? <Text style={styles.status}>{submitLabel}…</Text> : null}
      {!autoSubmit ? (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: code.length !== PARENTAL_CODE_MAX_LENGTH || busy }}
          disabled={code.length !== PARENTAL_CODE_MAX_LENGTH || busy}
          onPress={() => void submit()}
          style={({ pressed }) => [
            styles.button,
            (code.length !== PARENTAL_CODE_MAX_LENGTH || busy) && styles.buttonDisabled,
            pressed && code.length === PARENTAL_CODE_MAX_LENGTH && !busy && styles.buttonPressed,
          ]}>
          <Text style={styles.buttonLabel}>{submitLabel}</Text>
        </Pressable>
      ) : null}
      {onForgotCode ? (
        <Pressable accessibilityRole="button" onPress={() => setShowForgotConfirm(true)}>
          <Text style={styles.forgotLink}>Forgot Pass Code?</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  containerCompact: {
    gap: 8,
  },
  title: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: colors.ink,
    textAlign: 'center',
  },
  body: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: colors.inkSoft,
    textAlign: 'center',
    lineHeight: 20,
  },
  error: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: colors.pinkDark,
    textAlign: 'center',
  },
  status: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: colors.inkSoft,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.purple,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 16,
    color: colors.white,
  },
  dangerButton: {
    backgroundColor: colors.pinkDark,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  dangerButtonLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
  },
  forgotLink: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: colors.purpleDark,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  cancelLink: {
    paddingVertical: 4,
  },
  cancelLinkLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: colors.inkSoft,
    textAlign: 'center',
  },
});
