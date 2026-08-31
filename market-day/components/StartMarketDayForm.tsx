import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors } from '@/constants/theme';
import {
  formatMarketDayDate,
  marketDayStartedAtIso,
  startOfLocalDay,
} from '@/lib/market-day';

type StartMarketDayFormProps = {
  onStart: (params: { name: string; startedAt: string }) => void;
  busy?: boolean;
};

export function StartMarketDayForm({ onStart, busy = false }: StartMarketDayFormProps) {
  const [name, setName] = useState('');
  const [date, setDate] = useState(() => startOfLocalDay());
  const [showPicker, setShowPicker] = useState(false);

  const canStart = name.trim().length > 0 && !busy;

  const handleDateChange = (_event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (selected) {
      setDate(startOfLocalDay(selected));
    }
  };

  const handleStart = () => {
    if (!canStart) return;
    onStart({
      name: name.trim(),
      startedAt: marketDayStartedAtIso(date),
    });
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Start Market Day</Text>
        <Text style={styles.cardIntro}>Name today&apos;s shop, then pick the date.</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Market Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholderTextColor={colors.inkSoft}
            style={styles.input}
            autoCapitalize="words"
            editable={!busy}
          />
          <Text style={styles.hint}>Shows in Events and exports</Text>
        </View>

        <View style={styles.fieldDivider} />

        <View style={styles.field}>
          <Text style={styles.label}>Date</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Market Day date, ${formatMarketDayDate(marketDayStartedAtIso(date))}`}
            disabled={busy}
            onPress={() => setShowPicker(true)}
            style={({ pressed }) => [styles.dateButton, pressed && !busy && styles.dateButtonPressed]}>
            <Text style={styles.dateValue}>{formatMarketDayDate(marketDayStartedAtIso(date))}</Text>
            <Text style={styles.dateChevron}>▾</Text>
          </Pressable>
          <Text style={styles.hint}>The date for this shop day</Text>
        </View>
      </View>

      {showPicker ? (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
      ) : null}

      {Platform.OS === 'ios' && showPicker ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => setShowPicker(false)}
          style={styles.donePicker}>
          <Text style={styles.donePickerLabel}>Done</Text>
        </Pressable>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !canStart }}
        disabled={!canStart}
        onPress={handleStart}
        style={({ pressed }) => [
          styles.startButtonOuter,
          !canStart && styles.startButtonDisabled,
          pressed && canStart && styles.startButtonOuterPressed,
        ]}>
        <View style={styles.startButtonInner}>
          <Text style={styles.startButtonLabel}>
            {busy ? 'Starting…' : '▶️ Start Market Day'}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    gap: 16,
  },
  card: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 20,
    gap: 16,
  },
  cardTitle: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 18,
    color: colors.ink,
    textAlign: 'center',
  },
  cardIntro: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: colors.inkSoft,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: -8,
  },
  field: {
    gap: 6,
  },
  fieldDivider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
  },
  label: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.inkSoft,
  },
  hint: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: colors.inkSoft,
    lineHeight: 16,
  },
  input: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: colors.ink,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceMuted,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dateButtonPressed: {
    opacity: 0.88,
  },
  dateValue: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: colors.ink,
  },
  dateChevron: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: colors.purpleDark,
  },
  donePicker: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  donePickerLabel: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    color: colors.purpleDark,
  },
  startButtonOuter: {
    width: '100%',
    borderRadius: 18,
    backgroundColor: colors.purpleDark,
    paddingBottom: 4,
  },
  startButtonDisabled: {
    opacity: 0.45,
  },
  startButtonOuterPressed: {
    paddingBottom: 1,
    marginTop: 3,
  },
  startButtonInner: {
    backgroundColor: colors.purple,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startButtonLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 16,
    color: colors.ink,
  },
});
