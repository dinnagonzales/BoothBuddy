import { createCatalog } from '@/lib/catalog';

test('admin dashboard shows total revenue and item count for the active Market Day', async () => {
  const catalog = createCatalog();

  const dragon = await catalog.createItem({
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
        itemId: dragon.id,
        name: 'Dragon',
        icon: '🐉',
        priceCents: 400,
        costCents: 100,
        quantity: 2,
      },
    ],
    paymentMethod: 'cash',
    cashReceivedCents: 1000,
  });

  expect(await catalog.getMarketDayStats(marketDay.id)).toEqual({
    totalCents: 800,
    itemCount: 2,
    profitCents: 600,
    cashCents: 800,
    venmoCents: 0,
    tipsCents: 0,
  });
});

test('admin dashboard shows Cash and Venmo/Zelle totals separately', async () => {
  const catalog = createCatalog();

  const dragon = await catalog.createItem({
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
  });
  const pokeball = await catalog.createItem({
    name: 'Pokeball',
    icon: '⚪',
    costCents: 50,
    priceCents: 200,
  });
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
  await catalog.recordSale({
    marketDayId: marketDay.id,
    lines: [
      {
        itemId: pokeball.id,
        name: 'Pokeball',
        icon: '⚪',
        priceCents: 200,
        costCents: 50,
        quantity: 3,
      },
    ],
    paymentMethod: 'venmo_zelle',
    cashReceivedCents: null,
  });

  expect(await catalog.getMarketDayStats(marketDay.id)).toEqual({
    totalCents: 1000,
    itemCount: 4,
    profitCents: 750,
    cashCents: 400,
    venmoCents: 600,
    tipsCents: 0,
  });
});

test('admin dashboard lists every Sale with number, time, total, and payment method', async () => {
  const catalog = createCatalog();

  const dragon = await catalog.createItem({
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

  const sales = await catalog.listSalesForMarketDay(marketDay.id);

  expect(sales).toHaveLength(2);
  expect(sales[0]).toEqual({
    saleNumber: 1,
    totalCents: 400,
    paymentMethod: 'cash',
    name: null,
    notes: null,
    completeDate: null,
    createdAt: expect.any(String),
  });
  expect(sales[1]).toEqual({
    saleNumber: 2,
    totalCents: 800,
    paymentMethod: 'venmo_zelle',
    name: null,
    notes: null,
    completeDate: null,
    createdAt: expect.any(String),
  });
});

test('seller Home does not include admin sales totals', async () => {
  const catalog = createCatalog();

  const dragon = await catalog.createItem({
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

  const sellerItems = await catalog.listForSeller();
  expect(sellerItems[0]).not.toHaveProperty('totalCents');
  expect(sellerItems[0]).not.toHaveProperty('itemCount');

  const activeDay = await catalog.getActiveMarketDay();
  expect(activeDay).toEqual({ id: marketDay.id, name: 'Spring Fair 2026' });
  expect(activeDay).not.toHaveProperty('totalCents');
});

test('admin dashboard shows an empty Sale list before any Sales are logged', async () => {
  const catalog = createCatalog();

  await catalog.createItem({
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
  });
  const marketDay = await catalog.startMarketDay('Spring Fair 2026');

  expect(await catalog.listSalesForMarketDay(marketDay.id)).toEqual([]);
  expect(await catalog.getMarketDayStats(marketDay.id)).toEqual({
    totalCents: 0,
    itemCount: 0,
    profitCents: 0,
    cashCents: 0,
    venmoCents: 0,
    tipsCents: 0,
  });
});
