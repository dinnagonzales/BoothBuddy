import { buildMarketDayCsv, marketDayExportFilename } from '@/lib/market-day-export';

test('buildMarketDayCsv includes headers and one row per line item', () => {
  const csv = buildMarketDayCsv([
    {
      saleNumber: 1,
      createdAt: '2026-08-28T20:32:00.000Z',
      marketDayName: 'Demo Market Day – Aug 28, 2026',
      itemName: 'Dragon',
      quantity: 2,
      priceCents: 400,
      costCents: 100,
      saleTotalCents: 800,
      paymentMethod: 'cash',
      cashReceivedCents: 1000,
      customerName: null,
    },
  ]);

  expect(csv.startsWith(
    'Sale Number,Date/Time,Market Day,Item Name,Quantity,Unit Price,Unit Cost,Line Total,Line Profit,Sale Total,Payment Method,Cash Received,Customer Name\n',
  )).toBe(true);
  expect(csv).toContain('Demo Market Day – Aug 28, 2026');
  expect(csv).toContain('Dragon');
  expect(csv).toContain('4.00');
  expect(csv).toContain('1.00');
  expect(csv).toContain('8.00');
  expect(csv).toContain('6.00');
  expect(csv).toContain('Cash');
  expect(csv).toContain('10.00');
});

test('marketDayExportFilename sanitizes the Market Day name', () => {
  expect(marketDayExportFilename('Demo Market Day – Aug 28, 2026')).toBe(
    'Demo-Market-Day-Aug-28-2026-sales.csv',
  );
});
