import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AdminSalesList } from '@/components/AdminSalesList';
import { DatePickerField } from '@/components/DatePickerField';
import { MarketDaySummaryCard } from '@/components/MarketDaySummaryCard';
import { ScreenHeader, SectionLabel } from '@/components/Screen';
import { colors } from '@/constants/theme';
import { getAllTimeSales, getAllTimeStats } from '@/lib/db/queries';
import { shareSalesCsv } from '@/lib/market-day-export';
import { startOfLocalDay, toExportDate } from '@/lib/market-day';
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
    tipsCents: 0,
  });
  const [sales, setSales] = useState<AllTimeSaleSummary[]>([]);
  const [startDate, setStartDate] = useState(() => startOfLocalDay());
  const [endDate, setEndDate] = useState(() => startOfLocalDay());
  const [exporting, setExporting] = useState(false);

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

  const handleStartChange = (next: Date) => {
    setStartDate(next);
    if (next > endDate) setEndDate(next);
  };

  const handleEndChange = (next: Date) => {
    setEndDate(next);
    if (next < startDate) setStartDate(next);
  };

  const handleExport = () => {
    void (async () => {
      setExporting(true);
      try {
        const start = toExportDate(startDate);
        const end = toExportDate(endDate);
        await shareSalesCsv(db, start, end);
        await refresh();
      } catch (error) {
        Alert.alert(
          'Export failed',
          error instanceof Error ? error.message : 'Could not export sales.',
        );
      } finally {
        setExporting(false);
      }
    })();
  };

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
          tipsCents={stats.tipsCents}
        />

        <View style={styles.exportSection}>
          <SectionLabel>Export sales</SectionLabel>
          <View style={styles.exportCard}>
            <View style={styles.dateField}>
              <Text style={styles.dateLabel}>From</Text>
              <DatePickerField
                value={startDate}
                onChange={handleStartChange}
                accessibilityLabel="Export start date"
              />
            </View>
            <View style={styles.dateField}>
              <Text style={styles.dateLabel}>To</Text>
              <DatePickerField
                value={endDate}
                onChange={handleEndChange}
                accessibilityLabel="Export end date"
              />
            </View>
            <Pressable
              accessibilityRole="button"
              disabled={exporting}
              onPress={handleExport}
              style={({ pressed }) => [
                styles.exportButton,
                exporting ? styles.exportButtonDisabled : null,
                pressed && !exporting ? styles.exportButtonPressed : null,
              ]}>
              <Text style={styles.exportButtonLabel}>
                {exporting ? 'Exporting…' : 'Export sales as CSV'}
              </Text>
            </Pressable>
          </View>
        </View>

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
  exportSection: {
    marginBottom: 12,
  },
  exportCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  dateField: {
    gap: 4,
  },
  dateLabel: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.inkSoft,
  },
  exportButton: {
    marginTop: 4,
    backgroundColor: colors.purple,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  exportButtonDisabled: {
    opacity: 0.6,
  },
  exportButtonPressed: {
    opacity: 0.88,
  },
  exportButtonLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 15,
    color: colors.white,
  },
  salesSection: {
    marginTop: 4,
  },
});
