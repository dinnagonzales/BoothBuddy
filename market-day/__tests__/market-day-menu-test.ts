import { createCatalog } from '@/lib/catalog';

test('starting a Market Day auto-populates the Menu with all non-archived Items', async () => {
  const catalog = createCatalog();

  const dragon = await catalog.createItem({
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
  });
  const unicorn = await catalog.createItem({
    name: 'Unicorn',
    icon: '🦄',
    costCents: 150,
    priceCents: 500,
  });
  await catalog.archive(unicorn.id);

  await catalog.startMarketDay('Spring Fair 2026');

  expect(await catalog.listMenuForAdmin()).toEqual([
    {
      id: dragon.id,
      name: 'Dragon',
      icon: '🐉',
      priceCents: 400,
      soldOut: false,
    },
  ]);
});

test('admin can add a removed Item back to the Menu', async () => {
  const catalog = createCatalog();

  const dragon = await catalog.createItem({
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
  });
  await catalog.createItem({
    name: 'Unicorn',
    icon: '🦄',
    costCents: 150,
    priceCents: 500,
  });

  await catalog.startMarketDay('Spring Fair 2026');
  await catalog.removeFromMenu(dragon.id);

  expect(await catalog.listRemovedFromMenu()).toEqual([
    {
      id: dragon.id,
      name: 'Dragon',
      icon: '🐉',
      priceCents: 400,
    },
  ]);

  await catalog.addToMenu(dragon.id);

  expect(await catalog.listRemovedFromMenu()).toEqual([]);
  expect(await catalog.listMenuForAdmin()).toEqual(
    expect.arrayContaining([
      {
        id: expect.any(Number),
        name: 'Unicorn',
        icon: '🦄',
        priceCents: 500,
        soldOut: false,
      },
      {
        id: dragon.id,
        name: 'Dragon',
        icon: '🐉',
        priceCents: 400,
        soldOut: false,
      },
    ]),
  );
  expect(await catalog.listForSeller()).toEqual(
    expect.arrayContaining([
      {
        id: expect.any(Number),
        name: 'Unicorn',
        icon: '🦄',
        photoUri: null,
        priceCents: 500,
        soldOut: false,
      },
      {
        id: dragon.id,
        name: 'Dragon',
        icon: '🐉',
        photoUri: null,
        priceCents: 400,
        soldOut: false,
      },
    ]),
  );
});

test('removing an Item from the Menu hides it from Home and checkout', async () => {
  const catalog = createCatalog();

  const dragon = await catalog.createItem({
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
  });
  await catalog.createItem({
    name: 'Unicorn',
    icon: '🦄',
    costCents: 150,
    priceCents: 500,
  });

  await catalog.startMarketDay('Spring Fair 2026');
  await catalog.removeFromMenu(dragon.id);

  expect(await catalog.listForSeller()).toEqual([
    {
      id: expect.any(Number),
      name: 'Unicorn',
      icon: '🦄',
      photoUri: null,
      priceCents: 500,
      soldOut: false,
    },
  ]);
  expect(await catalog.listForCheckout()).toEqual([
    {
      id: expect.any(Number),
      name: 'Unicorn',
      icon: '🦄',
      photoUri: null,
      priceCents: 500,
    },
  ]);
});

test('sold out Items stay on Home but are blocked in checkout', async () => {
  const catalog = createCatalog();

  const dragon = await catalog.createItem({
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
  });

  await catalog.startMarketDay('Spring Fair 2026');
  await catalog.markSoldOut(dragon.id);

  expect(await catalog.listForSeller()).toEqual([
    {
      id: dragon.id,
      name: 'Dragon',
      icon: '🐉',
      photoUri: null,
      priceCents: 400,
      soldOut: true,
    },
  ]);
  expect(await catalog.listForCheckout()).toEqual([]);
});

