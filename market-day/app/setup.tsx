import { useRouter } from 'expo-router';
import { useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';

import { GrownUpSetupCard } from '@/components/GrownUpSetupCard';
import { ProfileSetupCard } from '@/components/ProfileSetupCard';
import { SetupSplash } from '@/components/onboarding/SetupSplash';
import {
  setupBackEntering,
  setupBackExiting,
  setupCrossFadeEntering,
  setupCrossFadeExiting,
  setupForwardEntering,
  setupForwardExiting,
} from '@/components/onboarding/setup-motion';
import { SetupSuccessCard } from '@/components/SetupSuccessCard';
import { colors } from '@/constants/theme';
import { isAdminProfileComplete } from '@/lib/admin-profile';
import { getAdminProfile, saveAdminProfile } from '@/lib/db/admin-profile';
import { setPasscodeGateEnabled } from '@/lib/db/passcode-gate-settings';
import { clearShopData } from '@/lib/db/reset';
import { deviceParentalGate } from '@/lib/device-parental-gate';
import { beginFreshSetupIfNoCode, getSetupStep } from '@/lib/setup';
import { showUiError } from '@/lib/ui-errors';

type Step = 'splash' | 'profile' | 'code' | 'success';
type NavDirection = 'forward' | 'back' | 'crossfade';
type AfterSplash = 'profile' | 'code' | 'home';

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
  const reduceMotion = useReducedMotion();

  const [step, setStep] = useState<Step>('splash');
  const [navDirection, setNavDirection] = useState<NavDirection>('crossfade');
  const [splashProgress, setSplashProgress] = useState(0.08);

  const [businessName, setBusinessName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const loadStarted = useRef(false);
  const splashAdvanced = useRef(false);
  const afterSplashRef = useRef<AfterSplash | null>(null);

  const goTo = useCallback((next: Step, direction: NavDirection = 'forward') => {
    setNavDirection(direction);
    setStep(next);
  }, []);

  const advanceFromSplash = useCallback(() => {
    if (splashAdvanced.current) return;
    const next = afterSplashRef.current;
    if (!next) return;

    splashAdvanced.current = true;
    if (next === 'home') {
      router.replace('/');
      return;
    }
    goTo(next, 'crossfade');
  }, [goTo, router]);

  useEffect(() => {
    if (loadStarted.current) return;
    loadStarted.current = true;

    let cancelled = false;
    const tick = setInterval(() => {
      setSplashProgress((current) => {
        if (current >= 0.85) return current;
        return Math.min(0.85, current + 0.04);
      });
    }, 90);

    void (async () => {
      try {
        await beginFreshSetupIfNoCode(
          deviceParentalGate,
          () => clearShopData(db),
          async () => isAdminProfileComplete(await getAdminProfile(db)),
        );
        const nextStep = await getSetupStep(createSetupDeps(db));
        if (cancelled) return;

        if (nextStep === 'complete') {
          afterSplashRef.current = 'home';
        } else if (nextStep === 'code') {
          const profile = await getAdminProfile(db);
          if (cancelled) return;
          setBusinessName(profile.businessName);
          setFirstName(profile.firstName);
          setLastName(profile.lastName);
          afterSplashRef.current = 'code';
        } else {
          afterSplashRef.current = 'profile';
        }

        setSplashProgress(1);
      } catch (error) {
        showUiError(error);
        if (!cancelled) {
          afterSplashRef.current = 'profile';
          setSplashProgress(1);
        }
      } finally {
        clearInterval(tick);
      }
    })();

    return () => {
      cancelled = true;
      clearInterval(tick);
    };
  }, [db]);

  const entering =
    navDirection === 'back'
      ? setupBackEntering(reduceMotion)
      : navDirection === 'crossfade'
        ? setupCrossFadeEntering(reduceMotion)
        : setupForwardEntering(reduceMotion);

  const exiting =
    navDirection === 'back'
      ? setupBackExiting(reduceMotion)
      : navDirection === 'crossfade'
        ? setupCrossFadeExiting(reduceMotion)
        : setupForwardExiting(reduceMotion);

  const saveProfile = async () => {
    try {
      await saveAdminProfile(db, { businessName, firstName, lastName });
      goTo('code', 'forward');
    } catch (error) {
      showUiError(error);
    }
  };

  const saveCode = useCallback(
    async (code: string) => {
      try {
        await deviceParentalGate.setCode(code);
        await setPasscodeGateEnabled(db, true);
        goTo('success', 'forward');
      } catch (error) {
        showUiError(error);
      }
    },
    [db, goTo],
  );

  return (
    <View style={styles.root}>
      <Animated.View key={step} entering={entering} exiting={exiting} style={styles.step}>
        {step === 'splash' ? (
          <SetupSplash
            progress={splashProgress}
            reduceMotion={reduceMotion}
            onReady={advanceFromSplash}
          />
        ) : null}

        {step === 'profile' ? (
          <ProfileSetupCard
            businessName={businessName}
            firstName={firstName}
            lastName={lastName}
            onBusinessNameChange={setBusinessName}
            onFirstNameChange={setFirstName}
            onLastNameChange={setLastName}
            onSave={() => void saveProfile()}
            reduceMotion={reduceMotion}
          />
        ) : null}

        {step === 'code' ? (
          <GrownUpSetupCard
            onBack={() => goTo('profile', 'back')}
            onComplete={(code) => void saveCode(code)}
            reduceMotion={reduceMotion}
          />
        ) : null}

        {step === 'success' ? (
          <SetupSuccessCard
            firstName={firstName}
            onContinue={() => router.replace('/')}
            reduceMotion={reduceMotion}
          />
        ) : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  step: {
    flex: 1,
  },
});
