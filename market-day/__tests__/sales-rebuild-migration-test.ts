// @ts-expect-error Node built-in; project tsconfig has no @types/node (same as foreign-keys-test)
import { DatabaseSync } from 'node:sqlite';

import { migrateSalesTable, type SalesSchemaDb } from '@/lib/db/sales-schema';

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

function createThrowDuringRebuildAdapter(db: DatabaseSync): SalesSchemaDb {
  const base = createNodeSqliteAdapter(db);
  return {
    ...base,
    execAsync: async (source) => {
      if (source.includes('sales_preorder_migration')) {
        throw new Error('simulated rebuild failure');
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
      notes TEXT
    );
  `);
}

test('sales rebuild restores foreign_keys ON after success and leaves pay_on_pickup shape', async () => {
  const db = new DatabaseSync(':memory:');
  createOldSalesSchema(db);
  db.exec('PRAGMA foreign_keys=ON');
  db.prepare(
    `INSERT INTO sales (sale_number, total_cents, payment_method) VALUES (1, 400, 'cash')`,
  ).run();

  await migrateSalesTable(createNodeSqliteAdapter(db));

  const sql = (
    db.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'sales'").get() as {
      sql: string;
    }
  ).sql;
  expect(sql).toContain('pay_on_pickup');
  expect(db.prepare('PRAGMA foreign_keys').get()).toEqual({ foreign_keys: 1 });
  expect(db.prepare('SELECT COUNT(*) AS c FROM sales').get()).toEqual({ c: 1 });
  expect(db.prepare('PRAGMA foreign_key_check').all()).toEqual([]);
});

test('sales rebuild restores foreign_keys ON even when rebuild throws', async () => {
  const db = new DatabaseSync(':memory:');
  createOldSalesSchema(db);
  db.exec('PRAGMA foreign_keys=ON');
  db.prepare(
    `INSERT INTO sales (sale_number, total_cents, payment_method) VALUES (1, 400, 'cash')`,
  ).run();

  await expect(migrateSalesTable(createThrowDuringRebuildAdapter(db))).rejects.toThrow(
    /simulated rebuild failure/,
  );

  expect(db.prepare('PRAGMA foreign_keys').get()).toEqual({ foreign_keys: 1 });
});
