import { createCatalog } from '@/lib/catalog';

test('a new catalog has no Items for the seller', () => {
  const catalog = createCatalog();

  expect(catalog.listForSeller()).toEqual([]);
  expect(catalog.getActiveMarketDay()).toBeNull();
});

test('creating an Item makes it available to the seller without cost', () => {
  const catalog = createCatalog();

  catalog.createItem({
    name: 'Dragon',
    emoji: '🐉',
    costCents: 100,
    priceCents: 400,
  });

  const sellerItems = catalog.listForSeller();
  expect(sellerItems).toEqual([
    {
      id: expect.any(Number),
      name: 'Dragon',
      emoji: '🐉',
      priceCents: 400,
    },
  ]);
  expect(sellerItems[0]).not.toHaveProperty('costCents');
});

test('a retired Item is not available to the seller', () => {
  const catalog = createCatalog();
  const item = catalog.createItem({
    name: 'Dragon',
    emoji: '🐉',
    costCents: 100,
    priceCents: 400,
  });

  catalog.retire(item.id);

  expect(catalog.listForSeller()).toEqual([]);
});
