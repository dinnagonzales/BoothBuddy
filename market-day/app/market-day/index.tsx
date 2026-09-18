import { Redirect, useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AdminSalesList } from '@/components/AdminSalesList';
import { MarketDaySummaryCard } from '@/components/MarketDaySummaryCard';
import { Screen, ScreenHeader, SectionLabel } from '@/components/Screen';
import {
  getActiveMarketDay,
  getMarketDaySales,
  getMarketDayStats,
} from '@/lib/db/queries';
import { safeBack } from '@/lib/navigation';
import type { MarketDay, SaleSummary } from '@/lib/types';

export default function MarketDayDashboardScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [activeDay, setActiveDay] = useState<MarketDay | null>(null);
  const [stats, setStats] = useState({ cashCents: 0, venmoCents: 0, tipsCents: 0 });
  const [sales, setSales] = useState<SaleSummary[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    const day = await getActiveMarketDay(db);
    setActiveDay(day);
    if (day) {
      const [dayStats, daySales] = await Promise.all([
        getMarketDayStats(db, day.id),
        getMarketDaySales(db, day.id),
      ]);
      setStats({
        cashCents: dayStats.cashCents,
        venmoCents: dayStats.venmoCents,
        tipsCents: dayStats.tipsCents,
      });
      setSales(daySales);
    } else {
      setStats({ cashCents: 0, venmoCents: 0, tipsCents: 0 });
      setSales([]);
    }
    setLoaded(true);
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  if (loaded && !activeDay) {
    return <Redirect href="/" />;
  }

  if (!activeDay) {
    return null;
  }

  return (
    <Screen>
      <View style={styles.page}>
        <ScreenHeader title="🎪 Market Day" onBack={() => safeBack(router)} />
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <MarketDaySummaryCard
            variant="viewOnly"
            name={activeDay.name}
            startedAt={activeDay.startedAt}
            saleCount={sales.length}
            cashCents={stats.cashCents}
            venmoCents={stats.venmoCents}
            tipsCents={stats.tipsCents}
          />

          <View style={styles.salesSection}>
            <SectionLabel>Sales</SectionLabel>
            <AdminSalesList
              sales={sales}
              onSalePress={(saleNumber) =>
                router.push({
                  pathname: '/market-day/sale/[saleNumber]',
                  params: { saleNumber: String(saleNumber) },
                })
              }
            />
          </View>
        </ScrollView>
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
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  salesSection: {
    marginTop: 4,
  },
});
