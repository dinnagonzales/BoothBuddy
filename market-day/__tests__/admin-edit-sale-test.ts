import { createCatalog } from '@/lib/catalog';

test('admin can cancel a completed Sale with Return; it stays visible and drops from totals', async () => {
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

  await catalog.cancelSale(first.saleNumber, { kind: 'return' });

  const sales = await catalog.listSalesForMarketDay(marketDay.id);
  expect(sales).toHaveLength(2);
  expect(sales[0]).toMatchObject({
    saleNumber: 1,
    totalCents: 400,
    cancelled: true,
    cancelReason: 'return',
    cancelNote: null,
  });
  expect(sales[1]).toMatchObject({
    saleNumber: 2,
    totalCents: 800,
    cancelled: false,
  });
  expect(await catalog.getMarketDayStats(marketDay.id)).toEqual({
    totalCents: 800,
    itemCount: 2,
    profitCents: 600,
    cashCents: 0,
    venmoCents: 800,
    tipsCents: 0,
    cashTipsCents: 0,
    venmoTipsCents: 0,
  });
  expect(await catalog.getSale(first.saleNumber)).toMatchObject({
    saleNumber: 1,
    cancelled: true,
    cancelReason: 'return',
    cancelNote: null,
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
      cancelled: false,
      cancelReason: null,
      cancelNote: null,
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
    cashTipsCents: 0,
    venmoTipsCents: 0,
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

  expect(await catalog.getMarketDayStats(marketDay.id)).toMatchObject({
    tipsCents: 100,
    cashTipsCents: 0,
    venmoTipsCents: 100,
    cashCents: 0,
    venmoCents: 400,
  });
  const afterVenmo = await catalog.listSalesExportRows('2000-01-01', '2100-01-01');
  expect(afterVenmo[0]).toMatchObject({
    paymentMethod: 'venmo_zelle',
    cashReceivedCents: 500,
    changeKeptCents: 100,
  });

  await catalog.updateSalePaymentMethod(saleNumber, 'cash');

  expect(await catalog.getMarketDayStats(marketDay.id)).toMatchObject({
    tipsCents: 100,
    cashTipsCents: 100,
    venmoTipsCents: 0,
    cashCents: 400,
    venmoCents: 0,
  });
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

test('exported Market Day is flagged for re-export after cancelling a Sale', async () => {
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
  await catalog.cancelSale(saleNumber, { kind: 'return' });

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
      cancelled: false,
      cancelReason: null,
      cancelNote: null,
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

test('admin can cancel a completed Sale with Error and a short note', async () => {
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

  await catalog.cancelSale(saleNumber, { kind: 'error', note: '  Double ring  ' });

  expect(await catalog.getSale(saleNumber)).toMatchObject({
    cancelled: true,
    cancelReason: 'error',
    cancelNote: 'Double ring',
  });
  expect(await catalog.getMarketDayStats(marketDay.id)).toMatchObject({
    totalCents: 0,
    itemCount: 0,
  });
});

test('cancel with Error rejects an empty note', async () => {
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

  await expect(
    catalog.cancelSale(saleNumber, { kind: 'error', note: '   ' }),
  ).rejects.toThrow('Error reason requires a short note');
});

test('deleting an open preorder removes it entirely', async () => {
  const catalog = createCatalog();

  const dragon = await catalog.createItem({
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
  });

  const { saleNumber } = await catalog.recordQuickSale({
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
    paymentMethod: 'pay_on_pickup',
    cashReceivedCents: null,
    name: 'Emma',
    notes: 'Saturday pickup',
    completeDate: '2026-08-30',
    isPreorder: true,
  });

  await catalog.deleteOpenPreorder(saleNumber);

  expect(await catalog.getSale(saleNumber)).toBeNull();
  expect(await catalog.listPreorderSales()).toHaveLength(0);
});

test('cancelled sales appear in export with zero money contribution', async () => {
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

  await catalog.cancelSale(saleNumber, { kind: 'return' });

  const rows = await catalog.listSalesExportRows('2000-01-01', '2100-01-01');
  expect(rows).toHaveLength(1);
  expect(rows[0]).toMatchObject({
    saleNumber: 1,
    itemName: 'Dragon',
    quantity: 1,
    saleTotalCents: 0,
    priceCents: 0,
    costCents: 0,
    cancelled: true,
    cancelReason: 'return',
    cancelNote: null,
  });
});
