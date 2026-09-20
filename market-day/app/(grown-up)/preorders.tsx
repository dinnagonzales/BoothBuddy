import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ClipboardList } from 'lucide-react-native';

import { GrownUpScreenHeader } from '@/components/GrownUpScreenHeader';
import { PreorderSalesList } from '@/components/PreorderSalesList';
import { SectionLabel } from '@/components/Screen';
import { UiIcon } from '@/components/ui/UiIcon';
import { colors } from '@/constants/theme';
import { getPreorderPrepSummary, getPreorderSales, completePreorder, getSaleByNumber, type PreorderPrepItem } from '@/lib/db/queries';
import { isCompleteDateOverdue, startOfLocalDay } from '@/lib/market-day';
import { sharePreorderPrintout } from '@/lib/market-day-export';
import { formatMoney } from '@/lib/money';
import type { SaleSummary } from '@/lib/types';

export default function PreordersScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const params = useLocalSearchParams<{ saleSaved?: string }>();
  const [sales, setSales] = useState<SaleSummary[]>([]);
  const [prepSummary, setPrepSummary] = useState<PreorderPrepItem[]>([]);
  const [savedSaleNumber, setSavedSaleNumber] = useState<number | null>(null);
  const [deliveringSaleNumber, setDeliveringSaleNumber] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);

  const refresh = useCallback(async () => {
    const [preorders, prep] = await Promise.all([
      getPreorderSales(db),
      getPreorderPrepSummary(db),
    ]);
    setSales(preorders);
    setPrepSummary(prep);
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
      if (params.saleSaved) {
        const parsed = Number(params.saleSaved);
        if (!Number.isNaN(parsed) && parsed > 0) {
          setSavedSaleNumber(parsed);
        }
      }
    }, [params.saleSaved, refresh]),
  );

  const totalCents = sales.reduce((sum, sale) => sum + sale.totalCents, 0);
  const overdueSales = sales.filter(
    (sale) => sale.completeDate != null && isCompleteDateOverdue(sale.completeDate, startOfLocalDay()),
  );
  const upcomingSales = sales.filter(
    (sale) => sale.completeDate == null || !isCompleteDateOverdue(sale.completeDate, startOfLocalDay()),
  );

  const handleExport = () => {
    void (async () => {
      setExporting(true);
      try {
        await sharePreorderPrintout(db);
      } catch (error) {
        Alert.alert(
          'Export failed',
          error instanceof Error ? error.message : 'Could not export preorders.',
        );
      } finally {
        setExporting(false);
      }
    })();
  };

  const handleMarkDelivered = (saleNumber: number) => {
    const sale = sales.find((entry) => entry.saleNumber === saleNumber);
    const label = sale?.name?.trim() ? sale.name : `#${saleNumber}`;

    Alert.alert(
      'Mark delivered?',
      `${label} will move to Sales.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Delivered',
          onPress: () => {
            void (async () => {
              setDeliveringSaleNumber(saleNumber);
              try {
                const header = await getSaleByNumber(db, saleNumber);
                if (!header?.isPreorder || header.paymentMethod === 'pay_on_pickup') return;

                await completePreorder(db, saleNumber, {
                  paymentMethod: header.paymentMethod,
                  cashReceivedCents: header.cashReceivedCents ?? header.totalCents,
                  changeKept: header.changeKept,
                });
                await refresh();
              } catch (error) {
                Alert.alert(
                  'Could not mark delivered',
                  error instanceof Error ? error.message : 'Try again.',
                );
              } finally {
                setDeliveringSaleNumber(null);
              }
            })();
          },
        },
      ],
    );
  };

  return (
    <View style={styles.screen}>
      <GrownUpScreenHeader
        title="Preorders"
        titleIcon={<UiIcon icon={ClipboardList} size={20} color={colors.ink} />}
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.lead}>
          Tap an invoice to record payment and mark it picked up. For paid preorders, keep payment
          separate from completed sales to ensure totals align.
        </Text>

        {sales.length > 0 ? (
          <View style={styles.prepSection}>
            <SectionLabel>Prepare</SectionLabel>
            <View style={styles.prepCard}>
              {prepSummary.map((item) => (
                <View key={item.itemId} style={styles.prepRow}>
                  <Text style={styles.prepIcon}>{item.icon}</Text>
                  <Text style={styles.prepName}>{item.name}</Text>
                  <Text style={styles.prepQty}>× {item.quantity}</Text>
                </View>
              ))}
              <Text style={styles.prepMeta}>
                {sales.length} {sales.length === 1 ? 'order' : 'orders'} · {formatMoney(totalCents)} total
              </Text>
            </View>
          </View>
        ) : null}

        <View style={styles.exportSection}>
          <SectionLabel>Export for printing</SectionLabel>
          <Pressable
            accessibilityRole="button"
            disabled={exporting || sales.length === 0}
            onPress={handleExport}
            style={({ pressed }) => [
              styles.exportButton,
              (exporting || sales.length === 0) && styles.exportButtonDisabled,
              pressed && !exporting && sales.length > 0 && styles.exportButtonPressed,
            ]}>
            <Text style={styles.exportButtonLabel}>
              {exporting ? 'Exporting…' : 'Export preorders for printing'}
            </Text>
          </Pressable>
        </View>

        {overdueSales.length > 0 ? (
          <>
            <SectionLabel>Overdue</SectionLabel>
            <PreorderSalesList
              sales={overdueSales}
              overdue
              savedSaleNumber={savedSaleNumber}
              deliveringSaleNumber={deliveringSaleNumber}
              onSalePress={(saleNumber) =>
                router.push({
                  pathname: '/sale/[saleNumber]',
                  params: { saleNumber: String(saleNumber), returnTo: 'preorders' },
                })
              }
              onMarkDelivered={handleMarkDelivered}
            />
          </>
        ) : null}

        <SectionLabel>{overdueSales.length > 0 ? 'Upcoming' : 'Open preorders'}</SectionLabel>
        {upcomingSales.length > 0 ? (
          <PreorderSalesList
            sales={upcomingSales}
            savedSaleNumber={savedSaleNumber}
            deliveringSaleNumber={deliveringSaleNumber}
            onSalePress={(saleNumber) =>
              router.push({
                pathname: '/sale/[saleNumber]',
                params: { saleNumber: String(saleNumber), returnTo: 'preorders' },
              })
            }
            onMarkDelivered={handleMarkDelivered}
          />
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              {overdueSales.length > 0 ? 'No upcoming preorders' : 'No open preorders yet'}
            </Text>
          </View>
        )}
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
    paddingBottom: 16,
  },
  lead: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: colors.inkSoft,
    lineHeight: 18,
    marginBottom: 14,
  },
  prepSection: {
    marginBottom: 12,
  },
  prepCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  prepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  prepIcon: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
  },
  prepName: {
    flex: 1,
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: colors.ink,
  },
  prepQty: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 15,
    color: colors.purpleDark,
  },
  prepMeta: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: colors.inkSoft,
    marginTop: 4,
  },
  exportSection: {
    marginBottom: 12,
  },
  exportButton: {
    backgroundColor: colors.purple,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  exportButtonPressed: {
    opacity: 0.88,
  },
  exportButtonDisabled: {
    opacity: 0.6,
  },
  exportButtonLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 15,
    color: colors.white,
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  emptyText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: colors.inkSoft,
    textAlign: 'center',
  },
});
