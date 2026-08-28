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
  createItem(draft: ItemDraft): { id: number };
  retire(id: number): void;
  listForSeller(): SellerItem[];
  getActiveMarketDay(): { id: number; name: string } | null;
};

type StoredItem = ItemDraft & { id: number; retired: boolean };

export function createCatalog(): Catalog {
  const items: StoredItem[] = [];
  let nextId = 1;

  return {
    createItem(draft: ItemDraft) {
      const item = { id: nextId++, retired: false, ...draft };
      items.push(item);
      return item;
    },
    retire(id: number) {
      const item = items.find((entry) => entry.id === id);
      if (item) item.retired = true;
    },
    listForSeller(): SellerItem[] {
      return items
        .filter((item) => !item.retired)
        .map(({ id, name, emoji, priceCents }) => ({
          id,
          name,
          emoji,
          priceCents,
        }));
    },
    getActiveMarketDay() {
      return null;
    },
  };
}
