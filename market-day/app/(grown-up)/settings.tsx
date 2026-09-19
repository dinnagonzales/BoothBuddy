import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Home, Store, XCircle } from 'lucide-react-native';

import { BoothBuddyLogo } from '@/components/BoothBuddyLogo';
import { AdminSalesList } from '@/components/AdminSalesList';
import { ExpandableCard } from '@/components/ExpandableCard';
import { MarketDaySummaryCard } from '@/components/MarketDaySummaryCard';
import { PastEventsList } from '@/components/PastEventsList';
import { ScreenHeader, SectionLabel } from '@/components/Screen';
import { StartMarketDayForm } from '@/components/StartMarketDayForm';
import { TodaysMenu } from '@/components/TodaysMenu';
import { UiIcon } from '@/components/ui/UiIcon';
import { colors } from '@/constants/theme';
import { fonts, radii, spacing } from '@/constants/visual';
import {
  closeActiveMarketDay,
  getActiveMarketDay,
  getClosedMarketDays,
  getMarketDaySales,
  getMarketDayStats,
  startMarketDay,
} from '@/lib/db/queries';
import { leaveGrownUpArea } from '@/lib/navigation';
import { ActiveMarketDayExistsError } from '@/lib/market-day';
import { countActiveSales, countCancelledSales } from '@/lib/sale-cancel';
import { showUiError } from '@/lib/ui-errors';
import type { ClosedMarketDaySummary, MarketDay, SaleSummary } from '@/lib/types';

