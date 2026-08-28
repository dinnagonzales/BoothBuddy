import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button, Input } from '@/components/ui';

type ParentalGatePromptProps = {
  title: string;
  errorText: string;
  submitLabel: string;
  onSubmit: (code: string) => Promise<boolean>;
};

export function ParentalGatePrompt({ title, errorText, submitLabel, onSubmit }: ParentalGatePromptProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!code) return;
    setBusy(true);
    const ok = await onSubmit(code);
    setBusy(false);
    if (!ok) {
      setError(true);
      return;
    }
    setError(false);
    setCode('');
  };

  return (
    <View className="gap-3">
      <Text className="text-base font-bold text-foreground text-center">{title}</Text>
      <Input
        accessibilityLabel="Parental code"
        keyboardType="number-pad"
        secureTextEntry
        value={code}
        onChangeText={(value) => {
          setCode(value.replace(/[^\d]/g, ''));
          setError(false);
        }}
      />
      {error ? <Text className="text-center text-danger font-bold">{errorText}</Text> : null}
      <Button size="lg" isDisabled={!code || busy} onPress={submit}>
        <Button.Label className="font-bold">{submitLabel}</Button.Label>
      </Button>
    </View>
  );
}
