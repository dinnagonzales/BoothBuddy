import type { SQLiteDatabase } from 'expo-sqlite';

import { setPasscodeGateEnabled } from '@/lib/db/passcode-gate-settings';

type GrownUpSessionUnlock = {
  unlock: () => void;
};

type GrownUpLeave = {
  leave: () => void;
};

/** Clear persistent lock and open the in-memory grown-up session. */
export async function unlockGrownUpPasscode(
  db: SQLiteDatabase,
  session: GrownUpSessionUnlock,
): Promise<void> {
  await setPasscodeGateEnabled(db, false);
  session.unlock();
}

/** Turn protection on and leave grown-up (Lock & go to Dashboard). */
export async function lockGrownUpPasscodeOnExit(
  db: SQLiteDatabase,
  navigation: GrownUpLeave,
): Promise<void> {
  await setPasscodeGateEnabled(db, true);
  navigation.leave();
}
