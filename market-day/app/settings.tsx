import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { ParentalGatePrompt } from '@/components/ParentalGatePrompt';
import { AdminItemCatalog } from '@/components/AdminItemCatalog';
import { TodaysMenu } from '@/components/TodaysMenu';
import { Screen, ScreenHeader, SectionLabel } from '@/components/Screen';
import { Button, Card, Input } from '@/components/ui';
import { deviceParentalGate } from '@/lib/device-parental-gate';
import {
  canUndoCloseMarketDay,
  closeActiveMarketDay,
  getDashboardMarketDay,
  getMarketDayStats,
  startMarketDay,
  undoCloseMostRecentMarketDay,
} from '@/lib/db/queries';
import { suggestMarketDayName } from '@/lib/market-day';
import { formatMoney } from '@/lib/money';
import { resetAppForForgottenCode } from '@/lib/reset-app';
import type { MarketDay } from '@/lib/types';

export default function SettingsScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [unlocked, setUnlocked] = useState(false);
  const [dashboardDay, setDashboardDay] = useState<MarketDay | null>(null);
  const [proposedName, setProposedName] = useState(suggestMarketDayName());
  const [canUndo, setCanUndo] = useState(false);
  const [stats, setStats] = useState({
    totalCents: 0,
    itemCount: 0,
    cashCents: 0,
    venmoCents: 0,
  });

  const refreshDashboard = useCallback(async () => {
    const day = await getDashboardMarketDay(db);
    setDashboardDay(day);
    setCanUndo(await canUndoCloseMarketDay(db));
    if (day) {
      setStats(await getMarketDayStats(db, day.id));
    } else {
      setStats({ totalCents: 0, itemCount: 0, cashCents: 0, venmoCents: 0 });
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setUnlocked(false);
      setProposedName(suggestMarketDayName());

      void (async () => {
        if (cancelled) return;
        await refreshDashboard();
      })();

      return () => {
        cancelled = true;
      };
    }, [refreshDashboard]),
  );

  const activeDay = dashboardDay?.closedAt === null ? dashboardDay : null;
  const closedDay = dashboardDay?.closedAt !== null ? dashboardDay : null;

  const handleStartMarketDay = () => {
    void (async () => {
      const name = proposedName.trim() || suggestMarketDayName();
      await startMarketDay(db, name);
      await refreshDashboard();
    })();
  };

  const handleEndMarketDay = () => {
    void (async () => {
      await closeActiveMarketDay(db);
      await refreshDashboard();
    })();
  };

  const handleUndoClose = () => {
    void (async () => {
      await undoCloseMostRecentMarketDay(db);
      await refreshDashboard();
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
                {activeDay
                  ? `Active: ${activeDay.name}`
                  : closedDay
                    ? `Closed: ${closedDay.name}`
                    : 'No Market Day yet'}
              </Text>
            </Card>

            {activeDay ? (
              <Button size="lg" variant="secondary" onPress={handleEndMarketDay}>
                <Button.Label className="font-bold">End Market Day</Button.Label>
              </Button>
            ) : (
              <>
                <Card className="p-4 gap-2">
                  <Text className="text-[11px] font-extrabold uppercase text-muted">Market Day name</Text>
                  <Input
                    value={proposedName}
                    onChangeText={setProposedName}
                    placeholder={suggestMarketDayName()}
                  />
                </Card>
                <Button size="lg" onPress={handleStartMarketDay}>
                  <Button.Label className="font-bold">Start Market Day</Button.Label>
                </Button>
              </>
            )}

            {canUndo ? (
              <Button size="lg" variant="secondary" onPress={handleUndoClose}>
                <Button.Label className="font-bold">Undo close</Button.Label>
              </Button>
            ) : null}

            {activeDay ? (
              <>
                <SectionLabel>Today&apos;s Menu</SectionLabel>
                <TodaysMenu db={db} />
              </>
            ) : null}

            <SectionLabel>Items & cost</SectionLabel>
            <AdminItemCatalog db={db} />
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
