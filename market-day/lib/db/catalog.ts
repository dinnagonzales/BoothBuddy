import type { SQLiteDatabase } from 'expo-sqlite';

import type { Catalog, AdminItem, ItemDraft, SellerItem } from '@/lib/catalog';
import {
  canUndoCloseMarketDay,
  closeActiveMarketDay,
  exportMarketDay,
  getActiveMarketDay,
  getAllItems,
  startMarketDay,
  undoCloseMostRecentMarketDay,
  archiveItem,
  unarchiveItem,
  updateItem,
} from '@/lib/db/queries';

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
    async archive(id: number) {
      await archiveItem(db, id);
    },
    async unarchive(id: number) {
      await unarchiveItem(db, id);
    },
    async updateItem(id: number, draft: ItemDraft) {
      await updateItem(db, id, draft);
    },
    async listForSeller(): Promise<SellerItem[]> {
      const rows = await db.getAllAsync<{
        id: number;
        name: string;
        emoji: string;
        price_cents: number;
      }>(
        'SELECT id, name, emoji, price_cents FROM items WHERE archived = 0 ORDER BY name COLLATE NOCASE',
      );
      return rows.map((row) => ({
        id: row.id,
        name: row.name,
        emoji: row.emoji,
        priceCents: row.price_cents,
      }));
    },
    async listForAdmin(): Promise<AdminItem[]> {
      const items = await getAllItems(db);
      return items.map((item) => ({
        id: item.id,
        name: item.name,
        emoji: item.emoji,
        costCents: item.costCents,
        priceCents: item.priceCents,
        archived: item.archived,
      }));
    },
    async getActiveMarketDay() {
      const marketDay = await getActiveMarketDay(db);
      return marketDay ? { id: marketDay.id, name: marketDay.name } : null;
    },
    async startMarketDay(name: string) {
      const marketDay = await startMarketDay(db, name);
      return { id: marketDay.id, name: marketDay.name };
    },
    async closeActiveMarketDay() {
      await closeActiveMarketDay(db);
    },
    async undoCloseMostRecentMarketDay() {
      await undoCloseMostRecentMarketDay(db);
    },
    async canUndoClose() {
      return canUndoCloseMarketDay(db);
    },
    async exportMarketDay(id: number) {
      await exportMarketDay(db, id);
    },
  };
}
