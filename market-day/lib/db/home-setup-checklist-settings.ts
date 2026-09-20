import type { SQLiteDatabase } from 'expo-sqlite';

const HOME_SETUP_CHECKLIST_DISMISSED_KEY = 'home_setup_checklist_dismissed';

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

async function deleteAppStateValue(db: SQLiteDatabase, key: string): Promise<void> {
  await db.runAsync('DELETE FROM app_state WHERE key = ?', [key]);
}

export async function getHomeSetupChecklistDismissed(db: SQLiteDatabase): Promise<boolean> {
  const value = await getAppStateValue(db, HOME_SETUP_CHECKLIST_DISMISSED_KEY);
  return value === '1' || value === 'true';
}

export async function setHomeSetupChecklistDismissed(
  db: SQLiteDatabase,
  dismissed: boolean,
): Promise<void> {
  if (dismissed) {
    await setAppStateValue(db, HOME_SETUP_CHECKLIST_DISMISSED_KEY, '1');
    return;
  }
  await deleteAppStateValue(db, HOME_SETUP_CHECKLIST_DISMISSED_KEY);
}

export async function clearHomeSetupChecklistDismissed(db: SQLiteDatabase): Promise<void> {
  await deleteAppStateValue(db, HOME_SETUP_CHECKLIST_DISMISSED_KEY);
}
