import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AdminSalesList } from '@/components/AdminSalesList';
import { MarketDaySummaryCard } from '@/components/MarketDaySummaryCard';
import { ScreenHeader, SectionLabel } from '@/components/Screen';
import { colors } from '@/constants/theme';
import {
  canReopenMarketDay,
  deleteMarketDay,
  getMarketDayById,
  getMarketDaySales,
  getMarketDayStats,
  undoCloseMostRecentMarketDay,
} from '@/lib/db/queries';
import { shareMarketDayCsv } from '@/lib/market-day-export';
import { safeBack } from '@/lib/navigation';
import type { MarketDay, SaleSummary } from '@/lib/types';

export default function PastMarketDayScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; saleSaved?: string }>();
  const marketDayId = Number(params.id ?? 0);

  const [marketDay, setMarketDay] = useState<MarketDay | null>(null);
  const [canReopen, setCanReopen] = useState(false);
  const [stats, setStats] = useState({
    totalCents: 0,
    itemCount: 0,
    profitCents: 0,
    cashCents: 0,
    venmoCents: 0,
    tipsCents: 0,
  });
  const [sales, setSales] = useState<SaleSummary[]>([]);
  const [savedSaleNumber, setSavedSaleNumber] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);
  const [reopening, setReopening] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const refresh = useCallback(async () => {
    if (!marketDayId || Number.isNaN(marketDayId)) {
      setMarketDay(null);
      return;
    }

    const day = await getMarketDayById(db, marketDayId);
    setMarketDay(day);
    if (!day?.closedAt) {
      setCanReopen(false);
      setStats({ totalCents: 0, itemCount: 0, profitCents: 0, cashCents: 0, venmoCents: 0, tipsCents: 0 });
      setSales([]);
      return;
    }

    setCanReopen(await canReopenMarketDay(db, marketDayId));
    setStats(await getMarketDayStats(db, marketDayId));
    setSales(await getMarketDaySales(db, marketDayId));
  }, [db, marketDayId]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  useEffect(() => {
    if (!params.saleSaved) return;

    const saleNumber = Number(params.saleSaved);
    if (Number.isNaN(saleNumber) || saleNumber <= 0) return;

    setSavedSaleNumber(saleNumber);
    router.setParams({ saleSaved: undefined });

    const timeout = setTimeout(() => setSavedSaleNumber(null), 5000);
    return () => clearTimeout(timeout);
  }, [params.saleSaved, router]);

  const handleExport = () => {
    void (async () => {
      setExporting(true);
      try {
        await shareMarketDayCsv(db, marketDayId);
        await refresh();
      } catch (error) {
        Alert.alert(
          'Export failed',
          error instanceof Error ? error.message : 'Could not export this Market Day.',
        );
      } finally {
        setExporting(false);
      }
    })();
  };

  const handleReopen = () => {
    Alert.alert(
      'Reopen Market Day?',
      'Checkout turns back on. This day becomes active again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reopen',
          onPress: () => {
            void (async () => {
              setReopening(true);
              try {
                await undoCloseMostRecentMarketDay(db);
                router.replace('/settings');
              } catch (error) {
                Alert.alert(
                  'Could not reopen',
                  error instanceof Error ? error.message : 'Try again in a moment.',
                );
              } finally {
                setReopening(false);
              }
            })();
          },
        },
      ],
    );
  };

  const handleDelete = () => {
    const saleLabel = sales.length === 1 ? '1 sale' : `${sales.length} sales`;
    Alert.alert(
      'Delete Market Day?',
      `"${marketDay?.name ?? 'This market day'}" and ${saleLabel} will be deleted. Can't be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              setDeleting(true);
              try {
                await deleteMarketDay(db, marketDayId);
                router.replace('/settings');
              } catch (error) {
                Alert.alert(
                  'Could not delete',
                  error instanceof Error ? error.message : 'Try again in a moment.',
                );
              } finally {
                setDeleting(false);
              }
            })();
          },
        },
      ],
    );
  };

  if (!marketDay?.closedAt) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Past Event" onBack={() => safeBack(router, '/settings')} />
      </View>
    );
  }

  const exportLabel = marketDay.exportedAt ? 'Re-export sales as CSV' : 'Export sales as CSV';

  return (
    <View style={styles.screen}>
      <ScreenHeader title={marketDay.name} onBack={() => safeBack(router, '/settings')} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <MarketDaySummaryCard
          name={marketDay.name}
          startedAt={marketDay.startedAt}
          totalCents={stats.totalCents}
          profitCents={stats.profitCents}
          saleCount={sales.length}
          cashCents={stats.cashCents}
          venmoCents={stats.venmoCents}
          tipsCents={stats.tipsCents}
        />

        {marketDay.needsReexport ? (
          <View style={styles.reexportBanner}>
            <Text style={styles.reexportTitle}>Re-export recommended</Text>
            <Text style={styles.reexportBody}>
              A sale was edited after export. Export again so your CSV matches the app.
            </Text>
          </View>
        ) : null}

        <View style={styles.salesSection}>
          <SectionLabel>Sales</SectionLabel>
          <AdminSalesList
            sales={sales}
            savedSaleNumber={savedSaleNumber}
            onSalePress={(saleNumber) =>
              router.push({
                pathname: '/(grown-up)/sale/[saleNumber]',
                params: {
                  saleNumber: String(saleNumber),
                  returnTo: 'past',
                  marketDayId: String(marketDayId),
                },
              })
            }
          />
        </View>
      </ScrollView>

      <View style={styles.actionDock}>
        <Pressable
          accessibilityRole="button"
          disabled={exporting}
          onPress={handleExport}
          style={({ pressed }) => [
            styles.exportButtonOuter,
            exporting && styles.buttonDisabled,
            pressed && !exporting && styles.exportButtonOuterPressed,
          ]}>
          <View style={styles.exportButtonInner}>
            <Text style={styles.exportButtonLabel}>
              {exporting ? 'Exporting…' : `⬇ ${exportLabel}`}
            </Text>
          </View>
        </Pressable>

        {canReopen ? (
          <Pressable
            accessibilityRole="button"
            disabled={reopening}
            onPress={handleReopen}
            style={({ pressed }) => [
              styles.reopenButton,
              reopening && styles.buttonDisabled,
              pressed && !reopening && styles.reopenButtonPressed,
            ]}>
            <Text style={styles.reopenButtonLabel}>
              {reopening ? 'Reopening…' : '↩ Reopen Market Day'}
            </Text>
          </Pressable>
        ) : null}

        <Pressable
          accessibilityRole="button"
          disabled={deleting}
          onPress={handleDelete}
          style={({ pressed }) => [
            styles.deleteButton,
            deleting && styles.buttonDisabled,
            pressed && !deleting && styles.deleteButtonPressed,
          ]}>
          <Text style={styles.deleteButtonLabel}>
            {deleting ? 'Deleting…' : '🗑 Delete Market Day'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 12,
  },
  reexportBanner: {
    backgroundColor: colors.warningSurface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.warningBorder,
  },
  reexportTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    color: colors.ink,
    marginBottom: 4,
  },
  reexportBody: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: colors.inkSoft,
    lineHeight: 17,
  },
  salesSection: {
    marginTop: 4,
  },
  actionDock: {
    paddingTop: 10,
    paddingBottom: 4,
    gap: 10,
  },
  exportButtonOuter: {
    width: '100%',
    borderRadius: 18,
    backgroundColor: colors.purpleDark,
    paddingBottom: 4,
  },
  exportButtonOuterPressed: {
    paddingBottom: 1,
    marginTop: 3,
  },
  exportButtonInner: {
    backgroundColor: colors.purple,
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
  },
  exportButtonLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 15,
    color: colors.white,
  },
  reopenButton: {
    width: '100%',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.borderSubtle,
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
  },
  reopenButtonPressed: {
    opacity: 0.85,
  },
  reopenButtonLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 14,
    color: colors.purpleDark,
  },
  deleteButton: {
    width: '100%',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.borderDanger,
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
  },
  deleteButtonPressed: {
    opacity: 0.85,
  },
  deleteButtonLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 14,
    color: colors.redDark,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
});
