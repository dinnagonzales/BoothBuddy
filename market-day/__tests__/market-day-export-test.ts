import { buildMarketDayCsv, buildPreorderPrintout, marketDayExportFilename } from '@/lib/market-day-export';

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

test('buildPreorderPrintout includes prep summary and checkbox lines per order', () => {
  const printout = buildPreorderPrintout(
    [{ itemId: 1, name: 'Dragon', emoji: '🐉', quantity: 3 }],
    [
      {
        saleNumber: 1,
        createdAt: '2026-08-28T20:32:00.000Z',
        customerName: 'Emma',
        notes: 'Saturday pickup',
        itemName: 'Dragon',
        emoji: '🐉',
        quantity: 2,
        priceCents: 400,
        saleTotalCents: 800,
      },
      {
        saleNumber: 2,
        createdAt: '2026-08-28T21:00:00.000Z',
        customerName: 'Jake',
        notes: 'Sunday',
        itemName: 'Unicorn',
        emoji: '🦄',
        quantity: 1,
        priceCents: 300,
        saleTotalCents: 300,
      },
    ],
  );

  expect(printout).toContain('PREP SUMMARY');
  expect(printout).toContain('3x 🐉 Dragon');
  expect(printout).toContain('ORDERS (2)');
  expect(printout).toContain('#1 · Emma · Saturday pickup');
  expect(printout).toContain('[ ] 2x 🐉 Dragon ($8.00)');
  expect(printout).toContain('#2 · Jake · Sunday');
  expect(printout).toContain('[ ] 1x 🦄 Unicorn ($3.00)');
});
