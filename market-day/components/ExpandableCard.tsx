import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '@/constants/theme';

type ExpandableCardProps = {
  header: ReactNode;
  expanded?: boolean;
  onHeaderPress?: () => void;
  accessibilityLabel?: string;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  bodyStyle?: StyleProp<ViewStyle>;
  headerStyle?: StyleProp<ViewStyle>;
  headerDivider?: boolean;
  embedded?: boolean;
};

export function ExpandableCard({
  header,
  expanded = false,
  onHeaderPress,
  accessibilityLabel,
  children,
  style,
  bodyStyle,
  headerStyle,
  headerDivider = false,
  embedded = false,
}: ExpandableCardProps) {
  const headerNode = onHeaderPress ? (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      accessibilityLabel={accessibilityLabel}
      onPress={onHeaderPress}
      style={({ pressed }) => [
        styles.header,
        headerDivider && styles.headerDivider,
        headerStyle,
        pressed && styles.headerPressed,
      ]}>
      {header}
    </Pressable>
  ) : (
    <View style={[styles.header, headerDivider && styles.headerDivider, headerStyle]}>{header}</View>
  );

  return (
    <View style={[styles.card, embedded && styles.cardEmbedded, style]}>
      {headerNode}
      {expanded && children ? (
        <View
          style={[
            styles.body,
            headerDivider && styles.bodyNoDivider,
            embedded && styles.bodyEmbedded,
            bodyStyle,
          ]}>
          {children}
        </View>
      ) : null}
    </View>
  );
}

type OutlineAddButtonProps = {
  label: string;
  onPress: () => void;
  embedded?: boolean;
};

export function OutlineAddButton({ label, onPress, embedded = false }: OutlineAddButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.addButton,
        embedded && styles.addButtonEmbedded,
        pressed && styles.addButtonPressed,
      ]}>
      <Text style={styles.addButtonLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardEmbedded: {
    backgroundColor: colors.white,
  },
  header: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  headerPressed: {
    opacity: 0.85,
  },
  headerDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceMuted,
  },
  body: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  bodyNoDivider: {
    borderTopWidth: 0,
  },
  bodyEmbedded: {
    paddingTop: 0,
  },
  addButton: {
    width: '100%',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.borderFocus,
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 4,
  },
  addButtonEmbedded: {
    backgroundColor: colors.surfaceMuted,
  },
  addButtonPressed: {
    opacity: 0.85,
  },
  addButtonLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 14,
    color: colors.purpleDark,
  },
});
