import { createCatalog } from '@/lib/catalog';

test('admin can add a photo when creating an Item', async () => {
  const catalog = createCatalog();

  await catalog.createItem({
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
    photoUri: 'file:///items/dragon.jpg',
  });

  expect(await catalog.listForAdmin()).toEqual([
    {
      id: expect.any(Number),
      name: 'Dragon',
      icon: '🐉',
      costCents: 100,
      priceCents: 400,
      photoUri: 'file:///items/dragon.jpg',
      archived: false,
    },
  ]);
});

test('admin can replace a photo when editing an Item', async () => {
  const catalog = createCatalog();
  const item = await catalog.createItem({
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
    photoUri: 'file:///items/dragon-v1.jpg',
  });

  await catalog.updateItem(item.id, {
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
    photoUri: 'file:///items/dragon-v2.jpg',
  });

  expect(await catalog.listForAdmin()).toEqual([
    {
      id: item.id,
      name: 'Dragon',
      icon: '🐉',
      costCents: 100,
      priceCents: 400,
      photoUri: 'file:///items/dragon-v2.jpg',
      archived: false,
    },
  ]);
});

test('admin can remove a photo and the emoji icon remains', async () => {
  const catalog = createCatalog();
  const item = await catalog.createItem({
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
    photoUri: 'file:///items/dragon.jpg',
  });

  await catalog.updateItem(item.id, {
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
    photoUri: null,
  });

  expect(await catalog.listForAdmin()).toEqual([
    {
      id: item.id,
      name: 'Dragon',
      icon: '🐉',
      costCents: 100,
      priceCents: 400,
      photoUri: null,
      archived: false,
    },
  ]);
});

test('seller sees Item photo on Home and checkout without cost', async () => {
  const catalog = createCatalog();
  const item = await catalog.createItem({
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
    photoUri: 'file:///items/dragon.jpg',
  });

  const sellerView = {
    id: item.id,
    name: 'Dragon',
    icon: '🐉',
    photoUri: 'file:///items/dragon.jpg',
    priceCents: 400,
  };

  expect(await catalog.listForSeller()).toEqual([sellerView]);
  expect(await catalog.listForCheckout()).toEqual([sellerView]);
  expect((await catalog.listForSeller())[0]).not.toHaveProperty('costCents');
});

test('archived Items with photos stay hidden from the seller', async () => {
  const catalog = createCatalog();
  const item = await catalog.createItem({
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
    photoUri: 'file:///items/dragon.jpg',
  });

  await catalog.archive(item.id);

  expect(await catalog.listForSeller()).toEqual([]);
  expect(await catalog.listForAdmin()).toEqual([
    {
      id: item.id,
      name: 'Dragon',
      icon: '🐉',
      costCents: 100,
      priceCents: 400,
      photoUri: 'file:///items/dragon.jpg',
      archived: true,
    },
  ]);
});