test('admin can mark a sold out Item available again', async () => {
  const catalog = createCatalog();

  const dragon = await catalog.createItem({
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
  });

  await catalog.startMarketDay('Spring Fair 2026');
  await catalog.markSoldOut(dragon.id);
  await catalog.markAvailable(dragon.id);

  expect(await catalog.listForSeller()).toEqual([
    {
      id: dragon.id,
      name: 'Dragon',
      icon: '🐉',
      photoUri: null,
      priceCents: 400,
      soldOut: false,
    },
  ]);
  expect(await catalog.listForCheckout()).toEqual([
    {
      id: dragon.id,
      name: 'Dragon',
      icon: '🐉',
      photoUri: null,
      priceCents: 400,
    },
  ]);
});

test('new Items auto-join the active Menu', async () => {
  const catalog = createCatalog();

  await catalog.startMarketDay('Spring Fair 2026');
  const dragon = await catalog.createItem({
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
  });

  expect(await catalog.listMenuForAdmin()).toEqual([
    {
      id: dragon.id,
      name: 'Dragon',
      icon: '🐉',
      priceCents: 400,
      soldOut: false,
    },
  ]);
});

test('archiving an Item drops it from the active Menu', async () => {
  const catalog = createCatalog();

  const dragon = await catalog.createItem({
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
  });

  await catalog.startMarketDay('Spring Fair 2026');
  await catalog.archive(dragon.id);

  expect(await catalog.listMenuForAdmin()).toEqual([]);
  expect(await catalog.listForSeller()).toEqual([]);
});

test('undo close restores the Menu including sold out flags', async () => {
  const catalog = createCatalog();

  const dragon = await catalog.createItem({
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
  });
  const unicorn = await catalog.createItem({
    name: 'Unicorn',
    icon: '🦄',
    costCents: 150,
    priceCents: 500,
  });

  await catalog.startMarketDay('Spring Fair 2026');
  await catalog.removeFromMenu(unicorn.id);
  await catalog.markSoldOut(dragon.id);
  await catalog.closeActiveMarketDay();
  await catalog.undoCloseMostRecentMarketDay();

  expect(await catalog.listMenuForAdmin()).toEqual([
    {
      id: dragon.id,
      name: 'Dragon',
      icon: '🐉',
      priceCents: 400,
      soldOut: true,
    },
  ]);
});

test('Running Tab checkout ignores the Menu', async () => {
  const catalog = createCatalog();

  const dragon = await catalog.createItem({
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
  });
  const unicorn = await catalog.createItem({
    name: 'Unicorn',
    icon: '🦄',
    costCents: 150,
    priceCents: 500,
  });

  await catalog.startMarketDay('Spring Fair 2026');
  await catalog.removeFromMenu(unicorn.id);

  expect(await catalog.listForRunningTab()).toEqual([
    {
      id: dragon.id,
      name: 'Dragon',
      icon: '🐉',
      photoUri: null,
      priceCents: 400,
    },
    {
      id: unicorn.id,
      name: 'Unicorn',
      icon: '🦄',
      photoUri: null,
      priceCents: 500,
    },
  ]);
});

test('starting a Market Day seeds Menu order A-Z by Inventory name', async () => {
  const catalog = createCatalog();

  const unicorn = await catalog.createItem({
    name: 'Unicorn',
    icon: '🦄',
    costCents: 150,
    priceCents: 500,
  });
  const cookie = await catalog.createItem({
    name: 'Cookie',
    icon: '🍪',
    costCents: 50,
    priceCents: 200,
  });
  const dragon = await catalog.createItem({
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
  });

  await catalog.startMarketDay('Spring Fair 2026');

  expect((await catalog.listMenuForAdmin()).map((item) => item.id)).toEqual([
    cookie.id,
    dragon.id,
    unicorn.id,
  ]);
  expect((await catalog.listForSeller()).map((item) => item.id)).toEqual([
    cookie.id,
    dragon.id,
    unicorn.id,
  ]);
});

