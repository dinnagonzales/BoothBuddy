import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';

import { UiIcon } from '@/components/ui/UiIcon';
import { colors } from '@/constants/theme';
import { formatCompleteDate, isCompleteDateOverdue } from '@/lib/market-day';
import { formatMoney } from '@/lib/money';
import type { SaleSummary } from '@/lib/types';

type PreorderSalesListProps = {
  sales: SaleSummary[];
  savedSaleNumber?: number | null;
  deliveringSaleNumber?: number | null;
  overdue?: boolean;
  onSalePress?: (saleNumber: number) => void;
  onMarkDelivered?: (saleNumber: number) => void;
};

export function PreorderSalesList({
  sales,
  savedSaleNumber,
  deliveringSaleNumber = null,
  overdue = false,
  onSalePress,
  onMarkDelivered,
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
              <View style={styles.savedBannerRow}>
                <Text style={styles.savedBannerText}>Saved</Text>
                <UiIcon icon={Check} size={16} color={colors.greenDark} />
              </View>
            </View>
          ) : null}
          <View
            style={[styles.saleCard, overdue && styles.saleCardOverdue]}>
            <Pressable
              accessibilityRole="button"
              onPress={() => onSalePress?.(sale.saleNumber)}
              style={({ pressed }) => [styles.saleRow, pressed && styles.saleRowPressed]}>
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
            {isPaid ? (
              <View style={styles.saleCardFooter}>
                <Pressable
                  accessibilityRole="button"
                  disabled={deliveringSaleNumber === sale.saleNumber}
                  onPress={() => onMarkDelivered?.(sale.saleNumber)}
                  style={({ pressed }) => [
                    styles.deliverButton,
                    deliveringSaleNumber === sale.saleNumber && styles.deliverButtonDisabled,
                    pressed && deliveringSaleNumber !== sale.saleNumber && styles.deliverButtonPressed,
                  ]}>
                  <Text style={styles.deliverButtonLabel}>
                    {deliveringSaleNumber === sale.saleNumber ? 'Delivering…' : 'Mark Delivered'}
                  </Text>
                </Pressable>
              </View>
            ) : null}
          </View>
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
    backgroundColor: colors.successSurface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.borderSuccess,
    alignItems: 'center',
  },
  savedBannerText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 12,
    color: colors.greenDark,
  },
  savedBannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  saleCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    overflow: 'hidden',
  },
  saleCardOverdue: {
    borderWidth: 1,
    borderColor: colors.borderDanger,
    backgroundColor: colors.dangerSurface,
  },
  saleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 12,
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
  saleCardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  deliverButton: {
    backgroundColor: colors.green,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  deliverButtonPressed: {
    opacity: 0.85,
  },
  deliverButtonDisabled: {
    opacity: 0.55,
  },
  deliverButtonLabel: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 11,
    color: colors.white,
  },
});
