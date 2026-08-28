import { useCallback, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { SQLiteDatabase } from 'expo-sqlite';

import { Card, Button } from '@/components/ui';
import type { MenuItem } from '@/lib/catalog';
import { createSqliteCatalog } from '@/lib/db/catalog';
import { formatMoney } from '@/lib/money';

type TodaysMenuProps = {
  db: SQLiteDatabase;
};

export function TodaysMenu({ db }: TodaysMenuProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const refreshMenu = useCallback(async () => {
    const catalog = createSqliteCatalog(db);
    setMenuItems(await catalog.listMenuForAdmin());
  }, [db]);

  useEffect(() => {
    void refreshMenu();
  }, [refreshMenu]);

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

  const removeItem = (itemId: number) => {
    void (async () => {
      const catalog = createSqliteCatalog(db);
      await catalog.removeFromMenu(itemId);
      await refreshMenu();
    })();
  };

  if (menuItems.length === 0) {
    return (
      <Card className="p-4">
        <Text className="text-muted font-semibold">No Items on today&apos;s Menu yet.</Text>
      </Card>
    );
  }

  return (
    <View className="gap-2">
      {menuItems.map((item) => (
        <Card key={item.id} className="p-3 gap-2">
          <View className="flex-row items-center gap-2">
            <Text className="text-2xl">{item.emoji}</Text>
            <View className="flex-1">
              <Text className="font-bold text-[15px]">{item.name}</Text>
              <Text className="text-muted text-[13px]">{formatMoney(item.priceCents)}</Text>
            </View>
            {item.soldOut ? (
              <Text className="text-[11px] font-extrabold uppercase text-muted">Sold out</Text>
            ) : null}
          </View>
          <View className="flex-row gap-2">
            <Button
              size="sm"
              variant={item.soldOut ? 'secondary' : 'primary'}
              className="flex-1"
              onPress={() => toggleSoldOut(item)}>
              <Button.Label className="font-bold">
                {item.soldOut ? 'Mark available' : 'Mark sold out'}
              </Button.Label>
            </Button>
            <Button size="sm" variant="secondary" className="flex-1" onPress={() => removeItem(item.id)}>
              <Button.Label className="font-bold">Remove</Button.Label>
            </Button>
          </View>
        </Card>
      ))}
    </View>
  );
}
