import { createCatalog } from '@/lib/catalog';

test('Quick Sale saves to Running Tab with no Market Day', async () => {
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
    paymentMethod: 'cash',
    cashReceivedCents: 500,
  });

  const sale = await catalog.getSale(saleNumber);
  expect(sale).toMatchObject({
    saleNumber: 1,
    totalCents: 400,
    paymentMethod: 'cash',
    name: null,
    notes: null,
  });

  const allTimeSales = await catalog.listAllTimeSales();
  expect(allTimeSales).toHaveLength(1);
  expect(allTimeSales[0]).toMatchObject({
    saleNumber: 1,
    totalCents: 400,
    marketDayName: null,
  });
});

test('Quick Sale during an Active Market Day still saves to Running Tab', async () => {
  const catalog = createCatalog();

  const dragon = await catalog.createItem({
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
  });
  const marketDay = await catalog.startMarketDay('Spring Fair 2026');

  await catalog.recordQuickSale({
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
    cashReceivedCents: null,
  });

  expect(await catalog.getMarketDayStats(marketDay.id)).toEqual({
    totalCents: 0,
    itemCount: 0,
    profitCents: 0,
    cashCents: 0,
    venmoCents: 0,
    tipsCents: 0,
  });

  const allTimeSales = await catalog.listAllTimeSales();
  expect(allTimeSales).toHaveLength(1);
  expect(allTimeSales[0].marketDayName).toBeNull();
});

test('Quick Sale can include optional name and notes', async () => {
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
    paymentMethod: 'cash',
    cashReceivedCents: 500,
    name: 'Porch pickup',
    notes: 'Preorder for Emma',
  });

  expect(await catalog.getSale(saleNumber)).toMatchObject({
    name: 'Porch pickup',
    notes: 'Preorder for Emma',
  });
});

test('listSalesExportRows includes all completed sales in the date range', async () => {
  jest.useFakeTimers();

  const catalog = createCatalog();
  const dragon = await catalog.createItem({
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
  });

  jest.setSystemTime(new Date('2026-08-10T15:00:00.000Z'));
  const marketDay = await catalog.startMarketDay('Spring Fair 2026');
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
    paymentMethod: 'cash',
    cashReceivedCents: 500,
  });

  jest.setSystemTime(new Date('2026-08-20T15:00:00.000Z'));
  await catalog.recordQuickSale({
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
    cashReceivedCents: null,
  });

  expect(await catalog.listSalesExportRows('2026-08-10', '2026-08-10')).toHaveLength(1);
  expect(await catalog.listSalesExportRows('2026-08-20', '2026-08-20')).toHaveLength(1);
  expect(await catalog.listSalesExportRows('2026-08-10', '2026-08-20')).toHaveLength(2);
  expect((await catalog.listSalesExportRows('2026-08-10', '2026-08-10'))[0].marketDayName).toBe(
    'Spring Fair 2026',
  );
  expect((await catalog.listSalesExportRows('2026-08-20', '2026-08-20'))[0].marketDayName).toBe('');

  jest.useRealTimers();
});
