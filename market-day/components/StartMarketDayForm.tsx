import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors } from '@/constants/theme';
import {
  defaultMarketDayName,
  formatMarketDayDate,
  marketDayStartedAtIso,
  startOfLocalDay,
} from '@/lib/market-day';

type StartMarketDayFormProps = {
  onStart: (params: { name: string; startedAt: string }) => void;
  busy?: boolean;
};

export function StartMarketDayForm({ onStart, busy = false }: StartMarketDayFormProps) {
  const [name, setName] = useState(defaultMarketDayName);
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
      <View style={styles.field}>
        <Text style={styles.label}>Market Day</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Spring Fair 2026"
          placeholderTextColor={colors.inkSoft}
          style={styles.input}
          autoCapitalize="words"
          editable={!busy}
        />
      </View>

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
    gap: 14,
  },
  field: {
    gap: 6,
  },
  label: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.inkSoft,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 14,
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
    backgroundColor: colors.white,
    borderRadius: 14,
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
    marginTop: 4,
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
    color: colors.white,
  },
});
