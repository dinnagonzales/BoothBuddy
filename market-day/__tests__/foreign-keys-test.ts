import { ItemHasSalesError } from '@/lib/market-day';
import { clearShopData } from '@/lib/db/reset';
import { initDatabase } from '@/lib/db/schema';
import {
  createItem,
  createSale,
  deleteItem,
  deleteMarketDay,
  deleteSale,
  replaceSaleContents,
  startMarketDay,
} from '@/lib/db/queries';
import { withWriteTransaction } from '@/lib/db/write-transaction';
import {
  createTestDb,
  createTwoConnectionTestDb,
  foreignKeysEnabled,
} from './helpers/sqlite-test-db';

test('(a) initDatabase enables foreign_keys pragma', async () => {
  const { raw, db } = createTestDb();
  expect(raw.prepare('PRAGMA foreign_keys').get() as { foreign_keys: number }).toEqual({
    foreign_keys: 0,
  });

  await initDatabase(db);

  expect(await foreignKeysEnabled(db)).toBe(1);
});

test('(b) inserting a line_item with nonexistent sale_id fails', async () => {
  const { db } = createTestDb();
  await initDatabase(db);

  const item = await createItem(db, {
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
  });

  await expect(
    db.runAsync(
      `INSERT INTO line_items (sale_id, item_id, quantity, price_cents, cost_cents)
       VALUES (?, ?, ?, ?, ?)`,
      999_999,
      item.id,
      1,
      400,
      100,
    ),
  ).rejects.toThrow(/FOREIGN KEY constraint failed/i);
});

test('(c) deleting an item that has line_items fails cleanly', async () => {
  const { db } = createTestDb();
  await initDatabase(db);

  const item = await createItem(db, {
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
  });
  const marketDay = await startMarketDay(db, 'Spring Fair 2026', '2026-03-01T12:00:00.000Z');
  await createSale(db, {
    marketDayId: marketDay.id,
    lines: [
      {
        itemId: item.id,
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

  await expect(deleteItem(db, item.id)).rejects.toThrow(ItemHasSalesError);
});

test('(d) clearShopData and deleteMarketDay still work with FKs on', async () => {
  const { db } = createTestDb();
  await initDatabase(db);

  const item = await createItem(db, {
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
  });
  const marketDay = await startMarketDay(db, 'Spring Fair 2026', '2026-03-01T12:00:00.000Z');
  await createSale(db, {
    marketDayId: marketDay.id,
    lines: [
      {
        itemId: item.id,
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

  await db.runAsync(`UPDATE market_days SET closed_at = datetime('now') WHERE id = ?`, marketDay.id);
  await expect(deleteMarketDay(db, marketDay.id)).resolves.toBeUndefined();

  const another = await createItem(db, {
    name: 'Unicorn',
    icon: '🦄',
    costCents: 150,
    priceCents: 500,
  });
  const day = await startMarketDay(db, 'Fall Fair 2026', '2026-09-01T12:00:00.000Z');
  await createSale(db, {
    marketDayId: day.id,
    lines: [
      {
        itemId: another.id,
        name: 'Unicorn',
        icon: '🦄',
        priceCents: 500,
        costCents: 150,
        quantity: 1,
      },
    ],
    paymentMethod: 'cash',
    cashReceivedCents: 500,
  });

  await expect(clearShopData(db)).resolves.toBeUndefined();
  expect(await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) AS c FROM items')).toEqual({
    c: 0,
  });
  expect(await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) AS c FROM sales')).toEqual({
    c: 0,
  });
  expect(await foreignKeysEnabled(db)).toBe(1);
});

test('exclusive-style second connection does not inherit foreign_keys (old bug)', async () => {
  const { main, exclusive } = createTwoConnectionTestDb();
  await initDatabase(main);

  expect(await foreignKeysEnabled(main)).toBe(1);
  expect(await foreignKeysEnabled(exclusive)).toBe(0);

  const item = await createItem(main, {
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
  });

  // Orphan write on the exclusive-style connection is accepted when FKs are off.
  await exclusive.runAsync(
    `INSERT INTO line_items (sale_id, item_id, quantity, price_cents, cost_cents)
     VALUES (?, ?, ?, ?, ?)`,
    999_999,
    item.id,
    1,
    400,
    100,
  );

  const orphans = await main.getFirstAsync<{ c: number }>(
    'SELECT COUNT(*) AS c FROM line_items WHERE sale_id = 999999',
  );
  expect(orphans).toEqual({ c: 1 });
});

test('withWriteTransaction rejects orphan line_item (createSale path)', async () => {
  const { db } = createTestDb();
  await initDatabase(db);

  const marketDay = await startMarketDay(db, 'Spring Fair 2026', '2026-03-01T12:00:00.000Z');

  await expect(
    createSale(db, {
      marketDayId: marketDay.id,
      lines: [
        {
          itemId: 999_999,
          name: 'Ghost',
          icon: '👻',
          priceCents: 400,
          costCents: 100,
          quantity: 1,
        },
      ],
      paymentMethod: 'cash',
      cashReceivedCents: 400,
    }),
  ).rejects.toThrow(/FOREIGN KEY constraint failed/i);

  expect(await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) AS c FROM sales')).toEqual({
    c: 0,
  });
  expect(await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) AS c FROM line_items')).toEqual({
    c: 0,
  });
});

