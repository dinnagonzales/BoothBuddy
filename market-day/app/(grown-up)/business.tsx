import { useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Settings } from 'lucide-react-native';

import { BusinessSettingsForm } from '@/components/BusinessSettingsForm';
import { GrownUpScreenHeader } from '@/components/GrownUpScreenHeader';
import { UiIcon } from '@/components/ui/UiIcon';
import { colors } from '@/constants/theme';
import { spacing } from '@/constants/visual';

export default function BusinessSettingsScreen() {
  const db = useSQLiteContext();
  const { payment } = useLocalSearchParams<{ payment?: string }>();

  return (
    <View style={styles.screen}>
      <GrownUpScreenHeader
        title="Settings"
        titleIcon={<UiIcon icon={Settings} size={20} color={colors.ink} />}
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <BusinessSettingsForm db={db} expandPayment={payment === '1'} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: spacing.screen,
  },
  scrollContent: {
    paddingBottom: 16,
  },
});
