import { DatabaseSync } from 'node:sqlite';

import { migrateSalesTable, type SalesSchemaDb } from '@/lib/db/sales-schema';

function createNodeSqliteAdapter(db: DatabaseSync): SalesSchemaDb {
  return {
    execAsync: async (source) => {
      db.exec(source);
    },
    getAllAsync: async <T>(source: string) => db.prepare(source).all() as T[],
    getFirstAsync: async <T>(source: string) => (db.prepare(source).get() as T | undefined) ?? null,
  };
}

function createMarketDaysStub(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS market_days (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    );
  `);
}

function insertCompleteSale(db: DatabaseSync) {
  db.prepare(
    `INSERT INTO sales (sale_number, market_day_id, total_cents, payment_method, cash_received_cents, change_kept, name, notes, complete_date, is_preorder)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(1, null, 400, 'cash', 500, 1, null, null, null, 0);
}

test('legacy sales rebuild keeps change_kept so complete sale can insert', async () => {
  const db = new DatabaseSync(':memory:');
  createMarketDaysStub(db);
  db.exec(`
    CREATE TABLE sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_number INTEGER NOT NULL UNIQUE,
      market_day_id INTEGER,
      total_cents INTEGER NOT NULL,
      payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'venmo_zelle')),
      cash_received_cents INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      exported_at TEXT,
      name TEXT,
      notes TEXT
    );
    INSERT INTO sales (sale_number, total_cents, payment_method) VALUES (99, 100, 'cash');
  `);

  await migrateSalesTable(createNodeSqliteAdapter(db));

  expect(() => insertCompleteSale(db)).not.toThrow();
  const columns = db
    .prepare('PRAGMA table_info(sales)')
    .all()
    .map((column) => (column as { name: string }).name);
  expect(columns).toEqual(expect.arrayContaining(['change_kept', 'complete_date', 'is_preorder']));
});

test('fresh sales schema supports change_kept insert after migrate', async () => {
  const db = new DatabaseSync(':memory:');
  createMarketDaysStub(db);
  await migrateSalesTable(createNodeSqliteAdapter(db));
  expect(() => insertCompleteSale(db)).not.toThrow();
});
