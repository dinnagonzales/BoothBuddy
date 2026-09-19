// @ts-expect-error Node built-in; project tsconfig has no @types/node (same as foreign-keys-test)
import { DatabaseSync } from 'node:sqlite';

import {
  migrateSalesTable,
  salesSqlHasPayOnPickupPaymentCheck,
  type SalesSchemaDb,
} from '@/lib/db/sales-schema';

function createNodeSqliteAdapter(db: DatabaseSync): SalesSchemaDb {
  return {
    execAsync: async (source) => {
      db.exec(source);
    },
    getAllAsync: async <T>(source: string) => db.prepare(source).all() as T[],
    getFirstAsync: async <T>(source: string) =>
      (db.prepare(source).get() as T | undefined) ?? null,
  };
}

function createThrowAtDropSalesAdapter(db: DatabaseSync): SalesSchemaDb {
  const base = createNodeSqliteAdapter(db);
  return {
    ...base,
    execAsync: async (source) => {
      const normalized = source.replace(/\s+/g, ' ').trim().toUpperCase();
      if (normalized === 'DROP TABLE SALES') {
        throw new Error('simulated drop failure');
      }
      await base.execAsync(source);
    },
  };
}

function createOldSalesSchema(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS market_days (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    );
    CREATE TABLE sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_number INTEGER NOT NULL UNIQUE,
      market_day_id INTEGER REFERENCES market_days(id),
      total_cents INTEGER NOT NULL,
      payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'venmo_zelle')),
      cash_received_cents INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      exported_at TEXT,
      name TEXT,
      notes TEXT,
      complete_date TEXT,
      change_kept INTEGER NOT NULL DEFAULT 0,
      is_preorder INTEGER NOT NULL DEFAULT 0,
      cancelled INTEGER NOT NULL DEFAULT 0,
      cancel_reason TEXT,
      cancel_note TEXT
    );
    CREATE TABLE line_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
      item_id INTEGER NOT NULL REFERENCES items(id),
      quantity INTEGER NOT NULL,
      price_cents INTEGER NOT NULL,
      cost_cents INTEGER NOT NULL
    );
  `);
}

function seedSaleWithLineItem(
  db: DatabaseSync,
  opts: {
    saleNumber?: number;
    cancelled?: number;
    cancelReason?: string | null;
    cancelNote?: string | null;
  } = {},
) {
  const marketDay = db
    .prepare(`INSERT INTO market_days (name) VALUES ('Spring Fair')`)
    .run();
  const item = db.prepare(`INSERT INTO items (name) VALUES ('Dragon')`).run();
  const sale = db
    .prepare(
      `INSERT INTO sales (
         sale_number, market_day_id, total_cents, payment_method, cash_received_cents,
         name, notes, complete_date, change_kept, is_preorder,
         cancelled, cancel_reason, cancel_note
       ) VALUES (?, ?, 400, 'cash', 400, 'Ada', 'pickup Friday', '2026-03-07', 0, 0, ?, ?, ?)`,
    )
    .run(
      opts.saleNumber ?? 1,
      Number(marketDay.lastInsertRowid),
      opts.cancelled ?? 0,
      opts.cancelReason ?? null,
      opts.cancelNote ?? null,
    );
  db.prepare(
    `INSERT INTO line_items (sale_id, item_id, quantity, price_cents, cost_cents)
     VALUES (?, ?, 1, 400, 100)`,
  ).run(Number(sale.lastInsertRowid), Number(item.lastInsertRowid));
  return {
    saleId: Number(sale.lastInsertRowid),
    itemId: Number(item.lastInsertRowid),
  };
}

test('salesSqlHasPayOnPickupPaymentCheck: old-shape, new-shape, multi-line', () => {
  const oldShape = `
    CREATE TABLE sales (
      payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'venmo_zelle'))
    )
  `;
  const newShape = `
    CREATE TABLE sales (
      payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'venmo_zelle', 'pay_on_pickup'))
    )
  `;
  const multiLineOddWhitespace = `
    CREATE TABLE sales (
      payment_method TEXT NOT NULL
        CHECK
        (
          payment_method
            IN
            (
              'cash',
              'venmo_zelle',
              'pay_on_pickup'
            )
        )
    )
  `;
  const multiLineOld = `
    CREATE TABLE sales (
      payment_method TEXT NOT NULL
        CHECK ( payment_method IN (
          'cash',
          'venmo_zelle'
        ) )
    )
  `;

  expect(salesSqlHasPayOnPickupPaymentCheck(oldShape)).toBe(false);
  expect(salesSqlHasPayOnPickupPaymentCheck(newShape)).toBe(true);
  expect(salesSqlHasPayOnPickupPaymentCheck(multiLineOddWhitespace)).toBe(true);
  expect(salesSqlHasPayOnPickupPaymentCheck(multiLineOld)).toBe(false);
  expect(
    salesSqlHasPayOnPickupPaymentCheck(
      `CREATE TABLE sales (payment_method TEXT NOT NULL CHECK (PAYMENT_METHOD IN ('CASH', 'VENMO_ZELLE', 'PAY_ON_PICKUP')))`,
    ),
  ).toBe(true);
});

test('sales rebuild restores foreign_keys ON after success and leaves pay_on_pickup shape', async () => {
  const db = new DatabaseSync(':memory:');
  createOldSalesSchema(db);
  db.exec('PRAGMA foreign_keys=ON');
  seedSaleWithLineItem(db);

  await migrateSalesTable(createNodeSqliteAdapter(db));

  const sql = (
    db.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'sales'").get() as {
      sql: string;
    }
  ).sql;
  expect(salesSqlHasPayOnPickupPaymentCheck(sql)).toBe(true);
  expect(db.prepare('PRAGMA foreign_keys').get()).toEqual({ foreign_keys: 1 });
  expect(db.prepare('SELECT COUNT(*) AS c FROM sales').get()).toEqual({ c: 1 });
  expect(db.prepare('PRAGMA foreign_key_check').all()).toEqual([]);
});

test('sales rebuild keeps rows and line_item links intact', async () => {
  const db = new DatabaseSync(':memory:');
  createOldSalesSchema(db);
  db.exec('PRAGMA foreign_keys=ON');
  const { saleId, itemId } = seedSaleWithLineItem(db);

  await migrateSalesTable(createNodeSqliteAdapter(db));

  expect(db.prepare('SELECT COUNT(*) AS c FROM sales').get()).toEqual({ c: 1 });
  expect(db.prepare('SELECT COUNT(*) AS c FROM line_items').get()).toEqual({ c: 1 });
  expect(
    db
      .prepare(
        `SELECT sale_id, item_id FROM line_items WHERE sale_id = ? AND item_id = ?`,
      )
      .get(saleId, itemId),
  ).toEqual({ sale_id: saleId, item_id: itemId });
  expect(
    db.prepare(`SELECT id FROM sales WHERE id = ?`).get(saleId),
  ).toEqual({ id: saleId });
});

test('sales rebuild preserves cancelled / cancel_reason / cancel_note', async () => {
  const db = new DatabaseSync(':memory:');
  createOldSalesSchema(db);
  db.exec('PRAGMA foreign_keys=ON');
  seedSaleWithLineItem(db, {
    cancelled: 1,
    cancelReason: 'error',
    cancelNote: 'wrong item',
  });

  await migrateSalesTable(createNodeSqliteAdapter(db));

  expect(
    db
      .prepare(
        `SELECT cancelled, cancel_reason, cancel_note FROM sales WHERE sale_number = 1`,
      )
      .get(),
  ).toEqual({
    cancelled: 1,
    cancel_reason: 'error',
    cancel_note: 'wrong item',
  });
});

test('throw after DROP TABLE sales leaves original sales and line_items untouched', async () => {
  const db = new DatabaseSync(':memory:');
  createOldSalesSchema(db);
  db.exec('PRAGMA foreign_keys=ON');
  const { saleId } = seedSaleWithLineItem(db);

  await expect(migrateSalesTable(createThrowAtDropSalesAdapter(db))).rejects.toThrow(
    /simulated drop failure/,
  );

  expect(db.prepare('PRAGMA foreign_keys').get()).toEqual({ foreign_keys: 1 });
  expect(db.prepare('SELECT COUNT(*) AS c FROM sales').get()).toEqual({ c: 1 });
  expect(db.prepare('SELECT COUNT(*) AS c FROM line_items').get()).toEqual({ c: 1 });
  expect(db.prepare(`SELECT id FROM sales WHERE id = ?`).get(saleId)).toEqual({
    id: saleId,
  });
  expect(
    db.prepare(`SELECT sale_id FROM line_items WHERE sale_id = ?`).get(saleId),
  ).toEqual({ sale_id: saleId });
  // Rebuild aborted inside the transaction — no leftover sales_new.
  expect(
    db
      .prepare(
        `SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('sales_new', 'sales_preorder_migration')`,
      )
      .all(),
  ).toEqual([]);
});

test('second migrateSalesTable run is a no-op', async () => {
  const db = new DatabaseSync(':memory:');
  createOldSalesSchema(db);
  db.exec('PRAGMA foreign_keys=ON');
  seedSaleWithLineItem(db);

  await migrateSalesTable(createNodeSqliteAdapter(db));
  const sqlAfterFirst = (
    db.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'sales'").get() as {
      sql: string;
    }
  ).sql;

  await migrateSalesTable(createNodeSqliteAdapter(db));
  const sqlAfterSecond = (
    db.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'sales'").get() as {
      sql: string;
    }
  ).sql;

  expect(sqlAfterSecond).toBe(sqlAfterFirst);
  expect(db.prepare('SELECT COUNT(*) AS c FROM sales').get()).toEqual({ c: 1 });
  expect(db.prepare('SELECT COUNT(*) AS c FROM line_items').get()).toEqual({ c: 1 });
});

test('recovery: sales missing + leftover table renames back with data intact', async () => {
  const db = new DatabaseSync(':memory:');
  createOldSalesSchema(db);
  db.exec('PRAGMA foreign_keys=ON');
  const { saleId } = seedSaleWithLineItem(db, {
    cancelled: 1,
    cancelReason: 'return',
    cancelNote: null,
  });

  // Simulate old non-atomic crash: data lives in leftover, sales is gone.
  db.exec(`
    ALTER TABLE sales RENAME TO sales_preorder_migration;
  `);
  // Recreate empty would be wrong — leave sales missing.
  expect(
    db
      .prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'sales'`)
      .get(),
  ).toBeUndefined();

  await migrateSalesTable(createNodeSqliteAdapter(db));

  expect(db.prepare('SELECT COUNT(*) AS c FROM sales').get()).toEqual({ c: 1 });
  expect(
    db.prepare(`SELECT id, cancelled, cancel_reason FROM sales WHERE id = ?`).get(saleId),
  ).toEqual({ id: saleId, cancelled: 1, cancel_reason: 'return' });
  expect(db.prepare('SELECT COUNT(*) AS c FROM line_items').get()).toEqual({ c: 1 });
  expect(
    db
      .prepare(
        `SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'sales_preorder_migration'`,
      )
      .get(),
  ).toBeUndefined();
});

test('line_items are not cascade-deleted during the rebuild', async () => {
  const db = new DatabaseSync(':memory:');
  createOldSalesSchema(db);
  db.exec('PRAGMA foreign_keys=ON');
  const { saleId } = seedSaleWithLineItem(db);

  await migrateSalesTable(createNodeSqliteAdapter(db));

  expect(db.prepare('SELECT COUNT(*) AS c FROM line_items').get()).toEqual({ c: 1 });
  expect(
    db.prepare(`SELECT sale_id FROM line_items WHERE sale_id = ?`).get(saleId),
  ).toEqual({ sale_id: saleId });
});

test('sales rebuild restores foreign_keys ON even when rebuild throws', async () => {
  const db = new DatabaseSync(':memory:');
  createOldSalesSchema(db);
  db.exec('PRAGMA foreign_keys=ON');
  seedSaleWithLineItem(db);

  await expect(migrateSalesTable(createThrowAtDropSalesAdapter(db))).rejects.toThrow(
    /simulated drop failure/,
  );

  expect(db.prepare('PRAGMA foreign_keys').get()).toEqual({ foreign_keys: 1 });
});
