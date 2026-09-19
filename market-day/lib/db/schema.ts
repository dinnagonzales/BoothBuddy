import type { SQLiteDatabase } from 'expo-sqlite';

import { ensureActiveMarketDayMenu } from '@/lib/db/queries';
import { migrateSalesTable } from '@/lib/db/sales-schema';

const CORE_SCHEMA = `
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
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
`;

const DEPENDENT_SCHEMA = `
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
  // Must run outside a transaction — SQLite ignores this pragma inside one.
  await db.execAsync('PRAGMA foreign_keys = ON');

  await db.execAsync(CORE_SCHEMA);

  const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(items)');
  const hasRetired = columns.some((column) => column.name === 'retired');
  const hasArchived = columns.some((column) => column.name === 'archived');
  if (hasRetired && !hasArchived) {
    await db.execAsync('ALTER TABLE items RENAME COLUMN retired TO archived');
  }
  const hasEmojiColumn = columns.some((column) => column.name === 'emoji');
  const hasIconColumn = columns.some((column) => column.name === 'icon');
  if (hasEmojiColumn && !hasIconColumn) {
    await db.execAsync('ALTER TABLE items RENAME COLUMN emoji TO icon');
  }

  const marketDayColumns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(market_days)');
  const hasNeedsReexport = marketDayColumns.some((column) => column.name === 'needs_reexport');
  if (!hasNeedsReexport) {
    await db.execAsync(
      'ALTER TABLE market_days ADD COLUMN needs_reexport INTEGER NOT NULL DEFAULT 0',
    );
  }

  await migrateSalesTable(db);
  await db.execAsync(DEPENDENT_SCHEMA);

  await ensureActiveMarketDayMenu(db);

  const violations = await db.getAllAsync<{
    table: string;
    rowid: number;
    parent: string;
    fkid: number;
  }>('PRAGMA foreign_key_check');
  if (violations.length > 0) {
    console.warn(
      `[db] foreign_key_check found ${violations.length} violation(s) on startup`,
      violations,
    );
  }
}
