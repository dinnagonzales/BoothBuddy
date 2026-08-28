import { Slot, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { GrownUpNav } from '@/components/GrownUpNav';
import { PassCodeSheet } from '@/components/PassCodeSheet';
import { Screen } from '@/components/Screen';
import { useGrownUpSession } from '@/context/GrownUpSessionContext';
import { deviceParentalGate } from '@/lib/device-parental-gate';
import { leaveGrownUpArea } from '@/lib/navigation';
import { resetAppForForgottenCode } from '@/lib/reset-app';

export default function GrownUpLayout() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { unlocked, unlock, lock } = useGrownUpSession();

  useEffect(() => () => lock(), [lock]);

  if (!unlocked) {
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
  lockedPage: {
    flex: 1,
    backgroundColor: '#EDE9F5',
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
