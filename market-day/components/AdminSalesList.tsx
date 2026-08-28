import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/theme';
import { formatSaleTime, paymentMethodLabel } from '@/lib/market-day';
import { formatMoney } from '@/lib/money';
import type { SaleSummary } from '@/lib/types';

type AdminSalesListProps = {
  sales: SaleSummary[];
  savedSaleNumber?: number | null;
  onSalePress?: (saleNumber: number) => void;
};

export function AdminSalesList({ sales, savedSaleNumber, onSalePress }: AdminSalesListProps) {
  if (sales.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyText}>No sales yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      {sales.map((sale) => (
        <View key={sale.saleNumber} style={styles.saleBlock}>
          {savedSaleNumber === sale.saleNumber ? (
            <View style={styles.savedBanner}>
              <Text style={styles.savedBannerText}>Saved ✓</Text>
            </View>
          ) : null}
          <Pressable
            accessibilityRole="button"
            onPress={() => onSalePress?.(sale.saleNumber)}
            style={({ pressed }) => [styles.saleRow, pressed && styles.saleRowPressed]}>
            <View>
              <Text style={styles.saleNumber}>#{sale.saleNumber}</Text>
              <Text style={styles.saleTime}>{formatSaleTime(sale.createdAt)}</Text>
            </View>
            <View style={styles.saleAmountWrap}>
              <Text style={styles.saleAmount}>{formatMoney(sale.totalCents)}</Text>
              <Text style={styles.saleMethod}>{paymentMethodLabel(sale.paymentMethod)}</Text>
            </View>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
    marginBottom: 10,
  },
  saleBlock: {
    gap: 6,
  },
  savedBanner: {
    backgroundColor: '#E8F9EF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#B8EBCE',
    alignItems: 'center',
  },
  savedBannerText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 12,
    color: colors.greenDark,
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
  saleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  saleRowPressed: {
    opacity: 0.85,
  },
  saleNumber: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    color: colors.ink,
  },
  saleTime: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    color: colors.inkSoft,
    marginTop: 1,
  },
  saleAmountWrap: {
    alignItems: 'flex-end',
  },
  saleAmount: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 14,
    color: colors.ink,
  },
  saleMethod: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    color: colors.inkSoft,
    marginTop: 1,
  },
});
