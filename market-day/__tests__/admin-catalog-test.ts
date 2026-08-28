import { createCatalog } from '@/lib/catalog';

test('admin can add a new Item with emoji, name, cost, and price', async () => {
  const catalog = createCatalog();

  await catalog.createItem({
    name: 'Dragon',
    emoji: '🐉',
    costCents: 100,
    priceCents: 400,
  });

  expect(await catalog.listForAdmin()).toEqual([
    {
      id: expect.any(Number),
      name: 'Dragon',
      emoji: '🐉',
      costCents: 100,
      priceCents: 400,
      retired: false,
    },
  ]);
});

test('admin can edit an existing Item', async () => {
  const catalog = createCatalog();
  const item = await catalog.createItem({
    name: 'Dragon',
    emoji: '🐉',
    costCents: 100,
    priceCents: 400,
  });

  await catalog.updateItem(item.id, {
    name: 'Phoenix',
    emoji: '🔥',
    costCents: 200,
    priceCents: 500,
  });

  expect(await catalog.listForAdmin()).toEqual([
    {
      id: item.id,
      name: 'Phoenix',
      emoji: '🔥',
      costCents: 200,
      priceCents: 500,
      retired: false,
    },
  ]);
});

test('editing an Item updates what the seller sees', async () => {
  const catalog = createCatalog();
  const item = await catalog.createItem({
    name: 'Dragon',
    emoji: '🐉',
    costCents: 100,
    priceCents: 400,
  });

  await catalog.updateItem(item.id, {
    name: 'Phoenix',
    emoji: '🔥',
    costCents: 200,
    priceCents: 500,
  });

  const sellerItems = await catalog.listForSeller();
  expect(sellerItems).toEqual([
    {
      id: item.id,
      name: 'Phoenix',
      emoji: '🔥',
      priceCents: 500,
    },
  ]);
  expect(sellerItems[0]).not.toHaveProperty('costCents');
});

test('a retired Item stays visible to the admin', async () => {
  const catalog = createCatalog();
  const item = await catalog.createItem({
    name: 'Dragon',
    emoji: '🐉',
    costCents: 100,
    priceCents: 400,
  });

  await catalog.retire(item.id);

  expect(await catalog.listForAdmin()).toEqual([
    {
      id: item.id,
      name: 'Dragon',
      emoji: '🐉',
      costCents: 100,
      priceCents: 400,
      retired: true,
    },
  ]);
});

test('retired Items cannot be added to new Sales', async () => {
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
