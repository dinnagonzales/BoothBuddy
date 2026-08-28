import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AdminSalesList } from '@/components/AdminSalesList';
import { ScreenHeader, SectionLabel } from '@/components/Screen';
import { colors } from '@/constants/theme';
import { getPreorderSales } from '@/lib/db/queries';
import { leaveGrownUpArea } from '@/lib/navigation';
import type { SaleSummary } from '@/lib/types';

export default function PreordersScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const params = useLocalSearchParams<{ saleSaved?: string }>();
  const [sales, setSales] = useState<SaleSummary[]>([]);
  const [savedSaleNumber, setSavedSaleNumber] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    setSales(await getPreorderSales(db));
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

  return (
    <View style={styles.screen}>
      <ScreenHeader title="📋 Preorders" onBack={() => leaveGrownUpArea(router)} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.lead}>
          Open preorders awaiting pickup. Tap an invoice to record payment and mark complete.
        </Text>
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
});
