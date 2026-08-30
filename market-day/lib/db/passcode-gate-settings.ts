import type { SQLiteDatabase } from 'expo-sqlite';

const PASSCODE_GATE_ENABLED_KEY = 'passcode_gate_enabled';

async function getAppStateValue(db: SQLiteDatabase, key: string): Promise<string | null> {
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_state WHERE key = ?',
    [key],
  );
  return row?.value ?? null;
}

async function setAppStateValue(db: SQLiteDatabase, key: string, value: string): Promise<void> {
  await db.runAsync('INSERT OR REPLACE INTO app_state (key, value) VALUES (?, ?)', [key, value]);
}

export async function getPasscodeGateEnabled(db: SQLiteDatabase): Promise<boolean> {
  const value = await getAppStateValue(db, PASSCODE_GATE_ENABLED_KEY);
  if (value == null) return true;
  return value === '1' || value === 'true';
}

export async function setPasscodeGateEnabled(db: SQLiteDatabase, enabled: boolean): Promise<void> {
  await setAppStateValue(db, PASSCODE_GATE_ENABLED_KEY, enabled ? '1' : '0');
}
