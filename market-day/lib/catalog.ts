import {
  ActiveMarketDayExistsError,
  CannotDeleteActiveMarketDayError,
  ItemHasSalesError,
  NothingToUndoCloseError,
} from '@/lib/market-day';

export type ItemDraft = {
  name: string;
  icon: string;
  costCents: number;
  priceCents: number;
  photoUri?: string | null;
};

export type SellerItem = {
  id: number;
  name: string;
  icon: string;
  photoUri: string | null;
  priceCents: number;
  soldOut?: boolean;
};

export type MenuItem = {
  id: number;
  name: string;
  icon: string;
  priceCents: number;
  soldOut: boolean;
};

export type RemovedMenuItem = {
  id: number;
  name: string;
  icon: string;
  priceCents: number;
};

export type AdminItem = {
  id: number;
  name: string;
  icon: string;
  photoUri: string | null;
  costCents: number;
  priceCents: number;
  archived: boolean;
};

export type MarketDayStats = {
  totalCents: number;
  itemCount: number;
  profitCents: number;
  cashCents: number;
  venmoCents: number;
  tipsCents: number;
  cashTipsCents: number;
  venmoTipsCents: number;
};

export type SaleDetail = {
  saleNumber: number;
  totalCents: number;
  paymentMethod: PaymentMethod;
  name: string | null;
  notes: string | null;
  completeDate: string | null;
  isPreorder: boolean;
  createdAt: string;
  lines: CartLine[];
};

export type Catalog = {
  createItem(draft: ItemDraft): Promise<{ id: number }>;
  updateItem(id: number, draft: ItemDraft): Promise<void>;
  archive(id: number): Promise<void>;
  unarchive(id: number): Promise<void>;
  deleteItem(id: number): Promise<void>;
  listForSeller(): Promise<SellerItem[]>;
  listForCheckout(): Promise<SellerItem[]>;
  listForRunningTab(): Promise<SellerItem[]>;
  listForAdmin(): Promise<AdminItem[]>;
  hasActiveItems(): Promise<boolean>;
  listMenuForAdmin(): Promise<MenuItem[]>;
  listRemovedFromMenu(): Promise<RemovedMenuItem[]>;
  removeFromMenu(itemId: number): Promise<void>;
  addToMenu(itemId: number): Promise<void>;
  markSoldOut(itemId: number): Promise<void>;
  markAvailable(itemId: number): Promise<void>;
  getActiveMarketDay(): Promise<{ id: number; name: string } | null>;
  startMarketDay(name: string, startedAt?: string): Promise<{ id: number; name: string }>;
  closeActiveMarketDay(): Promise<void>;
  undoCloseMostRecentMarketDay(): Promise<void>;
  canUndoClose(): Promise<boolean>;
  exportMarketDay(id: number): Promise<void>;
  recordSale(params: {
    marketDayId: number;
    lines: CartLine[];
    paymentMethod: PaymentMethod;
    cashReceivedCents: number | null;
    changeKept?: boolean;
    name?: string | null;
    notes?: string | null;
    saleNumber?: number;
  }): Promise<{ saleNumber: number }>;
  recordQuickSale(params: {
    lines: CartLine[];
    paymentMethod: PaymentMethod;
    cashReceivedCents: number | null;
    changeKept?: boolean;
    name?: string | null;
    notes?: string | null;
    completeDate?: string | null;
    isPreorder?: boolean;
    saleNumber?: number;
  }): Promise<{ saleNumber: number }>;
  getMarketDayStats(marketDayId: number): Promise<MarketDayStats>;
  listSalesForMarketDay(marketDayId: number): Promise<SaleSummary[]>;
  getAllTimeStats(): Promise<MarketDayStats>;
  listAllTimeSales(): Promise<AllTimeSaleSummary[]>;
  listPreorderSales(): Promise<SaleSummary[]>;
  getSale(saleNumber: number): Promise<SaleDetail | null>;
  removeSale(saleNumber: number): Promise<void>;
  updateSalePaymentMethod(saleNumber: number, paymentMethod: PaymentMethod): Promise<void>;
  updateSale(
    saleNumber: number,
    updates: {
      paymentMethod?: PaymentMethod;
      cashReceivedCents?: number | null;
      changeKept?: boolean;
      name?: string | null;
      notes?: string | null;
      completeDate?: string | null;
    },
  ): Promise<void>;
  replaceSale(
    saleNumber: number,
    params: {
      lines: CartLine[];
      paymentMethod: PaymentMethod;
      cashReceivedCents: number | null;
      changeKept?: boolean;
      name?: string | null;
      notes?: string | null;
      completeDate?: string | null;
    },
  ): Promise<{ saleNumber: number }>;
  completePreorder(
    saleNumber: number,
    params: {
      paymentMethod: PaymentMethod;
      cashReceivedCents?: number | null;
      changeKept?: boolean;
      name?: string | null;
      notes?: string | null;
      completeDate?: string | null;
    },
  ): Promise<void>;
  marketDayNeedsReexport(marketDayId: number): Promise<boolean>;
  listClosedMarketDays(): Promise<ClosedMarketDaySummary[]>;
  getMarketDayById(id: number): Promise<MarketDay | null>;
  canReopenMarketDay(id: number): Promise<boolean>;
  deleteMarketDay(id: number): Promise<void>;
  listSalesExportRows(startDate: string, endDate: string): Promise<SalesExportRow[]>;
};

