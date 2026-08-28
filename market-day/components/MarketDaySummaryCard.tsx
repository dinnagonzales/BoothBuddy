import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/theme';
import { formatMarketDayDate } from '@/lib/market-day';
import { formatMoney } from '@/lib/money';

type MarketDaySummaryCardProps = {
  name: string;
  startedAt: string;
  totalCents: number;
  profitCents: number;
  saleCount: number;
  cashCents: number;
  venmoCents: number;
};

type StatBoxProps = {
  emoji: string;
  label: string;
  value: string;
  subValue?: string;
  backgroundColor: string;
};

function StatBox({ emoji, label, value, subValue, backgroundColor }: StatBoxProps) {
  return (
    <View style={[styles.statBox, { backgroundColor }]}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {subValue ? <Text style={styles.statSub}>{subValue}</Text> : null}
    </View>
  );
}

export function MarketDaySummaryCard({
  name,
  startedAt,
  totalCents,
  profitCents,
  saleCount,
  cashCents,
  venmoCents,
}: MarketDaySummaryCardProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.date}>{formatMarketDayDate(startedAt)}</Text>

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
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 18,
  },
  name: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 20,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 2,
  },
  date: {
    fontFamily: 'Nunito_700Bold',
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
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 108,
  },
  statEmoji: {
    fontSize: 18,
    marginBottom: 6,
  },
  statLabel: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 10,
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 26,
    color: colors.white,
  },
  statSub: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    color: colors.white,
    opacity: 0.85,
    marginTop: 2,
  },
});
