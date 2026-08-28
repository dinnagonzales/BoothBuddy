import type { SQLiteDatabase } from 'expo-sqlite';

export async function clearShopData(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    DELETE FROM line_items;
    DELETE FROM sales;
    DELETE FROM market_days;
    DELETE FROM items;
  `);
}
