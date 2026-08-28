import type { SQLiteDatabase } from 'expo-sqlite';

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    emoji TEXT NOT NULL,
    photo_uri TEXT,
    cost_cents INTEGER NOT NULL,
    price_cents INTEGER NOT NULL,
    retired INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS market_days (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    started_at TEXT NOT NULL DEFAULT (datetime('now')),
    closed_at TEXT,
    exported_at TEXT
  );

  CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_number INTEGER NOT NULL UNIQUE,
    market_day_id INTEGER REFERENCES market_days(id),
    total_cents INTEGER NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'venmo_zelle')),
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
`;

const SEED_ITEMS: Array<[string, string, number, number]> = [
  ['Dragon', '🐉', 100, 400],
  ['Groot key', '🔑', 50, 200],
  ['Pokeball', '⚪', 50, 200],
  ['Phone stand', '📱', 75, 250],
  ['Letter - A', '🔤', 40, 150],
];

export async function initDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(SCHEMA);

  const row = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM items');
  if ((row?.count ?? 0) > 0) return;

  for (const [name, emoji, costCents, priceCents] of SEED_ITEMS) {
    await db.runAsync(
      'INSERT INTO items (name, emoji, cost_cents, price_cents) VALUES (?, ?, ?, ?)',
      name,
      emoji,
      costCents,
      priceCents,
    );
  }

  await db.runAsync(
    `INSERT INTO market_days (name) VALUES (?)`,
    `Demo Market Day – ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
  );
}
