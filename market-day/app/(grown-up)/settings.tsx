import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AdminSalesList } from '@/components/AdminSalesList';
import { ExpandableCard } from '@/components/ExpandableCard';
import { MarketDaySummaryCard } from '@/components/MarketDaySummaryCard';
import { ScreenHeader, SectionLabel } from '@/components/Screen';
import { TodaysMenu } from '@/components/TodaysMenu';
import { colors } from '@/constants/theme';
import {
  canUndoCloseMarketDay,
  closeActiveMarketDay,
  getActiveMarketDay,
  getMarketDaySales,
  getMarketDayStats,
  startMarketDay,
  undoCloseMostRecentMarketDay,
} from '@/lib/db/queries';
import { suggestMarketDayName } from '@/lib/market-day';
import type { MarketDay, SaleSummary } from '@/lib/types';

export default function SettingsScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [activeDay, setActiveDay] = useState<MarketDay | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [stats, setStats] = useState({ totalCents: 0, itemCount: 0, cashCents: 0, venmoCents: 0 });
  const [sales, setSales] = useState<SaleSummary[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  const refreshDashboard = useCallback(async () => {
    const day = await getActiveMarketDay(db);
    setActiveDay(day);
    setCanUndo(await canUndoCloseMarketDay(db));
    if (day) {
      setStats(await getMarketDayStats(db, day.id));
      setSales(await getMarketDaySales(db, day.id));
    } else {
      setStats({ totalCents: 0, itemCount: 0, cashCents: 0, venmoCents: 0 });
      setSales([]);
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      void refreshDashboard();
    }, [refreshDashboard]),
  );

  const handleStartMarketDay = () => {
    void (async () => {
      await startMarketDay(db, suggestMarketDayName());
      await refreshDashboard();
    })();
  };

  const handleEndMarketDay = () => {
    Alert.alert(
      'End Market Day?',
      'Sales stay saved, but checkout will stop until you start a new day.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Market Day',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              await closeActiveMarketDay(db);
              await refreshDashboard();
            })();
          },
        },
      ],
    );
  };

  const handleUndoClose = () => {
    void (async () => {
      await undoCloseMostRecentMarketDay(db);
      await refreshDashboard();
    })();
  };

  if (!activeDay) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="⚙️ Settings" onBack={() => router.back()} />
        <View style={styles.emptyWrap}>
          <View style={styles.emptyBadge}>
            <Text style={styles.emptyBadgeIcon}>🎪</Text>
          </View>
          <Text style={styles.emptyTitle}>No market day yet</Text>
          <Text style={styles.emptyBody}>Start one to begin tracking today&apos;s sales.</Text>
          <Pressable
            accessibilityRole="button"
            onPress={handleStartMarketDay}
            style={({ pressed }) => [styles.startButtonOuter, pressed && styles.startButtonOuterPressed]}>
            <View style={styles.startButtonInner}>
              <Text style={styles.startButtonLabel}>▶️ Start Market Day</Text>
            </View>
          </Pressable>
          {canUndo ? (
            <Pressable accessibilityRole="button" onPress={handleUndoClose} style={styles.undoLink}>
              <Text style={styles.undoLinkLabel}>Undo close</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader title="⚙️ Settings" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <MarketDaySummaryCard
          name={activeDay.name}
          startedAt={activeDay.startedAt}
          totalCents={stats.totalCents}
          itemCount={stats.itemCount}
          saleCount={sales.length}
          cashCents={stats.cashCents}
          venmoCents={stats.venmoCents}
        />

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
          onPress={handleEndMarketDay}
          style={({ pressed }) => [styles.endButton, pressed && styles.endButtonPressed]}>
          <Text style={styles.endButtonLabel}>🔴 End Market Day</Text>
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
    backgroundColor: '#FFF4D6',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F5DFA0',
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
  menuCard: {
    marginBottom: 4,
  },
  menuCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuCardTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: colors.ink,
  },
  menuCardChevron: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 16,
    color: colors.purpleDark,
    lineHeight: 18,
  },
  salesSection: {
    marginTop: 10,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  emptyBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3EFFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyBadgeIcon: {
    fontSize: 30,
  },
  emptyTitle: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 19,
    color: colors.ink,
    marginBottom: 6,
  },
  emptyBody: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: colors.inkSoft,
    textAlign: 'center',
    marginBottom: 20,
  },
  startButtonOuter: {
    width: '100%',
    borderRadius: 18,
    backgroundColor: colors.purpleDark,
    paddingBottom: 4,
  },
  startButtonOuterPressed: {
    paddingBottom: 1,
    marginTop: 3,
  },
  startButtonInner: {
    backgroundColor: colors.purple,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startButtonLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 16,
    color: colors.white,
  },
  undoLink: {
    marginTop: 10,
    paddingVertical: 4,
  },
  undoLinkLabel: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 10,
    color: colors.purpleDark,
  },
  endDock: {
    paddingTop: 10,
    paddingBottom: 4,
  },
  endButton: {
    width: '100%',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: '#FFD3D3',
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
  },
  endButtonPressed: {
    opacity: 0.85,
  },
  endButtonLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 14,
    color: colors.redDark,
  },
});
