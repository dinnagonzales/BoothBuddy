import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';

import { GrownUpSetupCard } from '@/components/GrownUpSetupCard';
import { ItemSetupCard } from '@/components/ItemSetupCard';
import { Screen } from '@/components/Screen';
import { createSqliteCatalog } from '@/lib/db/catalog';
import { clearShopData } from '@/lib/db/reset';
import { deviceParentalGate } from '@/lib/device-parental-gate';
import { parseMoneyInput } from '@/lib/money';
import {
  getParentalCodeLengthError,
  PARENTAL_CODE_MAX_LENGTH,
} from '@/lib/parental-gate';
import { beginFreshSetupIfNoCode, getSetupStep } from '@/lib/setup';

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

    void (async () => {
      try {
        await beginFreshSetupIfNoCode(deviceParentalGate, () => clearShopData(db));
        const nextStep = await getSetupStep(deviceParentalGate, catalog);
        if (cancelled) return;
        if (nextStep === 'complete') {
          router.replace('/');
          return;
        }
        setStep(nextStep);
      } catch {
        if (!cancelled) setStep('code');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [db, router]);

  const saveCode = async () => {
    const lengthError = getParentalCodeLengthError(code);
    if (lengthError) {
      setCodeError(lengthError);
      return;
    }
    if (code !== confirmCode) {
      setCodeError('Those codes do not match.');
      return;
    }
    await deviceParentalGate.setCode(code);
    setStep('item');
  };

  const saveItem = async () => {
    const trimmedName = name.trim();
    const priceCents = parseMoneyInput(price);
    if (!trimmedName || priceCents <= 0) return;

    await createSqliteCatalog(db).createItem({
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

  const canSaveCode =
    code.length === PARENTAL_CODE_MAX_LENGTH && confirmCode.length === PARENTAL_CODE_MAX_LENGTH;

  if (step === 'code') {
    return (
      <GrownUpSetupCard
        code={code}
        confirmCode={confirmCode}
        codeError={codeError}
        onCodeChange={(value) => {
          setCode(value);
          setCodeError(null);
        }}
        onConfirmCodeChange={(value) => {
          setConfirmCode(value);
          setCodeError(null);
        }}
        onSave={saveCode}
        canSave={canSaveCode}
      />
    );
  }

  return (
    <ItemSetupCard
      emoji={emoji}
      name={name}
      cost={cost}
      price={price}
      onEmojiChange={setEmoji}
      onNameChange={setName}
      onCostChange={setCost}
      onPriceChange={setPrice}
      onSave={saveItem}
    />
  );
}
