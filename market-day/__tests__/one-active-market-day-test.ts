// @ts-expect-error Node built-in; project tsconfig has no @types/node (same as foreign-keys-test)
import { DatabaseSync } from 'node:sqlite';
import type { SQLiteDatabase } from 'expo-sqlite';

import { ActiveMarketDayExistsError } from '@/lib/market-day';
import { initDatabase } from '@/lib/db/schema';
import {
  canReopenMarketDay,
  closeActiveMarketDay,
  getActiveMarketDay,
  startMarketDay,
  undoCloseMostRecentMarketDay,
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

async function openDayCount(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ c: number }>(
    'SELECT COUNT(*) AS c FROM market_days WHERE closed_at IS NULL',
  );
  return row?.c ?? 0;
}

test('partial unique index rejects a second open Market Day insert', async () => {
  const { db } = createTestDb();
  await initDatabase(db);

  await db.runAsync(
    `INSERT INTO market_days (name, started_at) VALUES (?, ?)`,
    'Spring Fair 2026',
    '2026-03-01T12:00:00.000Z',
  );

  await expect(
    db.runAsync(
      `INSERT INTO market_days (name, started_at) VALUES (?, ?)`,
      'Fall Fair 2026',
      '2026-09-01T12:00:00.000Z',
    ),
  ).rejects.toThrow(/UNIQUE constraint failed/i);

  expect(await openDayCount(db)).toBe(1);
});

test('startMarketDay rejects a second open day and leaves exactly one open', async () => {
  const { db } = createTestDb();
  await initDatabase(db);

  await startMarketDay(db, 'Spring Fair 2026', '2026-03-01T12:00:00.000Z');
  await expect(
    startMarketDay(db, 'Fall Fair 2026', '2026-09-01T12:00:00.000Z'),
  ).rejects.toThrow(ActiveMarketDayExistsError);

  expect(await openDayCount(db)).toBe(1);
  const active = await getActiveMarketDay(db);
  expect(active?.name).toBe('Spring Fair 2026');
});

test('close A → start B → reopen A fails; canReopenMarketDay is false', async () => {
  const { db } = createTestDb();
  await initDatabase(db);

  const spring = await startMarketDay(db, 'Spring Fair 2026', '2026-03-01T12:00:00.000Z');
  await closeActiveMarketDay(db);
  const fall = await startMarketDay(db, 'Fall Fair 2026', '2026-09-01T12:00:00.000Z');

  expect(await canReopenMarketDay(db, spring.id)).toBe(false);
  await expect(undoCloseMostRecentMarketDay(db)).rejects.toThrow(ActiveMarketDayExistsError);

  expect(await openDayCount(db)).toBe(1);
  expect(await getActiveMarketDay(db)).toEqual(
    expect.objectContaining({ id: fall.id, name: 'Fall Fair 2026' }),
  );
});

test('reopen works when no Market Day is open', async () => {
  const { db } = createTestDb();
  await initDatabase(db);

  const spring = await startMarketDay(db, 'Spring Fair 2026', '2026-03-01T12:00:00.000Z');
  await closeActiveMarketDay(db);

  expect(await canReopenMarketDay(db, spring.id)).toBe(true);
  await undoCloseMostRecentMarketDay(db);

  expect(await openDayCount(db)).toBe(1);
  expect(await getActiveMarketDay(db)).toEqual(
    expect.objectContaining({ id: spring.id, name: 'Spring Fair 2026' }),
  );
});

test('initDatabase heals two open days: keeps most recent, does not throw', async () => {
  const { raw, db } = createTestDb();

  // Seed before init so the unique index does not yet exist.
  raw.exec(`
    CREATE TABLE market_days (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      started_at TEXT NOT NULL,
      closed_at TEXT,
      exported_at TEXT,
      needs_reexport INTEGER NOT NULL DEFAULT 0
    );
  `);
  raw
    .prepare(
      `INSERT INTO market_days (name, started_at, closed_at) VALUES (?, ?, NULL)`,
    )
    .run('Spring Fair 2026', '2026-03-01T12:00:00.000Z');
  raw
    .prepare(
      `INSERT INTO market_days (name, started_at, closed_at) VALUES (?, ?, NULL)`,
    )
    .run('Fall Fair 2026', '2026-09-01T12:00:00.000Z');

  await expect(initDatabase(db)).resolves.toBeUndefined();

  expect(await openDayCount(db)).toBe(1);
  const active = await getActiveMarketDay(db);
  expect(active?.name).toBe('Fall Fair 2026');

  const spring = await db.getFirstAsync<{ closed_at: string | null }>(
    `SELECT closed_at FROM market_days WHERE name = ?`,
    'Spring Fair 2026',
  );
  expect(spring?.closed_at).toBe('2026-03-01T12:00:00.000Z');
});

test('initDatabase run twice is a no-op', async () => {
  const { db } = createTestDb();
  await initDatabase(db);
  await startMarketDay(db, 'Spring Fair 2026', '2026-03-01T12:00:00.000Z');

  await expect(initDatabase(db)).resolves.toBeUndefined();

  expect(await openDayCount(db)).toBe(1);
  expect(await getActiveMarketDay(db)).toEqual(
    expect.objectContaining({ name: 'Spring Fair 2026' }),
  );
});
