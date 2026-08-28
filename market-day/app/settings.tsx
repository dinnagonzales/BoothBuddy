import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { ParentalGatePrompt } from '@/components/ParentalGatePrompt';
import { Screen, ScreenHeader, SectionLabel } from '@/components/Screen';
import { Button, Card } from '@/components/ui';
import { deviceParentalGate } from '@/lib/device-parental-gate';
import { getActiveMarketDay, getMarketDayStats, startMarketDay } from '@/lib/db/queries';
import { formatMoney } from '@/lib/money';
import { resetAppForForgottenCode } from '@/lib/reset-app';

export default function SettingsScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [unlocked, setUnlocked] = useState(false);
  const [marketDayName, setMarketDayName] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalCents: 0,
    itemCount: 0,
    cashCents: 0,
    venmoCents: 0,
  });

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setUnlocked(false);

      void (async () => {
        const marketDay = await getActiveMarketDay(db);
        if (cancelled) return;
        setMarketDayName(marketDay?.name ?? null);
        if (marketDay) {
          setStats(await getMarketDayStats(db, marketDay.id));
        }
      })();

      return () => {
        cancelled = true;
      };
    }, [db]),
  );

  const restartDemoDay = () => {
    void (async () => {
      const label = `Demo Market Day – ${new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}`;
      await startMarketDay(db, label);
      const marketDay = await getActiveMarketDay(db);
      setMarketDayName(marketDay?.name ?? null);
      if (marketDay) {
        setStats(await getMarketDayStats(db, marketDay.id));
      }
    })();
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, gap: 12 }}>
        <ScreenHeader title="⚙️ Grown-up settings" onBack={() => router.back()} />

        {!unlocked ? (
          <ParentalGatePrompt
            title="Enter your grown-up code"
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
        ) : (
          <View className="gap-3">
            <Card className="bg-[#FF6B9D] p-4 items-center rounded-[18px]">
              <Text className="text-[32px] font-bold text-white">{formatMoney(stats.totalCents)}</Text>
              <Text className="text-xs font-bold text-white/90 mt-1 text-center">
                {stats.itemCount} items · {formatMoney(stats.cashCents)} cash ·{' '}
                {formatMoney(stats.venmoCents)} Venmo
              </Text>
              <Text className="text-white font-bold text-[13px] mt-2">
                {marketDayName ?? 'No active Market Day'}
              </Text>
            </Card>

            <Button size="lg" onPress={restartDemoDay}>
              <Button.Label className="font-bold">Start new demo Market Day</Button.Label>
            </Button>

            <SectionLabel>Items & cost</SectionLabel>
            <Card className="p-4">
              <Text className="text-muted font-semibold">Item management + CSV export coming soon</Text>
            </Card>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
