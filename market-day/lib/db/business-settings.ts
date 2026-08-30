import type { SQLiteDatabase } from 'expo-sqlite';

import {
  BUSINESS_SETTINGS_KEYS,
  EMPTY_BUSINESS_SETTINGS,
  normalizeBusinessSettings,
  type BusinessSettings,
} from '@/lib/business-settings';

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

export async function getBusinessSettings(db: SQLiteDatabase): Promise<BusinessSettings> {
  const [
    businessName,
    businessLogoUri,
    zelleName,
    zelleContact,
    zelleQrUri,
    venmoHandle,
    venmoQrUri,
  ] = await Promise.all([
    getAppStateValue(db, BUSINESS_SETTINGS_KEYS.businessName),
    getAppStateValue(db, BUSINESS_SETTINGS_KEYS.businessLogoUri),
    getAppStateValue(db, BUSINESS_SETTINGS_KEYS.zelleName),
    getAppStateValue(db, BUSINESS_SETTINGS_KEYS.zelleContact),
    getAppStateValue(db, BUSINESS_SETTINGS_KEYS.zelleQrUri),
    getAppStateValue(db, BUSINESS_SETTINGS_KEYS.venmoHandle),
    getAppStateValue(db, BUSINESS_SETTINGS_KEYS.venmoQrUri),
  ]);

  return normalizeBusinessSettings({
    businessName: businessName ?? EMPTY_BUSINESS_SETTINGS.businessName,
    businessLogoUri: businessLogoUri ?? EMPTY_BUSINESS_SETTINGS.businessLogoUri,
    zelleName: zelleName ?? EMPTY_BUSINESS_SETTINGS.zelleName,
    zelleContact: zelleContact ?? EMPTY_BUSINESS_SETTINGS.zelleContact,
    zelleQrUri: zelleQrUri ?? EMPTY_BUSINESS_SETTINGS.zelleQrUri,
    venmoHandle: venmoHandle ?? EMPTY_BUSINESS_SETTINGS.venmoHandle,
    venmoQrUri: venmoQrUri ?? EMPTY_BUSINESS_SETTINGS.venmoQrUri,
  });
}

export async function saveBusinessSettings(
  db: SQLiteDatabase,
  settings: BusinessSettings,
): Promise<void> {
  const normalized = normalizeBusinessSettings(settings);

  await setAppStateValue(db, BUSINESS_SETTINGS_KEYS.businessName, normalized.businessName);

  if (normalized.businessLogoUri) {
    await setAppStateValue(db, BUSINESS_SETTINGS_KEYS.businessLogoUri, normalized.businessLogoUri);
  } else {
    await deleteAppStateValue(db, BUSINESS_SETTINGS_KEYS.businessLogoUri);
  }

  await setAppStateValue(db, BUSINESS_SETTINGS_KEYS.zelleName, normalized.zelleName);
  await setAppStateValue(db, BUSINESS_SETTINGS_KEYS.zelleContact, normalized.zelleContact);

  if (normalized.zelleQrUri) {
    await setAppStateValue(db, BUSINESS_SETTINGS_KEYS.zelleQrUri, normalized.zelleQrUri);
  } else {
    await deleteAppStateValue(db, BUSINESS_SETTINGS_KEYS.zelleQrUri);
  }

  await setAppStateValue(db, BUSINESS_SETTINGS_KEYS.venmoHandle, normalized.venmoHandle);

  if (normalized.venmoQrUri) {
    await setAppStateValue(db, BUSINESS_SETTINGS_KEYS.venmoQrUri, normalized.venmoQrUri);
  } else {
    await deleteAppStateValue(db, BUSINESS_SETTINGS_KEYS.venmoQrUri);
  }
}
