import { createCatalog } from '@/lib/catalog';
import { ItemHasSalesError } from '@/lib/market-day';

test('admin can add a new Item with icon, name, cost, and price', async () => {
  const catalog = createCatalog();

  await catalog.createItem({
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
  });

  expect(await catalog.listForAdmin()).toEqual([
    {
      id: expect.any(Number),
      name: 'Dragon',
      icon: '🐉',
      costCents: 100,
      priceCents: 400,
      archived: false,
    },
  ]);
});

test('admin can edit an existing Item', async () => {
  const catalog = createCatalog();
  const item = await catalog.createItem({
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
  });

  await catalog.updateItem(item.id, {
    name: 'Phoenix',
    icon: '🔥',
    costCents: 200,
    priceCents: 500,
  });

  expect(await catalog.listForAdmin()).toEqual([
    {
      id: item.id,
      name: 'Phoenix',
      icon: '🔥',
      costCents: 200,
      priceCents: 500,
      archived: false,
    },
  ]);
});

test('editing an Item updates what the seller sees', async () => {
  const catalog = createCatalog();
  const item = await catalog.createItem({
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
  });

  await catalog.updateItem(item.id, {
    name: 'Phoenix',
    icon: '🔥',
    costCents: 200,
    priceCents: 500,
  });

  const sellerItems = await catalog.listForSeller();
  expect(sellerItems).toEqual([
    {
      id: item.id,
      name: 'Phoenix',
      icon: '🔥',
      priceCents: 500,
    },
  ]);
  expect(sellerItems[0]).not.toHaveProperty('costCents');
});

test('an archived Item stays visible to the admin', async () => {
  const catalog = createCatalog();
  const item = await catalog.createItem({
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
  });

  await catalog.archive(item.id);

  expect(await catalog.listForAdmin()).toEqual([
    {
      id: item.id,
      name: 'Dragon',
      icon: '🐉',
      costCents: 100,
      priceCents: 400,
      archived: true,
    },
  ]);
});

test('archived Items cannot be added to new Sales', async () => {
  const catalog = createCatalog();
  const item = await catalog.createItem({
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
  });

  await catalog.archive(item.id);

  expect(await catalog.listForSeller()).toEqual([]);
});

test('admin can unarchive an Item so it returns to the seller', async () => {
  const catalog = createCatalog();
  const item = await catalog.createItem({
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
  });

  await catalog.archive(item.id);
  await catalog.unarchive(item.id);

  expect(await catalog.listForAdmin()).toEqual([
    {
      id: item.id,
      name: 'Dragon',
      icon: '🐉',
      costCents: 100,
      priceCents: 400,
      archived: false,
    },
  ]);
  expect(await catalog.listForSeller()).toEqual([
    {
      id: item.id,
      name: 'Dragon',
      icon: '🐉',
      priceCents: 400,
    },
  ]);
});

test('admin can delete an Item that has never been sold', async () => {
  const catalog = createCatalog();
  const item = await catalog.createItem({
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
  });

  await catalog.deleteItem(item.id);

  expect(await catalog.listForAdmin()).toEqual([]);
  expect(await catalog.listForSeller()).toEqual([]);
});

test('admin cannot delete an Item that appears in past sales', async () => {
  const catalog = createCatalog();
  const item = await catalog.createItem({
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
  });
  const marketDay = await catalog.startMarketDay('Spring Fair 2026');

  await catalog.recordSale({
    marketDayId: marketDay.id,
    lines: [
      {
        itemId: item.id,
        name: 'Dragon',
        icon: '🐉',
        priceCents: 400,
        costCents: 100,
        quantity: 1,
      },
    ],
    paymentMethod: 'cash',
    cashReceivedCents: 500,
  });

  await expect(catalog.deleteItem(item.id)).rejects.toThrow(ItemHasSalesError);
  expect(await catalog.listForAdmin()).toEqual([
    {
      id: item.id,
      name: 'Dragon',
      icon: '🐉',
      costCents: 100,
      priceCents: 400,
      archived: false,
    },
  ]);
});
