import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Banknote, Check, ClipboardList, Smartphone } from 'lucide-react-native';

import { Screen, ScreenHeader } from '@/components/Screen';
import { VenmoZellePaymentInfo } from '@/components/VenmoZellePaymentInfo';
import { BrandButton, Card, Checkbox, cn } from '@/components/ui';
import { UiIcon } from '@/components/ui/UiIcon';
import { colors } from '@/constants/theme';
import { fonts, radii, touchTargets } from '@/constants/visual';
import { useCart } from '@/context/CartContext';
import type { BusinessSettings } from '@/lib/business-settings';
import { EMPTY_BUSINESS_SETTINGS } from '@/lib/business-settings';
import { getBusinessSettings } from '@/lib/db/business-settings';
import { createSale, deleteSale, getActiveMarketDay } from '@/lib/db/queries';
import { safeBack } from '@/lib/navigation';
import { paymentCanComplete, preorderMetadataValid, cashChangeCents, cashChangeStatusLabel } from '@/lib/sale-edit';
import { formatMoney } from '@/lib/money';
import type { PaymentMethod } from '@/lib/types';

const BILLS = [100, 500, 1000, 2000, 10000] as const;
const BILL_ROWS = [
  [BILLS[0], BILLS[1]],
  [BILLS[2], BILLS[3]],
] as const;
const BILL_FULL = BILLS[4];

const chipShadow = (shadowColor: string) =>
  Platform.select({
    web: { boxShadow: `0 4px 0 ${shadowColor}` },
    default: {
      shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 0,
    },
  });