export type SalesExportRow = {
  saleNumber: number;
  createdAt: string;
  marketDayName: string;
  itemName: string;
  quantity: number;
  priceCents: number;
  costCents: number;
  saleTotalCents: number;
  paymentMethod: PaymentMethod;
  cashReceivedCents: number | null;
  changeKeptCents: number;
  customerName: string | null;
};

type StoredItem = ItemDraft & { id: number; archived: boolean; photoUri: string | null };

type StoredMarketDay = {
  id: number;
  name: string;
  startedAt: string;
  closedAt: string | null;
  exportedAt: string | null;
  needsReexport: boolean;
};

type StoredMenuEntry = {
  marketDayId: number;
  itemId: number;
  soldOut: boolean;
  removed: boolean;
};

type StoredSale = {
  saleNumber: number;
  marketDayId: number | null;
  lines: CartLine[];
  paymentMethod: PaymentMethod;
  cashReceivedCents: number | null;
  changeKept: boolean;
  name: string | null;
  notes: string | null;
  completeDate: string | null;
  isPreorder: boolean;
  createdAt: string;
  exportedAt: string | null;
};

function normalizeOptionalText(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function cartTotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.priceCents * line.quantity, 0);
}

function cartProfit(lines: CartLine[]): number {
  return lines.reduce(
    (sum, line) => sum + (line.priceCents - line.costCents) * line.quantity,
    0,
  );
}

