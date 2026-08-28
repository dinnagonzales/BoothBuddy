import { createCatalog } from '@/lib/catalog';

test('a new catalog has no Items for the seller', async () => {
  const catalog = createCatalog();

  expect(await catalog.listForSeller()).toEqual([]);
  expect(await catalog.getActiveMarketDay()).toBeNull();
});

test('creating an Item makes it available to the seller without cost', async () => {
  const catalog = createCatalog();

  await catalog.createItem({
    name: 'Dragon',
    emoji: '🐉',
    costCents: 100,
    priceCents: 400,
  });

  const sellerItems = await catalog.listForSeller();
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

test('a retired Item is not available to the seller', async () => {
  const catalog = createCatalog();
  const item = await catalog.createItem({
    name: 'Dragon',
    emoji: '🐉',
    costCents: 100,
    priceCents: 400,
  });

  await catalog.retire(item.id);

  expect(await catalog.listForSeller()).toEqual([]);
});