export default function PaymentScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { lines, totalCents, clearCart, editingSaleId, editingPaymentMethod, editingCashReceivedCents, invoiceNumber, saleName, saleNotes, saleCompleteDate, isQuickSale, isPreorder } =
    useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashReceivedCents, setCashReceivedCents] = useState(0);
  const [keepChange, setKeepChange] = useState(false);
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>(EMPTY_BUSINESS_SETTINGS);
  const preorderCheckout = isQuickSale && isPreorder && editingSaleId == null;

  useEffect(() => {
    void getBusinessSettings(db).then(setBusinessSettings);
  }, [db]);

  useEffect(() => {
    if (preorderCheckout) {
      setPaymentMethod('pay_on_pickup');
      setCashReceivedCents(0);
      setKeepChange(false);
    }
  }, [preorderCheckout]);

  useEffect(() => {
    if (editingSaleId == null) return;

    if (editingPaymentMethod != null) {
      setPaymentMethod(editingPaymentMethod);
    }
    if (
      (editingPaymentMethod === 'cash' || editingPaymentMethod === 'venmo_zelle') &&
      editingCashReceivedCents != null
    ) {
      setCashReceivedCents(editingCashReceivedCents);
    } else if (editingPaymentMethod === 'venmo_zelle') {
      setCashReceivedCents(totalCents);
    }
  }, [editingSaleId, editingPaymentMethod, editingCashReceivedCents, totalCents]);

  const changeCents = useMemo(
    () => cashChangeCents(cashReceivedCents, totalCents),
    [cashReceivedCents, totalCents],
  );

  useEffect(() => {
    if (changeCents === 0) {
      setKeepChange(false);
    }
  }, [changeCents]);
  const amountDueCents = useMemo(
    () => Math.max(totalCents - cashReceivedCents, 0),
    [cashReceivedCents, totalCents],
  );
  const cashCoversTotal = cashReceivedCents >= totalCents;
  const cashAmountColorStyle =
    cashReceivedCents === 0
      ? styles.cashAmountEmpty
      : cashReceivedCents < totalCents
        ? styles.cashAmountShort
        : styles.cashAmountGood;
  const showAmountEntry = paymentMethod === 'cash' || paymentMethod === 'venmo_zelle';
  const canComplete =
    paymentCanComplete(paymentMethod, cashReceivedCents, totalCents) &&
    (!preorderCheckout || preorderMetadataValid(saleName, saleNotes, saleCompleteDate));

  const completeSale = () => {
    if (!canComplete) return;

    void (async () => {
      if (lines.length === 0) return;

      let marketDayId: number | null;
      if (isQuickSale) {
        marketDayId = null;
      } else {
        const marketDay = await getActiveMarketDay(db);
        marketDayId = marketDay?.id ?? null;
      }

      const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);

      if (editingSaleId) {
        await deleteSale(db, editingSaleId);
      }

      const sale = await createSale(db, {
        marketDayId,
        lines,
        paymentMethod,
        cashReceivedCents:
          paymentMethod === 'cash' || paymentMethod === 'venmo_zelle' ? cashReceivedCents : null,
        changeKept:
          (paymentMethod === 'cash' || paymentMethod === 'venmo_zelle') && keepChange,
        name: saleName,
        notes: saleNotes,
        completeDate: saleCompleteDate,
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
            onBack={() => safeBack(router, '/sell')}
          />

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            <View style={styles.totalBlock}>
              <Text style={styles.totalLabel}>Order Total</Text>
              <Text style={styles.totalValue}>{formatMoney(totalCents)}</Text>
            </View>

            {paymentMethod === 'venmo_zelle' ? (
              <VenmoZellePaymentInfo
                settings={businessSettings}
                totalCents={totalCents}
                saleLabel={
                  invoiceNumber != null ? `Invoice #${invoiceNumber}` : undefined
                }
              />
            ) : null}

            {showAmountEntry ? (
            <Card style={styles.cashEntry} className="p-4 mb-3">
              <View style={styles.amountPaidHeader}>
                <Text style={styles.valuePaidLabel}>Amount Paid</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Clear cash amount"
                  style={styles.clearChip}
                  onPress={() => {
                    setKeepChange(false);
                    setCashReceivedCents(0);
                  }}>
                  <Text style={styles.clearChipLabel}>Clear</Text>
                </Pressable>
              </View>

              <View style={styles.cashControlRow}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Subtract one dollar"
                  style={styles.minusButton}
                  onPress={() => setCashReceivedCents((value) => Math.max(value - 100, 0))}>
                  <Text style={styles.stepButtonLabel}>−</Text>
                </Pressable>
                <View style={styles.cashAmountWrap}>
                  <Text style={[styles.cashAmount, cashAmountColorStyle]}>
                    {formatMoney(cashReceivedCents)}
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Add one dollar"
                  style={styles.plusButton}
                  onPress={() => setCashReceivedCents((value) => value + 100)}>
                  <Text style={styles.stepButtonLabelLight}>+</Text>
                </Pressable>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Exact amount ${formatMoney(totalCents)}`}
                style={styles.exactChip}
                onPress={() => {
                  setKeepChange(false);
                  setCashReceivedCents(totalCents);
                }}>
                <Text style={styles.chipLabelLight}>Exact amount</Text>
              </Pressable>

              <View style={styles.billGrid}>
                {BILL_ROWS.map((row) => (
                  <View key={row.join('-')} style={styles.billRow}>
                    {row.map((cents) => (
                      <Pressable
                        key={cents}
                        accessibilityRole="button"
                        accessibilityLabel={`Add ${formatMoney(cents)}`}
                        style={[styles.chip, styles.chipHalf]}
                        onPress={() => {
                          setKeepChange(false);
                          setCashReceivedCents((value) => value + cents);
                        }}>
                        <Text style={styles.chipLabel}>{`$${cents / 100}`}</Text>
                      </Pressable>
                    ))}
                  </View>
                ))}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Add ${formatMoney(BILL_FULL)}`}
                  style={[styles.chip, styles.chipWide]}
                  onPress={() => {
                    setKeepChange(false);
                    setCashReceivedCents((value) => value + BILL_FULL);
                  }}>
                  <Text style={styles.chipLabel}>{`$${BILL_FULL / 100}`}</Text>
                </Pressable>
              </View>

              <View style={styles.statusBar}>
                {cashCoversTotal ? (
                  <Text style={[styles.changeText, keepChange ? styles.keepChangeText : null]}>
                    {cashChangeStatusLabel(changeCents, keepChange, formatMoney)}
                  </Text>
                ) : (
                  <Text style={styles.dueText}>Still {formatMoney(amountDueCents)} due</Text>
                )}
              </View>

              {changeCents > 0 ? (
                <View style={styles.keepChangeWrap}>
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: keepChange }}
                    accessibilityLabel="Keep change"
                    style={styles.keepChangeButton}
                    onPress={() => setKeepChange((value) => !value)}>
                    <Text style={styles.keepChangeLabel}>Keep change?</Text>
                    <View pointerEvents="none">
                      <Checkbox
                        isSelected={keepChange}
                        variant="secondary"
                        background={null}
                        className="h-[26px] w-[26px] bg-surface"
                        style={styles.keepChangeCheckbox}
                      />
                    </View>
                  </Pressable>
                </View>
              ) : null}
            </Card>
          ) : null}

          <Card
            style={styles.payOption}
            className={cn(
              'p-4 mb-3 border-[3px]',
              paymentMethod === 'cash' ? 'border-success' : 'border-transparent',
            )}>
            <Pressable
              className="flex-row justify-between items-center"
              onPress={() => {
                setPaymentMethod('cash');
              }}>
              <View style={styles.payOptionLabelRow}>
                <UiIcon icon={Banknote} size={20} color={colors.ink} />
                <Text style={styles.payOptionLabel}>Cash</Text>
              </View>
              <View
                className={cn(
                  'w-[26px] h-[26px] rounded-full border-2 border-success items-center justify-center',
                  paymentMethod === 'cash' ? 'bg-success' : 'bg-surface',
                )}>
                {paymentMethod === 'cash' ? (
                  <UiIcon icon={Check} size={16} color={colors.white} />
                ) : null}
              </View>
            </Pressable>
          </Card>

          <Card
            style={styles.payOption}
            className={cn(
              'p-4 mb-3 border-[3px]',
              paymentMethod === 'venmo_zelle' ? 'border-success' : 'border-transparent',
            )}>
            <Pressable
              className="flex-row justify-between items-center"
              onPress={() => {
                setPaymentMethod('venmo_zelle');
                setCashReceivedCents(totalCents);
                setKeepChange(false);
              }}>
              <View style={styles.payOptionLabelRow}>
                <UiIcon icon={Smartphone} size={20} color={colors.ink} />
                <Text style={styles.payOptionLabel}>Venmo / Zelle</Text>
              </View>
              <View
                className={cn(
                  'w-[26px] h-[26px] rounded-full border-2 items-center justify-center',
                  paymentMethod === 'venmo_zelle'
                    ? 'border-success bg-success'
                    : 'border-border bg-surface',
                )}>
                {paymentMethod === 'venmo_zelle' ? (
                  <UiIcon icon={Check} size={16} color={colors.white} />
                ) : null}
              </View>
            </Pressable>
          </Card>

          {preorderCheckout ? (
            <Card
              style={styles.payOption}
              className={cn(
                'p-4 mb-3 border-[3px]',
                paymentMethod === 'pay_on_pickup' ? 'border-success' : 'border-transparent',
              )}>
              <Pressable
                className="flex-row justify-between items-center"
                onPress={() => {
                  setPaymentMethod('pay_on_pickup');
                  setCashReceivedCents(0);
                  setKeepChange(false);
                }}>
                <View style={styles.payOptionLabelRow}>
                  <UiIcon icon={ClipboardList} size={20} color={colors.ink} />
                  <Text style={styles.payOptionLabel}>Pay on pickup</Text>
                </View>
                <View
                  className={cn(
                    'w-[26px] h-[26px] rounded-full border-2 items-center justify-center',
                    paymentMethod === 'pay_on_pickup'
                      ? 'border-success bg-success'
                      : 'border-border bg-surface',
                  )}>
                  {paymentMethod === 'pay_on_pickup' ? (
                    <UiIcon icon={Check} size={16} color={colors.white} />
                  ) : null}
                </View>
              </Pressable>
            </Card>
          ) : null}
          </ScrollView>

          <View style={styles.endDock}>
            <BrandButton
              label={preorderCheckout ? 'Save preorder' : 'Complete sale'}
              icon={<UiIcon icon={Check} size={20} color={colors.white} />}
              disabled={!canComplete}
              onPress={completeSale}
              style={styles.completeButton}
            />
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 12,
  },
  endDock: {
    paddingTop: 10,
    paddingBottom: 16,
  },
  completeButton: {
    width: '100%',
  },
  totalBlock: {
    alignItems: 'center',
    marginVertical: 10,
    marginBottom: 16,
  },
  totalLabel: {
    fontFamily: fonts.body.extraBold,
    fontSize: 13,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.inkSoft,
  },
  totalValue: {
    fontFamily: fonts.heading.bold,
    fontSize: 44,
    color: colors.ink,
  },
  cashEntry: {
    borderRadius: radii.payOption,
  },
  payOption: {
    borderRadius: radii.payOption,
  },
  payOptionLabel: {
    fontFamily: fonts.heading.semiBold,
    fontSize: 16,
    color: colors.ink,
  },
  payOptionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  valuePaidLabel: {
    fontFamily: fonts.body.extraBold,
    fontSize: 13,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.inkSoft,
  },
  amountPaidHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  cashControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 4,
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
    fontFamily: fonts.heading.semiBold,
    fontSize: 24,
    color: colors.white,
    lineHeight: 28,
  },
  stepButtonLabelLight: {
    fontFamily: fonts.heading.semiBold,
    fontSize: 24,
    color: colors.white,
    lineHeight: 28,
  },
  cashAmountWrap: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  cashAmount: {
    fontFamily: fonts.heading.semiBold,
    fontSize: 44,
    textAlign: 'center',
  },
  cashAmountEmpty: {
    color: colors.inkSoft,
  },
  cashAmountShort: {
    color: colors.redDark,
  },
  cashAmountGood: {
    color: colors.greenDark,
  },
  billGrid: {
    gap: 8,
    marginTop: 8,
  },
  billRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    backgroundColor: colors.purple,
    borderRadius: radii.completeBtn,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...chipShadow(colors.purpleDark),
  },
  chipHalf: {
    flex: 1,
  },
  chipWide: {
    width: '100%',
  },
  exactChip: {
    marginTop: 12,
    backgroundColor: colors.green,
    borderRadius: radii.completeBtn,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...chipShadow(colors.greenDark),
  },
  clearChip: {
    backgroundColor: colors.white,
    borderRadius: 999,
    minHeight: touchTargets.minSize,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipLabel: {
    fontFamily: fonts.heading.semiBold,
    fontSize: 16,
    color: colors.white,
  },
  chipLabelLight: {
    fontFamily: fonts.heading.semiBold,
    fontSize: 16,
    color: colors.white,
  },
  clearChipLabel: {
    fontFamily: fonts.heading.semiBold,
    fontSize: 14,
    color: colors.purpleDark,
  },
  statusBar: {
    marginTop: 16,
    backgroundColor: colors.screen,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  dueText: {
    fontFamily: fonts.heading.semiBold,
    fontSize: 20,
    color: colors.inkSoft,
  },
  changeText: {
    fontFamily: fonts.heading.semiBold,
    fontSize: 22,
    color: colors.greenDark,
  },
  keepChangeText: {
    color: colors.purpleDark,
  },
  keepChangeWrap: {
    marginTop: 14,
    alignItems: 'center',
  },
  keepChangeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: colors.purple,
    borderRadius: radii.completeBtn,
    backgroundColor: colors.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  keepChangeLabel: {
    fontFamily: fonts.heading.semiBold,
    fontSize: 16,
    color: colors.purpleDark,
  },
  keepChangeCheckbox: {
    borderWidth: 2,
    borderColor: colors.purple,
  },
});
