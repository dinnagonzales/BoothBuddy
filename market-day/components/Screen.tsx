import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';

import { IconTile } from '@/components/ui/IconTile';
import { UI_ICON_STROKE } from '@/components/ui/UiIcon';
import { colors } from '@/constants/theme';
import { fonts, radii, spacing, touchTargets } from '@/constants/visual';
import { checkoutVisualSize, iconTileProps, resolveItemVisual } from '@/lib/item-visual';

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
  /** Optional Lucide (or brand) icon shown before the title. */
  titleIcon?: ReactNode;
  onBack?: () => void;
  right?: ReactNode;
};

export function ScreenHeader({ title, titleIcon, onBack, right }: ScreenHeaderProps) {
  return (
    <View style={styles.header}>
      {onBack ? (
        <Pressable onPress={onBack} style={styles.headerSide} accessibilityLabel="Back">
          <View style={styles.backRow}>
            <ChevronLeft size={20} color={colors.purple} strokeWidth={UI_ICON_STROKE} />
            <Text style={styles.backLabel}>Back</Text>
          </View>
        </Pressable>
      ) : (
        <View style={styles.headerSide} />
      )}
      <View style={styles.headerTitleWrap}>
        {titleIcon}
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
      </View>
      <View style={[styles.headerSide, styles.headerSideEnd]}>{right ?? null}</View>
    </View>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

type ItemCardProps = {
  icon: string;
  photoUri?: string | null;
  name: string;
  priceLabel: string;
  quantity?: number;
  onIncrement?: () => void;
  onDecrement?: () => void;
  onAdd?: () => void;
};

export function ItemCard({
  icon,
  photoUri = null,
  name,
  priceLabel,
  quantity = 0,
  onIncrement,
  onDecrement,
  onAdd,
}: ItemCardProps) {
  const useStepper = onIncrement != null && onDecrement != null;
  const visual = resolveItemVisual({ icon, photoUri });
  const tileSize = visual ? checkoutVisualSize(visual) : 36;

  return (
    <View style={styles.itemCard}>
      <IconTile
        {...iconTileProps({ icon, photoUri })}
        size={tileSize}
        style={styles.itemIconWrap}
      />
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
            <Text style={styles.qtyBoxLabel}>{quantity}</Text>
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
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -4,
  },
  backLabel: {
    fontFamily: fonts.body.bold,
    fontSize: 14,
    color: colors.purple,
  },
  headerTitleWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  headerTitle: {
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
  itemIconWrap: {
    alignSelf: 'center',
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
    paddingHorizontal: 8,
  },
  stepperMinus: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.pinkDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperPlus: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonLabel: {
    fontFamily: fonts.heading.semiBold,
    fontSize: 30,
    color: colors.white,
    lineHeight: 33,
  },
  qtyBox: {
    width: 32,
    height: 32,
    borderRadius: radii.stepBtn,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBoxLabel: {
    fontFamily: fonts.heading.semiBold,
    fontSize: 16,
    color: colors.ink,
  },
});