export default function SettingsScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const params = useLocalSearchParams<{ saleSaved?: string }>();
  const [activeDay, setActiveDay] = useState<MarketDay | null>(null);
  const [pastEvents, setPastEvents] = useState<ClosedMarketDaySummary[]>([]);
  const [stats, setStats] = useState({
    totalCents: 0,
    itemCount: 0,
    profitCents: 0,
    cashCents: 0,
    venmoCents: 0,
    tipsCents: 0,
    cashTipsCents: 0,
    venmoTipsCents: 0,
  });
  const [sales, setSales] = useState<SaleSummary[]>([]);
  const [menuOpen, setMenuOpen] = useState(true);
  const [savedSaleNumber, setSavedSaleNumber] = useState<number | null>(null);
  const [starting, setStarting] = useState(false);

  const refreshDashboard = useCallback(async () => {
    const day = await getActiveMarketDay(db);
    setActiveDay(day);
    if (day) {
      setPastEvents([]);
      setStats(await getMarketDayStats(db, day.id));
      setSales(await getMarketDaySales(db, day.id));
    } else {
      setPastEvents(await getClosedMarketDays(db));
      setStats({
        totalCents: 0,
        itemCount: 0,
        profitCents: 0,
        cashCents: 0,
        venmoCents: 0,
        tipsCents: 0,
        cashTipsCents: 0,
        venmoTipsCents: 0,
      });
      setSales([]);
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      void refreshDashboard();
    }, [refreshDashboard]),
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

  const handleStartMarketDay = ({ name, startedAt }: { name: string; startedAt: string }) => {
    void (async () => {
      setStarting(true);
      try {
        await startMarketDay(db, name, startedAt);
        await refreshDashboard();
      } catch (error) {
        if (error instanceof ActiveMarketDayExistsError) {
          Alert.alert('Could not start Market Day', error.message);
        } else {
          showUiError(error);
        }
      } finally {
        setStarting(false);
      }
    })();
  };

  const handleEndMarketDay = () => {
    Alert.alert(
      'End Market Day?',
      'Sales stay saved. Checkout stops until you start a new day.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Market Day',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                await closeActiveMarketDay(db);
                await refreshDashboard();
              } catch (error) {
                showUiError(error);
              }
            })();
          },
        },
      ],
    );
  };

  if (!activeDay) {
    return (
      <View style={styles.screen}>
        <ScreenHeader
          title="Events"
          titleIcon={<UiIcon icon={Store} size={20} color={colors.ink} />}
          onBack={() => leaveGrownUpArea(router)}
        />
        <ScrollView contentContainerStyle={styles.emptyScrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.emptyWrap}>
            <View style={styles.emptyBadge}>
              <BoothBuddyLogo variant="full" style={styles.emptyLogo} />
            </View>
            <Text style={styles.emptyTitle}>No market day yet</Text>
            <Text style={styles.emptyBody}>Start one to track today&apos;s sales.</Text>
            <StartMarketDayForm onStart={handleStartMarketDay} busy={starting} />
          </View>

          <PastEventsList
            events={pastEvents}
            onEventPress={(marketDayId) =>
              router.push({
                pathname: '/(grown-up)/past/[id]',
                params: { id: String(marketDayId) },
              })
            }
          />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="Events"
        titleIcon={<UiIcon icon={Store} size={20} color={colors.ink} />}
        onBack={() => leaveGrownUpArea(router)}
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.summarySection}>
          <SectionLabel>Event Summary</SectionLabel>
          <MarketDaySummaryCard
            name={activeDay.name}
            startedAt={activeDay.startedAt}
            totalCents={stats.totalCents}
            profitCents={stats.profitCents}
            saleCount={countActiveSales(sales)}
            cancelledSaleCount={countCancelledSales(sales)}
            cashCents={stats.cashCents}
            venmoCents={stats.venmoCents}
            cashTipsCents={stats.cashTipsCents}
            venmoTipsCents={stats.venmoTipsCents}
          />
        </View>

        {activeDay.needsReexport ? (
          <View style={styles.reexportBanner}>
            <Text style={styles.reexportTitle}>Re-export recommended</Text>
            <Text style={styles.reexportBody}>
              A sale was edited after export. Export again so your CSV matches the app.
            </Text>
          </View>
        ) : null}

        <ExpandableCard
          expanded={menuOpen}
          onHeaderPress={() => setMenuOpen((open) => !open)}
          accessibilityLabel="Today's Menu"
          style={styles.menuCard}
          headerStyle={styles.menuCardHeader}
          header={
            <>
              <Text style={styles.menuCardTitle}>Today&apos;s Menu</Text>
              <Text style={styles.menuCardChevron}>{menuOpen ? '▾' : '▸'}</Text>
            </>
          }>
          <TodaysMenu db={db} embedded />
        </ExpandableCard>

        <View style={styles.salesSection}>
          <SectionLabel>Sales</SectionLabel>
          <AdminSalesList
            sales={sales}
            savedSaleNumber={savedSaleNumber}
            onSalePress={(saleNumber) =>
              router.push({
                pathname: '/(grown-up)/sale/[saleNumber]',
                params: { saleNumber: String(saleNumber) },
              })
            }
          />
        </View>
      </ScrollView>

      <View style={styles.endDock}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go to Dashboard"
          onPress={() => leaveGrownUpArea(router)}
          style={({ pressed }) => [
            styles.dashboardButton,
            pressed && styles.dashboardButtonPressed,
          ]}>
          <View style={styles.dashboardButtonRow}>
            <UiIcon icon={Home} size={18} color={colors.ink} />
            <Text style={styles.dashboardButtonLabel}>Go to Dashboard</Text>
          </View>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={handleEndMarketDay}
          style={({ pressed }) => [styles.endButton, pressed && styles.endButtonPressed]}>
          <View style={styles.endButtonRow}>
            <UiIcon icon={XCircle} size={20} color={colors.redDark} />
            <Text style={styles.endButtonLabel}>End Market Day</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: spacing.screen,
  },
  scrollContent: {
    paddingBottom: 132,
  },
  summarySection: {
    marginBottom: 4,
  },
  dashboardButton: {
    width: '100%',
    borderRadius: radii.completeBtn,
    backgroundColor: colors.grayLight,
    paddingVertical: 14,
    alignItems: 'center',
  },
  dashboardButtonPressed: {
    opacity: 0.85,
  },
  dashboardButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dashboardButtonLabel: {
    fontFamily: fonts.heading.semiBold,
    fontSize: 16,
    color: colors.ink,
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
    fontFamily: fonts.body.extraBold,
    fontSize: 13,
    color: colors.ink,
    marginBottom: 4,
  },
  reexportBody: {
    fontFamily: fonts.body.semiBold,
    fontSize: 12,
    color: colors.inkSoft,
    lineHeight: 17,
  },
  menuCard: {
    marginBottom: 4,
  },
  menuCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuCardTitle: {
    fontFamily: fonts.body.extraBold,
    fontSize: 14,
    color: colors.ink,
  },
  menuCardChevron: {
    fontFamily: fonts.body.extraBold,
    fontSize: 16,
    color: colors.purpleDark,
    lineHeight: 18,
  },
  salesSection: {
    marginTop: 10,
  },
  emptyScrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingTop: 48,
    paddingBottom: 8,
  },
  emptyBadge: {
    width: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyLogo: {
    width: 96,
  },
  emptyTitle: {
    fontFamily: fonts.heading.semiBold,
    fontSize: 19,
    color: colors.ink,
    marginBottom: 6,
  },
  emptyBody: {
    fontFamily: fonts.body.bold,
    fontSize: 13,
    color: colors.inkSoft,
    textAlign: 'center',
    marginBottom: 20,
  },
  endDock: {
    gap: 10,
    paddingTop: 10,
    paddingBottom: 16,
  },
  endButton: {
    width: '100%',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.borderDanger,
    borderRadius: radii.settingsRow,
    paddingVertical: 13,
    alignItems: 'center',
  },
  endButtonPressed: {
    opacity: 0.85,
  },
  endButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  endButtonLabel: {
    fontFamily: fonts.heading.semiBold,
    fontSize: 14,
    color: colors.redDark,
  },
});
