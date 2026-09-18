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

test('switching payment method keeps change-kept tip and tender', async () => {
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
    changeKept: true,
  });

  expect((await catalog.getMarketDayStats(marketDay.id)).tipsCents).toBe(100);

  await catalog.updateSalePaymentMethod(saleNumber, 'venmo_zelle');

  expect((await catalog.getMarketDayStats(marketDay.id)).tipsCents).toBe(100);
  const afterVenmo = await catalog.listSalesExportRows('2000-01-01', '2100-01-01');
  expect(afterVenmo[0]).toMatchObject({
    paymentMethod: 'venmo_zelle',
    cashReceivedCents: 500,
    changeKeptCents: 100,
  });

  await catalog.updateSalePaymentMethod(saleNumber, 'cash');

  expect((await catalog.getMarketDayStats(marketDay.id)).tipsCents).toBe(100);
  const afterCash = await catalog.listSalesExportRows('2000-01-01', '2100-01-01');
  expect(afterCash[0]).toMatchObject({
    paymentMethod: 'cash',
    cashReceivedCents: 500,
    changeKeptCents: 100,
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

test('edit-sale replace keeps the same invoice number and created time', async () => {
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
    cashReceivedCents: 400,
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
        quantity: 1,
      },
    ],
    paymentMethod: 'venmo_zelle',
    cashReceivedCents: 400,
  });

  const before = await catalog.getSale(first.saleNumber);
  expect(before?.saleNumber).toBe(1);
  const createdAt = before!.createdAt;

  // Mirrors payment.tsx edit flow: replace contents in place.
  const replaced = await catalog.replaceSale(first.saleNumber, {
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
    paymentMethod: 'cash',
    cashReceivedCents: 800,
  });

  expect(replaced.saleNumber).toBe(1);
  const after = await catalog.getSale(1);
  expect(after).toMatchObject({
    saleNumber: 1,
    totalCents: 800,
    paymentMethod: 'cash',
    createdAt,
  });
  expect(after?.lines).toEqual([
    expect.objectContaining({ itemId: dragon.id, quantity: 2 }),
  ]);
  expect(await catalog.listSalesForMarketDay(marketDay.id)).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ saleNumber: 1, totalCents: 800 }),
      expect.objectContaining({ saleNumber: 2, totalCents: 400 }),
    ]),
  );
});

test('exported Market Day is flagged for re-export after replacing a Sale', async () => {
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
    cashReceivedCents: 400,
  });

  await catalog.exportMarketDay(marketDay.id);
  expect(await catalog.marketDayNeedsReexport(marketDay.id)).toBe(false);

  await catalog.replaceSale(saleNumber, {
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
    paymentMethod: 'cash',
    cashReceivedCents: 800,
  });

  expect(await catalog.marketDayNeedsReexport(marketDay.id)).toBe(true);
});
