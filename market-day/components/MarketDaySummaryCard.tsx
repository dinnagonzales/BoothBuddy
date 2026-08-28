import { StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient as SvgGradient, Rect, Stop } from 'react-native-svg';

import { colors } from '@/constants/theme';
import { formatMarketDayDate } from '@/lib/market-day';
import { formatMoney } from '@/lib/money';

type MarketDaySummaryCardProps = {
  name: string;
  startedAt: string;
  totalCents: number;
  saleCount: number;
};

export function MarketDaySummaryCard({
  name,
  startedAt,
  totalCents,
  saleCount,
}: MarketDaySummaryCardProps) {
  const saleLabel = saleCount === 1 ? '1 sale' : `${saleCount} sales`;

  return (
    <View style={styles.card}>
      <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none">
        <Defs>
          <SvgGradient id="summaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.pink} />
            <Stop offset="100%" stopColor={colors.purple} />
          </SvgGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#summaryGradient)" />
      </Svg>
      <View style={styles.content}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.amount}>{formatMoney(totalCents)}</Text>
        <Text style={styles.sub}>
          {formatMarketDayDate(startedAt)} · {saleLabel}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 18,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  name: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 15,
    color: colors.white,
    marginBottom: 6,
  },
  amount: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 32,
    color: colors.white,
  },
  sub: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: colors.white,
    opacity: 0.9,
    marginTop: 2,
  },
});
