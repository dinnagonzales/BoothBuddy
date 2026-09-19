import { buildMarketDayCsv, buildPreorderPrintout, computeExportSummary, marketDayExportFilename } from '@/lib/market-day-export';

const activeRow = {
  cancelled: false as const,
  cancelReason: null,
  cancelNote: null,
};

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
      ...activeRow,
    },
  ]);

  expect(csv.startsWith(
    'Sale Number,Date/Time,Market Day,Item Name,Quantity,Unit Price,Unit Cost,Line Total,Line Profit,Sale Total,Payment Method,Cash Received,Change Kept,Customer Name,Status,Cancel Reason\n',
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
    'Total (without tips),,,,,,,,,8.00,,,,,,',
    'Gross (without tips),,,,,,,,,8.00,,,,,,',
    'Profit (without tips),,,,,,,,,6.00,,,,,,',
    'Tips total,,,,,,,,,2.00,,,,,,',
  ]);
});

test('buildMarketDayCsv marks cancelled sales with zero money and reason', () => {
  const csv = buildMarketDayCsv([
    {
      saleNumber: 7,
      createdAt: '2026-08-28T20:32:00.000Z',
      marketDayName: 'Fair',
      itemName: 'Dragon',
      quantity: 1,
      priceCents: 0,
      costCents: 0,
      saleTotalCents: 0,
      paymentMethod: 'cash',
      cashReceivedCents: null,
      changeKeptCents: 0,
      customerName: null,
      cancelled: true,
      cancelReason: 'return',
      cancelNote: null,
    },
  ]);

  expect(csv).toContain('Cancelled');
  expect(csv).toContain('Return');
  const dataLine = csv.trim().split('\n')[1];
  expect(dataLine).toContain(',0.00,0.00,0.00,0.00,0.00,');
});

test('computeExportSummary ignores cancelled sales when mixed with active ones', () => {
  expect(
    computeExportSummary([
      {
        saleNumber: 1,
        createdAt: '2026-08-28T20:32:00.000Z',
        marketDayName: 'Fair',
        itemName: 'Dragon',
        quantity: 1,
        priceCents: 400,
        costCents: 100,
        saleTotalCents: 400,
        paymentMethod: 'cash',
        cashReceivedCents: 400,
        changeKeptCents: 0,
        customerName: null,
        ...activeRow,
      },
      {
        saleNumber: 2,
        createdAt: '2026-08-28T21:00:00.000Z',
        marketDayName: 'Fair',
        itemName: 'Unicorn',
        quantity: 1,
        priceCents: 0,
        costCents: 0,
        saleTotalCents: 0,
        paymentMethod: 'cash',
        cashReceivedCents: null,
        changeKeptCents: 0,
        customerName: null,
        cancelled: true,
        cancelReason: 'return',
        cancelNote: null,
      },
    ]),
  ).toEqual({
    totalWithoutTipsCents: 400,
    grossWithoutTipsCents: 400,
    profitWithoutTipsCents: 300,
    tipsTotalCents: 0,
  });
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
        ...activeRow,
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
        ...activeRow,
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
        ...activeRow,
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
        ...activeRow,
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

test('buildMarketDayCsv prefixes formula-like free-text cells with a single quote', () => {
  const cases: { customerName: string; itemName: string; expectInCsv: string | RegExp }[] = [
    { customerName: '=1+1', itemName: 'Dragon', expectInCsv: "'=1+1" },
    { customerName: '+cmd', itemName: 'Dragon', expectInCsv: "'+cmd" },
    { customerName: '-2', itemName: 'Dragon', expectInCsv: "'-2" },
    { customerName: '@SUM(A1)', itemName: 'Dragon', expectInCsv: "'@SUM(A1)" },
    { customerName: 'a,b', itemName: 'Dragon', expectInCsv: '"a,b"' },
    { customerName: 'he said "hi"', itemName: 'Dragon', expectInCsv: '"he said ""hi"""' },
    { customerName: '🐉', itemName: '🐉', expectInCsv: '🐉' },
  ];

  for (const { customerName, itemName, expectInCsv } of cases) {
    const csv = buildMarketDayCsv([
      {
        saleNumber: 1,
        createdAt: '2026-08-28T20:32:00.000Z',
        marketDayName: 'Fair',
        itemName,
        quantity: 1,
        priceCents: -250,
        costCents: 0,
        saleTotalCents: -250,
        paymentMethod: 'cash',
        cashReceivedCents: null,
        changeKeptCents: 0,
        customerName,
        ...activeRow,
      },
    ]);

    const dataLine = csv.trim().split('\n')[1]!;
    expect(dataLine).toContain(',-2.50,');
    expect(dataLine).not.toMatch(/,'-2\.50/);
    if (typeof expectInCsv === 'string') {
      expect(dataLine).toContain(expectInCsv);
    } else {
      expect(dataLine).toMatch(expectInCsv);
    }
  }

  const multilineCsv = buildMarketDayCsv([
    {
      saleNumber: 1,
      createdAt: '2026-08-28T20:32:00.000Z',
      marketDayName: 'Fair',
      itemName: 'Dragon',
      quantity: 1,
      priceCents: 400,
      costCents: 100,
      saleTotalCents: 400,
      paymentMethod: 'cash',
      cashReceivedCents: 400,
      changeKeptCents: 0,
      customerName: 'line1\nline2',
      ...activeRow,
    },
  ]);
  expect(multilineCsv).toContain('"line1\nline2"');
});

test('buildPreorderPrintout neutralizes formula-like free-text for spreadsheet paste', () => {
  const printout = buildPreorderPrintout(
    [{ itemId: 1, name: '=1+1', icon: '🐉', quantity: 1 }],
    [
      {
        saleNumber: 1,
        createdAt: '2026-08-28T20:32:00.000Z',
        customerName: '+cmd',
        notes: '@SUM(A1)',
        itemName: '-2',
        icon: '🐉',
        quantity: 1,
        priceCents: 400,
        saleTotalCents: 400,
      },
    ],
  );

  expect(printout).toContain("'=1+1");
  expect(printout).toContain("'+cmd");
  expect(printout).toContain("'@SUM(A1)");
  expect(printout).toContain("'-2");
});
