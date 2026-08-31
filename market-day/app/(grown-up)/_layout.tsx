import { Slot, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { GrownUpNav } from '@/components/GrownUpNav';
import { PassCodeSheet } from '@/components/PassCodeSheet';
import { Screen } from '@/components/Screen';
import { colors } from '@/constants/theme';
import { useGrownUpSession } from '@/context/GrownUpSessionContext';
import { getPasscodeGateEnabled } from '@/lib/db/passcode-gate-settings';
import { deviceParentalGate } from '@/lib/device-parental-gate';
import { leaveGrownUpArea } from '@/lib/navigation';
import { resetAppForForgottenCode } from '@/lib/reset-app';

export default function GrownUpLayout() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { unlocked, unlock, lock } = useGrownUpSession();
  const [passcodeGateEnabled, setPasscodeGateEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const enabled = await getPasscodeGateEnabled(db);
      if (cancelled) return;
      setPasscodeGateEnabled(enabled);
      if (!enabled) {
        unlock();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [db, unlock]);

  useEffect(() => () => lock(), [lock]);

  if (passcodeGateEnabled == null) {
    return (
      <View style={styles.loadingPage}>
        <ActivityIndicator size="large" color={colors.purple} />
      </View>
    );
  }

  if (passcodeGateEnabled && !unlocked) {
    return (
      <View style={styles.lockedPage}>
        <PassCodeSheet
          visible
          onClose={() => leaveGrownUpArea(router)}
          onSubmit={(code) => deviceParentalGate.verify(code)}
          onSuccess={unlock}
          onForgotCode={async () => {
            await resetAppForForgottenCode(db, deviceParentalGate);
            router.replace('/setup');
          }}
        />
      </View>
    );
  }

  return (
    <Screen>
      <View style={styles.page}>
        <View style={styles.content}>
          <Slot />
        </View>
        <GrownUpNav />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loadingPage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  lockedPage: {
    flex: 1,
    backgroundColor: colors.background,
  },
  page: {
    flex: 1,
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  content: {
    flex: 1,
  },
});
