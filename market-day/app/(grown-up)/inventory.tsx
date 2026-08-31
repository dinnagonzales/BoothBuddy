import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AdminItemCatalog } from '@/components/AdminItemCatalog';
import { ScreenHeader, SectionLabel } from '@/components/Screen';
import { leaveGrownUpArea } from '@/lib/navigation';

export default function InventoryScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { add } = useLocalSearchParams<{ add?: string }>();

  return (
    <View style={styles.screen}>
      <ScreenHeader title="📦 Inventory" onBack={() => leaveGrownUpArea(router)} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SectionLabel>Items & cost</SectionLabel>
        <AdminItemCatalog db={db} autoOpenAdd={add === '1'} />
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
