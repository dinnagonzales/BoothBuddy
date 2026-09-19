import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Settings } from 'lucide-react-native';

import { BusinessSettingsForm } from '@/components/BusinessSettingsForm';
import { ScreenHeader } from '@/components/Screen';
import { UiIcon } from '@/components/ui/UiIcon';
import { colors } from '@/constants/theme';
import { spacing } from '@/constants/visual';
import { leaveGrownUpArea } from '@/lib/navigation';

export default function BusinessSettingsScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { payment } = useLocalSearchParams<{ payment?: string }>();

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="Settings"
        titleIcon={<UiIcon icon={Settings} size={20} color={colors.ink} />}
        onBack={() => leaveGrownUpArea(router)}
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
