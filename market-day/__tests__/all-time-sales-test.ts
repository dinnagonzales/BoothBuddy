import { createCatalog } from '@/lib/catalog';

test('all-time sales aggregates stats across every market day', async () => {
  const catalog = createCatalog();

  const dragon = await catalog.createItem({
    name: 'Dragon',
    emoji: '🐉',
    costCents: 100,
    priceCents: 400,
  });
  const springDay = await catalog.startMarketDay('Spring Fair 2026');
  await catalog.recordSale({
    marketDayId: springDay.id,
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
  const fallDay = await catalog.startMarketDay('Fall Fair 2026');
  await catalog.recordSale({
    marketDayId: fallDay.id,
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

  expect(await catalog.getAllTimeStats()).toEqual({
    totalCents: 1200,
    itemCount: 3,
    profitCents: 900,
    cashCents: 400,
    venmoCents: 800,
    tipsCents: 0,
  });
});

test('all-time sales list includes sale date context and market day name', async () => {
  const catalog = createCatalog();

  const dragon = await catalog.createItem({
    name: 'Dragon',
    emoji: '🐉',
    costCents: 100,
    priceCents: 400,
  });
  const springDay = await catalog.startMarketDay('Spring Fair 2026');
  const { saleNumber: firstSaleNumber } = await catalog.recordSale({
    marketDayId: springDay.id,
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
  const fallDay = await catalog.startMarketDay('Fall Fair 2026');
  const { saleNumber: secondSaleNumber } = await catalog.recordSale({
    marketDayId: fallDay.id,
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
    paymentMethod: 'venmo_zelle',
    cashReceivedCents: null,
    name: 'Emma',
  });

  const sales = await catalog.listAllTimeSales();
  expect(sales).toHaveLength(2);
  expect(sales[0]).toMatchObject({
    saleNumber: secondSaleNumber,
    totalCents: 400,
    paymentMethod: 'venmo_zelle',
    name: 'Emma',
    marketDayName: 'Fall Fair 2026',
  });
  expect(sales[1]).toMatchObject({
    saleNumber: firstSaleNumber,
    totalCents: 400,
    paymentMethod: 'cash',
    name: null,
    marketDayName: 'Spring Fair 2026',
  });
});

test('all-time sales list is empty before any sales are logged', async () => {
  const catalog = createCatalog();

  expect(await catalog.getAllTimeStats()).toEqual({
    totalCents: 0,
    itemCount: 0,
    profitCents: 0,
    cashCents: 0,
    venmoCents: 0,
    tipsCents: 0,
  });
  expect(await catalog.listAllTimeSales()).toEqual([]);
});
