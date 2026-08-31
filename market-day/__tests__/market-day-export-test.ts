import { buildMarketDayCsv, buildPreorderPrintout, computeExportSummary, marketDayExportFilename } from '@/lib/market-day-export';

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
      changeKeptCents: 200,
      customerName: null,
    },
  ]);

  expect(csv.startsWith(
    'Sale Number,Date/Time,Market Day,Item Name,Quantity,Unit Price,Unit Cost,Line Total,Line Profit,Sale Total,Payment Method,Cash Received,Change Kept,Customer Name\n',
  )).toBe(true);
  expect(csv).toContain('Demo Market Day – Aug 28, 2026');
  expect(csv).toContain('Dragon');
  expect(csv).toContain('4.00');
  expect(csv).toContain('1.00');
  expect(csv).toContain('8.00');
  expect(csv).toContain('6.00');
  expect(csv).toContain('Cash');
  expect(csv).toContain('10.00');
  expect(csv).toContain('2.00');
  const summaryLines = csv.trim().split('\n').slice(-4);
  expect(summaryLines).toEqual([
    'Total (without tips),,,,,,,,,8.00,,,,',
    'Gross (without tips),,,,,,,,,8.00,,,,',
    'Profit (without tips),,,,,,,,,6.00,,,,',
    'Tips total,,,,,,,,,2.00,,,,',
  ]);
});

test('computeExportSummary dedupes sale totals and tips across line items', () => {
  expect(
    computeExportSummary([
      {
        saleNumber: 1,
        createdAt: '2026-08-28T20:32:00.000Z',
        marketDayName: 'Fair',
        itemName: 'Dragon',
        quantity: 2,
        priceCents: 400,
        costCents: 100,
        saleTotalCents: 800,
        paymentMethod: 'cash',
        cashReceivedCents: 1000,
        changeKeptCents: 200,
        customerName: null,
      },
      {
        saleNumber: 2,
        createdAt: '2026-08-28T21:00:00.000Z',
        marketDayName: 'Fair',
        itemName: 'Unicorn',
        quantity: 1,
        priceCents: 300,
        costCents: 100,
        saleTotalCents: 300,
        paymentMethod: 'venmo_zelle',
        cashReceivedCents: null,
        changeKeptCents: 0,
        customerName: 'Emma',
      },
    ]),
  ).toEqual({
    totalWithoutTipsCents: 1100,
    grossWithoutTipsCents: 1100,
    profitWithoutTipsCents: 800,
    tipsTotalCents: 200,
  });
});

test('computeExportSummary sums every line item for gross and profit', () => {
  expect(
    computeExportSummary([
      {
        saleNumber: 1,
        createdAt: '2026-08-28T20:32:00.000Z',
        marketDayName: 'Fair',
        itemName: 'Dragon',
        quantity: 2,
        priceCents: 400,
        costCents: 100,
        saleTotalCents: 1000,
        paymentMethod: 'cash',
        cashReceivedCents: 1000,
        changeKeptCents: 0,
        customerName: null,
      },
      {
        saleNumber: 1,
        createdAt: '2026-08-28T20:32:00.000Z',
        marketDayName: 'Fair',
        itemName: 'Pokeball',
        quantity: 1,
        priceCents: 200,
        costCents: 50,
        saleTotalCents: 1000,
        paymentMethod: 'cash',
        cashReceivedCents: 1000,
        changeKeptCents: 0,
        customerName: null,
      },
    ]),
  ).toEqual({
    totalWithoutTipsCents: 1000,
    grossWithoutTipsCents: 1000,
    profitWithoutTipsCents: 750,
    tipsTotalCents: 0,
  });
});

test('marketDayExportFilename sanitizes the Market Day name', () => {
  expect(marketDayExportFilename('Demo Market Day – Aug 28, 2026')).toBe(
    'Demo-Market-Day-Aug-28-2026-sales.csv',
  );
});

test('buildPreorderPrintout includes prep summary and checkbox lines per order', () => {
  const printout = buildPreorderPrintout(
    [{ itemId: 1, name: 'Dragon', icon: '🐉', quantity: 3 }],
    [
      {
        saleNumber: 1,
        createdAt: '2026-08-28T20:32:00.000Z',
        customerName: 'Emma',
        notes: 'Saturday pickup',
        itemName: 'Dragon',
        icon: '🐉',
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
        icon: '🦄',
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
