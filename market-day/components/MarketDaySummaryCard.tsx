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
  subValue?: string;
  backgroundColor: string;
  fullWidth?: boolean;
};

function StatBox({ icon, label, value, subValue, backgroundColor, fullWidth }: StatBoxProps) {
  const labelColor = textOnBackground(backgroundColor);
  return (
    <View style={[styles.statBox, fullWidth && styles.statBoxFullWidth, { backgroundColor }]}>
      <View style={styles.statIcon}>{icon}</View>
      <Text style={[styles.statLabel, { color: labelColor }]}>{label}</Text>
      <Text style={[styles.statValue, { color: labelColor }]}>{value}</Text>
      {subValue ? (
        <Text style={[styles.statSub, { color: labelColor }]}>{subValue}</Text>
      ) : null}
    </View>
  );
}

type MarketDaySummaryCardProps = {
  name?: string;
  startedAt?: string;
  saleCount: number;
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
  cashCents,
  venmoCents,
  cashTipsCents = 0,
  venmoTipsCents = 0,
  variant = 'admin',
}: MarketDaySummaryCardProps) {
  const cashTotalCents = cashCents + cashTipsCents;
  const venmoTotalCents = venmoCents + venmoTipsCents;
  const cashSubValue =
    cashTipsCents > 0
      ? `${formatMoney(cashCents)} + ${formatMoney(cashTipsCents)} (tips)`
      : undefined;
  const venmoSubValue =
    venmoTipsCents > 0
      ? `${formatMoney(venmoCents)} + ${formatMoney(venmoTipsCents)} (tips)`
      : undefined;

  return (
    <View style={styles.wrap}>
      <Text style={styles.name}>{variant === 'allTime' ? 'All Time' : name}</Text>
      {variant !== 'allTime' && startedAt ? (
        <Text style={styles.date}>{formatMarketDayDate(startedAt)}</Text>
      ) : null}

      {variant === 'viewOnly' ? (
        <View style={styles.stack}>
          <StatBox
            icon={<UiIcon icon={Receipt} size={20} color={textOnBackground(colors.pink)} />}
            label="Total Sales"
            value={String(saleCount)}
            backgroundColor={colors.pink}
            fullWidth
          />
          <StatBox
            icon={<UiIcon icon={Smartphone} size={20} color={textOnBackground(colors.grayLight)} />}
            label="Zelle / Venmo"
            value={formatMoney(venmoTotalCents)}
            subValue={venmoSubValue}
            backgroundColor={colors.grayLight}
            fullWidth
          />
          <StatBox
            icon={<UiIcon icon={Banknote} size={20} color={textOnBackground(colors.green)} />}
            label="Cash"
            value={formatMoney(cashTotalCents)}
            subValue={cashSubValue}
            backgroundColor={colors.green}
            fullWidth
          />
        </View>
      ) : (
        <View style={styles.grid}>
          <View style={styles.gridRow}>
            <StatBox
              icon={<UiIcon icon={Receipt} size={20} color={textOnBackground(colors.pink)} />}
              label="Total Sales"
              value={String(saleCount)}
              backgroundColor={colors.pink}
            />
            <StatBox
              icon={<UiIcon icon={Coins} size={20} color={textOnBackground(colors.peach)} />}
              label="Profit"
              value={formatMoney(profitCents)}
              subValue={`${formatMoney(totalCents)} gross`}
              backgroundColor={colors.peach}
            />
          </View>
          <View style={styles.gridRow}>
            <StatBox
              icon={<UiIcon icon={Smartphone} size={20} color={textOnBackground(colors.grayLight)} />}
              label="Zelle / Venmo"
              value={formatMoney(venmoTotalCents)}
              subValue={venmoSubValue}
              backgroundColor={colors.grayLight}
            />
            <StatBox
              icon={<UiIcon icon={Banknote} size={20} color={textOnBackground(colors.green)} />}
              label="Cash"
              value={formatMoney(cashTotalCents)}
              subValue={cashSubValue}
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
  stack: {
    gap: 10,
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
  statIcon: {
    marginBottom: 6,
  },
  statLabel: {
    fontFamily: fonts.body.extraBold,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
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
