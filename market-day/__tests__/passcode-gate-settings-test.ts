import { createMemorySecretStore, createParentalGate } from '@/lib/parental-gate';
import {
  getPasscodeGateEnabled,
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

test('passcode gate defaults to enabled when unset', async () => {
  const db = createMemoryDb();
  expect(await getPasscodeGateEnabled(db)).toBe(true);
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