test('withWriteTransaction rejects orphan line_item inside replaceSaleContents', async () => {
  const { db } = createTestDb();
  await initDatabase(db);

  const item = await createItem(db, {
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
  });
  const marketDay = await startMarketDay(db, 'Spring Fair 2026', '2026-03-01T12:00:00.000Z');
  const sale = await createSale(db, {
    marketDayId: marketDay.id,
    lines: [
      {
        itemId: item.id,
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
    replaceSaleContents(db, sale.id, {
      lines: [
        {
          itemId: 999_999,
          name: 'Ghost',
          icon: '👻',
          priceCents: 400,
          costCents: 100,
          quantity: 1,
        },
      ],
      paymentMethod: 'cash',
      cashReceivedCents: 400,
    }),
  ).rejects.toThrow(/FOREIGN KEY constraint failed/i);

  const lines = await db.getAllAsync<{ item_id: number }>(
    'SELECT item_id FROM line_items WHERE sale_id = ?',
    sale.id,
  );
  expect(lines).toEqual([{ item_id: item.id }]);
});

test('deleteSale rolls back when a step fails (via withWriteTransaction)', async () => {
  const { db } = createTestDb();
  await initDatabase(db);

  const item = await createItem(db, {
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
  });
  const marketDay = await startMarketDay(db, 'Spring Fair 2026', '2026-03-01T12:00:00.000Z');
  const sale = await createSale(db, {
    marketDayId: marketDay.id,
    lines: [
      {
        itemId: item.id,
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

  const originalRun = db.runAsync.bind(db);
  db.runAsync = (async (source: string, ...params: unknown[]) => {
    if (/DELETE FROM sales/i.test(source)) {
      throw new Error('injected deleteSale failure');
    }
    return originalRun(source, ...params);
  }) as typeof db.runAsync;

  await expect(deleteSale(db, sale.id)).rejects.toThrow('injected deleteSale failure');

  expect(
    await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) AS c FROM line_items WHERE sale_id = ?', sale.id),
  ).toEqual({ c: 1 });
  expect(
    await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) AS c FROM sales WHERE id = ?', sale.id),
  ).toEqual({ c: 1 });
});

test('two concurrent createSale calls both commit', async () => {
  const { db } = createTestDb();
  await initDatabase(db);

  const item = await createItem(db, {
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
  });
  const marketDay = await startMarketDay(db, 'Spring Fair 2026', '2026-03-01T12:00:00.000Z');
  const line = {
    itemId: item.id,
    name: 'Dragon',
    icon: '🐉',
    priceCents: 400,
    costCents: 100,
    quantity: 1,
  };

  const [a, b] = await Promise.all([
    createSale(db, {
      marketDayId: marketDay.id,
      lines: [line],
      paymentMethod: 'cash',
      cashReceivedCents: 400,
    }),
    createSale(db, {
      marketDayId: marketDay.id,
      lines: [line],
      paymentMethod: 'venmo_zelle',
      cashReceivedCents: null,
    }),
  ]);

  expect(a.id).not.toBe(b.id);
  expect(a.saleNumber).not.toBe(b.saleNumber);
  expect(await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) AS c FROM sales')).toEqual({
    c: 2,
  });
});

test('a failing write does not roll back a concurrent successful one', async () => {
  const { db } = createTestDb();
  await initDatabase(db);

  const item = await createItem(db, {
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
  });
  const marketDay = await startMarketDay(db, 'Spring Fair 2026', '2026-03-01T12:00:00.000Z');
  const line = {
    itemId: item.id,
    name: 'Dragon',
    icon: '🐉',
    priceCents: 400,
    costCents: 100,
    quantity: 1,
  };

  let salesInserts = 0;
  const originalRun = db.runAsync.bind(db);
  db.runAsync = (async (source: string, ...params: unknown[]) => {
    if (/INSERT INTO sales\b/i.test(source)) {
      salesInserts += 1;
      if (salesInserts === 2) {
        throw new Error('injected concurrent createSale failure');
      }
    }
    return originalRun(source, ...params);
  }) as typeof db.runAsync;

  const results = await Promise.allSettled([
    createSale(db, {
      marketDayId: marketDay.id,
      lines: [line],
      paymentMethod: 'cash',
      cashReceivedCents: 400,
    }),
    createSale(db, {
      marketDayId: marketDay.id,
      lines: [line],
      paymentMethod: 'venmo_zelle',
      cashReceivedCents: null,
    }),
  ]);

  const fulfilled = results.filter((r) => r.status === 'fulfilled');
  const rejected = results.filter((r) => r.status === 'rejected');
  expect(fulfilled).toHaveLength(1);
  expect(rejected).toHaveLength(1);
  expect(await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) AS c FROM sales')).toEqual({
    c: 1,
  });
  expect(await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) AS c FROM line_items')).toEqual({
    c: 1,
  });
});

test('withWriteTransaction only rolls back if BEGIN succeeded', async () => {
  const { db } = createTestDb();
  await initDatabase(db);

  await db.runAsync(
    `INSERT INTO items (name, icon, photo_uri, cost_cents, price_cents) VALUES (?, ?, ?, ?, ?)`,
    'Keep Me',
    '🧸',
    null,
    50,
    200,
  );

  const originalExec = db.execAsync.bind(db);
  let beginAttempts = 0;
  db.execAsync = (async (source: string) => {
    if (/^BEGIN\b/i.test(source.trim())) {
      beginAttempts += 1;
      if (beginAttempts === 1) {
        throw new Error('injected BEGIN failure');
      }
    }
    if (/^ROLLBACK\b/i.test(source.trim())) {
      throw new Error('ROLLBACK must not run when BEGIN failed');
    }
    return originalExec(source);
  }) as typeof db.execAsync;

  await expect(
    withWriteTransaction(db, async () => {
      throw new Error('should not reach task');
    }),
  ).rejects.toThrow('injected BEGIN failure');

  expect(
    await db.getFirstAsync<{ c: number }>(`SELECT COUNT(*) AS c FROM items WHERE name = 'Keep Me'`),
  ).toEqual({ c: 1 });
});
