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
  listForAdmin(): Promise<AdminItem[]>;
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

export function createCatalog(): Catalog {
  const items: StoredItem[] = [];
  const marketDays: StoredMarketDay[] = [];
  let nextItemId = 1;
  let nextMarketDayId = 1;

  return {
    async createItem(draft: ItemDraft) {
      const item = { id: nextItemId++, archived: false, ...draft };
      items.push(item);
      return item;
    },
    async archive(id: number) {
      const item = items.find((entry) => entry.id === id);
      if (item) item.archived = true;
    },
    async unarchive(id: number) {
      const item = items.find((entry) => entry.id === id);
      if (item) item.archived = false;
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
    async getActiveMarketDay() {
      const active = marketDays.find((day) => day.closedAt === null);
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
