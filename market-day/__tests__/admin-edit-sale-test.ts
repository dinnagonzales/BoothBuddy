import { createCatalog } from '@/lib/catalog';

test('admin can remove a mis-logged Sale', async () => {
  const catalog = createCatalog();

  const dragon = await catalog.createItem({
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
  });
  const marketDay = await catalog.startMarketDay('Spring Fair 2026');

  const first = await catalog.recordSale({
    marketDayId: marketDay.id,
    lines: [
      {
        itemId: dragon.id,
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
  await catalog.recordSale({
    marketDayId: marketDay.id,
    lines: [
      {
        itemId: dragon.id,
        name: 'Dragon',
        icon: '🐉',
        priceCents: 400,
        costCents: 100,
        quantity: 2,
      },
    ],
    paymentMethod: 'venmo_zelle',
    cashReceivedCents: null,
  });

  await catalog.removeSale(first.saleNumber);

  expect(await catalog.listSalesForMarketDay(marketDay.id)).toEqual([
    {
      saleNumber: 2,
      totalCents: 800,
      paymentMethod: 'venmo_zelle',
      name: null,
      notes: null,
      completeDate: null,
      createdAt: expect.any(String),
    },
  ]);
  expect(await catalog.getMarketDayStats(marketDay.id)).toEqual({
    totalCents: 800,
    itemCount: 2,
    profitCents: 600,
    cashCents: 0,
    venmoCents: 800,
    tipsCents: 0,
  });
});

test('admin can change payment method on a Sale', async () => {
  const catalog = createCatalog();

  const dragon = await catalog.createItem({
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
  });
  const marketDay = await catalog.startMarketDay('Spring Fair 2026');

  const { saleNumber } = await catalog.recordSale({
    marketDayId: marketDay.id,
    lines: [
      {
        itemId: dragon.id,
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

  await catalog.updateSalePaymentMethod(saleNumber, 'venmo_zelle');

  const sale = await catalog.getSale(saleNumber);
  expect(sale?.paymentMethod).toBe('venmo_zelle');
  expect(await catalog.listSalesForMarketDay(marketDay.id)).toEqual([
    {
      saleNumber: 1,
      totalCents: 400,
      paymentMethod: 'venmo_zelle',
      name: null,
      notes: null,
      completeDate: null,
      createdAt: expect.any(String),
    },
  ]);
  expect(await catalog.getMarketDayStats(marketDay.id)).toEqual({
    totalCents: 400,
    itemCount: 1,
    profitCents: 300,
    cashCents: 0,
    venmoCents: 400,
    tipsCents: 0,
  });
});

test('exported Market Day is flagged for re-export after a payment method edit', async () => {
  const catalog = createCatalog();

  const dragon = await catalog.createItem({
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
  });
  const marketDay = await catalog.startMarketDay('Spring Fair 2026');

  const { saleNumber } = await catalog.recordSale({
    marketDayId: marketDay.id,
    lines: [
      {
        itemId: dragon.id,
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

  await catalog.exportMarketDay(marketDay.id);
  expect(await catalog.marketDayNeedsReexport(marketDay.id)).toBe(false);

  await catalog.updateSalePaymentMethod(saleNumber, 'venmo_zelle');

  expect(await catalog.marketDayNeedsReexport(marketDay.id)).toBe(true);
});

test('exported Market Day is flagged for re-export after removing a Sale', async () => {
  const catalog = createCatalog();

  const dragon = await catalog.createItem({
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
  });
  const marketDay = await catalog.startMarketDay('Spring Fair 2026');

  const { saleNumber } = await catalog.recordSale({
    marketDayId: marketDay.id,
    lines: [
      {
        itemId: dragon.id,
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

  await catalog.exportMarketDay(marketDay.id);
  await catalog.removeSale(saleNumber);

  expect(await catalog.marketDayNeedsReexport(marketDay.id)).toBe(true);
});

test('admin can add optional name and notes to a Sale', async () => {
  const catalog = createCatalog();

  const dragon = await catalog.createItem({
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
  });
  const marketDay = await catalog.startMarketDay('Spring Fair 2026');

  const { saleNumber } = await catalog.recordSale({
    marketDayId: marketDay.id,
    lines: [
      {
        itemId: dragon.id,
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

  await catalog.updateSale(saleNumber, {
    name: '  Emma  ',
    notes: ' Pick up at 3 ',
  });

  const sale = await catalog.getSale(saleNumber);
  expect(sale?.name).toBe('Emma');
  expect(sale?.notes).toBe('Pick up at 3');
  expect(await catalog.listSalesForMarketDay(marketDay.id)).toEqual([
    {
      saleNumber: 1,
      totalCents: 400,
      paymentMethod: 'cash',
      name: 'Emma',
      notes: null,
      completeDate: null,
      createdAt: expect.any(String),
    },
  ]);

  await catalog.updateSale(saleNumber, { name: '', notes: '' });

  expect((await catalog.getSale(saleNumber))?.name).toBeNull();
  expect((await catalog.getSale(saleNumber))?.notes).toBeNull();
});
