import { Redirect, useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';

import { ItemCard, Screen, SectionLabel } from '@/components/Screen';
import { Button } from '@/components/ui';
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

      isSetupComplete(deviceParentalGate, catalog).then((complete) => {
        if (cancelled) return;
        setSetupReady(complete);
        if (complete) {
          setItems(catalog.listForSeller());
          setCanSell(catalog.getActiveMarketDay() !== null);
        }
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
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-xl font-bold text-foreground">🎪 Market Day</Text>
        <Pressable
          accessibilityLabel="Grown-up settings"
          className="w-[34px] h-[34px] rounded-full bg-surface items-center justify-center"
          onPress={() => router.push('/settings')}>
          <Text className="text-base">⚙️</Text>
        </Pressable>
      </View>

      <SectionLabel>Items</SectionLabel>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ gap: 8, paddingBottom: 12 }}
        style={{ flex: 1 }}
        renderItem={({ item }) => (
          <ItemCard emoji={item.emoji} name={item.name} priceLabel={formatMoney(item.priceCents)} />
        )}
      />

      {!canSell ? (
        <Text className="text-center text-muted font-bold text-[13px] mb-2">
          Ask a grown-up to start a Market Day in ⚙️ settings.
        </Text>
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
