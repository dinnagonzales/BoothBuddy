import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { createElement, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '@/constants/theme';
import {
  formatCompleteDate,
  localDayFromExportDate,
  startOfLocalDay,
  toExportDate,
} from '@/lib/market-day';

type DatePickerFieldProps = {
  value: Date;
  onChange: (next: Date) => void;
  accessibilityLabel: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Date field that works on iOS/Android (native picker) and web (`input type="date"`). */
export function DatePickerField({
  value,
  onChange,
  accessibilityLabel,
  disabled = false,
  style,
}: DatePickerFieldProps) {
  const [showPicker, setShowPicker] = useState(false);
  const label = formatCompleteDate(toExportDate(value));

  const emitChange = (next: Date) => {
    onChange(startOfLocalDay(next));
  };

  const handleNativeChange = (_event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (selected) {
      emitChange(selected);
    }
  };

  if (Platform.OS === 'web') {
    return createElement('input', {
      type: 'date',
      value: toExportDate(value),
      disabled,
      'aria-label': accessibilityLabel,
      onChange: (event: { target: { value: string } }) => {
        if (event.target.value) {
          emitChange(localDayFromExportDate(event.target.value));
        }
      },
      style: {
        width: '100%',
        boxSizing: 'border-box',
        backgroundColor: colors.surfaceMuted,
        borderRadius: 14,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: colors.borderSubtle,
        paddingLeft: 14,
        paddingRight: 14,
        paddingTop: 12,
        paddingBottom: 12,
        fontFamily: 'Nunito_700Bold',
        fontSize: 15,
        color: colors.ink,
        outlineStyle: 'none',
      },
    });
  }

  return (
    <View style={style}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        disabled={disabled}
        onPress={() => setShowPicker(true)}
        style={({ pressed }) => [
          styles.dateButton,
          pressed && !disabled && styles.dateButtonPressed,
        ]}>
        <Text style={styles.dateValue}>{label}</Text>
        <Text style={styles.dateChevron}>▾</Text>
      </Pressable>

      {showPicker ? (
        <DateTimePicker
          value={value}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleNativeChange}
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
    </View>
  );
}

const styles = StyleSheet.create({
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
    marginTop: 4,
  },
  donePickerLabel: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    color: colors.purpleDark,
  },
});
