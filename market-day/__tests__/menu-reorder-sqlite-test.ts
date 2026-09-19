import { initDatabase } from '@/lib/db/schema';
import {
  addToMenu,
  closeActiveMarketDay,
  createItem,
  getCheckoutItems,
  getHomeItems,
  getMenuForAdmin,
  removeFromMenu,
  reorderMenu,
  startMarketDay,
  undoCloseMostRecentMarketDay,
} from '@/lib/db/queries';
import { createTestDb } from '../test-utils/sqlite-test-db';

test('sqlite Menu order seeds A-Z, reorders, appends, and survives reopen', async () => {
  const { db } = createTestDb();
  await initDatabase(db);

  const unicorn = await createItem(db, {
    name: 'Unicorn',
    icon: '🦄',
    costCents: 150,
    priceCents: 500,
  });
  const cookie = await createItem(db, {
    name: 'Cookie',
    icon: '🍪',
    costCents: 50,
    priceCents: 200,
  });
  const dragon = await createItem(db, {
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
  });

  await startMarketDay(db, 'Spring Fair 2026', '2026-03-01T12:00:00.000Z');

  expect((await getMenuForAdmin(db)).map((item) => item.id)).toEqual([
    cookie.id,
    dragon.id,
    unicorn.id,
  ]);

  await reorderMenu(db, [unicorn.id, cookie.id, dragon.id]);

  expect((await getHomeItems(db)).map((item) => item.id)).toEqual([
    unicorn.id,
    cookie.id,
    dragon.id,
  ]);
  expect((await getCheckoutItems(db)).map((item) => item.id)).toEqual([
    unicorn.id,
    cookie.id,
    dragon.id,
  ]);

  const zebra = await createItem(db, {
    name: 'Zebra',
    icon: '🦓',
    costCents: 80,
    priceCents: 300,
  });
  await removeFromMenu(db, cookie.id);
  await addToMenu(db, cookie.id);

  expect((await getMenuForAdmin(db)).map((item) => item.id)).toEqual([
    unicorn.id,
    dragon.id,
    zebra.id,
    cookie.id,
  ]);

  await closeActiveMarketDay(db);
  await undoCloseMostRecentMarketDay(db);

  expect((await getMenuForAdmin(db)).map((item) => item.id)).toEqual([
    unicorn.id,
    dragon.id,
    zebra.id,
    cookie.id,
  ]);
});

test('sqlite migrates existing menu_items to A-Z positions', async () => {
  const { db } = createTestDb();

  await db.execAsync(`
    CREATE TABLE items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      photo_uri TEXT,
      cost_cents INTEGER NOT NULL,
      price_cents INTEGER NOT NULL,
      archived INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE market_days (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      started_at TEXT NOT NULL DEFAULT (datetime('now')),
      closed_at TEXT,
      exported_at TEXT,
      needs_reexport INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE menu_items (
      market_day_id INTEGER NOT NULL REFERENCES market_days(id) ON DELETE CASCADE,
      item_id INTEGER NOT NULL REFERENCES items(id),
      sold_out INTEGER NOT NULL DEFAULT 0,
      removed INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (market_day_id, item_id)
    );
  `);

  await db.runAsync(
    `INSERT INTO items (name, icon, cost_cents, price_cents) VALUES (?, ?, ?, ?)`,
    'Unicorn',
    '🦄',
    150,
    500,
  );
  await db.runAsync(
    `INSERT INTO items (name, icon, cost_cents, price_cents) VALUES (?, ?, ?, ?)`,
    'Cookie',
    '🍪',
    50,
    200,
  );
  await db.runAsync(
    `INSERT INTO market_days (name, started_at) VALUES (?, ?)`,
    'Spring Fair 2026',
    '2026-03-01T12:00:00.000Z',
  );
  await db.runAsync(
    `INSERT INTO menu_items (market_day_id, item_id, sold_out, removed) VALUES (1, 1, 0, 0)`,
  );
  await db.runAsync(
    `INSERT INTO menu_items (market_day_id, item_id, sold_out, removed) VALUES (1, 2, 0, 0)`,
  );

  await initDatabase(db);

  const positions = await db.getAllAsync<{ item_id: number; position: number }>(
    `SELECT item_id, position FROM menu_items ORDER BY position ASC, item_id ASC`,
  );
  expect(positions).toEqual([
    { item_id: 2, position: 0 },
    { item_id: 1, position: 1 },
  ]);
});
