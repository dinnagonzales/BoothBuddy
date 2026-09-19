import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Banknote, Check, ClipboardList, Smartphone } from 'lucide-react-native';

import { DatePickerField } from '@/components/DatePickerField';
import { ScreenHeader } from '@/components/Screen';
import { Card, Checkbox, cn } from '@/components/ui';
import { UiIcon } from '@/components/ui/UiIcon';
import { colors } from '@/constants/theme';
import {
  cancelSaleByNumber,
  completePreorder,
  deleteOpenPreorderByNumber,
  getSaleByNumber,
  getSaleLineItems,
  updateSale,
} from '@/lib/db/queries';
import {
  defaultCompleteDate,
  formatCompleteDate,
  formatSaleTime,
  localDayFromExportDate,
  paymentMethodLabel,
  toExportDate,
} from '@/lib/market-day';
import {
  CANCEL_ERROR_NOTE_MAX_LENGTH,
  cancelReasonDisplayLabel,
  type CancelSaleReason,
} from '@/lib/sale-cancel';
import {
  cashChangeCents,
  cashChangeStatusLabel,
  paymentCanComplete,
  paymentMethodCompletesPreorder,
  preorderMetadataValid,
  saleHasUnsavedChanges,
} from '@/lib/sale-edit';
import { formatMoney, parseMoneyInput } from '@/lib/money';
import type { CancelReason, CartLine, PaymentMethod } from '@/lib/types';

function moneyInputFromCents(cents: number): string {
  if (cents === 0) return '';
  return (cents / 100).toFixed(2);
}

function paymentMethodIcon(method: PaymentMethod) {
  if (method === 'cash') return Banknote;
  if (method === 'pay_on_pickup') return ClipboardList;
  return Smartphone;
}

function PaymentMethodLabel({ method, label }: { method: PaymentMethod; label?: string }) {
  return (
    <View style={styles.payLabelRow}>
      <UiIcon icon={paymentMethodIcon(method)} size={20} color={colors.ink} />
      <Text style={styles.payLabelText}>{label ?? paymentMethodLabel(method)}</Text>
    </View>
  );
}

type SaleDetail = {
  saleNumber: number;
  totalCents: number;
  paymentMethod: PaymentMethod;
  name: string | null;
  notes: string | null;
  completeDate: string | null;
  isPreorder: boolean;
  cancelled: boolean;
  cancelReason: CancelReason | null;
  cancelNote: string | null;
  createdAt: string;
  lines: CartLine[];
};

type SaleDetailScreenProps = {
  saleNumber: number;
  readOnly?: boolean;
  preorderMode?: boolean;
  onBack: () => void;
  onSaved?: (saleNumber: number) => void;
  onCompleted?: (saleNumber: number) => void;
};

