// @ts-expect-error Node built-in; project tsconfig has no @types/node
import { DatabaseSync } from 'node:sqlite';
import type { SQLiteDatabase } from 'expo-sqlite';

function normalizeParams(params: unknown[]): unknown[] {
  if (params.length === 1 && Array.isArray(params[0])) {
    return params[0] as unknown[];
  }
  return params;
}

function wrapConnection(raw: DatabaseSync): SQLiteDatabase {
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
    /**
     * Models expo-sqlite's withExclusiveTransactionAsync: a *separate*
     * connection that does not inherit PRAGMA foreign_keys from the main one.
     * Production code no longer calls this; tests keep it to reproduce the old bug.
     */
    async withExclusiveTransactionAsync(
      _task: (txn: SQLiteDatabase) => Promise<void>,
    ) {
      throw new Error(
        'withExclusiveTransactionAsync requires createTwoConnectionTestDb (separate FK-off connection)',
      );
    },
  };

  return db as unknown as SQLiteDatabase;
}

let sharedMemSeq = 0;

/**
 * Single main connection. withWriteTransaction uses BEGIN IMMEDIATE via execAsync.
 */
export function createTestDb(): { raw: DatabaseSync; db: SQLiteDatabase } {
  const raw = new DatabaseSync(':memory:', { enableForeignKeyConstraints: false });
  return { raw, db: wrapConnection(raw) };
}

/**
 * Two connections on the same in-memory DB (shared cache):
 * - main: used by app code after initDatabase (FKs ON)
 * - exclusive: models expo-sqlite's useNewConnection txn (FKs stay OFF)
 */
export function createTwoConnectionTestDb(): {
  mainRaw: DatabaseSync;
  exclusiveRaw: DatabaseSync;
  main: SQLiteDatabase;
  exclusive: SQLiteDatabase;
} {
  sharedMemSeq += 1;
  const uri = `file:booth-buddy-fk-${sharedMemSeq}?mode=memory&cache=shared`;
  const mainRaw = new DatabaseSync(uri, { enableForeignKeyConstraints: false });
  const exclusiveRaw = new DatabaseSync(uri, { enableForeignKeyConstraints: false });

  const main = wrapConnection(mainRaw);
  const exclusive = wrapConnection(exclusiveRaw);

  main.withExclusiveTransactionAsync = async (task) => {
    exclusiveRaw.exec('BEGIN IMMEDIATE');
    try {
      await task(exclusive);
      exclusiveRaw.exec('COMMIT');
    } catch (error) {
      exclusiveRaw.exec('ROLLBACK');
      throw error;
    }
  };

  return { mainRaw, exclusiveRaw, main, exclusive };
}

export async function foreignKeysEnabled(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ foreign_keys: number }>('PRAGMA foreign_keys');
  return row?.foreign_keys ?? 0;
}

type RunAsync = (source: string, ...params: unknown[]) => Promise<{
  lastInsertRowId: number;
  changes: number;
}>;

/** Replace db.runAsync with a wrapper; restores bind flexibility for test spies. */
export function spyRunAsync(db: SQLiteDatabase, spy: RunAsync): void {
  db.runAsync = spy as SQLiteDatabase['runAsync'];
}

export function bindRunAsync(db: SQLiteDatabase): RunAsync {
  return db.runAsync.bind(db) as RunAsync;
}
