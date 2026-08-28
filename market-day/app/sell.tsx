import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { FlatList, Text, View } from 'react-native';

import { ItemCard, Screen, ScreenHeader } from '@/components/Screen';
import { Button, Card } from '@/components/ui';
import { useCart } from '@/context/CartContext';
import { getActiveItems } from '@/lib/db/queries';
import { formatMoney } from '@/lib/money';
import type { Item } from '@/lib/types';

export default function SellScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { lines, addItem, changeQuantity, itemCount, totalCents } = useCart();
  const [items, setItems] = useState<Item[]>([]);
  const [loaded, setLoaded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoaded(false);

      void getActiveItems(db).then((nextItems) => {
        if (cancelled) return;
        setItems(nextItems);
        setLoaded(true);
      });

      return () => {
        cancelled = true;
      };
    }, [db]),
  );

  useFocusEffect(
    useCallback(() => {
      if (loaded && items.length === 0) {
        router.replace('/');
      }
    }, [items.length, loaded, router]),
  );

  return (
    <Screen>
      <ScreenHeader title="What sold?" onBack={() => router.back()} />

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ gap: 8, paddingBottom: 8 }}
        style={{ flex: 1 }}
        renderItem={({ item }) => (
          <ItemCard
            emoji={item.emoji}
            name={item.name}
            priceLabel={formatMoney(item.priceCents)}
            onAdd={() =>
              addItem({
                itemId: item.id,
                name: item.name,
                emoji: item.emoji,
                priceCents: item.priceCents,
                costCents: item.costCents,
              })
            }
          />
        )}
      />

      <Card className="mt-2 mb-2 p-3.5">
        <Text className="text-[11px] font-extrabold uppercase text-muted mb-1.5">Cart</Text>
        {lines.length === 0 ? (
          <Text className="text-muted font-semibold py-2">Tap + to add items</Text>
        ) : (
          lines.map((line) => (
            <View key={line.itemId} className="flex-row justify-between items-center py-1">
              <View className="flex-row items-center gap-1.5 flex-1">
                <Button
                  size="sm"
                  isIconOnly
                  variant="secondary"
                  className="w-7 h-7 rounded-full"
                  onPress={() => changeQuantity(line.itemId, -1)}>
                  <Button.Label>−</Button.Label>
                </Button>
                <Text className="font-extrabold text-muted min-w-[24px]">{line.quantity}×</Text>
                <Button
                  size="sm"
                  isIconOnly
                  variant="secondary"
                  className="w-7 h-7 rounded-full"
                  onPress={() => changeQuantity(line.itemId, 1)}>
                  <Button.Label>+</Button.Label>
                </Button>
                <Text className="font-bold text-foreground flex-shrink">{line.name}</Text>
              </View>
              <Text className="font-bold text-foreground">
                {formatMoney(line.priceCents * line.quantity)}
              </Text>
            </View>
          ))
        )}
        <View className="flex-row justify-between items-center border-t-2 border-separator mt-2 pt-2">
          <Text className="text-[15px] font-semibold text-foreground">Total</Text>
          <Text className="text-xl font-bold text-danger">{formatMoney(totalCents)}</Text>
        </View>
        <Button
          size="lg"
          variant="primary"
          className="mt-2.5 bg-success"
          isDisabled={itemCount === 0}
          onPress={() => router.push('/payment')}>
          <Button.Label className="font-bold">Checkout →</Button.Label>
        </Button>
      </Card>
    </Screen>
  );
}
