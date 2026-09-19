import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Search } from 'lucide-react-native';

import { DatePickerField } from '@/components/DatePickerField';
import { ItemCard, Screen, ScreenHeader } from '@/components/Screen';
import { Card } from '@/components/ui';
import { UiIcon } from '@/components/ui/UiIcon';
import { colors } from '@/constants/theme';
import { fonts, radii, spacing } from '@/constants/visual';
import { useCart } from '@/context/CartContext';
import { getActiveMarketDay, getCheckoutItems, getNextSaleNumber, getRunningTabItems, getSale } from '@/lib/db/queries';
import { formatMoney } from '@/lib/money';
import {
  formatCompleteDate,
  localDayFromExportDate,
  toExportDate,
} from '@/lib/market-day';
import { safeBack } from '@/lib/navigation';
import { preorderMetadataValid } from '@/lib/sale-edit';
import type { Item } from '@/lib/types';

const CART_LINES_MAX_HEIGHT = 160;

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
    isQuickSale,
    saleName,
    saleNotes,
    saleCompleteDate,
    setSaleName,
    setSaleNotes,
    setSaleCompleteDate,
  } = useCart();
  const [items, setItems] = useState<Item[]>([]);
  const [hasActiveMarket, setHasActiveMarket] = useState<boolean | null>(null);
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

      void (async () => {
        const loader = isQuickSale ? getRunningTabItems : getCheckoutItems;
        const [marketDay, nextItems] = await Promise.all([getActiveMarketDay(db), loader(db)]);
        if (cancelled) return;
        setHasActiveMarket(marketDay != null);
        setItems(nextItems);
        setLoaded(true);
      })();

      return () => {
        cancelled = true;
      };
    }, [db, isQuickSale]),
  );

  const screenTitle =
    invoiceNumber != null
      ? `CART: Invoice #${invoiceNumber}`
      : isQuickSale
        ? 'Pre-order'
        : 'What sold?';

  const showSaleMeta = isQuickSale || hasActiveMarket === false;
  const metaRequired = isQuickSale;

  const preorderMetaValid = preorderMetadataValid(saleName, saleNotes, saleCompleteDate);
  const canCheckout = itemCount > 0 && (!metaRequired || preorderMetaValid);
  const itemCountLabel = itemCount === 1 ? '1 item' : `${itemCount} items`;

  return (
    <Screen>
      <View style={styles.page}>
        <View style={styles.container}>
          <ScreenHeader title={screenTitle} onBack={() => safeBack(router)} />

          <View style={styles.cartContainer}>
            <Card style={styles.cartCard}>
              <Text style={styles.cartTitle}>Cart</Text>
              <ScrollView
                style={styles.cartLines}
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled">
                {lines.map((line) => (
                  <View key={line.itemId} style={styles.cartLine}>
                    <Text style={styles.cartLineName}>
                      {line.name}({line.quantity})
                    </Text>
                    <Text style={styles.cartLinePrice}>
                      {formatMoney(line.priceCents * line.quantity)}
                    </Text>
                  </View>
                ))}
              </ScrollView>
              <View style={styles.cartTotalRow}>
                <Text style={styles.cartTotalLabel}>{itemCountLabel}</Text>
                <Text style={styles.cartTotalValue}>{formatMoney(totalCents)}</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                disabled={!canCheckout}
                onPress={() => {
                  leavingForPayment.current = true;
                  router.push('/payment');
                }}
                style={({ pressed }) => [
                  styles.checkoutButtonOuter,
                  !canCheckout ? styles.checkoutButtonDisabled : null,
                  pressed && canCheckout ? styles.checkoutButtonOuterPressed : null,
                ]}>
                <View style={styles.checkoutButtonInner}>
                  <Text style={styles.checkoutButtonLabel}>Checkout →</Text>
                </View>
              </Pressable>
            </Card>
          </View>

          <FlatList
            data={items}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listContent}
            style={styles.list}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={
              <View style={styles.listHeader}>
                {showSaleMeta ? (
                  <Card style={styles.metaCard}>
                    <Text style={styles.metaLabel}>
                      Name {metaRequired ? '(required)' : '(optional)'}
                    </Text>
                    <TextInput
                      value={saleName}
                      onChangeText={setSaleName}
                      placeholder="Customer or tab name"
                      placeholderTextColor={colors.inkSoft}
                      style={styles.metaInput}
                    />
                    <Text style={styles.metaLabel}>
                      Notes {metaRequired ? '(required)' : '(optional)'}
                    </Text>
                    <TextInput
                      value={saleNotes}
                      onChangeText={setSaleNotes}
                      placeholder={
                        metaRequired
                          ? 'Pickup time, special requests, etc.'
                          : 'Who bought it, where, etc.'
                      }
                      placeholderTextColor={colors.inkSoft}
                      style={[styles.metaInput, styles.notesInput]}
                      multiline
                    />
                    {metaRequired ? (
                      <>
                        <Text style={styles.metaLabel}>Complete date (required)</Text>
                        <DatePickerField
                          value={localDayFromExportDate(saleCompleteDate)}
                          onChange={(next) => setSaleCompleteDate(toExportDate(next))}
                          accessibilityLabel={`Complete date, ${formatCompleteDate(saleCompleteDate)}`}
                        />
                      </>
                    ) : null}
                  </Card>
                ) : null}
                <View style={styles.menuLabel}>
                  <View style={styles.menuLabelRow}>
                    <UiIcon icon={Search} size={14} color={colors.inkSoft} />
                    <Text style={styles.menuLabelText}>Menu · use − and + to adjust</Text>
                  </View>
                </View>
              </View>
            }
            ListEmptyComponent={
              loaded ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Update inventory to complete a sale"
                  onPress={() => router.push('/inventory?add=1')}
                  style={({ pressed }) => [
                    styles.emptyMenuCard,
                    pressed && styles.emptyMenuCardPressed,
                  ]}>
                  <Text style={styles.emptyMenuText}>Update Inventory to Complete a Sale</Text>
                </Pressable>
              ) : null
            }
            renderItem={({ item }) => {
              const quantity = lines.find((line) => line.itemId === item.id)?.quantity ?? 0;

              return (
                <ItemCard
                  icon={item.icon}
                  photoUri={item.photoUri}
                  name={item.name}
                  priceLabel={formatMoney(item.priceCents)}
                  quantity={quantity}
                  onIncrement={() =>
                    addItem({
                      itemId: item.id,
                      name: item.name,
                      icon: item.icon,
                      priceCents: item.priceCents,
                      costCents: item.costCents,
                    })
                  }
                  onDecrement={() => changeQuantity(item.id, -1)}
                />
              );
            }}
          />
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
  list: {
    flex: 1,
  },
  listContent: {
    gap: spacing.itemListGap,
    paddingBottom: 24,
  },
  listHeader: {
    gap: 12,
  },
  menuLabel: {
    marginBottom: 0,
  },
  menuLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  menuLabelText: {
    fontFamily: fonts.body.extraBold,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.inkSoft,
  },
  emptyMenuCard: {
    backgroundColor: colors.white,
    borderRadius: radii.itemRow,
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyMenuCardPressed: {
    opacity: 0.88,
  },
  emptyMenuText: {
    fontFamily: fonts.body.semiBold,
    fontSize: 14,
    color: colors.inkSoft,
    textAlign: 'center',
  },
  cartContainer: {
    marginBottom: 12,
  },
  metaCard: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 6,
    borderRadius: radii.cart,
  },
  metaLabel: {
    fontFamily: fonts.body.extraBold,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.inkSoft,
  },
  metaInput: {
    fontFamily: fonts.body.bold,
    fontSize: 14,
    color: colors.ink,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 6,
  },
  notesInput: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  cartCard: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: radii.cart,
  },
  cartTitle: {
    fontFamily: fonts.body.extraBold,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.inkSoft,
    marginBottom: 6,
  },
  cartLines: {
    maxHeight: CART_LINES_MAX_HEIGHT,
  },
  cartLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  cartLineName: {
    fontFamily: fonts.body.bold,
    fontSize: 13,
    color: colors.ink,
    flex: 1,
    flexShrink: 1,
    marginRight: 12,
  },
  cartLinePrice: {
    fontFamily: fonts.body.bold,
    fontSize: 13,
    color: colors.ink,
    minWidth: 52,
    textAlign: 'right',
  },
  cartTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 2,
    borderTopColor: colors.screen,
    marginTop: 8,
    paddingTop: 8,
  },
  cartTotalLabel: {
    fontFamily: fonts.heading.semiBold,
    fontSize: 15,
    color: colors.ink,
  },
  cartTotalValue: {
    fontFamily: fonts.heading.bold,
    fontSize: 20,
    color: colors.pinkDark,
  },
  checkoutButtonOuter: {
    marginTop: 10,
    borderRadius: radii.checkout,
    backgroundColor: colors.greenDark,
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
    backgroundColor: colors.green,
    borderRadius: radii.checkout,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutButtonLabel: {
    fontFamily: fonts.heading.semiBold,
    fontSize: 16,
    color: colors.white,
  },
});
