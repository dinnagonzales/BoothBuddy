import { createCatalog } from '@/lib/catalog';

test('closed Market Days appear in Past Events newest first with sale counts', async () => {
  const catalog = createCatalog();

  const dragon = await catalog.createItem({
    name: 'Dragon',
    emoji: '🐉',
    costCents: 100,
    priceCents: 400,
  });

  const spring = await catalog.startMarketDay('Spring Fair 2026');
  await catalog.recordSale({
    marketDayId: spring.id,
    lines: [
      {
        itemId: dragon.id,
        name: 'Dragon',
        emoji: '🐉',
        priceCents: 400,
        costCents: 100,
        quantity: 1,
      },
    ],
    paymentMethod: 'cash',
    cashReceivedCents: 500,
  });
  await catalog.closeActiveMarketDay();

  const fall = await catalog.startMarketDay('Fall Fair 2026');
  await catalog.recordSale({
    marketDayId: fall.id,
    lines: [
      {
        itemId: dragon.id,
        name: 'Dragon',
        emoji: '🐉',
        priceCents: 400,
        costCents: 100,
        quantity: 2,
      },
    ],
    paymentMethod: 'venmo_zelle',
    cashReceivedCents: null,
  });
  await catalog.closeActiveMarketDay();

  expect(await catalog.listClosedMarketDays()).toEqual([
    {
      id: fall.id,
      name: 'Fall Fair 2026',
      startedAt: expect.any(String),
      closedAt: expect.any(String),
      saleCount: 1,
    },
    {
      id: spring.id,
      name: 'Spring Fair 2026',
      startedAt: expect.any(String),
      closedAt: expect.any(String),
      saleCount: 1,
    },
  ]);
});

test('Reopen is only offered for the most recently closed non-exported Market Day', async () => {
  const catalog = createCatalog();

  const first = await catalog.startMarketDay('Spring Fair 2026');
  await catalog.closeActiveMarketDay();
  const second = await catalog.startMarketDay('Fall Fair 2026');
  await catalog.closeActiveMarketDay();

  expect(await catalog.canReopenMarketDay(first.id)).toBe(false);
  expect(await catalog.canReopenMarketDay(second.id)).toBe(true);

  await catalog.exportMarketDay(second.id);

  expect(await catalog.canReopenMarketDay(second.id)).toBe(false);
});

test('Reopen restores the closed Market Day as active', async () => {
  const catalog = createCatalog();

  const started = await catalog.startMarketDay('Spring Fair 2026');
  await catalog.closeActiveMarketDay();

  expect(await catalog.getActiveMarketDay()).toBeNull();
  expect(await catalog.canReopenMarketDay(started.id)).toBe(true);

  await catalog.undoCloseMostRecentMarketDay();

  expect(await catalog.getActiveMarketDay()).toEqual({
    id: started.id,
    name: 'Spring Fair 2026',
  });
});

test('deleting a closed Market Day removes it and its sales from Past Events', async () => {
  const catalog = createCatalog();

  const dragon = await catalog.createItem({
    name: 'Dragon',
    emoji: '🐉',
    costCents: 100,
    priceCents: 400,
  });

  const spring = await catalog.startMarketDay('Spring Fair 2026');
  await catalog.recordSale({
    marketDayId: spring.id,
    lines: [
      {
        itemId: dragon.id,
        name: 'Dragon',
        emoji: '🐉',
        priceCents: 400,
        costCents: 100,
        quantity: 1,
      },
    ],
    paymentMethod: 'cash',
    cashReceivedCents: 500,
  });
  await catalog.closeActiveMarketDay();

  await catalog.deleteMarketDay(spring.id);

  expect(await catalog.listClosedMarketDays()).toEqual([]);
  expect(await catalog.getMarketDayById(spring.id)).toBeNull();
  expect(await catalog.listAllTimeSales()).toEqual([]);
});

test('active Market Day cannot be deleted', async () => {
  const catalog = createCatalog();

  const active = await catalog.startMarketDay('Spring Fair 2026');

  await expect(catalog.deleteMarketDay(active.id)).rejects.toThrow('Active Market Day cannot be deleted');
});
