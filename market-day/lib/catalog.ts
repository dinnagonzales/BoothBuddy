import { ActiveMarketDayExistsError, NothingToUndoCloseError } from '@/lib/market-day';

export type ItemDraft = {
  name: string;
  emoji: string;
  costCents: number;
  priceCents: number;
};

export type SellerItem = {
  id: number;
  name: string;
  emoji: string;
  priceCents: number;
  soldOut?: boolean;
};

export type MenuItem = {
  id: number;
  name: string;
  emoji: string;
  priceCents: number;
  soldOut: boolean;
};

export type AdminItem = {
  id: number;
  name: string;
  emoji: string;
  costCents: number;
  priceCents: number;
  archived: boolean;
};

export type Catalog = {
  createItem(draft: ItemDraft): Promise<{ id: number }>;
  updateItem(id: number, draft: ItemDraft): Promise<void>;
  archive(id: number): Promise<void>;
  unarchive(id: number): Promise<void>;
  listForSeller(): Promise<SellerItem[]>;
  listForCheckout(): Promise<SellerItem[]>;
  listForRunningTab(): Promise<SellerItem[]>;
  listForAdmin(): Promise<AdminItem[]>;
  listMenuForAdmin(): Promise<MenuItem[]>;
  removeFromMenu(itemId: number): Promise<void>;
  markSoldOut(itemId: number): Promise<void>;
  markAvailable(itemId: number): Promise<void>;
  getActiveMarketDay(): Promise<{ id: number; name: string } | null>;
  startMarketDay(name: string): Promise<{ id: number; name: string }>;
  closeActiveMarketDay(): Promise<void>;
  undoCloseMostRecentMarketDay(): Promise<void>;
  canUndoClose(): Promise<boolean>;
  exportMarketDay(id: number): Promise<void>;
};

type StoredItem = ItemDraft & { id: number; archived: boolean };

type StoredMarketDay = {
  id: number;
  name: string;
  closedAt: string | null;
  exportedAt: string | null;
};

type StoredMenuEntry = {
  marketDayId: number;
  itemId: number;
  soldOut: boolean;
  removed: boolean;
};

export function createCatalog(): Catalog {
  const items: StoredItem[] = [];
  const marketDays: StoredMarketDay[] = [];
  const menuEntries: StoredMenuEntry[] = [];
  let nextItemId = 1;
  let nextMarketDayId = 1;

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
          emoji: item.emoji,
          priceCents: item.priceCents,
          soldOut: entry.soldOut,
        };
      });
  }

  return {
    async createItem(draft: ItemDraft) {
      const item = { id: nextItemId++, archived: false, ...draft };
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
    async updateItem(id: number, draft: ItemDraft) {
      const item = items.find((entry) => entry.id === id);
      if (!item) return;
      item.name = draft.name;
      item.emoji = draft.emoji;
      item.costCents = draft.costCents;
      item.priceCents = draft.priceCents;
    },
    async listForSeller(): Promise<SellerItem[]> {
      const active = getActiveMarketDayRecord();
      if (active) {
        return listMenuItemsForMarketDay(active.id).map(({ id, name, emoji, priceCents, soldOut }) => ({
          id,
          name,
          emoji,
          priceCents,
          soldOut,
        }));
      }
      return items
        .filter((item) => !item.archived)
        .map(({ id, name, emoji, priceCents }) => ({
          id,
          name,
          emoji,
          priceCents,
        }));
    },
    async listForCheckout(): Promise<SellerItem[]> {
      const active = getActiveMarketDayRecord();
      if (!active) return [];
      return listMenuItemsForMarketDay(active.id)
        .filter((item) => !item.soldOut)
        .map(({ id, name, emoji, priceCents }) => ({
          id,
          name,
          emoji,
          priceCents,
        }));
    },
    async listForRunningTab(): Promise<SellerItem[]> {
      return items
        .filter((item) => !item.archived)
        .map(({ id, name, emoji, priceCents }) => ({
          id,
          name,
          emoji,
          priceCents,
        }));
    },
    async listForAdmin(): Promise<AdminItem[]> {
      return items.map(({ id, name, emoji, costCents, priceCents, archived }) => ({
        id,
        name,
        emoji,
        costCents,
        priceCents,
        archived,
      }));
    },
    async listMenuForAdmin(): Promise<MenuItem[]> {
      const active = getActiveMarketDayRecord();
      if (!active) return [];
      return listMenuItemsForMarketDay(active.id);
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
    async startMarketDay(name: string) {
      if (await this.getActiveMarketDay()) {
        throw new ActiveMarketDayExistsError();
      }
      const marketDay = {
        id: nextMarketDayId++,
        name,
        closedAt: null,
        exportedAt: null,
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
      }
    },
  };
}
