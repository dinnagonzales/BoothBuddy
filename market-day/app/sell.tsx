import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { ItemCard, Screen, ScreenHeader, SectionLabel } from '@/components/Screen';
import { Card } from '@/components/ui';
import { colors } from '@/constants/theme';
import { useCart } from '@/context/CartContext';
import { getCheckoutItems, getNextSaleNumber, getSale } from '@/lib/db/queries';
import { formatMoney } from '@/lib/money';
import type { Item } from '@/lib/types';

export default function SellScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ invoiceNumber?: string }>();
  const {
    lines,
    addItem,
    changeQuantity,
    itemCount,
    totalCents,
    clearCart,
    editingSaleId,
    invoiceNumber,
    setInvoiceNumber,
  } = useCart();
  const [items, setItems] = useState<Item[]>([]);
  const [loaded, setLoaded] = useState(false);
  const leavingForPayment = useRef(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      if (leavingForPayment.current) {
        leavingForPayment.current = false;
        return;
      }
      clearCart();
    });
    return unsubscribe;
  }, [navigation, clearCart]);

  useEffect(() => {
    if (!params.invoiceNumber) return;
    const parsed = Number(params.invoiceNumber);
    if (!Number.isNaN(parsed) && parsed > 0) {
      setInvoiceNumber(parsed);
    }
  }, [params.invoiceNumber, setInvoiceNumber]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      void (async () => {
        if (invoiceNumber != null) return;

        if (editingSaleId != null) {
          const sale = await getSale(db, editingSaleId);
          if (cancelled || !sale) return;
          setInvoiceNumber(sale.saleNumber);
          return;
        }

        const nextNumber = await getNextSaleNumber(db);
        if (cancelled) return;
        setInvoiceNumber(nextNumber);
      })();

      return () => {
        cancelled = true;
      };
    }, [db, editingSaleId, invoiceNumber, setInvoiceNumber]),
  );

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoaded(false);

      void getCheckoutItems(db).then((nextItems) => {
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

  const screenTitle =
    invoiceNumber != null ? `CART: Invoice #${invoiceNumber}` : 'What sold?';

  return (
    <Screen>
      <View style={styles.page}>
        <View style={styles.container}>
          <ScreenHeader title={screenTitle} onBack={() => router.back()} />

          <SectionLabel>🍭 Menu · tap + to add</SectionLabel>

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

          <View style={styles.cartContainer}>
            <Card style={styles.cartCard}>
              <Text className="text-[11px] font-extrabold uppercase text-muted mb-1.5">Cart</Text>
              {lines.map((line) => (
                <View key={line.itemId} className="flex-row justify-between items-center py-1">
                  <View className="flex-row items-center gap-2 flex-1">
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Remove one ${line.name}`}
                      style={styles.minusButton}
                      onPress={() => changeQuantity(line.itemId, -1)}>
                      <Text style={styles.stepButtonLabel}>−</Text>
                    </Pressable>
                    <Text style={styles.quantityLabel}>{line.quantity}</Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Add one ${line.name}`}
                      style={styles.plusButton}
                      onPress={() => changeQuantity(line.itemId, 1)}>
                      <Text style={styles.stepButtonLabel}>+</Text>
                    </Pressable>
                    <Text className="font-bold text-foreground flex-shrink">{line.name}</Text>
                  </View>
                  <Text className="font-bold text-foreground">
                    {formatMoney(line.priceCents * line.quantity)}
                  </Text>
                </View>
              ))}
              <View className="flex-row justify-between items-center border-t-2 border-separator mt-2 pt-2">
                <Text className="text-[15px] font-semibold text-foreground">Total</Text>
                <Text className="text-xl font-bold text-danger">{formatMoney(totalCents)}</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                disabled={itemCount === 0}
                onPress={() => {
                  leavingForPayment.current = true;
                  router.push('/payment');
                }}
                style={({ pressed }) => [
                  styles.checkoutButtonOuter,
                  itemCount === 0 ? styles.checkoutButtonDisabled : null,
                  pressed && itemCount > 0 ? styles.checkoutButtonOuterPressed : null,
                ]}>
                <View style={styles.checkoutButtonInner}>
                  <Text style={styles.checkoutButtonLabel}>Checkout →</Text>
                </View>
              </Pressable>
            </Card>
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: 'center',
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 440,
  },
  cartContainer: {
    marginTop: 24,
    marginBottom: 24,
  },
  cartCard: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  minusButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.pinkDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepButtonLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 20,
    color: colors.white,
    lineHeight: 22,
  },
  quantityLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 16,
    color: colors.ink,
    minWidth: 18,
    textAlign: 'center',
  },
  checkoutButtonOuter: {
    marginTop: 10,
    borderRadius: 18,
    backgroundColor: colors.purpleDark,
    paddingBottom: 5,
  },
  checkoutButtonOuterPressed: {
    paddingBottom: 1,
    marginTop: 4,
  },
  checkoutButtonDisabled: {
    opacity: 0.45,
  },
  checkoutButtonInner: {
    backgroundColor: colors.purple,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutButtonLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 17,
    color: colors.white,
  },
});
