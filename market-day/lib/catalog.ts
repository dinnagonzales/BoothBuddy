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

export type Catalog = {
  createItem(draft: ItemDraft): Promise<{ id: number }>;
  retire(id: number): Promise<void>;
  listForSeller(): Promise<SellerItem[]>;
  getActiveMarketDay(): Promise<{ id: number; name: string } | null>;
};

type StoredItem = ItemDraft & { id: number; retired: boolean };

export function createCatalog(): Catalog {
  const items: StoredItem[] = [];
  let nextId = 1;

  return {
    async createItem(draft: ItemDraft) {
      const item = { id: nextId++, retired: false, ...draft };
      items.push(item);
      return item;
    },
    async retire(id: number) {
      const item = items.find((entry) => entry.id === id);
      if (item) item.retired = true;
    },
    async listForSeller(): Promise<SellerItem[]> {
      return items
        .filter((item) => !item.retired)
        .map(({ id, name, emoji, priceCents }) => ({
          id,
          name,
          emoji,
          priceCents,
        }));
    },
    async getActiveMarketDay() {
      return null;
    },
  };
}
