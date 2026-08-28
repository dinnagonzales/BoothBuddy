import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen, ScreenHeader } from '@/components/Screen';
import { Button, Card, cn } from '@/components/ui';
import { colors } from '@/constants/theme';
import { useCart } from '@/context/CartContext';
import { marketDayIdForSale } from '@/lib/market-day';
import { createSale, deleteSale, getActiveMarketDay } from '@/lib/db/queries';
import { paymentCanComplete, preorderMetadataValid } from '@/lib/sale-edit';
import { formatMoney } from '@/lib/money';
import type { PaymentMethod } from '@/lib/types';

const BILLS = [100, 500, 1000, 2000, 10000];

const chipShadow = Platform.select({
  web: { boxShadow: `0 4px 0 ${colors.purpleDark}` },
  default: {
    shadowColor: colors.purpleDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
});

export default function PaymentScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { lines, totalCents, clearCart, editingSaleId, editingPaymentMethod, editingCashReceivedCents, invoiceNumber, saleName, saleNotes, isQuickSale, isPreorder } =
    useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashReceivedCents, setCashReceivedCents] = useState(0);
  const preorderCheckout = isQuickSale && isPreorder && editingSaleId == null;

  useEffect(() => {
    if (preorderCheckout) {
      setPaymentMethod('pay_on_pickup');
      setCashReceivedCents(0);
    }
  }, [preorderCheckout]);

  useEffect(() => {
    if (editingSaleId == null) return;

    if (editingPaymentMethod != null) {
      setPaymentMethod(editingPaymentMethod);
    }
    if (editingPaymentMethod === 'cash' && editingCashReceivedCents != null) {
      setCashReceivedCents(editingCashReceivedCents);
    }
  }, [editingSaleId, editingPaymentMethod, editingCashReceivedCents]);

  const changeCents = useMemo(
    () => Math.max(cashReceivedCents - totalCents, 0),
    [cashReceivedCents, totalCents],
  );
  const amountDueCents = useMemo(
    () => Math.max(totalCents - cashReceivedCents, 0),
    [cashReceivedCents, totalCents],
  );
  const cashCoversTotal = cashReceivedCents >= totalCents;
  const canComplete =
    paymentCanComplete(paymentMethod, cashReceivedCents, totalCents) &&
    (!preorderCheckout || preorderMetadataValid(saleName, saleNotes));

  const completeSale = () => {
    if (!canComplete) return;

    void (async () => {
      if (lines.length === 0) return;

      let marketDayId: number | null;
      if (isQuickSale) {
        marketDayId = null;
      } else {
        const marketDay = await getActiveMarketDay(db);
        try {
          marketDayId = marketDayIdForSale(marketDay);
        } catch {
          return;
        }
      }

      const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);

      if (editingSaleId) {
        await deleteSale(db, editingSaleId);
      }

      const sale = await createSale(db, {
        marketDayId,
        lines,
        paymentMethod,
        cashReceivedCents: paymentMethod === 'cash' ? cashReceivedCents : null,
        name: saleName,
        notes: saleNotes,
        isPreorder: preorderCheckout,
      });

      clearCart();
      router.replace({
        pathname: '/celebration',
        params: {
          saleId: String(sale.id),
          itemCount: String(itemCount),
          totalCents: String(sale.totalCents),
          isPreorder: preorderCheckout ? '1' : '0',
          invoiceNumber: String(sale.saleNumber),
        },
      });
    })();
  };

  return (
    <Screen>
      <View style={styles.page}>
        <View style={styles.container}>
          <ScreenHeader
            title={
              invoiceNumber != null ? `Payment: Invoice #${invoiceNumber}` : "How'd they pay?"
            }
            onBack={() => router.back()}
          />

          <View className="items-center my-3">
            <Text className="text-[13px] font-extrabold uppercase text-muted">Total</Text>
            <Text className="text-[44px] font-bold text-foreground">
              {formatMoney(totalCents)}
            </Text>
          </View>

          <Card
            className={cn(
              'p-4 mb-3 border-[3px]',
              paymentMethod === 'cash' ? 'border-success' : 'border-transparent',
            )}>
            <Pressable
              className="flex-row justify-between items-center"
              onPress={() => {
                setPaymentMethod('cash');
              }}>
              <Text className="text-base font-semibold text-foreground">💵 Cash</Text>
              <View
                className={cn(
                  'w-[26px] h-[26px] rounded-full border-2 border-success items-center justify-center',
                  paymentMethod === 'cash' ? 'bg-success' : 'bg-surface',
                )}>
                {paymentMethod === 'cash' ? <Text className="text-white font-bold">✓</Text> : null}
              </View>
            </Pressable>

            {paymentMethod === 'cash' ? (
              <>
                <View style={styles.cashControlRow}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Subtract one dollar"
                    style={styles.minusButton}
                    onPress={() => setCashReceivedCents((value) => Math.max(value - 100, 0))}>
                    <Text style={styles.stepButtonLabel}>−</Text>
                  </Pressable>
                  <Text
                    style={[
                      styles.cashAmount,
                      cashReceivedCents === 0 ? styles.cashAmountEmpty : styles.cashAmountFilled,
                    ]}>
                    {formatMoney(cashReceivedCents)}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Add one dollar"
                    style={styles.plusButton}
                    onPress={() => setCashReceivedCents((value) => value + 100)}>
                    <Text style={styles.stepButtonLabel}>+</Text>
                  </Pressable>
                </View>

                <Text style={styles.tapToAdd}>Tap to add</Text>

                <View style={styles.chipRow}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Exact amount ${formatMoney(totalCents)}`}
                    style={styles.exactChip}
                    onPress={() => setCashReceivedCents(totalCents)}>
                    <Text style={styles.chipLabel}>Exact amount</Text>
                  </Pressable>
                  {BILLS.map((cents) => (
                    <Pressable
                      key={cents}
                      accessibilityRole="button"
                      accessibilityLabel={`Add ${formatMoney(cents)}`}
                      style={styles.chip}
                      onPress={() => setCashReceivedCents((value) => value + cents)}>
                      <Text style={styles.chipLabel}>{formatMoney(cents)}</Text>
                    </Pressable>
                  ))}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Clear cash amount"
                    style={styles.clearChip}
                    onPress={() => setCashReceivedCents(0)}>
                    <Text style={styles.clearChipLabel}>Clear</Text>
                  </Pressable>
                </View>

                <View style={styles.statusBar}>
                  {cashCoversTotal ? (
                    <Text style={styles.changeText}>Change: {formatMoney(changeCents)}</Text>
                  ) : (
                    <Text style={styles.dueText}>Still {formatMoney(amountDueCents)} due</Text>
                  )}
                </View>
              </>
            ) : null}
          </Card>

          <Card
            className={cn(
              'p-4 mb-3 border-[3px]',
              paymentMethod === 'venmo_zelle' ? 'border-success' : 'border-transparent',
            )}>
            <Pressable
              className="flex-row justify-between items-center"
              onPress={() => {
                setPaymentMethod('venmo_zelle');
                setCashReceivedCents(0);
              }}>
              <Text className="text-base font-semibold text-foreground">📱 Venmo / Zelle</Text>
              <View
                className={cn(
                  'w-[26px] h-[26px] rounded-full border-2 items-center justify-center',
                  paymentMethod === 'venmo_zelle'
                    ? 'border-success bg-success'
                    : 'border-border bg-surface',
                )}>
                {paymentMethod === 'venmo_zelle' ? (
                  <Text className="text-white font-bold">✓</Text>
                ) : null}
              </View>
            </Pressable>
          </Card>

          {preorderCheckout ? (
            <Card
              className={cn(
                'p-4 mb-3 border-[3px]',
                paymentMethod === 'pay_on_pickup' ? 'border-success' : 'border-transparent',
              )}>
              <Pressable
                className="flex-row justify-between items-center"
                onPress={() => {
                  setPaymentMethod('pay_on_pickup');
                  setCashReceivedCents(0);
                }}>
                <Text className="text-base font-semibold text-foreground">📋 Pay on pickup</Text>
                <View
                  className={cn(
                    'w-[26px] h-[26px] rounded-full border-2 items-center justify-center',
                    paymentMethod === 'pay_on_pickup'
                      ? 'border-success bg-success'
                      : 'border-border bg-surface',
                  )}>
                  {paymentMethod === 'pay_on_pickup' ? (
                    <Text className="text-white font-bold">✓</Text>
                  ) : null}
                </View>
              </Pressable>
            </Card>
          ) : null}

          <Button
            size="lg"
            className="mt-auto mb-2 rounded-[18px]"
            isDisabled={!canComplete}
            onPress={completeSale}>
            <Button.Label className="text-[17px] font-bold">
              {preorderCheckout ? 'Save preorder ✓' : 'Complete sale ✓'}
            </Button.Label>
          </Button>
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
  cashControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
  },
  minusButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.pinkDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepButtonLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 24,
    color: colors.white,
    lineHeight: 28,
  },
  cashAmount: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 32,
    minWidth: 100,
    textAlign: 'center',
  },
  cashAmountEmpty: {
    color: colors.inkSoft,
  },
  cashAmountFilled: {
    color: colors.ink,
  },
  tapToAdd: {
    marginTop: 6,
    textAlign: 'center',
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.inkSoft,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  chip: {
    backgroundColor: colors.purple,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    ...chipShadow,
  },
  exactChip: {
    backgroundColor: colors.green,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    ...chipShadow,
  },
  clearChip: {
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: '#E4DDF5',
  },
  chipLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 14,
    color: colors.white,
  },
  clearChipLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 14,
    color: colors.purpleDark,
  },
  statusBar: {
    marginTop: 14,
    backgroundColor: '#F3E9FF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  dueText: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 16,
    color: colors.inkSoft,
  },
  changeText: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 16,
    color: colors.greenDark,
  },
});
