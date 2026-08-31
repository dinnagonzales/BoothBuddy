import type { SQLiteDatabase } from 'expo-sqlite';

import { clearAdminProfile } from '@/lib/db/admin-profile';

export async function clearShopData(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    DELETE FROM line_items;
    DELETE FROM sales;
    DELETE FROM menu_items;
    DELETE FROM market_days;
    DELETE FROM items;
  `);
  await clearAdminProfile(db);
}
