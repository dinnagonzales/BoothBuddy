import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Screen, ScreenHeader } from '@/components/Screen';
import { Button, Input } from '@/components/ui';
import { createSqliteCatalog } from '@/lib/db/catalog';
import { deviceParentalGate } from '@/lib/device-parental-gate';
import { parseMoneyInput } from '@/lib/money';
import { isSetupComplete } from '@/lib/setup';

type Step = 'loading' | 'code' | 'item';

export default function SetupScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [step, setStep] = useState<Step>('loading');
  const [code, setCode] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [emoji, setEmoji] = useState('📦');
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    let cancelled = false;
    const catalog = createSqliteCatalog(db);

    isSetupComplete(deviceParentalGate, catalog).then((complete) => {
      if (cancelled) return;
      if (complete) {
        router.replace('/');
        return;
      }
      deviceParentalGate.isConfigured().then((configured) => {
        if (!cancelled) setStep(configured ? 'item' : 'code');
      });
    });

    return () => {
      cancelled = true;
    };
  }, [db, router]);

  const saveCode = async () => {
    if (!code) {
      setCodeError('Enter a numeric code.');
      return;
    }
    if (code !== confirmCode) {
      setCodeError('Those codes do not match.');
      return;
    }
    await deviceParentalGate.setCode(code);
    const catalog = createSqliteCatalog(db);
    if (await isSetupComplete(deviceParentalGate, catalog)) {
      router.replace('/');
      return;
    }
    setStep('item');
  };

  const saveItem = () => {
    const trimmedName = name.trim();
    const priceCents = parseMoneyInput(price);
    if (!trimmedName || priceCents <= 0) return;

    createSqliteCatalog(db).createItem({
      name: trimmedName,
      emoji: emoji.trim() || '📦',
      costCents: parseMoneyInput(cost),
      priceCents,
    });
    router.replace('/');
  };

  if (step === 'loading') {
    return (
      <Screen>
        <Text className="text-muted font-bold text-center mt-8">Getting ready…</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 16, gap: 12 }}>
        <ScreenHeader title="Grown-up setup" />

        {step === 'code' ? (
          <View className="gap-3">
            <Text className="text-muted font-semibold text-center">
              Pick a numeric code. You will need it every time you open grown-up settings.
            </Text>
            <Text className="text-[11px] font-extrabold uppercase text-muted">Code</Text>
            <Input
              accessibilityLabel="Parental code"
              keyboardType="number-pad"
              secureTextEntry
              placeholder="Code"
              value={code}
              onChangeText={(value) => {
                setCode(value.replace(/[^\d]/g, ''));
                setCodeError(null);
              }}
            />
            <Text className="text-[11px] font-extrabold uppercase text-muted">Type it again</Text>
            <Input
              accessibilityLabel="Confirm parental code"
              keyboardType="number-pad"
              secureTextEntry
              placeholder="Type it again"
              value={confirmCode}
              onChangeText={(value) => {
                setConfirmCode(value.replace(/[^\d]/g, ''));
                setCodeError(null);
              }}
            />
            {codeError ? <Text className="text-center text-danger font-bold">{codeError}</Text> : null}
            <Button size="lg" isDisabled={!code} onPress={saveCode}>
              <Button.Label className="font-bold">Save code</Button.Label>
            </Button>
          </View>
        ) : (
          <View className="gap-3">
            <Text className="text-muted font-semibold text-center">
              Add at least one Item before the seller can use Home.
            </Text>
            <Text className="text-[11px] font-extrabold uppercase text-muted">Emoji</Text>
            <Input
              accessibilityLabel="Item emoji"
              value={emoji}
              onChangeText={setEmoji}
              placeholder="📦"
            />
            <Text className="text-[11px] font-extrabold uppercase text-muted">Name</Text>
            <Input
              accessibilityLabel="Item name"
              value={name}
              onChangeText={setName}
              placeholder="Dragon"
            />
            <Text className="text-[11px] font-extrabold uppercase text-muted">
              Cost — not shown to the seller
            </Text>
            <Input
              accessibilityLabel="Item cost"
              keyboardType="decimal-pad"
              value={cost}
              onChangeText={setCost}
              placeholder="1.00"
            />
            <Text className="text-[11px] font-extrabold uppercase text-muted">Price</Text>
            <Input
              accessibilityLabel="Item price"
              keyboardType="decimal-pad"
              value={price}
              onChangeText={setPrice}
              placeholder="4.00"
            />
            <Button size="lg" isDisabled={!name.trim() || parseMoneyInput(price) <= 0} onPress={saveItem}>
              <Button.Label className="font-bold">Save Item and finish</Button.Label>
            </Button>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
