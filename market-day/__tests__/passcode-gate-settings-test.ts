import { createMemorySecretStore, createParentalGate } from '@/lib/parental-gate';
import {
  getPasscodeGateEnabled,
  migratePasscodeGateIfNeeded,
  setPasscodeGateEnabled,
} from '@/lib/db/passcode-gate-settings';

function createMemoryDb() {
  const records = new Map<string, string>();
  return {
    async getFirstAsync<T>(sql: string, params: string[]): Promise<T | null> {
      if (!sql.includes('app_state')) return null;
      const key = params[0];
      const value = records.get(key);
      return value != null ? ({ value } as T) : null;
    },
    async runAsync(sql: string, params: string[]) {
      if (!sql.includes('app_state')) return;
      records.set(params[0], params[1]);
    },
  };
}

test('passcode gate defaults to disabled when unset', async () => {
  const db = createMemoryDb();
  expect(await getPasscodeGateEnabled(db)).toBe(false);
});

test('passcode gate can be turned off and on', async () => {
  const db = createMemoryDb();

  await setPasscodeGateEnabled(db, false);
  expect(await getPasscodeGateEnabled(db)).toBe(false);

  await setPasscodeGateEnabled(db, true);
  expect(await getPasscodeGateEnabled(db)).toBe(true);
});

// Sanity: gate module does not affect parental code storage
test('passcode gate setting is separate from parental code', async () => {
  const db = createMemoryDb();
  const gate = createParentalGate(createMemorySecretStore());

  await setPasscodeGateEnabled(db, false);
  await gate.setCode('1234');

  expect(await getPasscodeGateEnabled(db)).toBe(false);
  expect(await gate.verify('1234')).toBe(true);
});

test('existing completed setup with unset gate stays locked after migrate', async () => {
  const db = createMemoryDb();

  await migratePasscodeGateIfNeeded(db, { setupComplete: true });

  expect(await getPasscodeGateEnabled(db)).toBe(true);
});

test('migrate does not overwrite an explicit unlocked preference', async () => {
  const db = createMemoryDb();
  await setPasscodeGateEnabled(db, false);

  await migratePasscodeGateIfNeeded(db, { setupComplete: true });

  expect(await getPasscodeGateEnabled(db)).toBe(false);
});

test('migrate leaves unset gate unlocked when setup is incomplete', async () => {
  const db = createMemoryDb();

  await migratePasscodeGateIfNeeded(db, { setupComplete: false });

  expect(await getPasscodeGateEnabled(db)).toBe(false);
});