test('owner can reorder the Menu and Home/checkout follow immediately', async () => {
  const catalog = createCatalog();

  const cookie = await catalog.createItem({
    name: 'Cookie',
    icon: '🍪',
    costCents: 50,
    priceCents: 200,
  });
  const dragon = await catalog.createItem({
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
  });
  const unicorn = await catalog.createItem({
    name: 'Unicorn',
    icon: '🦄',
    costCents: 150,
    priceCents: 500,
  });

  await catalog.startMarketDay('Spring Fair 2026');
  await catalog.reorderMenu([unicorn.id, cookie.id, dragon.id]);

  expect((await catalog.listMenuForAdmin()).map((item) => item.id)).toEqual([
    unicorn.id,
    cookie.id,
    dragon.id,
  ]);
  expect((await catalog.listForSeller()).map((item) => item.id)).toEqual([
    unicorn.id,
    cookie.id,
    dragon.id,
  ]);
  expect((await catalog.listForCheckout()).map((item) => item.id)).toEqual([
    unicorn.id,
    cookie.id,
    dragon.id,
  ]);
});

test('sold out Items keep their Menu position', async () => {
  const catalog = createCatalog();

  const cookie = await catalog.createItem({
    name: 'Cookie',
    icon: '🍪',
    costCents: 50,
    priceCents: 200,
  });
  const dragon = await catalog.createItem({
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
  });
  const unicorn = await catalog.createItem({
    name: 'Unicorn',
    icon: '🦄',
    costCents: 150,
    priceCents: 500,
  });

  await catalog.startMarketDay('Spring Fair 2026');
  await catalog.reorderMenu([unicorn.id, cookie.id, dragon.id]);
  await catalog.markSoldOut(cookie.id);

  expect((await catalog.listMenuForAdmin()).map((item) => item.id)).toEqual([
    unicorn.id,
    cookie.id,
    dragon.id,
  ]);
  expect(await catalog.listForSeller()).toEqual([
    expect.objectContaining({ id: unicorn.id, soldOut: false }),
    expect.objectContaining({ id: cookie.id, soldOut: true }),
    expect.objectContaining({ id: dragon.id, soldOut: false }),
  ]);
  expect((await catalog.listForCheckout()).map((item) => item.id)).toEqual([
    unicorn.id,
    dragon.id,
  ]);
});

test('Items that join the Menu mid-day append at the end', async () => {
  const catalog = createCatalog();

  const cookie = await catalog.createItem({
    name: 'Cookie',
    icon: '🍪',
    costCents: 50,
    priceCents: 200,
  });
  const dragon = await catalog.createItem({
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
  });

  await catalog.startMarketDay('Spring Fair 2026');
  await catalog.reorderMenu([dragon.id, cookie.id]);

  const zebra = await catalog.createItem({
    name: 'Zebra',
    icon: '🦓',
    costCents: 80,
    priceCents: 300,
  });
  await catalog.removeFromMenu(cookie.id);
  await catalog.addToMenu(cookie.id);

  expect((await catalog.listMenuForAdmin()).map((item) => item.id)).toEqual([
    dragon.id,
    zebra.id,
    cookie.id,
  ]);
});

test('undo close restores custom Menu order', async () => {
  const catalog = createCatalog();

  const cookie = await catalog.createItem({
    name: 'Cookie',
    icon: '🍪',
    costCents: 50,
    priceCents: 200,
  });
  const dragon = await catalog.createItem({
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
  });

  await catalog.startMarketDay('Spring Fair 2026');
  await catalog.reorderMenu([dragon.id, cookie.id]);
  await catalog.closeActiveMarketDay();
  await catalog.undoCloseMostRecentMarketDay();

  expect((await catalog.listMenuForAdmin()).map((item) => item.id)).toEqual([
    dragon.id,
    cookie.id,
  ]);
});

test('a brand-new Market Day resets Menu order to Inventory A-Z', async () => {
  const catalog = createCatalog();

  const cookie = await catalog.createItem({
    name: 'Cookie',
    icon: '🍪',
    costCents: 50,
    priceCents: 200,
  });
  const dragon = await catalog.createItem({
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
  });

  await catalog.startMarketDay('Spring Fair 2026');
  await catalog.reorderMenu([dragon.id, cookie.id]);
  await catalog.closeActiveMarketDay();
  await catalog.startMarketDay('Fall Fair 2026');

  expect((await catalog.listMenuForAdmin()).map((item) => item.id)).toEqual([
    cookie.id,
    dragon.id,
  ]);
});
