import { Redirect, useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { ItemCard, Screen, SectionLabel } from '@/components/Screen';
import { Button } from '@/components/ui';
import { colors } from '@/constants/theme';
import type { SellerItem } from '@/lib/catalog';
import { createSqliteCatalog } from '@/lib/db/catalog';
import { getActiveMarketDay, getMarketDaySaleCount } from '@/lib/db/queries';
import { deviceParentalGate } from '@/lib/device-parental-gate';
import { formatMarketDayDate } from '@/lib/market-day';
import { formatMoney } from '@/lib/money';
import { isSetupComplete } from '@/lib/setup';

type ActiveMarketSummary = {
  name: string;
  dateLabel: string;
  saleCount: number;
};

export default function HomeScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [setupReady, setSetupReady] = useState<boolean | null>(null);
  const [items, setItems] = useState<SellerItem[]>([]);
  const [canSell, setCanSell] = useState(false);
  const [activeMarket, setActiveMarket] = useState<ActiveMarketSummary | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      const catalog = createSqliteCatalog(db);

      isSetupComplete(deviceParentalGate, catalog)
        .then(async (complete) => {
          if (cancelled) return;
          setSetupReady(complete);
          if (complete) {
            setItems(await catalog.listForSeller());
            const marketDay = await getActiveMarketDay(db);
            if (marketDay) {
              setCanSell(true);
              setActiveMarket({
                name: marketDay.name,
                dateLabel: formatMarketDayDate(marketDay.startedAt),
                saleCount: await getMarketDaySaleCount(db, marketDay.id),
              });
            } else {
              setCanSell(false);
              setActiveMarket(null);
            }
          }
        })
        .catch(() => {
          if (!cancelled) setSetupReady(false);
        });

      return () => {
        cancelled = true;
      };
    }, [db]),
  );

  if (setupReady === null) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#9B5DE5" />
        </View>
      </Screen>
    );
  }

  if (!setupReady) {
    return <Redirect href="/setup" />;
  }

  return (
    <Screen>
      <View style={styles.topBar}>
        <Text style={styles.title}>🎪 Market Day</Text>
        <Pressable
          accessibilityLabel="Grown-up settings"
          style={styles.gearButton}
          onPress={() => router.push('/settings')}>
          <Text style={styles.gearIcon}>⚙️</Text>
        </Pressable>
      </View>

      {activeMarket ? (
        <View style={styles.marketWidget}>
          <Text style={styles.marketName}>{activeMarket.name}</Text>
          <View style={styles.marketMetaRow}>
            <Text style={styles.marketMeta}>{activeMarket.dateLabel}</Text>
            <Text style={styles.marketMetaDot}>·</Text>
            <Text style={styles.marketMeta}>
              {activeMarket.saleCount} {activeMarket.saleCount === 1 ? 'sale' : 'sales'}
            </Text>
          </View>
        </View>
      ) : null}

      <SectionLabel>Items</SectionLabel>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.itemList}
        style={styles.itemListScroll}
        ListEmptyComponent={
          <Text style={styles.emptyItems}>No items yet — ask a grown-up to add some in setup.</Text>
        }
        renderItem={({ item }) => (
          <ItemCard emoji={item.emoji} name={item.name} priceLabel={formatMoney(item.priceCents)} />
        )}
      />

      {!canSell ? (
        <Text style={styles.sellHint}>Ask a grown-up to start a Market Day in ⚙️ settings.</Text>
      ) : null}

      <Button
        size="lg"
        className="rounded-[20px] mb-2"
        isDisabled={!canSell}
        onPress={() => router.push('/sell')}>
        <Button.Label className="text-lg font-bold">🛒 Sell something!</Button.Label>
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 20,
    color: colors.ink,
  },
  gearButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearIcon: {
    fontSize: 16,
  },
  marketWidget: {
    backgroundColor: colors.white,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
  },
  marketName: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 17,
    color: colors.ink,
    marginBottom: 4,
  },
  marketMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  marketMeta: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: colors.inkSoft,
  },
  marketMetaDot: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: colors.inkSoft,
  },
  itemList: {
    gap: 8,
    paddingBottom: 12,
  },
  itemListScroll: {
    flex: 1,
  },
  emptyItems: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: colors.inkSoft,
    textAlign: 'center',
    paddingVertical: 24,
  },
  sellHint: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: colors.inkSoft,
    textAlign: 'center',
    marginBottom: 8,
  },
});
