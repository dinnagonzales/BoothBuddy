import {
  getPasscodeGateEnabled,
  setPasscodeGateEnabled,
} from '@/lib/db/passcode-gate-settings';
import { lockGrownUpPasscodeOnExit, unlockGrownUpPasscode } from '@/lib/grown-up-passcode';

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

test('unlocking grown-up clears the passcode gate', async () => {
  const db = createMemoryDb();
  await setPasscodeGateEnabled(db, true);
  let unlocked = false;

  await unlockGrownUpPasscode(db, {
    unlock: () => {
      unlocked = true;
    },
  });

  expect(await getPasscodeGateEnabled(db)).toBe(false);
  expect(unlocked).toBe(true);
});

test('lock on exit enables the passcode gate and leaves', async () => {
  const db = createMemoryDb();
  await setPasscodeGateEnabled(db, false);
  let left = false;

  await lockGrownUpPasscodeOnExit(db, {
    leave: () => {
      left = true;
    },
  });

  expect(await getPasscodeGateEnabled(db)).toBe(true);
  expect(left).toBe(true);
});
