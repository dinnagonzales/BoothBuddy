import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/theme';
import { formatCompleteDate, isCompleteDateOverdue } from '@/lib/market-day';
import { formatMoney } from '@/lib/money';
import type { SaleSummary } from '@/lib/types';

type PreorderSalesListProps = {
  sales: SaleSummary[];
  savedSaleNumber?: number | null;
  overdue?: boolean;
  onSalePress?: (saleNumber: number) => void;
};

export function PreorderSalesList({
  sales,
  savedSaleNumber,
  overdue = false,
  onSalePress,
}: PreorderSalesListProps) {
  if (sales.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      {sales.map((sale) => {
        const isPaid = sale.paymentMethod !== 'pay_on_pickup';

        return (
        <View key={sale.saleNumber} style={styles.saleBlock}>
          {savedSaleNumber === sale.saleNumber ? (
            <View style={styles.savedBanner}>
              <Text style={styles.savedBannerText}>Saved ✓</Text>
            </View>
          ) : null}
          <Pressable
            accessibilityRole="button"
            onPress={() => onSalePress?.(sale.saleNumber)}
            style={({ pressed }) => [
              styles.saleRow,
              overdue && styles.saleRowOverdue,
              pressed && styles.saleRowPressed,
            ]}>
            <View style={styles.saleCopy}>
              <Text style={styles.saleNumber}>
                {sale.name ? sale.name : `#${sale.saleNumber}`}
              </Text>
              {sale.notes ? <Text style={styles.saleNotes}>{sale.notes}</Text> : null}
              <Text style={[styles.paymentStatus, isPaid && styles.paymentStatusPaid]}>
                • {isPaid ? 'Paid' : 'Pending Payment'}
              </Text>
              {sale.completeDate ? (
                <Text style={[styles.saleCompleteDate, overdue && styles.saleCompleteDateOverdue]}>
                  Complete: {formatCompleteDate(sale.completeDate)}
                  {overdue || isCompleteDateOverdue(sale.completeDate) ? ' · Overdue' : ''}
                </Text>
              ) : null}
            </View>
            <View style={styles.saleAmountWrap}>
              <Text style={styles.saleAmount}>{formatMoney(sale.totalCents)}</Text>
            </View>
          </Pressable>
        </View>
        );
      })}
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
  saleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 12,
  },
  saleRowOverdue: {
    borderWidth: 1,
    borderColor: '#F5C2C2',
    backgroundColor: '#FFF8F8',
  },
  saleRowPressed: {
    opacity: 0.85,
  },
  saleCopy: {
    flex: 1,
    gap: 2,
  },
  saleNumber: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    color: colors.ink,
  },
  saleNotes: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: colors.inkSoft,
    lineHeight: 16,
  },
  paymentStatus: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    color: colors.inkSoft,
  },
  paymentStatusPaid: {
    color: colors.redDark,
  },
  saleCompleteDate: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    color: colors.inkSoft,
  },
  saleCompleteDateOverdue: {
    color: colors.pinkDark,
  },
  saleAmountWrap: {
    alignItems: 'flex-end',
  },
  saleAmount: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 14,
    color: colors.ink,
  },
});
