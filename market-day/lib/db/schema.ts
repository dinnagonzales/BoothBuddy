import type { SQLiteDatabase } from 'expo-sqlite';

import { ensureActiveMarketDayMenu } from '@/lib/db/queries';

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    emoji TEXT NOT NULL,
    photo_uri TEXT,
    cost_cents INTEGER NOT NULL,
    price_cents INTEGER NOT NULL,
    archived INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS market_days (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    started_at TEXT NOT NULL DEFAULT (datetime('now')),
    closed_at TEXT,
    exported_at TEXT,
    needs_reexport INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS menu_items (
    market_day_id INTEGER NOT NULL REFERENCES market_days(id) ON DELETE CASCADE,
    item_id INTEGER NOT NULL REFERENCES items(id),
    sold_out INTEGER NOT NULL DEFAULT 0,
    removed INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (market_day_id, item_id)
  );

  CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_number INTEGER NOT NULL UNIQUE,
    market_day_id INTEGER REFERENCES market_days(id),
    total_cents INTEGER NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'venmo_zelle', 'pay_on_pickup')),
    is_preorder INTEGER NOT NULL DEFAULT 0,
    cash_received_cents INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    exported_at TEXT
  );

  CREATE TABLE IF NOT EXISTS line_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    item_id INTEGER NOT NULL REFERENCES items(id),
    quantity INTEGER NOT NULL,
    price_cents INTEGER NOT NULL,
    cost_cents INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS app_state (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`;

export async function initDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(SCHEMA);

  const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(items)');
  const hasRetired = columns.some((column) => column.name === 'retired');
  const hasArchived = columns.some((column) => column.name === 'archived');
  if (hasRetired && !hasArchived) {
    await db.execAsync('ALTER TABLE items RENAME COLUMN retired TO archived');
  }

  const marketDayColumns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(market_days)');
  const hasNeedsReexport = marketDayColumns.some((column) => column.name === 'needs_reexport');
  if (!hasNeedsReexport) {
    await db.execAsync(
      'ALTER TABLE market_days ADD COLUMN needs_reexport INTEGER NOT NULL DEFAULT 0',
    );
  }

  const salesColumns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(sales)');
  const hasSaleName = salesColumns.some((column) => column.name === 'name');
  if (!hasSaleName) {
    await db.execAsync('ALTER TABLE sales ADD COLUMN name TEXT');
  }
  const hasSaleNotes = salesColumns.some((column) => column.name === 'notes');
  if (!hasSaleNotes) {
    await db.execAsync('ALTER TABLE sales ADD COLUMN notes TEXT');
  }

  const salesTableSql = await db.getFirstAsync<{ sql: string | null }>(
    "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'sales'",
  );
  if (salesTableSql?.sql && !salesTableSql.sql.includes('pay_on_pickup')) {
    await db.execAsync(`
      PRAGMA foreign_keys=OFF;
      CREATE TABLE sales_preorder_migration (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sale_number INTEGER NOT NULL UNIQUE,
        market_day_id INTEGER REFERENCES market_days(id),
        total_cents INTEGER NOT NULL,
        payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'venmo_zelle', 'pay_on_pickup')),
        cash_received_cents INTEGER,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        exported_at TEXT,
        name TEXT,
        notes TEXT,
        is_preorder INTEGER NOT NULL DEFAULT 0
      );
      INSERT INTO sales_preorder_migration (
        id, sale_number, market_day_id, total_cents, payment_method, cash_received_cents,
        created_at, exported_at, name, notes, is_preorder
      )
      SELECT
        id, sale_number, market_day_id, total_cents, payment_method, cash_received_cents,
        created_at, exported_at, name, notes, 0
      FROM sales;
      DROP TABLE sales;
      ALTER TABLE sales_preorder_migration RENAME TO sales;
      PRAGMA foreign_keys=ON;
    `);
  } else {
    const refreshedColumns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(sales)');
    const hasIsPreorder = refreshedColumns.some((column) => column.name === 'is_preorder');
    if (!hasIsPreorder) {
      await db.execAsync('ALTER TABLE sales ADD COLUMN is_preorder INTEGER NOT NULL DEFAULT 0');
    }
  }

  await ensureActiveMarketDayMenu(db);
}
