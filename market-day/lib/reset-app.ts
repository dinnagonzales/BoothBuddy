import type { SQLiteDatabase } from 'expo-sqlite';

import { clearShopData } from '@/lib/db/reset';

type ParentalGateReset = {
  clearCode(): Promise<void>;
};

export async function resetAppForForgottenCode(
  db: SQLiteDatabase,
  gate: ParentalGateReset,
): Promise<void> {
  await clearShopData(db);
  await gate.clearCode();
}
