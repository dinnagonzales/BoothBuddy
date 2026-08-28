import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AdminSalesList } from '@/components/AdminSalesList';
import { MarketDaySummaryCard } from '@/components/MarketDaySummaryCard';
import { ScreenHeader, SectionLabel } from '@/components/Screen';
import { getAllTimeSales, getAllTimeStats } from '@/lib/db/queries';
import { leaveGrownUpArea } from '@/lib/navigation';
import type { AllTimeSaleSummary } from '@/lib/types';

export default function SalesScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalCents: 0,
    itemCount: 0,
    profitCents: 0,
    cashCents: 0,
    venmoCents: 0,
  });
  const [sales, setSales] = useState<AllTimeSaleSummary[]>([]);

  const refresh = useCallback(async () => {
    const [allTimeStats, allTimeSales] = await Promise.all([
      getAllTimeStats(db),
      getAllTimeSales(db),
    ]);
    setStats(allTimeStats);
    setSales(allTimeSales);
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  return (
    <View style={styles.screen}>
      <ScreenHeader title="🧾 Sales" onBack={() => leaveGrownUpArea(router)} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <MarketDaySummaryCard
          variant="allTime"
          totalCents={stats.totalCents}
          profitCents={stats.profitCents}
          saleCount={sales.length}
          cashCents={stats.cashCents}
          venmoCents={stats.venmoCents}
        />

        <View style={styles.salesSection}>
          <SectionLabel>All Sales</SectionLabel>
          <AdminSalesList
            sales={sales}
            showSaleContext
            onSalePress={(saleNumber) =>
              router.push({
                pathname: '/(grown-up)/sale/[saleNumber]',
                params: { saleNumber: String(saleNumber) },
              })
            }
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  salesSection: {
    marginTop: 4,
  },
});
