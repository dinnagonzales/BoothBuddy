import { useRouter } from 'expo-router';
import { useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';

import { GrownUpSetupCard } from '@/components/GrownUpSetupCard';
import { ProfileSetupCard } from '@/components/ProfileSetupCard';
import { WelcomeSetupCard } from '@/components/WelcomeSetupCard';
import { Screen } from '@/components/Screen';
import { getAdminProfile, saveAdminProfile } from '@/lib/db/admin-profile';
import { clearShopData } from '@/lib/db/reset';
import { deviceParentalGate } from '@/lib/device-parental-gate';
import {
  getParentalCodeLengthError,
  PARENTAL_CODE_MAX_LENGTH,
} from '@/lib/parental-gate';
import { beginFreshSetupIfNoCode, getSetupStep } from '@/lib/setup';

type Step = 'loading' | 'welcome' | 'profile' | 'code';

function createSetupDeps(db: SQLiteDatabase) {
  return {
    gate: deviceParentalGate,
    profile: {
      get: () => getAdminProfile(db),
    },
  };
}

export default function SetupScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [step, setStep] = useState<Step>('loading');
  const [businessName, setBusinessName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [code, setCode] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        await beginFreshSetupIfNoCode(deviceParentalGate, () => clearShopData(db));
        const nextStep = await getSetupStep(createSetupDeps(db));
        if (cancelled) return;
        if (nextStep === 'complete') {
          router.replace('/');
          return;
        }
        if (nextStep === 'profile') {
          setStep('welcome');
          return;
        }
        setStep('code');
      } catch {
        if (!cancelled) setStep('welcome');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [db, router]);

  const saveProfile = async () => {
    await saveAdminProfile(db, { businessName, firstName, lastName });
    setStep('code');
  };

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

  if (step === 'welcome') {
    return <WelcomeSetupCard onContinue={() => setStep('profile')} />;
  }

  if (step === 'profile') {
    return (
      <ProfileSetupCard
        businessName={businessName}
        firstName={firstName}
        lastName={lastName}
        onBusinessNameChange={setBusinessName}
        onFirstNameChange={setFirstName}
        onLastNameChange={setLastName}
        onSave={saveProfile}
      />
    );
  }

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
