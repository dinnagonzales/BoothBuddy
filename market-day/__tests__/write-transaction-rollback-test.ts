import { ItemHasSalesError } from '@/lib/market-day';
import { initDatabase } from '@/lib/db/schema';
import {
  archiveItem,
  createItem,
  createSale,
  deleteItem,
  deleteMarketDay,
  startMarketDay,
  unarchiveItem,
} from '@/lib/db/queries';
import { createTestDb, bindRunAsync, spyRunAsync } from '../test-utils/sqlite-test-db';

const dragonDraft = {
  name: 'Dragon',
  icon: '🐉',
  costCents: 100,
  priceCents: 400,
};

function failOnSql(
  db: Parameters<typeof spyRunAsync>[0],
  pattern: RegExp,
  message: string,
) {
  const originalRun = bindRunAsync(db);
  spyRunAsync(db, async (source, ...params) => {
    if (pattern.test(source)) {
      throw new Error(message);
    }
    return originalRun(source, ...params);
  });
}

test('createItem rolls back item insert if menu step fails', async () => {
  const { db } = createTestDb();
  await initDatabase(db);
  await startMarketDay(db, 'Spring Fair 2026', '2026-03-01T12:00:00.000Z');

  failOnSql(db, /INSERT OR IGNORE INTO menu_items/i, 'injected createItem menu failure');

  await expect(createItem(db, dragonDraft)).rejects.toThrow('injected createItem menu failure');
  expect(await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) AS c FROM items')).toEqual({
    c: 0,
  });
  expect(await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) AS c FROM menu_items')).toEqual({
    c: 0,
  });
});

test('archiveItem rolls back archive if menu step fails', async () => {
  const { db } = createTestDb();
  await initDatabase(db);
  const marketDay = await startMarketDay(db, 'Spring Fair 2026', '2026-03-01T12:00:00.000Z');
  const item = await createItem(db, dragonDraft);

  failOnSql(db, /UPDATE menu_items/i, 'injected archiveItem menu failure');

  await expect(archiveItem(db, item.id)).rejects.toThrow('injected archiveItem menu failure');

  expect(
    await db.getFirstAsync<{ archived: number }>('SELECT archived FROM items WHERE id = ?', item.id),
  ).toEqual({ archived: 0 });
  expect(
    await db.getFirstAsync<{ removed: number }>(
      'SELECT removed FROM menu_items WHERE market_day_id = ? AND item_id = ?',
      marketDay.id,
      item.id,
    ),
  ).toEqual({ removed: 0 });
});

test('unarchiveItem rolls back unarchive if menu step fails', async () => {
  const { db } = createTestDb();
  await initDatabase(db);
  await startMarketDay(db, 'Spring Fair 2026', '2026-03-01T12:00:00.000Z');
  const item = await createItem(db, dragonDraft);
  await archiveItem(db, item.id);

  failOnSql(db, /INSERT OR IGNORE INTO menu_items/i, 'injected unarchiveItem menu failure');

  await expect(unarchiveItem(db, item.id)).rejects.toThrow('injected unarchiveItem menu failure');

  expect(
    await db.getFirstAsync<{ archived: number }>('SELECT archived FROM items WHERE id = ?', item.id),
  ).toEqual({ archived: 1 });
});

test('deleteItem rolls back menu delete if item delete fails', async () => {
  const { db } = createTestDb();
  await initDatabase(db);
  const marketDay = await startMarketDay(db, 'Spring Fair 2026', '2026-03-01T12:00:00.000Z');
  const item = await createItem(db, dragonDraft);

  failOnSql(db, /DELETE FROM items\b/i, 'injected deleteItem failure');

  await expect(deleteItem(db, item.id)).rejects.toThrow('injected deleteItem failure');

  expect(
    await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) AS c FROM items WHERE id = ?', item.id),
  ).toEqual({ c: 1 });
  expect(
    await db.getFirstAsync<{ c: number }>(
      'SELECT COUNT(*) AS c FROM menu_items WHERE market_day_id = ? AND item_id = ?',
      marketDay.id,
      item.id,
    ),
  ).toEqual({ c: 1 });
});

test('deleteMarketDay rolls back sale deletes if day delete fails', async () => {
  const { db } = createTestDb();
  await initDatabase(db);

  const item = await createItem(db, dragonDraft);
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

  failOnSql(db, /DELETE FROM market_days\b/i, 'injected deleteMarketDay failure');

  await expect(deleteMarketDay(db, marketDay.id)).rejects.toThrow('injected deleteMarketDay failure');

  expect(await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) AS c FROM sales')).toEqual({
    c: 1,
  });
  expect(await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) AS c FROM line_items')).toEqual({
    c: 1,
  });
  expect(
    await db.getFirstAsync<{ c: number }>(
      'SELECT COUNT(*) AS c FROM market_days WHERE id = ?',
      marketDay.id,
    ),
  ).toEqual({ c: 1 });
});

