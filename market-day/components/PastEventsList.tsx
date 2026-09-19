import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Calendar } from 'lucide-react-native';

import { UiIcon } from '@/components/ui/UiIcon';
import { colors } from '@/constants/theme';
import { formatMarketDayDate } from '@/lib/market-day';
import type { ClosedMarketDaySummary } from '@/lib/types';

type PastEventsListProps = {
  events: ClosedMarketDaySummary[];
  onEventPress: (marketDayId: number) => void;
};

function saleCountLabel(count: number): string {
  if (count === 1) return '1 sale';
  return `${count} sales`;
}

export function PastEventsList({ events, onEventPress }: PastEventsListProps) {
  if (events.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.sectionHeader}>
        <UiIcon icon={Calendar} size={14} color={colors.inkSoft} />
        <Text style={styles.sectionLabel}>Past Events</Text>
      </View>
      <View style={styles.list}>
        {events.map((event) => (
          <Pressable
            key={event.id}
            accessibilityRole="button"
            onPress={() => onEventPress(event.id)}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
            <View style={styles.rowMain}>
              <Text style={styles.name}>{event.name}</Text>
              <Text style={styles.meta}>
                {formatMarketDayDate(event.startedAt)} · {saleCountLabel(event.saleCount)}
              </Text>
            </View>
            <Text style={styles.chevron}>▸</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    marginTop: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  sectionLabel: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.inkSoft,
  },
  list: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowPressed: {
    opacity: 0.85,
  },
  rowMain: {
    flex: 1,
    paddingRight: 8,
  },
  name: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: colors.ink,
  },
  meta: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    color: colors.inkSoft,
    marginTop: 2,
  },
  chevron: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 16,
    color: colors.purpleDark,
  },
});
