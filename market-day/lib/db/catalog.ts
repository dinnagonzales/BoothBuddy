import type { SQLiteDatabase } from 'expo-sqlite';

import type { Catalog, AdminItem, ItemDraft, MenuItem, SellerItem } from '@/lib/catalog';
import {
  archiveItem,
  canReopenMarketDay,
  canUndoCloseMarketDay,
  closeActiveMarketDay,
  createItem,
  deleteItem as deleteItemFromDb,
  deleteMarketDay as deleteMarketDayFromDb,
  completePreorder,
  createSale,
  exportMarketDay,
  exportRunningTabSales,
  getActiveMarketDay,
  getAllItems,
  getAllTimeSales,
  getAllTimeStats,
  getCheckoutItems,
  getClosedMarketDays,
  getMarketDayById,
  getMarketDaySales,
  getMarketDayStats,
  getMenuForAdmin,
  getHomeItems,
  getRemovedMenuItems,
  getRunningTabItems,
  getPreorderSales,
  getRunningTabExportRows,
  getSaleByNumber,
  getSaleLineItems,
  markAvailable,
  markSoldOut,
  marketDayNeedsReexport,
  addToMenu as addItemToMenu,
  removeFromMenu,
  removeSaleByNumber,
  runningTabNeedsReexport,
  startMarketDay,
  undoCloseMostRecentMarketDay,
  unarchiveItem,
  updateItem,
  updateSalePaymentMethod,
  updateSale,
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
    async deleteItem(id: number) {
      await deleteItemFromDb(db, id);
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
    async startMarketDay(name: string, startedAt?: string) {
      const marketDay = await startMarketDay(db, name, startedAt ?? new Date().toISOString());
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
    async recordSale(params) {
      const sale = await createSale(db, params);
      return { saleNumber: sale.saleNumber };
    },
    async recordQuickSale(params) {
      const sale = await createSale(db, { ...params, marketDayId: null });
      return { saleNumber: sale.saleNumber };
    },
    async getMarketDayStats(marketDayId) {
      return getMarketDayStats(db, marketDayId);
    },
    async listSalesForMarketDay(marketDayId) {
      return getMarketDaySales(db, marketDayId);
    },
    async getAllTimeStats() {
      return getAllTimeStats(db);
    },
    async listAllTimeSales() {
      return getAllTimeSales(db);
    },
    async listPreorderSales() {
      return getPreorderSales(db);
    },
    async getSale(saleNumber) {
      const sale = await getSaleByNumber(db, saleNumber);
      if (!sale) return null;
      const lines = await getSaleLineItems(db, sale.id);
      return {
        saleNumber: sale.saleNumber,
        totalCents: sale.totalCents,
        paymentMethod: sale.paymentMethod,
        name: sale.name,
        notes: sale.notes,
        isPreorder: sale.isPreorder,
        createdAt: sale.createdAt,
        lines,
      };
    },
    async removeSale(saleNumber) {
      await removeSaleByNumber(db, saleNumber);
    },
    async updateSalePaymentMethod(saleNumber, paymentMethod) {
      await updateSalePaymentMethod(db, saleNumber, paymentMethod);
    },
    async updateSale(saleNumber, updates) {
      await updateSale(db, saleNumber, updates);
    },
    async completePreorder(saleNumber, params) {
      await completePreorder(db, saleNumber, params);
    },
    async marketDayNeedsReexport(marketDayId) {
      return marketDayNeedsReexport(db, marketDayId);
    },
    async listClosedMarketDays() {
      return getClosedMarketDays(db);
    },
    async getMarketDayById(id) {
      return getMarketDayById(db, id);
    },
    async canReopenMarketDay(id) {
      return canReopenMarketDay(db, id);
    },
    async deleteMarketDay(id) {
      await deleteMarketDayFromDb(db, id);
    },
    async listRunningTabExportRows(startDate, endDate) {
      return getRunningTabExportRows(db, startDate, endDate);
    },
    async exportRunningTabSales(startDate, endDate) {
      await exportRunningTabSales(db, startDate, endDate);
    },
    async runningTabNeedsReexport() {
      return runningTabNeedsReexport(db);
    },
  };
}
