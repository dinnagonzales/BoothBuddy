/** Minimal async SQLite surface used by sales migrations (expo-sqlite or test adapters). */
export type SalesSchemaDb = {
  execAsync: (source: string) => Promise<void>;
  getAllAsync: <T>(source: string) => Promise<T[]>;
  getFirstAsync: <T>(source: string) => Promise<T | null>;
};

const SALES_CREATE = `
  CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_number INTEGER NOT NULL UNIQUE,
    market_day_id INTEGER REFERENCES market_days(id),
    total_cents INTEGER NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'venmo_zelle', 'pay_on_pickup')),
    is_preorder INTEGER NOT NULL DEFAULT 0,
    cash_received_cents INTEGER,
    change_kept INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    exported_at TEXT
  );
`;

async function tableColumns(db: SalesSchemaDb, table: string): Promise<string[]> {
  const columns = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${table})`);
  return columns.map((column) => column.name);
}

async function ensureAdditiveSalesColumns(db: SalesSchemaDb): Promise<void> {
  const salesColumns = await tableColumns(db, 'sales');
  if (!salesColumns.includes('name')) {
    await db.execAsync('ALTER TABLE sales ADD COLUMN name TEXT');
  }
  if (!salesColumns.includes('notes')) {
    await db.execAsync('ALTER TABLE sales ADD COLUMN notes TEXT');
  }
  if (!salesColumns.includes('complete_date')) {
    await db.execAsync('ALTER TABLE sales ADD COLUMN complete_date TEXT');
  }
  if (!salesColumns.includes('change_kept')) {
    await db.execAsync('ALTER TABLE sales ADD COLUMN change_kept INTEGER NOT NULL DEFAULT 0');
  }
  if (!salesColumns.includes('is_preorder')) {
    await db.execAsync('ALTER TABLE sales ADD COLUMN is_preorder INTEGER NOT NULL DEFAULT 0');
  }
}

/**
 * Migrates the sales table to the current shape.
 *
 * Additive columns are ensured before and after the pay_on_pickup rebuild. The old
 * order added change_kept then rebuilt into a table that omitted it, which broke
 * complete-sale INSERTs with "table sales has no column named change_kept".
 */
export async function migrateSalesTable(db: SalesSchemaDb): Promise<void> {
  await db.execAsync(SALES_CREATE);
  await ensureAdditiveSalesColumns(db);

  const salesTableSql = await db.getFirstAsync<{ sql: string | null }>(
    "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'sales'",
  );
  if (salesTableSql?.sql && !salesTableSql.sql.includes('pay_on_pickup')) {
    await db.execAsync('PRAGMA foreign_keys=OFF');
    try {
      await db.execAsync(`
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
          complete_date TEXT,
          change_kept INTEGER NOT NULL DEFAULT 0,
          is_preorder INTEGER NOT NULL DEFAULT 0
        );
        INSERT INTO sales_preorder_migration (
          id, sale_number, market_day_id, total_cents, payment_method, cash_received_cents,
          created_at, exported_at, name, notes, complete_date, change_kept, is_preorder
        )
        SELECT
          id, sale_number, market_day_id, total_cents, payment_method, cash_received_cents,
          created_at, exported_at, name, notes, complete_date, change_kept, 0
        FROM sales;
        DROP TABLE sales;
        ALTER TABLE sales_preorder_migration RENAME TO sales;
      `);
    } finally {
      await db.execAsync('PRAGMA foreign_keys=ON');
    }

    const violations = await db.getAllAsync<{
      table: string;
      rowid: number;
      parent: string;
      fkid: number;
    }>('PRAGMA foreign_key_check');
    if (violations.length > 0) {
      console.warn(
        `[db] foreign_key_check found ${violations.length} violation(s) after sales rebuild`,
        violations,
      );
    }
  }

  // Re-ensure after rebuild so a incomplete migration table cannot leave columns missing.
  await ensureAdditiveSalesColumns(db);
}
