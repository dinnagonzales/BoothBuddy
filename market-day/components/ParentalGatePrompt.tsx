import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors } from '@/constants/theme';
import {
  getParentalCodeLengthError,
  PARENTAL_CODE_MAX_LENGTH,
} from '@/lib/parental-gate';

type ParentalGatePromptProps = {
  title: string;
  errorText: string;
  submitLabel: string;
  onSubmit: (code: string) => Promise<boolean>;
  onForgotCode?: () => Promise<void>;
};

export function ParentalGatePrompt({
  title,
  errorText,
  submitLabel,
  onSubmit,
  onForgotCode,
}: ParentalGatePromptProps) {
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showForgotConfirm, setShowForgotConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);

  const submit = async () => {
    const lengthError = getParentalCodeLengthError(code);
    if (lengthError) {
      setErrorMessage(lengthError);
      return;
    }
    setBusy(true);
    const ok = await onSubmit(code);
    setBusy(false);
    if (!ok) {
      setErrorMessage(errorText);
      return;
    }
    setErrorMessage(null);
    setCode('');
  };

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
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <TextInput
        accessibilityLabel="Pass Code"
        keyboardType="number-pad"
        maxLength={PARENTAL_CODE_MAX_LENGTH}
        secureTextEntry
        value={code}
        onChangeText={(value) => {
          setCode(value.replace(/[^\d]/g, '').slice(0, PARENTAL_CODE_MAX_LENGTH));
          setErrorMessage(null);
        }}
        style={styles.input}
        placeholderTextColor={colors.inkSoft}
      />
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: code.length !== PARENTAL_CODE_MAX_LENGTH || busy }}
        disabled={code.length !== PARENTAL_CODE_MAX_LENGTH || busy}
        onPress={submit}
        style={({ pressed }) => [
          styles.button,
          (code.length !== PARENTAL_CODE_MAX_LENGTH || busy) && styles.buttonDisabled,
          pressed && code.length === PARENTAL_CODE_MAX_LENGTH && !busy && styles.buttonPressed,
        ]}>
        <Text style={styles.buttonLabel}>{submitLabel}</Text>
      </Pressable>
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
  input: {
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 16,
    color: colors.ink,
    textAlign: 'center',
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
