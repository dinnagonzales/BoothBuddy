import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { ItemCard, Screen, ScreenHeader, SectionLabel } from '@/components/Screen';
import { Card } from '@/components/ui';
import { colors } from '@/constants/theme';
import { fonts, radii, spacing } from '@/constants/visual';
import { useCart } from '@/context/CartContext';
import { getActiveMarketDay, getCheckoutItems, getNextSaleNumber, getRunningTabItems, getSale } from '@/lib/db/queries';
import { formatMoney } from '@/lib/money';
import {
  formatCompleteDate,
  localDayFromExportDate,
  startOfLocalDay,
  toExportDate,
} from '@/lib/market-day';
import { preorderMetadataValid } from '@/lib/sale-edit';
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
  const [showCompleteDatePicker, setShowCompleteDatePicker] = useState(false);
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

  useFocusEffect(
    useCallback(() => {
      if (loaded && items.length === 0) {
        router.replace('/');
      }
    }, [items.length, loaded, router]),
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

  const handleCompleteDateChange = (_event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setShowCompleteDatePicker(false);
    }
    if (selected) {
      setSaleCompleteDate(toExportDate(startOfLocalDay(selected)));
    }
  };

  return (
    <Screen>
      <View style={styles.page}>
        <View style={styles.container}>
          <ScreenHeader title={screenTitle} onBack={() => router.back()} />

          <SectionLabel>🍭 Menu · use − and + to adjust</SectionLabel>

          <FlatList
            data={items}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ gap: spacing.itemListGap, paddingBottom: 8 }}
            style={{ flex: 1 }}
            renderItem={({ item }) => {
              const quantity = lines.find((line) => line.itemId === item.id)?.quantity ?? 0;

              return (
                <ItemCard
                  emoji={item.emoji}
                  name={item.name}
                  priceLabel={formatMoney(item.priceCents)}
                  quantity={quantity}
                  onIncrement={() =>
                    addItem({
                      itemId: item.id,
                      name: item.name,
                      emoji: item.emoji,
                      priceCents: item.priceCents,
                      costCents: item.costCents,
                    })
                  }
                  onDecrement={() => changeQuantity(item.id, -1)}
                />
              );
            }}
          />

          <View style={styles.cartContainer}>
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
                    metaRequired ? 'Pickup time, special requests, etc.' : 'Who bought it, where, etc.'
                  }
                  placeholderTextColor={colors.inkSoft}
                  style={[styles.metaInput, styles.notesInput]}
                  multiline
                />
                {metaRequired ? (
                  <>
                    <Text style={styles.metaLabel}>Complete date (required)</Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Complete date, ${formatCompleteDate(saleCompleteDate)}`}
                      onPress={() => setShowCompleteDatePicker(true)}
                      style={({ pressed }) => [
                        styles.dateButton,
                        pressed && styles.dateButtonPressed,
                      ]}>
                      <Text style={styles.dateValue}>{formatCompleteDate(saleCompleteDate)}</Text>
                      <Text style={styles.dateChevron}>▾</Text>
                    </Pressable>
                    {showCompleteDatePicker ? (
                      <DateTimePicker
                        value={localDayFromExportDate(saleCompleteDate)}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={handleCompleteDateChange}
                      />
                    ) : null}
                    {Platform.OS === 'ios' && showCompleteDatePicker ? (
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => setShowCompleteDatePicker(false)}
                        style={styles.donePicker}>
                        <Text style={styles.donePickerLabel}>Done</Text>
                      </Pressable>
                    ) : null}
                  </>
                ) : null}
              </Card>
            ) : null}
            <Card style={styles.cartCard}>
              <Text style={styles.cartTitle}>Cart</Text>
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
    gap: 12,
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
    backgroundColor: '#FAF8FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 6,
  },
  notesInput: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF8FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 6,
  },
  dateButtonPressed: {
    opacity: 0.88,
  },
  dateValue: {
    fontFamily: fonts.body.bold,
    fontSize: 14,
    color: colors.ink,
  },
  dateChevron: {
    fontFamily: fonts.body.extraBold,
    fontSize: 14,
    color: colors.purpleDark,
  },
  donePicker: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  donePickerLabel: {
    fontFamily: fonts.body.extraBold,
    fontSize: 13,
    color: colors.purpleDark,
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
    borderTopColor: '#F3E9FF',
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
