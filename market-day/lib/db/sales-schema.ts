/** Minimal async SQLite surface used by sales migrations (expo-sqlite or test adapters). */
export type SalesSchemaDb = {
  execAsync: (source: string) => Promise<void>;
  getAllAsync: <T>(source: string) => Promise<T[]>;
  getFirstAsync: <T>(source: string) => Promise<T | null>;
};

const LEFTOVER_SALES_TABLES = ['sales_preorder_migration', 'sales_new'] as const;

/**
 * Single source of truth for the sales table body. Parameterize the table name so
 * rebuilds create `sales_new` from the same definition as `sales`.
 */
export function buildSalesCreateSql(
  tableName: string,
  options: { ifNotExists?: boolean } = {},
): string {
  const ifNotExists = options.ifNotExists ? 'IF NOT EXISTS ' : '';
  return `
  CREATE TABLE ${ifNotExists}${tableName} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_number INTEGER NOT NULL UNIQUE,
    market_day_id INTEGER REFERENCES market_days(id),
    total_cents INTEGER NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'venmo_zelle', 'pay_on_pickup')),
    is_preorder INTEGER NOT NULL DEFAULT 0,
    cash_received_cents INTEGER,
    change_kept INTEGER NOT NULL DEFAULT 0,
    cancelled INTEGER NOT NULL DEFAULT 0,
    cancel_reason TEXT CHECK (cancel_reason IS NULL OR cancel_reason IN ('return', 'error')),
    cancel_note TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    exported_at TEXT
  );
`;
}

const SALES_CREATE = buildSalesCreateSql('sales', { ifNotExists: true });

/**
 * True when sqlite_master SQL already has a payment_method CHECK that allows pay_on_pickup.
 * Whitespace/case normalized so multi-line CREATE TABLE strings match.
 */
