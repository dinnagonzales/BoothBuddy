import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Banknote, Coins, Receipt, Smartphone } from 'lucide-react-native';

import { UiIcon } from '@/components/ui/UiIcon';
import { colors } from '@/constants/theme';
import { fonts, radii } from '@/constants/visual';
import { formatMarketDayDate } from '@/lib/market-day';
import { formatMoney } from '@/lib/money';
import { textOnBackground } from '@/theme/tokens';

type StatBoxProps = {
  icon: ReactNode;
  label: string;
  value: string;
  subValues?: string[];
  backgroundColor: string;
  fullWidth?: boolean;
};

function StatBox({ icon, label, value, subValues, backgroundColor, fullWidth }: StatBoxProps) {
  const labelColor = textOnBackground(backgroundColor);
  return (
    <View style={[styles.statBox, fullWidth && styles.statBoxFullWidth, { backgroundColor }]}>
      <View style={styles.statHeader}>
        {icon}
        <Text style={[styles.statLabel, { color: labelColor }]} numberOfLines={1}>
          {label}
        </Text>
      </View>
      <Text style={[styles.statValue, { color: labelColor }]}>{value}</Text>
      {subValues?.map((line) => (
        <Text key={line} style={[styles.statSub, { color: labelColor }]}>
          {line}
        </Text>
      ))}
    </View>
  );
}

type MarketDaySummaryCardProps = {
  name?: string;
  startedAt?: string;
  saleCount: number;
  cancelledSaleCount?: number;
  cashCents: number;
  venmoCents: number;
  cashTipsCents?: number;
  venmoTipsCents?: number;
  variant?: 'admin' | 'viewOnly' | 'allTime';
  totalCents?: number;
  profitCents?: number;
};

export function MarketDaySummaryCard({
  name,
  startedAt,
  totalCents = 0,
  profitCents = 0,
  saleCount,
  cancelledSaleCount = 0,
  cashCents,
  venmoCents,
  cashTipsCents = 0,
  venmoTipsCents = 0,
  variant = 'admin',
}: MarketDaySummaryCardProps) {
  const cashTotalCents = cashCents + cashTipsCents;
  const venmoTotalCents = venmoCents + venmoTipsCents;
  const tipsTotalCents = cashTipsCents + venmoTipsCents;
  const totalWithTipsCents = totalCents + tipsTotalCents;
  const cashSubValues =
    cashTipsCents > 0
      ? [`${formatMoney(cashCents)} + ${formatMoney(cashTipsCents)} (tips)`]
      : undefined;
  const venmoSubValues =
    venmoTipsCents > 0
      ? [`${formatMoney(venmoCents)} + ${formatMoney(venmoTipsCents)} (tips)`]
      : undefined;
  const saleCountSubValues =
    cancelledSaleCount > 0 ? [`${cancelledSaleCount} cancelled`] : undefined;

  return (
    <View style={styles.wrap}>
      <Text style={styles.name}>{variant === 'allTime' ? 'All Time' : name}</Text>
      {variant !== 'allTime' && startedAt ? (
        <Text style={styles.date}>{formatMarketDayDate(startedAt)}</Text>
      ) : null}

      {variant === 'viewOnly' ? (
        <View style={styles.grid}>
          <View style={styles.gridRow}>
            <StatBox
              icon={<UiIcon icon={Receipt} size={20} color={textOnBackground(colors.purple)} />}
              label="Total Sales"
              value={String(saleCount)}
              subValues={saleCountSubValues}
              backgroundColor={colors.purple}
            />
            <StatBox
              icon={<UiIcon icon={Coins} size={20} color={textOnBackground(colors.pink)} />}
              label="Total with Tips"
              value={formatMoney(totalWithTipsCents)}
              subValues={[
                `Order total: ${formatMoney(totalCents)}`,
                `Tips Total: ${formatMoney(tipsTotalCents)}`,
              ]}
              backgroundColor={colors.pink}
            />
          </View>
          <View style={styles.gridRow}>
            <StatBox
              icon={<UiIcon icon={Smartphone} size={20} color={textOnBackground(colors.grayLight)} />}
              label="Zelle / Venmo"
              value={formatMoney(venmoTotalCents)}
              subValues={[
                `Order total: ${formatMoney(venmoCents)}`,
                `Tips: ${formatMoney(venmoTipsCents)}`,
              ]}
              backgroundColor={colors.grayLight}
            />
            <StatBox
              icon={<UiIcon icon={Banknote} size={20} color={textOnBackground(colors.green)} />}
              label="Cash"
              value={formatMoney(cashTotalCents)}
              subValues={[
                `Order total: ${formatMoney(cashCents)}`,
                `Tips: ${formatMoney(cashTipsCents)}`,
              ]}
              backgroundColor={colors.green}
            />
          </View>
        </View>
      ) : (
        <View style={styles.grid}>
          <View style={styles.gridRow}>
            <StatBox
              icon={<UiIcon icon={Coins} size={20} color={textOnBackground(colors.purple)} />}
              label="Profit"
              value={formatMoney(profitCents)}
              subValues={[
                `${formatMoney(totalCents)} gross`,
                `Total sales: ${saleCount}`,
                ...(saleCountSubValues ?? []),
              ]}
              backgroundColor={colors.purple}
            />
            <StatBox
              icon={<UiIcon icon={Receipt} size={20} color={textOnBackground(colors.pink)} />}
              label="Total with Tips"
              value={formatMoney(totalWithTipsCents)}
              subValues={[
                `Order total: ${formatMoney(totalCents)}`,
                `Tips Total: ${formatMoney(tipsTotalCents)}`,
              ]}
              backgroundColor={colors.pink}
            />
          </View>
          <View style={styles.gridRow}>
            <StatBox
              icon={<UiIcon icon={Smartphone} size={20} color={textOnBackground(colors.grayLight)} />}
              label="Zelle / Venmo"
              value={formatMoney(venmoTotalCents)}
              subValues={venmoSubValues}
              backgroundColor={colors.grayLight}
            />
            <StatBox
              icon={<UiIcon icon={Banknote} size={20} color={textOnBackground(colors.green)} />}
              label="Cash"
              value={formatMoney(cashTotalCents)}
              subValues={cashSubValues}
              backgroundColor={colors.green}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 18,
  },
  name: {
    fontFamily: fonts.heading.semiBold,
    fontSize: 20,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 2,
  },
  date: {
    fontFamily: fonts.body.bold,
    fontSize: 13,
    color: colors.inkSoft,
    textAlign: 'center',
    marginBottom: 14,
  },
  grid: {
    gap: 10,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    borderRadius: radii.statsBox,
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 108,
  },
  statBoxFullWidth: {
    flex: undefined,
    width: '100%',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  statLabel: {
    flexShrink: 1,
    fontFamily: fonts.body.extraBold,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  statValue: {
    fontFamily: fonts.heading.bold,
    fontSize: 26,
  },
  statSub: {
    fontFamily: fonts.body.bold,
    fontSize: 11,
    opacity: 0.85,
    marginTop: 2,
  },
});
