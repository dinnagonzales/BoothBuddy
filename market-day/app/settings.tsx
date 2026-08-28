import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Screen, ScreenHeader, SectionLabel } from '@/components/Screen';
import { Button, Card } from '@/components/ui';
import { getActiveMarketDay, getMarketDayStats, startMarketDay } from '@/lib/db/queries';
import { formatMoney } from '@/lib/money';

export default function SettingsScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [marketDayName, setMarketDayName] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalCents: 0,
    itemCount: 0,
    cashCents: 0,
    venmoCents: 0,
  });

  useFocusEffect(
    useCallback(() => {
      const marketDay = getActiveMarketDay(db);
      setMarketDayName(marketDay?.name ?? null);
      if (marketDay) {
        setStats(getMarketDayStats(db, marketDay.id));
      }
    }, [db]),
  );

  const restartDemoDay = () => {
    const label = `Demo Market Day – ${new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })}`;
    startMarketDay(db, label);
    const marketDay = getActiveMarketDay(db);
    setMarketDayName(marketDay?.name ?? null);
    if (marketDay) {
      setStats(getMarketDayStats(db, marketDay.id));
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, gap: 12 }}>
        <ScreenHeader title="⚙️ Grown-up settings" onBack={() => router.back()} />

        <Text className="text-muted text-[13px] font-semibold text-center">
          Parental code gate comes next — open for iPad testing.
        </Text>

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
      </ScrollView>
    </Screen>
  );
}
