import { Slot, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { GrownUpNav } from '@/components/GrownUpNav';
import { ParentalGatePrompt } from '@/components/ParentalGatePrompt';
import { Screen, ScreenHeader } from '@/components/Screen';
import { deviceParentalGate } from '@/lib/device-parental-gate';
import { leaveGrownUpArea } from '@/lib/navigation';
import { resetAppForForgottenCode } from '@/lib/reset-app';

export default function GrownUpLayout() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [unlocked, setUnlocked] = useState(false);

  if (!unlocked) {
    return (
      <Screen>
        <View style={styles.page}>
          <ScreenHeader title="🔒 Grown-up area" onBack={() => leaveGrownUpArea(router)} />
          <ParentalGatePrompt
            title="Enter Pass Code"
            errorText="That code is not right."
            submitLabel="Unlock"
            onSubmit={async (code) => {
              const ok = await deviceParentalGate.verify(code);
              if (ok) setUnlocked(true);
              return ok;
            }}
            onForgotCode={async () => {
              await resetAppForForgottenCode(db, deviceParentalGate);
              router.replace('/setup');
            }}
          />
        </View>
      </Screen>
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