export function SaleDetailScreen({
  saleNumber,
  readOnly = false,
  preorderMode = false,
  onBack,
  onSaved,
  onCompleted,
}: SaleDetailScreenProps) {
  const db = useSQLiteContext();
  const [sale, setSale] = useState<SaleDetail | null>(null);
  const [draftPaymentMethod, setDraftPaymentMethod] = useState<PaymentMethod | null>(null);
  const [draftName, setDraftName] = useState('');
  const [draftNotes, setDraftNotes] = useState('');
  const [draftCompleteDate, setDraftCompleteDate] = useState(defaultCompleteDate());
  const [draftCashReceivedCents, setDraftCashReceivedCents] = useState(0);
  const [draftCashReceivedText, setDraftCashReceivedText] = useState('');
  const [draftKeepChange, setDraftKeepChange] = useState(false);
  const [busy, setBusy] = useState(false);
  const [cancelSheetOpen, setCancelSheetOpen] = useState(false);
  const [cancelKind, setCancelKind] = useState<'return' | 'error' | null>(null);
  const [cancelErrorNote, setCancelErrorNote] = useState('');

  const loadSale = useCallback(async () => {
    const header = await getSaleByNumber(db, saleNumber);
    if (!header) {
      setSale(null);
      setDraftPaymentMethod(null);
      setDraftName('');
      setDraftNotes('');
      setDraftCompleteDate(defaultCompleteDate());
      setDraftCashReceivedText('');
      return;
    }
    const lines = await getSaleLineItems(db, header.id);
    setSale({
      saleNumber: header.saleNumber,
      totalCents: header.totalCents,
      paymentMethod: header.paymentMethod,
      name: header.name,
      notes: header.notes,
      completeDate: header.completeDate,
      isPreorder: header.isPreorder,
      cancelled: header.cancelled,
      cancelReason: header.cancelReason,
      cancelNote: header.cancelNote,
      createdAt: header.createdAt,
      lines,
    });
    setDraftPaymentMethod(
      header.isPreorder && header.paymentMethod === 'pay_on_pickup' ? null : header.paymentMethod,
    );
    setDraftName(header.name ?? '');
    setDraftNotes(header.notes ?? '');
    setDraftCompleteDate(header.completeDate ?? defaultCompleteDate());
    const initialCashReceivedCents =
      header.cashReceivedCents ??
      (header.paymentMethod === 'cash' || header.paymentMethod === 'venmo_zelle'
        ? header.totalCents
        : 0);
    setDraftCashReceivedCents(initialCashReceivedCents);
    setDraftCashReceivedText(moneyInputFromCents(initialCashReceivedCents));
    setDraftKeepChange(header.changeKept);
  }, [db, saleNumber]);

  useEffect(() => {
    void loadSale();
  }, [loadSale]);

  const handleCashReceivedTextChange = (value: string) => {
    setDraftCashReceivedText(value);
    setDraftCashReceivedCents(parseMoneyInput(value));
  };

  const changePaymentMethod = (paymentMethod: PaymentMethod) => {
    if (readOnly || sale?.cancelled || !sale || busy || draftPaymentMethod === paymentMethod) return;
    setDraftPaymentMethod(paymentMethod);
    // Preserve existing tender/tip when reclassifying cash ↔ Venmo. Only default
    // Venmo to exact total when nothing over the total has been entered yet.
    if (
      paymentMethod === 'venmo_zelle' &&
      draftCashReceivedCents <= sale.totalCents &&
      !draftKeepChange
    ) {
      setDraftCashReceivedCents(sale.totalCents);
      setDraftCashReceivedText(moneyInputFromCents(sale.totalCents));
      setDraftKeepChange(false);
    }
  };

  const changeCents = useMemo(
    () => (sale ? cashChangeCents(draftCashReceivedCents, sale.totalCents) : 0),
    [draftCashReceivedCents, sale],
  );

  useEffect(() => {
    if (changeCents === 0) {
      setDraftKeepChange(false);
    }
  }, [changeCents]);

  const amountDueCents = sale ? Math.max(sale.totalCents - draftCashReceivedCents, 0) : 0;
  const cashCoversTotal = sale != null && draftCashReceivedCents >= sale.totalCents;
  const preorderAwaitingPayment = sale?.isPreorder === true && sale.paymentMethod === 'pay_on_pickup';
  const preorderPaymentLocked =
    sale?.isPreorder === true &&
    (sale.paymentMethod === 'cash' || sale.paymentMethod === 'venmo_zelle');
  const activePreorderPayment = preorderPaymentLocked
    ? sale!.paymentMethod
    : draftPaymentMethod;
  const showPreorderAmountEntry =
    sale?.isPreorder === true &&
    !readOnly &&
    (preorderPaymentLocked || preorderAwaitingPayment);
  const preorderAmountEditable = showPreorderAmountEntry && !preorderPaymentLocked;
  const cashAmountColorStyle =
    draftCashReceivedCents === 0
      ? styles.cashAmountEmpty
      : sale != null && draftCashReceivedCents < sale.totalCents
        ? styles.cashAmountShort
        : styles.cashAmountGood;

  const hasMetadataChanges =
    sale != null &&
    !readOnly &&
    (draftName.trim() !== (sale.name ?? '') ||
      draftNotes.trim() !== (sale.notes ?? '') ||
      draftCompleteDate !== (sale.completeDate ?? defaultCompleteDate()));

  const hasChanges =
    sale != null &&
    !readOnly &&
    !sale.isPreorder &&
    saleHasUnsavedChanges(sale, {
      paymentMethod: draftPaymentMethod,
      name: draftName,
      notes: draftNotes,
    }, readOnly);

  const preorderMetaValid = preorderMetadataValid(draftName, draftNotes, draftCompleteDate);

  const canMarkComplete =
    sale?.isPreorder === true &&
    !readOnly &&
    preorderMetaValid &&
    activePreorderPayment != null &&
    paymentMethodCompletesPreorder(activePreorderPayment) &&
    paymentCanComplete(activePreorderPayment, draftCashReceivedCents, sale.totalCents);

  const saveChanges = () => {
    if (readOnly || busy) return;
    if (sale?.isPreorder) {
      if (!hasMetadataChanges || !preorderMetaValid) return;
      void (async () => {
        setBusy(true);
        try {
          await updateSale(db, saleNumber, {
            name: draftName,
            notes: draftNotes,
            completeDate: draftCompleteDate,
          });
          await loadSale();
          onSaved?.(saleNumber);
        } finally {
          setBusy(false);
        }
      })();
      return;
    }

    if (!hasChanges || !draftPaymentMethod) return;

    void (async () => {
      setBusy(true);
      try {
        await updateSale(db, saleNumber, {
          paymentMethod: draftPaymentMethod,
          name: draftName,
          notes: draftNotes,
        });
        await loadSale();
        onSaved?.(saleNumber);
      } finally {
        setBusy(false);
      }
    })();
  };

  const markComplete = () => {
    if (!canMarkComplete || !activePreorderPayment || busy) return;

    void (async () => {
      setBusy(true);
      try {
        await completePreorder(db, saleNumber, {
          paymentMethod: activePreorderPayment,
          cashReceivedCents: draftCashReceivedCents,
          changeKept: draftKeepChange,
          name: draftName,
          notes: draftNotes,
          completeDate: draftCompleteDate,
        });
        onCompleted?.(saleNumber);
      } finally {
        setBusy(false);
      }
    })();
  };

  const confirmDeleteOpenPreorder = () => {
    if (readOnly || !sale?.isPreorder) return;

    Alert.alert(
      'Delete this preorder?',
      'This can\u2019t be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete preorder',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              setBusy(true);
              try {
                await deleteOpenPreorderByNumber(db, saleNumber);
                onBack();
              } finally {
                setBusy(false);
              }
            })();
          },
        },
      ],
    );
  };

  const openCancelSheet = () => {
    if (readOnly || !sale || sale.isPreorder || sale.cancelled) return;
    setCancelKind(null);
    setCancelErrorNote('');
    setCancelSheetOpen(true);
  };

  const confirmCancelSale = () => {
    if (!sale || cancelKind == null || busy) return;

    const reason: CancelSaleReason =
      cancelKind === 'return'
        ? { kind: 'return' }
        : { kind: 'error', note: cancelErrorNote };

    void (async () => {
      setBusy(true);
      try {
        await cancelSaleByNumber(db, saleNumber, reason);
        setCancelSheetOpen(false);
        await loadSale();
      } catch (error) {
        Alert.alert(
          'Could not cancel sale',
          error instanceof Error ? error.message : 'Try again.',
        );
      } finally {
        setBusy(false);
      }
    })();
  };

  if (!sale) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title={`Sale #${saleNumber}`} onBack={onBack} />
        <Text style={styles.missingText}>Sale not found.</Text>
      </View>
    );
  }

  const locked = readOnly || sale.cancelled;
  const paymentMethod = locked
    ? sale.paymentMethod
    : sale.isPreorder
      ? draftPaymentMethod
      : draftPaymentMethod ?? sale.paymentMethod;
  const selectedPayment = sale.isPreorder && !locked ? draftPaymentMethod : paymentMethod;
  const canSubmitCancel =
    cancelKind === 'return' ||
    (cancelKind === 'error' && cancelErrorNote.trim().length > 0);
  const preorderCompleteLabel = preorderPaymentLocked
    ? 'Mark Delivered → Sales'
    : activePreorderPayment === 'cash'
      ? 'Mark paid with Cash → Sales'
      : activePreorderPayment === 'venmo_zelle'
        ? 'Mark paid with Venmo/Zelle → Sales'
        : 'Mark complete → Sales';

  return (
    <View style={styles.screen}>
      <ScreenHeader title={`Sale #${sale.saleNumber}`} onBack={onBack} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.summaryCard}>
          <Text
            style={[
              styles.summaryAmount,
              sale.cancelled ? styles.summaryAmountCancelled : null,
            ]}>
            {formatMoney(sale.totalCents)}
          </Text>
          <Text style={styles.summaryMeta}>{formatSaleTime(sale.createdAt)}</Text>
          {sale.cancelled ? (
            <Text style={styles.cancelledBanner}>
              Cancelled
              {(() => {
                const reason = cancelReasonDisplayLabel(sale.cancelReason, sale.cancelNote);
                return reason ? ` · ${reason}` : '';
              })()}
            </Text>
          ) : null}
          {(locked || sale.cancelled) && sale.name ? (
            <Text style={styles.summaryName}>{sale.name}</Text>
          ) : null}
          {(locked || sale.cancelled) && sale.notes ? (
            <Text style={styles.summaryNotes}>{sale.notes}</Text>
          ) : null}
          {(locked || sale.cancelled) && sale.completeDate ? (
            <Text style={styles.summaryNotes}>Complete: {formatCompleteDate(sale.completeDate)}</Text>
          ) : null}
        </View>

        {!locked ? (
          <>
            <Text style={styles.sectionLabel}>
              Name {sale.isPreorder ? '(required)' : '(optional)'}
            </Text>
            <TextInput
              value={draftName}
              editable={!busy}
              onChangeText={setDraftName}
              placeholder="Customer or tab name"
              placeholderTextColor={colors.inkSoft}
              style={[
                styles.textInput,
                sale.isPreorder && !draftName.trim() ? styles.textInputRequired : null,
              ]}
            />

            <Text style={styles.sectionLabel}>
              Notes {sale.isPreorder ? '(required)' : '(optional)'}
            </Text>
            <TextInput
              value={draftNotes}
              editable={!busy}
              onChangeText={setDraftNotes}
              placeholder="Pickup time, special requests, etc."
              placeholderTextColor={colors.inkSoft}
              style={[
                styles.textInput,
                styles.notesInput,
                sale.isPreorder && !draftNotes.trim() ? styles.textInputRequired : null,
              ]}
              multiline
            />

            {sale.isPreorder ? (
              <>
                <Text style={styles.sectionLabel}>Complete date (required)</Text>
                <DatePickerField
                  value={localDayFromExportDate(draftCompleteDate)}
                  onChange={(next) => setDraftCompleteDate(toExportDate(next))}
                  accessibilityLabel={`Complete date, ${formatCompleteDate(draftCompleteDate)}`}
                  disabled={busy}
                />
              </>
            ) : null}
          </>
        ) : null}

        <Text style={styles.sectionLabel}>Line items</Text>
        {sale.lines.map((line) => (
          <View key={line.itemId} style={styles.lineRow}>
            <Text style={styles.lineIcon}>{line.icon}</Text>
            <View style={styles.lineCopy}>
              <Text style={styles.lineName}>{line.name}</Text>
              <Text style={styles.lineSubtotal}>{formatMoney(line.priceCents * line.quantity)}</Text>
            </View>
          </View>
        ))}

        <Text style={styles.sectionLabel}>Payment method</Text>
        {locked ? (
          <View style={styles.readOnlyPayment}>
            <PaymentMethodLabel method={sale.paymentMethod} />
          </View>
        ) : sale.isPreorder ? (
          <>
            {preorderAwaitingPayment ? (
              <>
                <Text style={styles.preorderPaymentHint}>
                  Pick a payment method to complete this preorder.
                </Text>
                <Card
                  className={cn(
                    'p-4 mb-2 border-[3px]',
                    selectedPayment === 'cash' ? 'border-success' : 'border-transparent',
                  )}>
                  <Pressable
                    accessibilityRole="button"
                    disabled={busy}
                    className="flex-row justify-between items-center"
                    onPress={() => changePaymentMethod('cash')}>
                    <PaymentMethodLabel method="cash" label="Cash" />
                    <View
                      className={cn(
                        'w-[26px] h-[26px] rounded-full border-2 border-success items-center justify-center',
                        selectedPayment === 'cash' ? 'bg-success' : 'bg-surface',
                      )}>
                      {selectedPayment === 'cash' ? (
                        <UiIcon icon={Check} size={16} color={colors.white} />
                      ) : null}
                    </View>
                  </Pressable>
                </Card>

                <Card
                  className={cn(
                    'p-4 mb-2 border-[3px]',
                    selectedPayment === 'venmo_zelle' ? 'border-success' : 'border-transparent',
                  )}>
                  <Pressable
                    accessibilityRole="button"
                    disabled={busy}
                    className="flex-row justify-between items-center"
                    onPress={() => changePaymentMethod('venmo_zelle')}>
                    <PaymentMethodLabel method="venmo_zelle" />
                    <View
                      className={cn(
                        'w-[26px] h-[26px] rounded-full border-2 items-center justify-center',
                        selectedPayment === 'venmo_zelle'
                          ? 'border-success bg-success'
                          : 'border-border bg-surface',
                      )}>
                      {selectedPayment === 'venmo_zelle' ? (
                        <UiIcon icon={Check} size={16} color={colors.white} />
                      ) : null}
                    </View>
                  </Pressable>
                </Card>
              </>
            ) : preorderPaymentLocked ? (
              <>
                <Text style={styles.preorderPaymentHint}>
                  Paid with {paymentMethodLabel(sale.paymentMethod)} at checkout.
                </Text>
                <View style={styles.readOnlyPayment}>
                  <PaymentMethodLabel method={sale.paymentMethod} />
                </View>
              </>
            ) : null}

            {showPreorderAmountEntry ? (
              <Card className="p-4 mb-3">
                <Text style={styles.amountPaidLabel}>Amount Paid</Text>
                {preorderAmountEditable ? (
                  <View style={styles.cashAmountInputRow}>
                    <Text style={[styles.cashAmountPrefix, cashAmountColorStyle]}>$</Text>
                    <TextInput
                      value={draftCashReceivedText}
                      editable={!busy}
                      onChangeText={handleCashReceivedTextChange}
                      placeholder="0.00"
                      placeholderTextColor={colors.inkSoft}
                      keyboardType="decimal-pad"
                      style={[styles.cashAmountInput, cashAmountColorStyle]}
                    />
                  </View>
                ) : (
                  <View style={styles.cashAmountWrap}>
                    <Text style={[styles.cashAmount, cashAmountColorStyle]}>
                      {formatMoney(draftCashReceivedCents)}
                    </Text>
                  </View>
                )}

                {preorderAmountEditable ? (
                  <View style={styles.statusBar}>
                    {cashCoversTotal ? (
                      <Text
                        style={[styles.changeText, draftKeepChange ? styles.keepChangeText : null]}>
                        {cashChangeStatusLabel(changeCents, draftKeepChange, formatMoney)}
                      </Text>
                    ) : (
                      <Text style={styles.dueText}>Still {formatMoney(amountDueCents)} due</Text>
                    )}
                  </View>
                ) : null}

                {changeCents > 0 && preorderAmountEditable ? (
                  <View style={styles.keepChangeWrap}>
                    <Pressable
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: draftKeepChange }}
                      accessibilityLabel="Keep change"
                      disabled={busy}
                      style={styles.keepChangeButton}
                      onPress={() => setDraftKeepChange((value) => !value)}>
                      <Text style={styles.keepChangeLabel}>Keep change?</Text>
                      <View pointerEvents="none">
                        <Checkbox
                          isSelected={draftKeepChange}
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

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !hasMetadataChanges || !preorderMetaValid || busy }}
              disabled={!hasMetadataChanges || !preorderMetaValid || busy}
              onPress={saveChanges}
              style={({ pressed }) => [
                styles.saveButtonOuter,
                (!hasMetadataChanges || !preorderMetaValid || busy) && styles.saveButtonOuterDisabled,
                pressed && hasMetadataChanges && preorderMetaValid && !busy && styles.saveButtonOuterPressed,
              ]}>
              <View style={styles.saveButtonInner}>
                <Text style={styles.saveButtonLabel}>{busy ? 'Saving…' : 'Save name & notes'}</Text>
              </View>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !canMarkComplete || busy }}
              disabled={!canMarkComplete || busy}
              onPress={markComplete}
              style={({ pressed }) => [
                styles.completeButtonOuter,
                (!canMarkComplete || busy) && styles.saveButtonOuterDisabled,
                pressed && canMarkComplete && !busy && styles.completeButtonOuterPressed,
              ]}>
              <View style={styles.completeButtonInner}>
                <Text style={styles.completeButtonLabel}>
                  {busy ? 'Completing…' : preorderCompleteLabel}
                </Text>
              </View>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              disabled={busy}
              onPress={confirmDeleteOpenPreorder}
              style={({ pressed }) => [styles.removeButton, pressed && styles.removeButtonPressed]}>
              <Text style={styles.removeButtonLabel}>Delete preorder</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Card
              className={cn(
                'p-4 mb-2 border-[3px]',
                paymentMethod === 'cash' ? 'border-success' : 'border-transparent',
              )}>
              <Pressable
                accessibilityRole="button"
                disabled={busy}
                className="flex-row justify-between items-center"
                onPress={() => changePaymentMethod('cash')}>
                <PaymentMethodLabel method="cash" label="Cash" />
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
              className={cn(
                'p-4 mb-2 border-[3px]',
                paymentMethod === 'venmo_zelle' ? 'border-success' : 'border-transparent',
              )}>
              <Pressable
                accessibilityRole="button"
                disabled={busy}
                className="flex-row justify-between items-center"
                onPress={() => changePaymentMethod('venmo_zelle')}>
                <PaymentMethodLabel method="venmo_zelle" />
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

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !hasChanges || busy }}
              disabled={!hasChanges || busy}
              onPress={saveChanges}
              style={({ pressed }) => [
                styles.saveButtonOuter,
                (!hasChanges || busy) && styles.saveButtonOuterDisabled,
                pressed && hasChanges && !busy && styles.saveButtonOuterPressed,
              ]}>
              <View style={styles.saveButtonInner}>
                <Text style={styles.saveButtonLabel}>{busy ? 'Saving…' : 'Save changes'}</Text>
              </View>
            </Pressable>

            {cancelSheetOpen ? (
              <View style={styles.cancelSheet}>
                <Text style={styles.cancelSheetTitle}>Cancel this sale?</Text>
                <Text style={styles.cancelSheetLead}>
                  It stays on the list for Invoice # history but won’t count in totals.
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setCancelKind('return')}
                  style={[
                    styles.cancelReasonOption,
                    cancelKind === 'return' && styles.cancelReasonOptionSelected,
                  ]}>
                  <Text style={styles.cancelReasonLabel}>Return</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setCancelKind('error')}
                  style={[
                    styles.cancelReasonOption,
                    cancelKind === 'error' && styles.cancelReasonOptionSelected,
                  ]}>
                  <Text style={styles.cancelReasonLabel}>Error</Text>
                </Pressable>
                {cancelKind === 'error' ? (
                  <TextInput
                    value={cancelErrorNote}
                    onChangeText={setCancelErrorNote}
                    placeholder="Short reason"
                    placeholderTextColor={colors.inkSoft}
                    maxLength={CANCEL_ERROR_NOTE_MAX_LENGTH}
                    style={styles.textInput}
                  />
                ) : null}
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ disabled: !canSubmitCancel || busy }}
                  disabled={!canSubmitCancel || busy}
                  onPress={confirmCancelSale}
                  style={({ pressed }) => [
                    styles.removeButton,
                    (!canSubmitCancel || busy) && styles.saveButtonOuterDisabled,
                    pressed && canSubmitCancel && !busy && styles.removeButtonPressed,
                  ]}>
                  <Text style={styles.removeButtonLabel}>
                    {busy ? 'Cancelling…' : 'Confirm cancel'}
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  disabled={busy}
                  onPress={() => setCancelSheetOpen(false)}
                  style={styles.cancelDismiss}>
                  <Text style={styles.cancelDismissLabel}>Keep sale</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                accessibilityRole="button"
                disabled={busy}
                onPress={openCancelSheet}
                style={({ pressed }) => [styles.removeButton, pressed && styles.removeButtonPressed]}>
                <Text style={styles.removeButtonLabel}>Cancel sale</Text>
              </Pressable>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  missingText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: colors.inkSoft,
    textAlign: 'center',
    marginTop: 24,
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryAmount: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 28,
    color: colors.ink,
  },
  summaryAmountCancelled: {
    color: colors.inkSoft,
    textDecorationLine: 'line-through',
  },
  cancelledBanner: {
    marginTop: 8,
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    color: colors.redDark,
  },
  cancelSheet: {
    marginTop: 8,
    gap: 10,
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.surfaceMuted,
  },
  cancelSheetTitle: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 18,
    color: colors.ink,
  },
  cancelSheetLead: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: colors.inkSoft,
    lineHeight: 18,
  },
  cancelReasonOption: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.white,
  },
  cancelReasonOptionSelected: {
    borderColor: colors.redDark,
  },
  cancelReasonLabel: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 15,
    color: colors.ink,
  },
  cancelDismiss: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  cancelDismissLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: colors.inkSoft,
  },
  summaryMeta: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: colors.inkSoft,
    marginTop: 4,
  },
  summaryName: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: colors.ink,
    marginTop: 8,
  },
  summaryNotes: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: colors.inkSoft,
    marginTop: 4,
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: colors.ink,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  textInputRequired: {
    borderColor: colors.borderDanger,
    backgroundColor: colors.dangerSurface,
  },
  notesInput: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  sectionLabel: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.inkSoft,
    marginBottom: 8,
    marginTop: 4,
  },
  lineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    gap: 10,
  },
  lineIcon: {
    fontSize: 24,
  },
  lineCopy: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  lineName: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: colors.ink,
    flex: 1,
  },
  lineSubtotal: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 14,
    color: colors.ink,
  },
  readOnlyPayment: {
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 8,
  },
  readOnlyPaymentLabel: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: colors.ink,
  },
  payLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  payLabelText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: colors.ink,
  },
  preorderPaymentHint: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: colors.inkSoft,
    marginBottom: 10,
    lineHeight: 17,
  },
  completeButtonOuter: {
    marginTop: 10,
    borderRadius: 18,
    backgroundColor: colors.greenDark,
    paddingBottom: 4,
  },
  completeButtonOuterPressed: {
    paddingBottom: 1,
    marginTop: 13,
  },
  completeButtonInner: {
    backgroundColor: colors.green,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  completeButtonLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 16,
    color: colors.white,
  },
  saveButtonOuter: {
    marginTop: 16,
    borderRadius: 18,
    backgroundColor: colors.purpleDark,
    paddingBottom: 4,
  },
  saveButtonOuterDisabled: {
    opacity: 0.45,
  },
  saveButtonOuterPressed: {
    paddingBottom: 1,
    marginTop: 19,
  },
  saveButtonInner: {
    backgroundColor: colors.purple,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 16,
    color: colors.white,
  },
  removeButton: {
    marginTop: 10,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.borderDanger,
    backgroundColor: colors.white,
    paddingVertical: 14,
    alignItems: 'center',
  },
  removeButtonPressed: {
    opacity: 0.85,
  },
  removeButtonLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 14,
    color: colors.redDark,
  },
  amountPaidLabel: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.inkSoft,
    textAlign: 'center',
    marginBottom: 4,
  },
  cashAmountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 4,
    gap: 4,
  },
  cashAmountPrefix: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 36,
  },
  cashAmountInput: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 36,
    textAlign: 'left',
    minWidth: 120,
    padding: 0,
  },
  cashAmountWrap: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cashAmount: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 36,
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
  statusBar: {
    marginTop: 12,
    backgroundColor: colors.screen,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  dueText: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 18,
    color: colors.inkSoft,
  },
  changeText: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 18,
    color: colors.greenDark,
  },
  keepChangeText: {
    color: colors.purpleDark,
  },
  keepChangeWrap: {
    marginTop: 12,
    alignItems: 'center',
  },
  keepChangeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: colors.purple,
    borderRadius: 18,
    backgroundColor: colors.white,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  keepChangeLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 15,
    color: colors.purpleDark,
  },
  keepChangeCheckbox: {
    borderWidth: 2,
    borderColor: colors.purple,
  },
});