export function salesSqlHasPayOnPickupPaymentCheck(sql: string): boolean {
  const normalized = sql.replace(/\s+/g, ' ').toLowerCase();
  const match = normalized.match(/check\s*\(\s*payment_method\s+in\s*\(([^)]*)\)/);
  if (!match) return false;
  return /['"]pay_on_pickup['"]/.test(match[1]);
}

async function tableExists(db: SalesSchemaDb, table: string): Promise<boolean> {
  // Table names are only from our constant allowlist / fixed 'sales' — not user input.
  const found = await db.getFirstAsync<{ name: string }>(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name = '${table}'`,
  );
  return found != null;
}

async function tableColumns(db: SalesSchemaDb, table: string): Promise<string[]> {
  const columns = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${table})`);
  return columns.map((column) => column.name);
}

async function ensureAdditiveSalesColumns(
  db: SalesSchemaDb,
  tableName: string = 'sales',
): Promise<void> {
  const salesColumns = await tableColumns(db, tableName);
  if (!salesColumns.includes('name')) {
    await db.execAsync(`ALTER TABLE ${tableName} ADD COLUMN name TEXT`);
  }
  if (!salesColumns.includes('notes')) {
    await db.execAsync(`ALTER TABLE ${tableName} ADD COLUMN notes TEXT`);
  }
  if (!salesColumns.includes('complete_date')) {
    await db.execAsync(`ALTER TABLE ${tableName} ADD COLUMN complete_date TEXT`);
  }
  if (!salesColumns.includes('change_kept')) {
    await db.execAsync(
      `ALTER TABLE ${tableName} ADD COLUMN change_kept INTEGER NOT NULL DEFAULT 0`,
    );
  }
  if (!salesColumns.includes('is_preorder')) {
    await db.execAsync(
      `ALTER TABLE ${tableName} ADD COLUMN is_preorder INTEGER NOT NULL DEFAULT 0`,
    );
  }
  if (!salesColumns.includes('cancelled')) {
    await db.execAsync(
      `ALTER TABLE ${tableName} ADD COLUMN cancelled INTEGER NOT NULL DEFAULT 0`,
    );
  }
  if (!salesColumns.includes('cancel_reason')) {
    await db.execAsync(`ALTER TABLE ${tableName} ADD COLUMN cancel_reason TEXT`);
  }
  if (!salesColumns.includes('cancel_note')) {
    await db.execAsync(`ALTER TABLE ${tableName} ADD COLUMN cancel_note TEXT`);
  }
}

async function getSalesTableSql(db: SalesSchemaDb): Promise<string | null> {
  const salesTableSql = await db.getFirstAsync<{ sql: string | null }>(
    "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'sales'",
  );
  return salesTableSql?.sql ?? null;
}

async function dropLeftoverSalesTables(db: SalesSchemaDb): Promise<void> {
  for (const leftover of LEFTOVER_SALES_TABLES) {
    if (await tableExists(db, leftover)) {
      await db.execAsync(`DROP TABLE ${leftover}`);
    }
  }
}

/**
 * Recover from a crash in older non-atomic rebuilds: if `sales` is gone but a
 * leftover copy remains, rename it back. Never drop a leftover while `sales` is missing.
 */
async function recoverInterruptedSalesRebuild(db: SalesSchemaDb): Promise<void> {
  const salesPresent = await tableExists(db, 'sales');

  if (!salesPresent) {
    for (const leftover of LEFTOVER_SALES_TABLES) {
      if (await tableExists(db, leftover)) {
        await db.execAsync(`ALTER TABLE ${leftover} RENAME TO sales`);
        return;
      }
    }
    return;
  }

  const sql = await getSalesTableSql(db);
  if (sql && salesSqlHasPayOnPickupPaymentCheck(sql)) {
    await dropLeftoverSalesTables(db);
  }
}

async function countRows(db: SalesSchemaDb, table: string): Promise<number> {
  const row = await db.getFirstAsync<{ c: number }>(`SELECT COUNT(*) AS c FROM ${table}`);
  return row?.c ?? 0;
}

async function countForeignKeyViolations(db: SalesSchemaDb): Promise<number> {
  const violations = await db.getAllAsync<{
    table: string;
    rowid: number;
    parent: string;
    fkid: number;
  }>('PRAGMA foreign_key_check');
  return violations.length;
}

async function copySalesIntersectingColumns(db: SalesSchemaDb): Promise<void> {
  const sourceColumns = await tableColumns(db, 'sales');
  const targetColumns = await tableColumns(db, 'sales_new');
  const shared = targetColumns.filter((column) => sourceColumns.includes(column));
  if (shared.length === 0) {
    throw new Error('sales rebuild: no shared columns to copy');
  }
  const columnList = shared.join(', ');
  await db.execAsync(
    `INSERT INTO sales_new (${columnList}) SELECT ${columnList} FROM sales`,
  );
}

async function rebuildSalesTableForPayOnPickup(db: SalesSchemaDb): Promise<void> {
  // Stale leftovers from a prior attempt — real data is in `sales`.
  await dropLeftoverSalesTables(db);

  const violationsBefore = await countForeignKeyViolations(db);
  const rowCountBefore = await countRows(db, 'sales');

  // Must run on this connection: withExclusiveTransactionAsync opens a new
  // connection (expo-sqlite Transaction.createAsync useNewConnection: true),
  // and PRAGMA foreign_keys is per-connection.
  await db.execAsync('PRAGMA foreign_keys=OFF');
  try {
    await db.execAsync('BEGIN IMMEDIATE');
    try {
      await db.execAsync(buildSalesCreateSql('sales_new'));
      await ensureAdditiveSalesColumns(db, 'sales_new');
      await copySalesIntersectingColumns(db);

      const rowCountAfter = await countRows(db, 'sales_new');
      if (rowCountAfter !== rowCountBefore) {
        throw new Error(
          `sales rebuild row count mismatch: expected ${rowCountBefore}, got ${rowCountAfter}`,
        );
      }

      await db.execAsync('DROP TABLE sales');
      await db.execAsync('ALTER TABLE sales_new RENAME TO sales');

      const violationsAfter = await countForeignKeyViolations(db);
      if (violationsAfter > violationsBefore) {
        throw new Error(
          `sales rebuild increased foreign_key_check violations: ${violationsBefore} → ${violationsAfter}`,
        );
      }

      await db.execAsync('COMMIT');
    } catch (error) {
      try {
        await db.execAsync('ROLLBACK');
      } catch {
        // Already rolled back or no active transaction.
      }
      throw error;
    }
  } finally {
    await db.execAsync('PRAGMA foreign_keys=ON');
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
  await recoverInterruptedSalesRebuild(db);

  await db.execAsync(SALES_CREATE);
  await ensureAdditiveSalesColumns(db);

  const salesTableSql = await getSalesTableSql(db);
  if (salesTableSql && !salesSqlHasPayOnPickupPaymentCheck(salesTableSql)) {
    await rebuildSalesTableForPayOnPickup(db);
  } else {
    await dropLeftoverSalesTables(db);
  }

  // Re-ensure after rebuild so an incomplete migration table cannot leave columns missing.
  await ensureAdditiveSalesColumns(db);
}
