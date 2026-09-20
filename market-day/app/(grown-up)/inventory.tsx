import { useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ShelvingUnit } from 'lucide-react-native';

import { GrownUpScreenHeader } from '@/components/GrownUpScreenHeader';
import { AdminItemCatalog } from '@/components/AdminItemCatalog';
import { SectionLabel } from '@/components/Screen';
import { UiIcon } from '@/components/ui/UiIcon';
import { colors } from '@/constants/theme';

export default function InventoryScreen() {
  const db = useSQLiteContext();
  const { add } = useLocalSearchParams<{ add?: string }>();

  return (
    <View style={styles.screen}>
      <GrownUpScreenHeader
        title="Inventory"
        titleIcon={<UiIcon icon={ShelvingUnit} size={20} color={colors.ink} />}
      />
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
