import type { SQLiteDatabase } from 'expo-sqlite';

import type { Catalog, ItemDraft, SellerItem } from '@/lib/catalog';
import { getActiveMarketDay } from '@/lib/db/queries';

export function createSqliteCatalog(db: SQLiteDatabase): Catalog {
  return {
    async createItem(draft: ItemDraft) {
      const result = await db.runAsync(
        'INSERT INTO items (name, emoji, cost_cents, price_cents) VALUES (?, ?, ?, ?)',
        draft.name,
        draft.emoji,
        draft.costCents,
        draft.priceCents,
      );
      return { id: Number(result.lastInsertRowId) };
    },
    async retire(id: number) {
      await db.runAsync('UPDATE items SET retired = 1 WHERE id = ?', id);
    },
    async listForSeller(): Promise<SellerItem[]> {
      const rows = await db.getAllAsync<{
        id: number;
        name: string;
        emoji: string;
        price_cents: number;
      }>(
        'SELECT id, name, emoji, price_cents FROM items WHERE retired = 0 ORDER BY name COLLATE NOCASE',
      );
      return rows.map((row) => ({
        id: row.id,
        name: row.name,
        emoji: row.emoji,
        priceCents: row.price_cents,
      }));
    },
    async getActiveMarketDay() {
      const marketDay = await getActiveMarketDay(db);
      return marketDay ? { id: marketDay.id, name: marketDay.name } : null;
    },
  };
}
