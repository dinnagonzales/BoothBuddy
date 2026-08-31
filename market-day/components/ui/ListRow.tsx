import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { colors } from '@/constants/theme';
import { fonts, touchTargets } from '@/constants/visual';
import { tokens } from '@/theme/tokens';

type ListRowProps = {
  label: string;
  value?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  style?: ViewStyle;
};

/** Tappable settings/list row with brand typography and 44pt minimum height. */
export function ListRow({ label, value, onPress, right, style }: ListRowProps) {
  const content = (
    <>
      <Text style={styles.label}>{label}</Text>
      {value ? <Text style={styles.value}>{value}</Text> : null}
      {right}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.row, pressed && styles.rowPressed, style]}>
        {content}
      </Pressable>
    );
  }

  return <View style={[styles.row, style]}>{content}</View>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: touchTargets.minSize,
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[3],
    backgroundColor: colors.white,
    borderRadius: tokens.radius.md,
  },
  rowPressed: {
    opacity: 0.88,
  },
  label: {
    flex: 1,
    fontFamily: fonts.body.bold,
    fontSize: 15,
    color: colors.ink,
  },
  value: {
    fontFamily: fonts.body.regular,
    fontSize: 14,
    color: colors.inkSoft,
    marginLeft: tokens.spacing[2],
  },
});
