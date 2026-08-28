import type { SQLiteDatabase } from 'expo-sqlite';

import type { Catalog, ItemDraft, SellerItem } from '@/lib/catalog';
import { getActiveMarketDay } from '@/lib/db/queries';

export function createSqliteCatalog(db: SQLiteDatabase): Catalog {
  return {
    createItem(draft: ItemDraft) {
      const result = db.runSync(
        'INSERT INTO items (name, emoji, cost_cents, price_cents) VALUES (?, ?, ?, ?)',
        draft.name,
        draft.emoji,
        draft.costCents,
        draft.priceCents,
      );
      return { id: Number(result.lastInsertRowId) };
    },
    retire(id: number) {
      db.runSync('UPDATE items SET retired = 1 WHERE id = ?', id);
    },
    listForSeller(): SellerItem[] {
      return db
        .getAllSync<{ id: number; name: string; emoji: string; price_cents: number }>(
          'SELECT id, name, emoji, price_cents FROM items WHERE retired = 0 ORDER BY name COLLATE NOCASE',
        )
        .map((row) => ({
          id: row.id,
          name: row.name,
          emoji: row.emoji,
          priceCents: row.price_cents,
        }));
    },
    getActiveMarketDay() {
      return getActiveMarketDay(db);
    },
  };
}
