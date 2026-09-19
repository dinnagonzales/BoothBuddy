import { createCatalog } from '@/lib/catalog';
import { countActiveSales, countCancelledSales } from '@/lib/sale-cancel';

test('sale count badge excludes cancelled sales so it matches dollar totals', async () => {
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
    cashReceivedCents: null,
  });

  await catalog.cancelSale(first.saleNumber, { kind: 'return' });

  const sales = await catalog.listSalesForMarketDay(marketDay.id);
  const stats = await catalog.getMarketDayStats(marketDay.id);

  expect(sales).toHaveLength(2);
  expect(countActiveSales(sales)).toBe(1);
  expect(countCancelledSales(sales)).toBe(1);
  // Badge count must agree with dollar totals (one $4 sale left).
  expect(countActiveSales(sales)).toBe(1);
  expect(stats.totalCents).toBe(400);
  // Using sales.length would disagree with totals.
  expect(sales.length).not.toBe(countActiveSales(sales));
});
