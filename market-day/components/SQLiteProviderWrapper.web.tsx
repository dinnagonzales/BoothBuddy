import { ActivityIndicator, Text, View } from 'react-native';
import { type ReactNode, useEffect, useState } from 'react';

import { initDatabase } from '@/lib/db/schema';

type SQLiteProviderComponent = React.ComponentType<{
  databaseName: string;
  onInit: typeof initDatabase;
  children: ReactNode;
}>;

export function SQLiteProviderWrapper({ children }: { children: ReactNode }) {
  const [SQLiteProvider, setSQLiteProvider] = useState<SQLiteProviderComponent | null>(null);

  useEffect(() => {
    import('expo-sqlite').then((mod) => setSQLiteProvider(() => mod.SQLiteProvider));
  }, []);

  if (!SQLiteProvider) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3E9FF' }}>
        <ActivityIndicator size="large" color="#9B5DE5" />
        <Text style={{ color: '#6E6480', fontWeight: '700', marginTop: 12 }}>Loading Market Day…</Text>
      </View>
    );
  }

  return (
    <SQLiteProvider databaseName="market-day-v1.db" onInit={initDatabase}>
      {children}
    </SQLiteProvider>
  );
}