test('deleteMarketDay does not deadlock with multiple sales', async () => {
  const { db } = createTestDb();
  await initDatabase(db);

  const item = await createItem(db, dragonDraft);
  const marketDay = await startMarketDay(db, 'Spring Fair 2026', '2026-03-01T12:00:00.000Z');
  const line = {
    itemId: item.id,
    name: 'Dragon',
    icon: '🐉',
    priceCents: 400,
    costCents: 100,
    quantity: 1,
  };
  await createSale(db, {
    marketDayId: marketDay.id,
    lines: [line],
    paymentMethod: 'cash',
    cashReceivedCents: 400,
  });
  await createSale(db, {
    marketDayId: marketDay.id,
    lines: [line],
    paymentMethod: 'venmo_zelle',
    cashReceivedCents: null,
  });
  await db.runAsync(`UPDATE market_days SET closed_at = datetime('now') WHERE id = ?`, marketDay.id);

  await expect(deleteMarketDay(db, marketDay.id)).resolves.toBeUndefined();

  expect(await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) AS c FROM sales')).toEqual({
    c: 0,
  });
  expect(
    await db.getFirstAsync<{ c: number }>(
      'SELECT COUNT(*) AS c FROM market_days WHERE id = ?',
      marketDay.id,
    ),
  ).toEqual({ c: 0 });
}, 3000);

test('deleteItem racing a line_items insert keeps the item and surfaces ItemHasSalesError', async () => {
  const { db } = createTestDb();
  await initDatabase(db);

  const item = await createItem(db, dragonDraft);
  const marketDay = await startMarketDay(db, 'Spring Fair 2026', '2026-03-01T12:00:00.000Z');

  // While deleteItem holds the write txn after the empty line_items check,
  // a concurrent createSale is serialized by the mutex and then the FK/check
  // path must reject deletion (or see the new line). Either way: no half-delete.
  const deletePromise = deleteItem(db, item.id);
  const salePromise = createSale(db, {
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

  const results = await Promise.allSettled([deletePromise, salePromise]);

  const itemStillThere = await db.getFirstAsync<{ c: number }>(
    'SELECT COUNT(*) AS c FROM items WHERE id = ?',
    item.id,
  );
  const lineCount = await db.getFirstAsync<{ c: number }>(
    'SELECT COUNT(*) AS c FROM line_items WHERE item_id = ?',
    item.id,
  );

  // Serialized outcomes: either delete wins first (item gone, sale FK-fails)
  // or sale wins first (item remains, delete throws ItemHasSalesError).
  const deleteResult = results[0];
  const saleResult = results[1];

  if (deleteResult.status === 'fulfilled') {
    expect(itemStillThere).toEqual({ c: 0 });
    expect(saleResult.status).toBe('rejected');
    expect(lineCount).toEqual({ c: 0 });
  } else {
    expect(deleteResult.reason).toBeInstanceOf(ItemHasSalesError);
    expect(itemStillThere).toEqual({ c: 1 });
    expect(saleResult.status).toBe('fulfilled');
    expect(lineCount).toEqual({ c: 1 });
  }
});

test('deleteItem still maps FK races to ItemHasSalesError inside the txn', async () => {
  const { db } = createTestDb();
  await initDatabase(db);

  const item = await createItem(db, dragonDraft);
  const marketDay = await startMarketDay(db, 'Spring Fair 2026', '2026-03-01T12:00:00.000Z');

  // Inject a line_item after the COUNT check by hijacking the menu delete step.
  const originalRun = bindRunAsync(db);
  spyRunAsync(db, async (source, ...params) => {
    if (/DELETE FROM menu_items WHERE item_id/i.test(source)) {
      const sale = await originalRun(
        `INSERT INTO sales (sale_number, market_day_id, total_cents, payment_method, cash_received_cents, change_kept, name, notes, complete_date, is_preorder)
         VALUES (1, ?, 400, 'cash', 400, 0, NULL, NULL, NULL, 0)`,
        marketDay.id,
      );
      await originalRun(
        `INSERT INTO line_items (sale_id, item_id, quantity, price_cents, cost_cents)
         VALUES (?, ?, 1, 400, 100)`,
        sale.lastInsertRowId,
        item.id,
      );
    }
    return originalRun(source, ...params);
  });

  await expect(deleteItem(db, item.id)).rejects.toThrow(ItemHasSalesError);

  expect(
    await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) AS c FROM items WHERE id = ?', item.id),
  ).toEqual({ c: 1 });
  expect(
    await db.getFirstAsync<{ c: number }>(
      'SELECT COUNT(*) AS c FROM menu_items WHERE item_id = ?',
      item.id,
    ),
  ).toEqual({ c: 1 });
});
