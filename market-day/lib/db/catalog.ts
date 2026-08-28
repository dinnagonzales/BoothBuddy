import type { SQLiteDatabase } from 'expo-sqlite';

import type { Catalog, AdminItem, ItemDraft, MenuItem, SellerItem } from '@/lib/catalog';
import {
  archiveItem,
  canUndoCloseMarketDay,
  closeActiveMarketDay,
  createItem,
  exportMarketDay,
  getActiveMarketDay,
  getAllItems,
  getCheckoutItems,
  getMenuForAdmin,
  getHomeItems,
  getRemovedMenuItems,
  getRunningTabItems,
  markAvailable,
  markSoldOut,
  addToMenu as addItemToMenu,
  removeFromMenu,
  startMarketDay,
  undoCloseMostRecentMarketDay,
  unarchiveItem,
  updateItem,
} from '@/lib/db/queries';

export function createSqliteCatalog(db: SQLiteDatabase): Catalog {
  return {
    async createItem(draft: ItemDraft) {
      return createItem(db, draft);
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
      const items = await getHomeItems(db);
      return items.map(({ id, name, emoji, priceCents, soldOut }) => ({
        id,
        name,
        emoji,
        priceCents,
        ...(soldOut ? { soldOut } : {}),
      }));
    },
    async listForCheckout(): Promise<SellerItem[]> {
      const items = await getCheckoutItems(db);
      return items.map(({ id, name, emoji, priceCents }) => ({
        id,
        name,
        emoji,
        priceCents,
      }));
    },
    async listForRunningTab(): Promise<SellerItem[]> {
      const items = await getRunningTabItems(db);
      return items.map(({ id, name, emoji, priceCents }) => ({
        id,
        name,
        emoji,
        priceCents,
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
    async hasActiveItems(): Promise<boolean> {
      const items = await getAllItems(db);
      return items.some((item) => !item.archived);
    },
    async listMenuForAdmin(): Promise<MenuItem[]> {
      return getMenuForAdmin(db);
    },
    async listRemovedFromMenu() {
      return getRemovedMenuItems(db);
    },
    async removeFromMenu(itemId: number) {
      await removeFromMenu(db, itemId);
    },
    async addToMenu(itemId: number) {
      await addItemToMenu(db, itemId);
    },
    async markSoldOut(itemId: number) {
      await markSoldOut(db, itemId);
    },
    async markAvailable(itemId: number) {
      await markAvailable(db, itemId);
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
