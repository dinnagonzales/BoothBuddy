import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/theme';
import { fonts, radii } from '@/constants/visual';
import { formatMarketDayDate } from '@/lib/market-day';
import { formatMoney } from '@/lib/money';

type StatBoxProps = {
  emoji: string;
  label: string;
  value: string;
  subValue?: string;
  backgroundColor: string;
  fullWidth?: boolean;
};

function StatBox({ emoji, label, value, subValue, backgroundColor, fullWidth }: StatBoxProps) {
  return (
    <View style={[styles.statBox, fullWidth && styles.statBoxFullWidth, { backgroundColor }]}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {subValue ? <Text style={styles.statSub}>{subValue}</Text> : null}
    </View>
  );
}

type MarketDaySummaryCardProps = {
  name?: string;
  startedAt?: string;
  saleCount: number;
  cashCents: number;
  venmoCents: number;
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
  variant = 'admin',
}: MarketDaySummaryCardProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.name}>{variant === 'allTime' ? 'All Time' : name}</Text>
      {variant !== 'allTime' && startedAt ? (
        <Text style={styles.date}>{formatMarketDayDate(startedAt)}</Text>
      ) : null}

      {variant === 'viewOnly' ? (
        <View style={styles.stack}>
          <StatBox
            emoji="🧾"
            label="Total Sales"
            value={String(saleCount)}
            backgroundColor={colors.purple}
            fullWidth
          />
          <StatBox
            emoji="📱"
            label="Zelle / Venmo"
            value={formatMoney(venmoCents)}
            backgroundColor={colors.blue}
            fullWidth
          />
          <StatBox
            emoji="💵"
            label="Cash"
            value={formatMoney(cashCents)}
            backgroundColor={colors.green}
            fullWidth
          />
        </View>
      ) : (
        <View style={styles.grid}>
          <View style={styles.gridRow}>
            <StatBox
              emoji="🧾"
              label="Total Sales"
              value={String(saleCount)}
              backgroundColor={colors.purple}
            />
            <StatBox
              emoji="💰"
              label="Profit"
              value={formatMoney(profitCents)}
              subValue={`${formatMoney(totalCents)} gross`}
              backgroundColor={colors.pink}
            />
          </View>
          <View style={styles.gridRow}>
            <StatBox
              emoji="📱"
              label="Zelle / Venmo"
              value={formatMoney(venmoCents)}
              backgroundColor={colors.blue}
            />
            <StatBox
              emoji="💵"
              label="Cash"
              value={formatMoney(cashCents)}
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
  statEmoji: {
    fontSize: 18,
    marginBottom: 6,
  },
  statLabel: {
    fontFamily: fonts.body.extraBold,
    fontSize: 10,
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: fonts.heading.bold,
    fontSize: 26,
    color: colors.white,
  },
  statSub: {
    fontFamily: fonts.body.bold,
    fontSize: 11,
    color: colors.white,
    opacity: 0.85,
    marginTop: 2,
  },
});
