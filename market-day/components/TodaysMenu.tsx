import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import type { SQLiteDatabase } from 'expo-sqlite';

import { colors } from '@/constants/theme';
import type { MenuItem, RemovedMenuItem } from '@/lib/catalog';
import { createSqliteCatalog } from '@/lib/db/catalog';
import { formatMoney } from '@/lib/money';

type TodaysMenuProps = {
  db: SQLiteDatabase;
};

export function TodaysMenu({ db }: TodaysMenuProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [removedItems, setRemovedItems] = useState<RemovedMenuItem[]>([]);

  const refreshMenu = useCallback(async () => {
    const catalog = createSqliteCatalog(db);
    const [onMenu, removed] = await Promise.all([
      catalog.listMenuForAdmin(),
      catalog.listRemovedFromMenu(),
    ]);
    setMenuItems(onMenu);
    setRemovedItems(removed);
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      void refreshMenu();
    }, [refreshMenu]),
  );

  const toggleSoldOut = (item: MenuItem) => {
    void (async () => {
      const catalog = createSqliteCatalog(db);
      if (item.soldOut) {
        await catalog.markAvailable(item.id);
      } else {
        await catalog.markSoldOut(item.id);
      }
      await refreshMenu();
    })();
  };

  const confirmSoldOut = (item: MenuItem) => {
    if (item.soldOut) {
      toggleSoldOut(item);
      return;
    }
    Alert.alert(
      'Mark sold out?',
      `${item.emoji} ${item.name} will stay on Home but can't be added to checkout.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Mark sold out', onPress: () => toggleSoldOut(item) },
      ],
    );
  };

  const removeItem = (item: MenuItem) => {
    void (async () => {
      const catalog = createSqliteCatalog(db);
      await catalog.removeFromMenu(item.id);
      await refreshMenu();
    })();
  };

  const confirmRemove = (item: MenuItem) => {
    Alert.alert(
      'Remove from menu?',
      `${item.emoji} ${item.name} will be hidden from Home and checkout for today.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeItem(item) },
      ],
    );
  };

  const addItem = (itemId: number) => {
    void (async () => {
      const catalog = createSqliteCatalog(db);
      await catalog.addToMenu(itemId);
      await refreshMenu();
    })();
  };

  const openAddPicker = () => {
    if (removedItems.length === 0) {
      Alert.alert(
        'Nothing to add',
        'Every catalog item is already on today\u2019s menu.',
      );
      return;
    }

    Alert.alert(
      'Add to today\u2019s menu',
      'Pick an item from inventory:',
      [
        ...removedItems.map((item) => ({
          text: `${item.emoji} ${item.name}`,
          onPress: () => addItem(item.id),
        })),
        { text: 'Cancel', style: 'cancel' as const },
      ],
    );
  };

  return (
    <View style={styles.wrap}>
      {menuItems.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No items on today&apos;s menu yet.</Text>
        </View>
      ) : (
        menuItems.map((item) => (
          <View key={item.id} style={[styles.itemRow, item.soldOut && styles.itemRowSoldOut]}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <View style={styles.meta}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.price}>{formatMoney(item.priceCents)}</Text>
            </View>
            <View style={styles.toggleWrap}>
              <SoldOutToggle
                soldOut={item.soldOut}
                onToggle={() => confirmSoldOut(item)}
              />
              <Text style={styles.toggleLabel}>Sold out</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Remove ${item.name} from menu`}
              onPress={() => confirmRemove(item)}
              style={({ pressed }) => [styles.trash, pressed && styles.trashPressed]}>
              <Text style={styles.trashIcon}>🗑</Text>
            </Pressable>
          </View>
        ))
      )}

      <Pressable
        accessibilityRole="button"
        onPress={openAddPicker}
        style={({ pressed }) => [styles.addMenuButton, pressed && styles.addMenuButtonPressed]}>
        <Text style={styles.addMenuLabel}>➕ Add item to today&apos;s menu</Text>
      </Pressable>
    </View>
  );
}

function SoldOutToggle({ soldOut, onToggle }: { soldOut: boolean; onToggle: () => void }) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: soldOut }}
      onPress={onToggle}
      style={[styles.toggle, soldOut && styles.toggleOn]}>
      <View style={[styles.knob, soldOut && styles.knobOn]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
    marginBottom: 8,
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
  },
  emptyText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: colors.inkSoft,
    textAlign: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  itemRowSoldOut: {
    opacity: 0.55,
  },
  emoji: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
  },
  meta: {
    flex: 1,
  },
  name: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    color: colors.ink,
  },
  price: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    color: colors.inkSoft,
    marginTop: 1,
  },
  toggleWrap: {
    alignItems: 'center',
  },
  toggle: {
    width: 40,
    height: 22,
    borderRadius: 12,
    backgroundColor: '#E4DDF5',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleOn: {
    backgroundColor: colors.red,
  },
  knob: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 1,
  },
  knobOn: {
    alignSelf: 'flex-end',
  },
  toggleLabel: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 9,
    color: colors.inkSoft,
    marginTop: 2,
    textAlign: 'center',
  },
  trash: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.redLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trashPressed: {
    opacity: 0.8,
  },
  trashIcon: {
    fontSize: 12,
  },
  addMenuButton: {
    width: '100%',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#C9B8F0',
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 4,
  },
  addMenuButtonPressed: {
    opacity: 0.85,
  },
  addMenuLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 14,
    color: colors.purpleDark,
  },
});
