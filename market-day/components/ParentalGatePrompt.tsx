import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button, Input } from '@/components/ui';
import {
  getParentalCodeLengthError,
  PARENTAL_CODE_MAX_LENGTH,
} from '@/lib/parental-gate';

type ParentalGatePromptProps = {
  title: string;
  errorText: string;
  submitLabel: string;
  onSubmit: (code: string) => Promise<boolean>;
};

export function ParentalGatePrompt({ title, errorText, submitLabel, onSubmit }: ParentalGatePromptProps) {
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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

  return (
    <View className="gap-3">
      <Text className="text-base font-bold text-foreground text-center">{title}</Text>
      <Input
        accessibilityLabel="Parental code"
        keyboardType="number-pad"
        maxLength={PARENTAL_CODE_MAX_LENGTH}
        secureTextEntry
        value={code}
        onChangeText={(value) => {
          setCode(value.replace(/[^\d]/g, '').slice(0, PARENTAL_CODE_MAX_LENGTH));
          setErrorMessage(null);
        }}
      />
      {errorMessage ? <Text className="text-center text-danger font-bold">{errorMessage}</Text> : null}
      <Button size="lg" isDisabled={code.length !== PARENTAL_CODE_MAX_LENGTH || busy} onPress={submit}>
        <Button.Label className="font-bold">{submitLabel}</Button.Label>
      </Button>
    </View>
  );
}
