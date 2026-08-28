import { SQLiteProvider } from 'expo-sqlite';
import type { ReactNode } from 'react';

import { initDatabase } from '@/lib/db/schema';

export function SQLiteProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <SQLiteProvider databaseName="market-day-v1.db" onInit={initDatabase}>
      {children}
    </SQLiteProvider>
  );
}
