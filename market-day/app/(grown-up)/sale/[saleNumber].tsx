import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ScreenHeader } from '@/components/Screen';
import { Card, cn } from '@/components/ui';
import { colors } from '@/constants/theme';
import {
  getSaleByNumber,
  getSaleLineItems,
  removeSaleByNumber,
  updateSalePaymentMethod,
} from '@/lib/db/queries';
import { formatSaleTime, paymentMethodLabel } from '@/lib/market-day';
import { formatMoney } from '@/lib/money';
import type { CartLine, PaymentMethod } from '@/lib/types';

type SaleDetail = {
  saleNumber: number;
  totalCents: number;
  paymentMethod: PaymentMethod;
  createdAt: string;
  lines: CartLine[];
};

export default function AdminEditSaleScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const params = useLocalSearchParams<{ saleNumber: string }>();
  const saleNumber = Number(params.saleNumber ?? 0);

  const [sale, setSale] = useState<SaleDetail | null>(null);
  const [busy, setBusy] = useState(false);

  const loadSale = useCallback(async () => {
    const header = await getSaleByNumber(db, saleNumber);
    if (!header) {
      setSale(null);
      return;
    }
    const lines = await getSaleLineItems(db, header.id);
    setSale({
      saleNumber: header.saleNumber,
      totalCents: header.totalCents,
      paymentMethod: header.paymentMethod,
      createdAt: header.createdAt,
      lines,
    });
  }, [db, saleNumber]);

  useFocusEffect(
    useCallback(() => {
      void loadSale();
    }, [loadSale]),
  );

  const changePaymentMethod = (paymentMethod: PaymentMethod) => {
    if (!sale || busy || sale.paymentMethod === paymentMethod) return;

    void (async () => {
      setBusy(true);
      await updateSalePaymentMethod(db, saleNumber, paymentMethod);
      await loadSale();
      setBusy(false);
    })();
  };

  const confirmRemoveSale = () => {
    Alert.alert(
      'Remove this sale?',
      'This deletes the whole mis-logged transaction. It cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove sale',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              setBusy(true);
              await removeSaleByNumber(db, saleNumber);
              router.back();
            })();
          },
        },
      ],
    );
  };

  if (!sale) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title={`Sale #${saleNumber}`} onBack={() => router.back()} />
        <Text style={styles.missingText}>This sale could not be found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader title={`Sale #${sale.saleNumber}`} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryAmount}>{formatMoney(sale.totalCents)}</Text>
          <Text style={styles.summaryMeta}>{formatSaleTime(sale.createdAt)}</Text>
        </View>

        <Text style={styles.sectionLabel}>Line items</Text>
        {sale.lines.map((line) => (
          <View key={line.itemId} style={styles.lineRow}>
            <Text style={styles.lineEmoji}>{line.emoji}</Text>
            <View style={styles.lineCopy}>
              <Text style={styles.lineName}>{line.name}</Text>
              <Text style={styles.lineSubtotal}>{formatMoney(line.priceCents * line.quantity)}</Text>
            </View>
          </View>
        ))}

        <Text style={styles.sectionLabel}>Payment method</Text>
        <Card
          className={cn(
            'p-4 mb-2 border-[3px]',
            sale.paymentMethod === 'cash' ? 'border-success' : 'border-transparent',
          )}>
          <Pressable
            accessibilityRole="button"
            disabled={busy}
            className="flex-row justify-between items-center"
            onPress={() => changePaymentMethod('cash')}>
            <Text className="text-base font-semibold text-foreground">💵 Cash</Text>
            <View
              className={cn(
                'w-[26px] h-[26px] rounded-full border-2 border-success items-center justify-center',
                sale.paymentMethod === 'cash' ? 'bg-success' : 'bg-surface',
              )}>
              {sale.paymentMethod === 'cash' ? (
                <Text className="text-white font-bold">✓</Text>
              ) : null}
            </View>
          </Pressable>
        </Card>

        <Card
          className={cn(
            'p-4 mb-2 border-[3px]',
            sale.paymentMethod === 'venmo_zelle' ? 'border-success' : 'border-transparent',
          )}>
          <Pressable
            accessibilityRole="button"
            disabled={busy}
            className="flex-row justify-between items-center"
            onPress={() => changePaymentMethod('venmo_zelle')}>
            <Text className="text-base font-semibold text-foreground">
              📱 {paymentMethodLabel('venmo_zelle')}
            </Text>
            <View
              className={cn(
                'w-[26px] h-[26px] rounded-full border-2 items-center justify-center',
                sale.paymentMethod === 'venmo_zelle'
                  ? 'border-success bg-success'
                  : 'border-border bg-surface',
              )}>
              {sale.paymentMethod === 'venmo_zelle' ? (
                <Text className="text-white font-bold">✓</Text>
              ) : null}
            </View>
          </Pressable>
        </Card>

        <Pressable
          accessibilityRole="button"
          disabled={busy}
          onPress={confirmRemoveSale}
          style={({ pressed }) => [styles.removeButton, pressed && styles.removeButtonPressed]}>
          <Text style={styles.removeButtonLabel}>Remove sale</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
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
  summaryMeta: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: colors.inkSoft,
    marginTop: 4,
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
  lineEmoji: {
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
  removeButton: {
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFD3D3',
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
});