export function createCatalog(): Catalog {
  const items: StoredItem[] = [];
  const marketDays: StoredMarketDay[] = [];
  const menuEntries: StoredMenuEntry[] = [];
  const sales: StoredSale[] = [];
  let nextItemId = 1;
  let nextMarketDayId = 1;
  let nextSaleNumber = 1;

  function getActiveMarketDayRecord() {
    return marketDays.find((day) => day.closedAt === null) ?? null;
  }

  function populateMenu(marketDayId: number) {
    for (const item of items) {
      if (item.archived) continue;
      menuEntries.push({
        marketDayId,
        itemId: item.id,
        soldOut: false,
        removed: false,
      });
    }
  }

  function getMenuEntry(marketDayId: number, itemId: number) {
    return menuEntries.find(
      (entry) => entry.marketDayId === marketDayId && entry.itemId === itemId,
    );
  }

  function listMenuItemsForMarketDay(marketDayId: number): MenuItem[] {
    return menuEntries
      .filter((entry) => entry.marketDayId === marketDayId && !entry.removed)
      .map((entry) => {
        const item = items.find((candidate) => candidate.id === entry.itemId);
        if (!item) {
          throw new Error(`Menu Item ${entry.itemId} not found`);
        }
        return {
          id: item.id,
          name: item.name,
          icon: item.icon,
          priceCents: item.priceCents,
          soldOut: entry.soldOut,
        };
      });
  }

  function recordSaleEntry(
    marketDayId: number | null,
    params: {
      lines: CartLine[];
      paymentMethod: PaymentMethod;
      cashReceivedCents: number | null;
      changeKept?: boolean;
      name?: string | null;
      notes?: string | null;
      completeDate?: string | null;
      isPreorder?: boolean;
      saleNumber?: number;
    },
  ) {
    const saleNumber =
      params.saleNumber != null && params.saleNumber > 0
        ? params.saleNumber
        : nextSaleNumber++;
    if (params.saleNumber != null && params.saleNumber > 0) {
      nextSaleNumber = Math.max(nextSaleNumber, params.saleNumber + 1);
    }
    const name = normalizeOptionalText(params.name);
    const notes = normalizeOptionalText(params.notes);
    const completeDate = normalizeOptionalText(params.completeDate);
    if (params.isPreorder === true && (!name || !notes || !completeDate)) {
      throw new Error('Preorder requires name, notes, and complete date');
    }
    const totalCents = cartTotal(params.lines);
    const changeKept =
      params.changeKept === true && (params.cashReceivedCents ?? 0) > totalCents;
    sales.push({
      saleNumber,
      marketDayId,
      lines: params.lines,
      paymentMethod: params.paymentMethod,
      cashReceivedCents: params.cashReceivedCents,
      changeKept,
      name,
      notes,
      completeDate,
      isPreorder: params.isPreorder === true,
      createdAt: new Date().toISOString(),
      exportedAt: null,
    });
    return Promise.resolve({ saleNumber });
  }

  function completedSales() {
    return sales.filter((sale) => !sale.isPreorder);
  }

  function isDateInRange(iso: string, startDate: string, endDate: string): boolean {
    const day = iso.slice(0, 10);
    return day >= startDate && day <= endDate;
  }

  function salesInRange(startDate: string, endDate: string) {
    return sales.filter(
      (sale) => !sale.isPreorder && isDateInRange(sale.createdAt, startDate, endDate),
    );
  }

  function toSalesExportRows(saleList: StoredSale[]): SalesExportRow[] {
    const rows: SalesExportRow[] = [];
    for (const sale of saleList) {
      const marketDayName =
        sale.marketDayId == null
          ? ''
          : (marketDays.find((day) => day.id === sale.marketDayId)?.name ?? '');
      const saleTotalCents = cartTotal(sale.lines);
      for (const line of sale.lines) {
        rows.push({
          saleNumber: sale.saleNumber,
          createdAt: sale.createdAt,
          marketDayName,
          itemName: line.name,
          quantity: line.quantity,
          priceCents: line.priceCents,
          costCents: line.costCents,
          saleTotalCents,
          paymentMethod: sale.paymentMethod,
          cashReceivedCents: sale.cashReceivedCents,
          changeKeptCents:
            sale.changeKept && sale.cashReceivedCents != null
              ? Math.max(sale.cashReceivedCents - saleTotalCents, 0)
              : 0,
          customerName: sale.name,
        });
      }
    }
    return rows.sort((a, b) => a.saleNumber - b.saleNumber);
  }

  return {
    async createItem(draft: ItemDraft) {
      const item = {
        id: nextItemId++,
        archived: false,
        photoUri: draft.photoUri ?? null,
        ...draft,
      };
      items.push(item);
      const active = getActiveMarketDayRecord();
      if (active) {
        menuEntries.push({
          marketDayId: active.id,
          itemId: item.id,
          soldOut: false,
          removed: false,
        });
      }
      return item;
    },
    async archive(id: number) {
      const item = items.find((entry) => entry.id === id);
      if (!item) return;
      item.archived = true;
      const active = getActiveMarketDayRecord();
      if (active) {
        const entry = getMenuEntry(active.id, id);
        if (entry) entry.removed = true;
      }
    },
    async unarchive(id: number) {
      const item = items.find((entry) => entry.id === id);
      if (!item) return;
      item.archived = false;
      const active = getActiveMarketDayRecord();
      if (active && !getMenuEntry(active.id, id)) {
        menuEntries.push({
          marketDayId: active.id,
          itemId: id,
          soldOut: false,
          removed: false,
        });
      } else if (active) {
        const entry = getMenuEntry(active.id, id);
        if (entry) {
          entry.removed = false;
          entry.soldOut = false;
        }
      }
    },
    async deleteItem(id: number) {
      const hasSales = sales.some((sale) => sale.lines.some((line) => line.itemId === id));
      if (hasSales) {
        throw new ItemHasSalesError();
      }

      const index = items.findIndex((entry) => entry.id === id);
      if (index === -1) return;

      items.splice(index, 1);
      for (let i = menuEntries.length - 1; i >= 0; i -= 1) {
        if (menuEntries[i].itemId === id) {
          menuEntries.splice(i, 1);
        }
      }
    },
    async updateItem(id: number, draft: ItemDraft) {
      const item = items.find((entry) => entry.id === id);
      if (!item) return;
      item.name = draft.name;
      item.icon = draft.icon;
      item.costCents = draft.costCents;
      item.priceCents = draft.priceCents;
      if (draft.photoUri !== undefined) {
        item.photoUri = draft.photoUri;
      }
    },
    async listForSeller(): Promise<SellerItem[]> {
      const active = getActiveMarketDayRecord();
      if (active) {
        return listMenuItemsForMarketDay(active.id).map(({ id, name, icon, priceCents, soldOut }) => {
          const item = items.find((candidate) => candidate.id === id);
          return {
            id,
            name,
            icon,
            photoUri: item?.photoUri ?? null,
            priceCents,
            soldOut,
          };
        });
      }
      return items
        .filter((item) => !item.archived)
        .map(({ id, name, icon, photoUri, priceCents }) => ({
          id,
          name,
          icon,
          photoUri,
          priceCents,
        }));
    },
    async listForCheckout(): Promise<SellerItem[]> {
      const active = getActiveMarketDayRecord();
      if (!active) {
        return items
          .filter((item) => !item.archived)
          .map(({ id, name, icon, photoUri, priceCents }) => ({
            id,
            name,
            icon,
            photoUri,
            priceCents,
          }));
      }
      return listMenuItemsForMarketDay(active.id)
        .filter((item) => !item.soldOut)
        .map(({ id, name, icon, priceCents }) => {
          const item = items.find((candidate) => candidate.id === id);
          return {
            id,
            name,
            icon,
            photoUri: item?.photoUri ?? null,
            priceCents,
          };
        });
    },
    async listForRunningTab(): Promise<SellerItem[]> {
      return items
        .filter((item) => !item.archived)
        .map(({ id, name, icon, photoUri, priceCents }) => ({
          id,
          name,
          icon,
          photoUri,
          priceCents,
        }));
    },
    async listForAdmin(): Promise<AdminItem[]> {
      return items.map(({ id, name, icon, photoUri, costCents, priceCents, archived }) => ({
        id,
        name,
        icon,
        photoUri,
        costCents,
        priceCents,
        archived,
      }));
    },
    async hasActiveItems(): Promise<boolean> {
      return items.some((item) => !item.archived);
    },
    async listMenuForAdmin(): Promise<MenuItem[]> {
      const active = getActiveMarketDayRecord();
      if (!active) return [];
      return listMenuItemsForMarketDay(active.id);
    },
    async listRemovedFromMenu(): Promise<RemovedMenuItem[]> {
      const active = getActiveMarketDayRecord();
      if (!active) return [];
      return menuEntries
        .filter((entry) => entry.marketDayId === active.id && entry.removed)
        .map((entry) => {
          const item = items.find((candidate) => candidate.id === entry.itemId);
          if (!item || item.archived) {
            throw new Error(`Menu Item ${entry.itemId} not found`);
          }
          return {
            id: item.id,
            name: item.name,
            icon: item.icon,
            priceCents: item.priceCents,
          };
        });
    },
    async removeFromMenu(itemId: number) {
      const active = getActiveMarketDayRecord();
      if (!active) return;
      const entry = getMenuEntry(active.id, itemId);
      if (entry) {
        entry.removed = true;
        entry.soldOut = false;
      }
    },
    async addToMenu(itemId: number) {
      const active = getActiveMarketDayRecord();
      if (!active) return;
      const item = items.find((candidate) => candidate.id === itemId);
      if (!item || item.archived) return;

      const entry = getMenuEntry(active.id, itemId);
      if (entry) {
        entry.removed = false;
        entry.soldOut = false;
      } else {
        menuEntries.push({
          marketDayId: active.id,
          itemId,
          soldOut: false,
          removed: false,
        });
      }
    },
    async markSoldOut(itemId: number) {
      const active = getActiveMarketDayRecord();
      if (!active) return;
      const entry = getMenuEntry(active.id, itemId);
      if (entry && !entry.removed) {
        entry.soldOut = true;
      }
    },
    async markAvailable(itemId: number) {
      const active = getActiveMarketDayRecord();
      if (!active) return;
      const entry = getMenuEntry(active.id, itemId);
      if (entry && !entry.removed) {
        entry.soldOut = false;
      }
    },
    async getActiveMarketDay() {
      const active = getActiveMarketDayRecord();
      return active ? { id: active.id, name: active.name } : null;
    },
    async startMarketDay(name: string, startedAt?: string) {
      if (await this.getActiveMarketDay()) {
        throw new ActiveMarketDayExistsError();
      }
      const trimmedName = name.trim();
      if (!trimmedName) {
        throw new Error('Market Day name is required');
      }
      const marketDay = {
        id: nextMarketDayId++,
        name: trimmedName,
        startedAt: startedAt ?? new Date().toISOString(),
        closedAt: null,
        exportedAt: null,
        needsReexport: false,
      };
      marketDays.push(marketDay);
      populateMenu(marketDay.id);
      return { id: marketDay.id, name: marketDay.name };
    },
    async closeActiveMarketDay() {
      const active = marketDays.find((day) => day.closedAt === null);
      if (active) {
        active.closedAt = new Date().toISOString();
      }
    },
    async undoCloseMostRecentMarketDay() {
      const closed = [...marketDays]
        .filter((day) => day.closedAt !== null && day.exportedAt === null)
        .sort((a, b) => b.closedAt!.localeCompare(a.closedAt!))[0];
      if (!closed) {
        throw new NothingToUndoCloseError();
      }
      closed.closedAt = null;
    },
    async canUndoClose() {
      return marketDays.some((day) => day.closedAt !== null && day.exportedAt === null);
    },
    async exportMarketDay(id: number) {
      const marketDay = marketDays.find((day) => day.id === id);
      if (marketDay) {
        marketDay.exportedAt = new Date().toISOString();
        marketDay.needsReexport = false;
      }
    },
    async recordSale(params) {
      return recordSaleEntry(params.marketDayId, params);
    },
    async recordQuickSale(params) {
      return recordSaleEntry(null, params);
    },
    async getMarketDayStats(marketDayId) {
      const daySales = sales.filter((sale) => sale.marketDayId === marketDayId);
      let totalCents = 0;
      let itemCount = 0;
      let profitCents = 0;
      let cashCents = 0;
      let venmoCents = 0;
      let cashTipsCents = 0;
      let venmoTipsCents = 0;

      for (const sale of daySales) {
        const saleTotal = cartTotal(sale.lines);
        totalCents += saleTotal;
        itemCount += sale.lines.reduce((sum, line) => sum + line.quantity, 0);
        profitCents += cartProfit(sale.lines);
        if (sale.paymentMethod === 'cash') {
          cashCents += saleTotal;
        } else {
          venmoCents += saleTotal;
        }
        if (sale.changeKept && sale.cashReceivedCents != null) {
          const tip = Math.max(sale.cashReceivedCents - saleTotal, 0);
          if (sale.paymentMethod === 'cash') {
            cashTipsCents += tip;
          } else if (sale.paymentMethod === 'venmo_zelle') {
            venmoTipsCents += tip;
          }
        }
      }

      return {
        totalCents,
        itemCount,
        profitCents,
        cashCents,
        venmoCents,
        tipsCents: cashTipsCents + venmoTipsCents,
        cashTipsCents,
        venmoTipsCents,
      };
    },
    async listSalesForMarketDay(marketDayId) {
      return sales
        .filter((sale) => sale.marketDayId === marketDayId)
        .sort((a, b) => a.saleNumber - b.saleNumber)
        .map((sale) => ({
          saleNumber: sale.saleNumber,
          totalCents: cartTotal(sale.lines),
          paymentMethod: sale.paymentMethod,
          name: sale.name,
          notes: null,
          completeDate: null,
          createdAt: sale.createdAt,
        }));
    },
    async getAllTimeStats() {
      let totalCents = 0;
      let itemCount = 0;
      let profitCents = 0;
      let cashCents = 0;
      let venmoCents = 0;
      let cashTipsCents = 0;
      let venmoTipsCents = 0;

      for (const sale of completedSales()) {
        const saleTotal = cartTotal(sale.lines);
        totalCents += saleTotal;
        itemCount += sale.lines.reduce((sum, line) => sum + line.quantity, 0);
        profitCents += cartProfit(sale.lines);
        if (sale.paymentMethod === 'cash') {
          cashCents += saleTotal;
        } else {
          venmoCents += saleTotal;
        }
        if (sale.changeKept && sale.cashReceivedCents != null) {
          const tip = Math.max(sale.cashReceivedCents - saleTotal, 0);
          if (sale.paymentMethod === 'cash') {
            cashTipsCents += tip;
          } else if (sale.paymentMethod === 'venmo_zelle') {
            venmoTipsCents += tip;
          }
        }
      }

      return {
        totalCents,
        itemCount,
        profitCents,
        cashCents,
        venmoCents,
        tipsCents: cashTipsCents + venmoTipsCents,
        cashTipsCents,
        venmoTipsCents,
      };
    },
    async listAllTimeSales() {
      return completedSales()
        .slice()
        .sort((a, b) => {
          const byDate = b.createdAt.localeCompare(a.createdAt);
          return byDate !== 0 ? byDate : b.saleNumber - a.saleNumber;
        })
        .map((sale) => ({
          saleNumber: sale.saleNumber,
          totalCents: cartTotal(sale.lines),
          paymentMethod: sale.paymentMethod,
          name: sale.name,
          notes: null,
          completeDate: null,
          createdAt: sale.createdAt,
          marketDayName: marketDays.find((day) => day.id === sale.marketDayId)?.name ?? null,
        }));
    },
    async listPreorderSales() {
      return sales
        .filter((sale) => sale.isPreorder)
        .sort((a, b) => {
          if (!a.completeDate && !b.completeDate) {
            return a.saleNumber - b.saleNumber;
          }
          if (!a.completeDate) return 1;
          if (!b.completeDate) return -1;
          const byDate = a.completeDate.localeCompare(b.completeDate);
          return byDate !== 0 ? byDate : a.saleNumber - b.saleNumber;
        })
        .map((sale) => ({
          saleNumber: sale.saleNumber,
          totalCents: cartTotal(sale.lines),
          paymentMethod: sale.paymentMethod,
          name: sale.name,
          notes: sale.notes,
          completeDate: sale.completeDate,
          createdAt: sale.createdAt,
        }));
    },
    async removeSale(saleNumber) {
      const index = sales.findIndex((sale) => sale.saleNumber === saleNumber);
      if (index === -1) return;
      const [removed] = sales.splice(index, 1);
      const marketDay = marketDays.find((day) => day.id === removed.marketDayId);
      if (marketDay?.exportedAt) {
        marketDay.needsReexport = true;
      }
    },
    async getSale(saleNumber) {
      const sale = sales.find((entry) => entry.saleNumber === saleNumber);
      if (!sale) return null;
      return {
        saleNumber: sale.saleNumber,
        totalCents: cartTotal(sale.lines),
        paymentMethod: sale.paymentMethod,
        name: sale.name,
        notes: sale.notes,
        completeDate: sale.completeDate,
        isPreorder: sale.isPreorder,
        createdAt: sale.createdAt,
        lines: sale.lines.map((line) => ({ ...line })),
      };
    },
    async updateSalePaymentMethod(saleNumber, paymentMethod) {
      const sale = sales.find((entry) => entry.saleNumber === saleNumber);
      if (!sale) return;

      sale.paymentMethod = paymentMethod;
      if (paymentMethod === 'cash' || paymentMethod === 'venmo_zelle') {
        sale.cashReceivedCents = sale.cashReceivedCents ?? cartTotal(sale.lines);
        sale.changeKept =
          sale.changeKept && sale.cashReceivedCents > cartTotal(sale.lines);
      } else {
        sale.cashReceivedCents = null;
        sale.changeKept = false;
      }

      const marketDay = marketDays.find((day) => day.id === sale.marketDayId);
      if (marketDay?.exportedAt) {
        marketDay.needsReexport = true;
      }
    },
    async updateSale(saleNumber, updates) {
      const sale = sales.find((entry) => entry.saleNumber === saleNumber);
      if (!sale) return;

      if (updates.paymentMethod !== undefined) {
        sale.paymentMethod = updates.paymentMethod;
        if (updates.paymentMethod === 'cash' || updates.paymentMethod === 'venmo_zelle') {
          sale.cashReceivedCents = sale.cashReceivedCents ?? cartTotal(sale.lines);
          sale.changeKept =
            sale.changeKept && sale.cashReceivedCents > cartTotal(sale.lines);
        } else {
          sale.cashReceivedCents = null;
          sale.changeKept = false;
        }
      }
      if (updates.cashReceivedCents !== undefined) {
        sale.cashReceivedCents = updates.cashReceivedCents;
      }
      if (updates.changeKept !== undefined) {
        const received = sale.cashReceivedCents ?? 0;
        sale.changeKept =
          updates.changeKept === true && received > cartTotal(sale.lines);
      }
      if (updates.name !== undefined) {
        sale.name = normalizeOptionalText(updates.name);
      }
      if (updates.notes !== undefined) {
        sale.notes = normalizeOptionalText(updates.notes);
      }
      if (updates.completeDate !== undefined) {
        sale.completeDate = normalizeOptionalText(updates.completeDate);
      }

      const marketDay = marketDays.find((day) => day.id === sale.marketDayId);
      if (marketDay?.exportedAt) {
        marketDay.needsReexport = true;
      }
    },
    async replaceSale(saleNumber, params) {
      const sale = sales.find((entry) => entry.saleNumber === saleNumber);
      if (!sale) {
        throw new Error('Sale not found');
      }
      if (params.lines.length === 0) {
        throw new Error('Sale must have at least one line item');
      }

      const totalCents = cartTotal(params.lines);
      const changeKept =
        params.changeKept === true && (params.cashReceivedCents ?? 0) > totalCents;

      sale.lines = params.lines.map((line) => ({ ...line }));
      sale.paymentMethod = params.paymentMethod;
      sale.cashReceivedCents = params.cashReceivedCents;
      sale.changeKept = changeKept;
      sale.name = normalizeOptionalText(params.name);
      sale.notes = normalizeOptionalText(params.notes);
      sale.completeDate = normalizeOptionalText(params.completeDate);

      const marketDay = marketDays.find((day) => day.id === sale.marketDayId);
      if (marketDay?.exportedAt) {
        marketDay.needsReexport = true;
      }

      return { saleNumber: sale.saleNumber };
    },
    async completePreorder(saleNumber, params) {
      const sale = sales.find((entry) => entry.saleNumber === saleNumber);
      if (!sale?.isPreorder || params.paymentMethod === 'pay_on_pickup') return;

      const totalCents = cartTotal(sale.lines);
      const cashReceivedCents =
        params.paymentMethod === 'cash' || params.paymentMethod === 'venmo_zelle'
          ? (params.cashReceivedCents ?? totalCents)
          : null;
      const changeKept =
        params.changeKept === true &&
        cashReceivedCents != null &&
        cashReceivedCents > totalCents;

      sale.paymentMethod = params.paymentMethod;
      sale.cashReceivedCents = cashReceivedCents;
      sale.changeKept = changeKept;
      if (params.name !== undefined) {
        sale.name = normalizeOptionalText(params.name);
      }
      if (params.notes !== undefined) {
        sale.notes = normalizeOptionalText(params.notes);
      }
      if (params.completeDate !== undefined) {
        sale.completeDate = normalizeOptionalText(params.completeDate);
      }
      if (!sale.name || !sale.notes) return;

      sale.isPreorder = false;

      const marketDay = marketDays.find((day) => day.id === sale.marketDayId);
      if (marketDay?.exportedAt) {
        marketDay.needsReexport = true;
      }
    },
    async marketDayNeedsReexport(marketDayId) {
      const marketDay = marketDays.find((day) => day.id === marketDayId);
      return marketDay?.needsReexport ?? false;
    },
    async listClosedMarketDays() {
      return [...marketDays]
        .filter((day) => day.closedAt !== null)
        .sort((a, b) => b.closedAt!.localeCompare(a.closedAt!) || b.id - a.id)
        .map((day) => ({
          id: day.id,
          name: day.name,
          startedAt: day.startedAt,
          closedAt: day.closedAt!,
          saleCount: sales.filter((sale) => sale.marketDayId === day.id).length,
        }));
    },
    async getMarketDayById(id) {
      const day = marketDays.find((entry) => entry.id === id);
      if (!day) return null;
      return {
        id: day.id,
        name: day.name,
        startedAt: day.startedAt,
        closedAt: day.closedAt,
        exportedAt: day.exportedAt,
        needsReexport: day.needsReexport,
      };
    },
    async canReopenMarketDay(id) {
      const reopenable = [...marketDays]
        .filter((day) => day.closedAt !== null && day.exportedAt === null)
        .sort((a, b) => b.closedAt!.localeCompare(a.closedAt!) || b.id - a.id)[0];
      return reopenable?.id === id;
    },
    async deleteMarketDay(id) {
      const day = marketDays.find((entry) => entry.id === id);
      if (!day) return;
      if (!day.closedAt) {
        throw new CannotDeleteActiveMarketDayError();
      }

      for (let i = sales.length - 1; i >= 0; i--) {
        if (sales[i].marketDayId === id) {
          sales.splice(i, 1);
        }
      }

      for (let i = menuEntries.length - 1; i >= 0; i--) {
        if (menuEntries[i].marketDayId === id) {
          menuEntries.splice(i, 1);
        }
      }

      const index = marketDays.findIndex((entry) => entry.id === id);
      if (index !== -1) {
        marketDays.splice(index, 1);
      }
    },
    async listSalesExportRows(startDate, endDate) {
      return toSalesExportRows(salesInRange(startDate, endDate));
    },
  };
}
