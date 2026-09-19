import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * Serialize write transactions on a single SQLiteDatabase connection.
 *
 * Prefer this over `withExclusiveTransactionAsync`: that API opens a *new*
 * connection (useNewConnection: true) which does not inherit
 * `PRAGMA foreign_keys = ON` from initDatabase, and the pragma cannot be
 * enabled after the library's BEGIN.
 */
const writeTails = new WeakMap<object, Promise<void>>();

export async function withWriteTransaction(
  db: SQLiteDatabase,
  task: (txn: SQLiteDatabase) => Promise<void>,
): Promise<void> {
  const previous = writeTails.get(db) ?? Promise.resolve();
  let release!: () => void;
  writeTails.set(
    db,
    new Promise<void>((resolve) => {
      release = resolve;
    }),
  );
  await previous;

  let began = false;
  try {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      const row = await db.getFirstAsync<{ foreign_keys: number }>('PRAGMA foreign_keys');
      if ((row?.foreign_keys ?? 0) !== 1) {
        console.warn(
          '[db] withWriteTransaction: PRAGMA foreign_keys is not 1 on this connection; FK checks may be skipped',
        );
      }
    }

    await db.execAsync('BEGIN IMMEDIATE');
    began = true;
    await task(db);
    await db.execAsync('COMMIT');
  } catch (error) {
    if (began) {
      try {
        await db.execAsync('ROLLBACK');
      } catch {
        // Never mask the original error if rollback itself fails.
      }
    }
    throw error;
  } finally {
    release();
  }
}
