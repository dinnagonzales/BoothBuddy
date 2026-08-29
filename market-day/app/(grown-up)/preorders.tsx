import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AdminSalesList } from '@/components/AdminSalesList';
import { ScreenHeader, SectionLabel } from '@/components/Screen';
import { colors } from '@/constants/theme';
import { getPreorderPrepSummary, getPreorderSales, type PreorderPrepItem } from '@/lib/db/queries';
import { sharePreorderPrintout } from '@/lib/market-day-export';
import { leaveGrownUpArea } from '@/lib/navigation';
import { formatMoney } from '@/lib/money';
import type { SaleSummary } from '@/lib/types';

export default function PreordersScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const params = useLocalSearchParams<{ saleSaved?: string }>();
  const [sales, setSales] = useState<SaleSummary[]>([]);
  const [prepSummary, setPrepSummary] = useState<PreorderPrepItem[]>([]);
  const [savedSaleNumber, setSavedSaleNumber] = useState<number | null>(null);
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

  return (
    <View style={styles.screen}>
      <ScreenHeader title="📋 Preorders" onBack={() => leaveGrownUpArea(router)} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.lead}>
          Open preorders awaiting pickup. Tap an invoice to record payment and mark complete.
        </Text>

        {sales.length > 0 ? (
          <View style={styles.prepSection}>
            <SectionLabel>Prepare</SectionLabel>
            <View style={styles.prepCard}>
              {prepSummary.map((item) => (
                <View key={item.itemId} style={styles.prepRow}>
                  <Text style={styles.prepEmoji}>{item.emoji}</Text>
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

        <SectionLabel>Open preorders</SectionLabel>
        <AdminSalesList
          sales={sales}
          savedSaleNumber={savedSaleNumber}
          onSalePress={(saleNumber) =>
            router.push({
              pathname: '/sale/[saleNumber]',
              params: { saleNumber: String(saleNumber), returnTo: 'preorders' },
            })
          }
        />
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
  prepEmoji: {
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
});
