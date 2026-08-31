import type { SQLiteDatabase } from 'expo-sqlite';

import {
  ADMIN_PROFILE_KEYS,
  EMPTY_ADMIN_PROFILE,
  normalizeAdminProfile,
  type AdminProfile,
} from '@/lib/admin-profile';
import {
  getBusinessSettings,
  saveBusinessSettings,
} from '@/lib/db/business-settings';

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

export async function getAdminProfile(db: SQLiteDatabase): Promise<AdminProfile> {
  const [firstName, lastName, businessName] = await Promise.all([
    getAppStateValue(db, ADMIN_PROFILE_KEYS.firstName),
    getAppStateValue(db, ADMIN_PROFILE_KEYS.lastName),
    getAppStateValue(db, ADMIN_PROFILE_KEYS.businessName),
  ]);

  return normalizeAdminProfile({
    firstName: firstName ?? EMPTY_ADMIN_PROFILE.firstName,
    lastName: lastName ?? EMPTY_ADMIN_PROFILE.lastName,
    businessName: businessName ?? EMPTY_ADMIN_PROFILE.businessName,
  });
}

export async function saveAdminProfile(db: SQLiteDatabase, profile: AdminProfile): Promise<void> {
  const normalized = normalizeAdminProfile(profile);

  await setAppStateValue(db, ADMIN_PROFILE_KEYS.firstName, normalized.firstName);
  await setAppStateValue(db, ADMIN_PROFILE_KEYS.lastName, normalized.lastName);
  await setAppStateValue(db, ADMIN_PROFILE_KEYS.businessName, normalized.businessName);

  const businessSettings = await getBusinessSettings(db);
  await saveBusinessSettings(db, {
    ...businessSettings,
    businessName: normalized.businessName,
  });
}

export async function clearAdminProfile(db: SQLiteDatabase): Promise<void> {
  await Promise.all([
    deleteAppStateValue(db, ADMIN_PROFILE_KEYS.firstName),
    deleteAppStateValue(db, ADMIN_PROFILE_KEYS.lastName),
    deleteAppStateValue(db, ADMIN_PROFILE_KEYS.businessName),
  ]);
}
