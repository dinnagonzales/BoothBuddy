// @ts-expect-error Node built-in; project tsconfig has no @types/node (same as sales-change-kept-migration-test)
import { DatabaseSync } from 'node:sqlite';
import type { SQLiteDatabase } from 'expo-sqlite';

import { ItemHasSalesError } from '@/lib/market-day';
import { clearShopData } from '@/lib/db/reset';
import { initDatabase } from '@/lib/db/schema';
import {
  createItem,
  createSale,
  deleteItem,
  deleteMarketDay,
  startMarketDay,
} from '@/lib/db/queries';

function normalizeParams(params: unknown[]): unknown[] {
  if (params.length === 1 && Array.isArray(params[0])) {
    return params[0] as unknown[];
  }
  return params;
}

function createTestDb(): { raw: DatabaseSync; db: SQLiteDatabase } {
  const raw = new DatabaseSync(':memory:', { enableForeignKeyConstraints: false });

  const db = {
    async execAsync(source: string) {
      raw.exec(source);
    },
    async getAllAsync<T>(source: string, ...params: unknown[]) {
      return raw.prepare(source).all(...normalizeParams(params)) as T[];
    },
    async getFirstAsync<T>(source: string, ...params: unknown[]) {
      const row = raw.prepare(source).get(...normalizeParams(params)) as T | undefined;
      return row ?? null;
    },
    async runAsync(source: string, ...params: unknown[]) {
      const result = raw.prepare(source).run(...normalizeParams(params));
      return {
        lastInsertRowId: Number(result.lastInsertRowid),
        changes: result.changes,
      };
    },
    async withExclusiveTransactionAsync(
      task: (txn: SQLiteDatabase) => Promise<void>,
    ) {
      raw.exec('BEGIN IMMEDIATE');
      try {
        await task(db as SQLiteDatabase);
        raw.exec('COMMIT');
      } catch (error) {
        raw.exec('ROLLBACK');
        throw error;
      }
    },
  } as SQLiteDatabase;

  return { raw, db };
}

async function foreignKeysEnabled(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ foreign_keys: number }>('PRAGMA foreign_keys');
  return row?.foreign_keys ?? 0;
}

test('(a) initDatabase enables foreign_keys pragma', async () => {
  const { raw, db } = createTestDb();
  expect(raw.prepare('PRAGMA foreign_keys').get() as { foreign_keys: number }).toEqual({
    foreign_keys: 0,
  });

  await initDatabase(db);

  expect(await foreignKeysEnabled(db)).toBe(1);
});

test('(b) inserting a line_item with nonexistent sale_id fails', async () => {
  const { db } = createTestDb();
  await initDatabase(db);

  const item = await createItem(db, {
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
  });

  await expect(
    db.runAsync(
      `INSERT INTO line_items (sale_id, item_id, quantity, price_cents, cost_cents)
       VALUES (?, ?, ?, ?, ?)`,
      999_999,
      item.id,
      1,
      400,
      100,
    ),
  ).rejects.toThrow(/FOREIGN KEY constraint failed/i);
});

test('(c) deleting an item that has line_items fails cleanly', async () => {
  const { db } = createTestDb();
  await initDatabase(db);

  const item = await createItem(db, {
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
  });
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

  await expect(deleteItem(db, item.id)).rejects.toThrow(ItemHasSalesError);
});

test('(d) clearShopData and deleteMarketDay still work with FKs on', async () => {
  const { db } = createTestDb();
  await initDatabase(db);

  const item = await createItem(db, {
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
  });
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
  await expect(deleteMarketDay(db, marketDay.id)).resolves.toBeUndefined();

  const another = await createItem(db, {
    name: 'Unicorn',
    icon: '🦄',
    costCents: 150,
    priceCents: 500,
  });
  const day = await startMarketDay(db, 'Fall Fair 2026', '2026-09-01T12:00:00.000Z');
  await createSale(db, {
    marketDayId: day.id,
    lines: [
      {
        itemId: another.id,
        name: 'Unicorn',
        icon: '🦄',
        priceCents: 500,
        costCents: 150,
        quantity: 1,
      },
    ],
    paymentMethod: 'cash',
    cashReceivedCents: 500,
  });

  await expect(clearShopData(db)).resolves.toBeUndefined();
  expect(await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) AS c FROM items')).toEqual({
    c: 0,
  });
  expect(await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) AS c FROM sales')).toEqual({
    c: 0,
  });
  expect(await foreignKeysEnabled(db)).toBe(1);
});
