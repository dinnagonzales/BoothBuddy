import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/constants/theme';
import { fonts, radii, spacing, touchTargets } from '@/constants/visual';

type ScreenProps = ViewProps & {
  children: ReactNode;
  className?: string;
};

export function Screen({ children, className, ...props }: ScreenProps) {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.screenBody} {...props}>
        {children}
      </View>
    </SafeAreaView>
  );
}

type ScreenHeaderProps = {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
};

export function ScreenHeader({ title, onBack, right }: ScreenHeaderProps) {
  return (
    <View style={styles.header}>
      {onBack ? (
        <Pressable onPress={onBack} style={styles.headerSide}>
          <Text style={styles.backLabel}>← Back</Text>
        </Pressable>
      ) : (
        <View style={styles.headerSide} />
      )}
      <Text style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>
      <View style={[styles.headerSide, styles.headerSideEnd]}>{right ?? null}</View>
    </View>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

type ItemCardProps = {
  emoji: string;
  name: string;
  priceLabel: string;
  quantity?: number;
  onIncrement?: () => void;
  onDecrement?: () => void;
  onAdd?: () => void;
};

export function ItemCard({
  emoji,
  name,
  priceLabel,
  quantity = 0,
  onIncrement,
  onDecrement,
  onAdd,
}: ItemCardProps) {
  const useStepper = onIncrement != null && onDecrement != null;

  return (
    <View style={styles.itemCard}>
      <Text style={styles.itemEmoji}>{emoji}</Text>
      <Text style={styles.itemName}>{name}</Text>
      <Text style={styles.itemPrice}>{priceLabel}</Text>
      {useStepper ? (
        <View style={styles.stepper}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Remove one ${name}`}
            onPress={onDecrement}
            style={styles.stepperMinus}>
            <Text style={styles.stepperButtonLabel}>−</Text>
          </Pressable>
          <View style={styles.qtyBox}>
            {quantity > 0 ? <Text style={styles.qtyBoxLabel}>{quantity}</Text> : null}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Add one ${name}`}
            onPress={onIncrement}
            style={styles.stepperPlus}>
            <Text style={styles.stepperButtonLabel}>+</Text>
          </Pressable>
        </View>
      ) : onAdd ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Add ${name}`}
          onPress={onAdd}
          style={({ pressed }) => [
            styles.addButtonOuter,
            pressed ? styles.addButtonOuterPressed : null,
          ]}>
          <View style={styles.addButtonInner}>
            <Text style={styles.addButtonLabel}>+</Text>
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.screen,
  },
  screenBody: {
    flex: 1,
    paddingHorizontal: spacing.screen,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginBottom: 8,
  },
  headerSide: {
    minWidth: 60,
  },
  headerSideEnd: {
    alignItems: 'flex-end',
  },
  backLabel: {
    fontFamily: fonts.body.bold,
    fontSize: 14,
    color: colors.purple,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.body.bold,
    fontSize: 15,
    color: colors.ink,
  },
  sectionLabel: {
    fontFamily: fonts.body.extraBold,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.inkSoft,
    marginBottom: 8,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: radii.itemRow,
    paddingHorizontal: spacing.itemRowPaddingH,
    paddingVertical: spacing.itemRowPaddingV,
  },
  itemEmoji: {
    width: 32,
    fontSize: 24,
    textAlign: 'center',
  },
  itemName: {
    flex: 1,
    fontFamily: fonts.body.extraBold,
    fontSize: 16,
    color: colors.ink,
  },
  itemPrice: {
    fontFamily: fonts.heading.semiBold,
    fontSize: 16,
    color: colors.purpleDark,
    marginRight: 4,
  },
  addButtonOuter: {
    borderRadius: touchTargets.addButton / 2,
    backgroundColor: colors.purpleDark,
    paddingBottom: 4,
  },
  addButtonOuterPressed: {
    paddingBottom: 1,
    marginTop: 3,
  },
  addButtonInner: {
    width: touchTargets.addButton,
    height: touchTargets.addButton,
    borderRadius: touchTargets.addButton / 2,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonLabel: {
    fontFamily: fonts.heading.semiBold,
    fontSize: 22,
    color: colors.white,
    lineHeight: 24,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stepperMinus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.pinkDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperPlus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonLabel: {
    fontFamily: fonts.heading.semiBold,
    fontSize: 20,
    color: colors.white,
    lineHeight: 22,
  },
  qtyBox: {
    width: 32,
    height: 32,
    borderRadius: radii.stepBtn,
    backgroundColor: '#FAF8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBoxLabel: {
    fontFamily: fonts.heading.semiBold,
    fontSize: 16,
    color: colors.ink,
  },
});
