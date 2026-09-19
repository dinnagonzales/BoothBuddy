import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';

import { UiIcon } from '@/components/ui/UiIcon';
import { colors } from '@/constants/theme';
import { formatMarketDayDate, formatSaleTime, paymentMethodLabel } from '@/lib/market-day';
import { formatMoney } from '@/lib/money';
import { cancelReasonDisplayLabel } from '@/lib/sale-cancel';
import type { AllTimeSaleSummary, SaleSummary } from '@/lib/types';

type AdminSalesListProps = {
  sales: SaleSummary[] | AllTimeSaleSummary[];
  savedSaleNumber?: number | null;
  onSalePress?: (saleNumber: number) => void;
  showSaleContext?: boolean;
};

function saleSubtitle(sale: SaleSummary | AllTimeSaleSummary, showSaleContext: boolean): string {
  if (showSaleContext) {
    const marketDayName =
      'marketDayName' in sale && sale.marketDayName ? `${sale.marketDayName} · ` : '';
    return `${formatMarketDayDate(sale.createdAt)} · ${marketDayName}${formatSaleTime(sale.createdAt)}`;
  }

  return `${sale.name ? `#${sale.saleNumber} · ` : ''}${formatSaleTime(sale.createdAt)}`;
}

function saleMethodLabel(sale: SaleSummary | AllTimeSaleSummary): string {
  if (!sale.cancelled) {
    return paymentMethodLabel(sale.paymentMethod);
  }
  const reason = cancelReasonDisplayLabel(sale.cancelReason, sale.cancelNote);
  return reason ? `Cancelled · ${reason}` : 'Cancelled';
}

export function AdminSalesList({
  sales,
  savedSaleNumber,
  onSalePress,
  showSaleContext = false,
}: AdminSalesListProps) {
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
              <View style={styles.savedBannerRow}>
                <Text style={styles.savedBannerText}>Saved</Text>
                <UiIcon icon={Check} size={16} color={colors.greenDark} />
              </View>
            </View>
          ) : null}
          <Pressable
            accessibilityRole="button"
            onPress={() => onSalePress?.(sale.saleNumber)}
            style={({ pressed }) => [styles.saleRow, pressed && styles.saleRowPressed]}>
            <View>
              <Text style={[styles.saleNumber, sale.cancelled && styles.saleNumberCancelled]}>
                {sale.name ? sale.name : `#${sale.saleNumber}`}
              </Text>
              <Text style={styles.saleTime}>{saleSubtitle(sale, showSaleContext)}</Text>
            </View>
            <View style={styles.saleAmountWrap}>
              <Text style={[styles.saleAmount, sale.cancelled && styles.saleAmountCancelled]}>
                {formatMoney(sale.totalCents)}
              </Text>
              <Text style={[styles.saleMethod, sale.cancelled && styles.saleMethodCancelled]}>
                {saleMethodLabel(sale)}
              </Text>
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
    backgroundColor: colors.successSurface,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  savedBannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  savedBannerText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 12,
    color: colors.greenDark,
  },
  saleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  saleRowPressed: {
    opacity: 0.85,
  },
  saleNumber: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 15,
    color: colors.ink,
  },
  saleNumberCancelled: {
    color: colors.inkSoft,
  },
  saleTime: {
    marginTop: 2,
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: colors.inkSoft,
  },
  saleAmountWrap: {
    alignItems: 'flex-end',
  },
  saleAmount: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 18,
    color: colors.ink,
  },
  saleAmountCancelled: {
    color: colors.inkSoft,
    textDecorationLine: 'line-through',
  },
  saleMethod: {
    marginTop: 2,
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    color: colors.inkSoft,
  },
  saleMethodCancelled: {
    color: colors.redDark,
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: colors.inkSoft,
  },
});
