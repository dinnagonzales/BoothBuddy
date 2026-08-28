import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';

import { ItemCard, Screen, SectionLabel } from '@/components/Screen';
import { Button } from '@/components/ui';
import { getActiveItems, getActiveMarketDay } from '@/lib/db/queries';
import { formatMoney } from '@/lib/money';
import type { Item } from '@/lib/types';

export default function HomeScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [marketDayName, setMarketDayName] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      setItems(getActiveItems(db));
      setMarketDayName(getActiveMarketDay(db)?.name ?? null);
    }, [db]),
  );

  const canSell = marketDayName !== null;

  return (
    <Screen>
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-xl font-bold text-foreground">🎪 Market Day</Text>
        <Pressable
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
