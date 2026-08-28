import { Redirect, useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { ItemCard, Screen, SectionLabel } from '@/components/Screen';
import { Button } from '@/components/ui';
import { colors } from '@/constants/theme';
import type { SellerItem } from '@/lib/catalog';
import { createSqliteCatalog } from '@/lib/db/catalog';
import { deviceParentalGate } from '@/lib/device-parental-gate';
import { formatMoney } from '@/lib/money';
import { isSetupComplete } from '@/lib/setup';

export default function HomeScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [setupReady, setSetupReady] = useState<boolean | null>(null);
  const [items, setItems] = useState<SellerItem[]>([]);
  const [canSell, setCanSell] = useState(false);

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
            setCanSell((await catalog.getActiveMarketDay()) !== null);
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
