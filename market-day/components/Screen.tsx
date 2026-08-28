import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/constants/theme';

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
      <Text style={styles.headerTitle}>{title}</Text>
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
  onAdd?: () => void;
};

export function ItemCard({ emoji, name, priceLabel, onAdd }: ItemCardProps) {
  return (
    <View style={styles.itemCard}>
      <Text style={styles.itemEmoji}>{emoji}</Text>
      <Text style={styles.itemName}>{name}</Text>
      <Text style={styles.itemPrice}>{priceLabel}</Text>
      {onAdd ? (
        <Pressable accessibilityRole="button" onPress={onAdd} style={styles.addButton}>
          <Text style={styles.addButtonLabel}>+</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenBody: {
    flex: 1,
    paddingHorizontal: 16,
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
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: colors.purple,
  },
  headerTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: colors.ink,
  },
  sectionLabel: {
    fontFamily: 'Nunito_800ExtraBold',
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
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  itemEmoji: {
    width: 28,
    fontSize: 22,
    textAlign: 'center',
  },
  itemName: {
    flex: 1,
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: colors.ink,
  },
  itemPrice: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 14,
    color: colors.purpleDark,
    marginRight: 4,
  },
  addButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 18,
    color: colors.white,
    lineHeight: 20,
  },
});
