import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AdminItemCatalog } from '@/components/AdminItemCatalog';
import { ScreenHeader, SectionLabel } from '@/components/Screen';

export default function InventoryScreen() {
  const db = useSQLiteContext();
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <ScreenHeader title="📦 Inventory" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SectionLabel>Items & cost</SectionLabel>
        <AdminItemCatalog db={db} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 16,
  },
});
