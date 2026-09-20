import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import type { ReactNode } from 'react';
import { Alert, Pressable, StyleSheet } from 'react-native';
import { Lock } from 'lucide-react-native';

import { ScreenHeader } from '@/components/Screen';
import { UiIcon } from '@/components/ui/UiIcon';
import { colors } from '@/constants/theme';
import { lockGrownUpPasscodeOnExit } from '@/lib/grown-up-passcode';
import { leaveGrownUpArea } from '@/lib/navigation';
import { showUiError } from '@/lib/ui-errors';

type GrownUpScreenHeaderProps = {
  title: string;
  titleIcon?: ReactNode;
};

export function GrownUpScreenHeader({ title, titleIcon }: GrownUpScreenHeaderProps) {
  const db = useSQLiteContext();
  const router = useRouter();

  const confirmLockAndLeave = () => {
    Alert.alert(
      'Lock Settings?',
      'You\'ll need your passcode next time you open Events, Inventory, Preorders, Sales, or Settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Lock & go to Dashboard',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                await lockGrownUpPasscodeOnExit(db, {
                  leave: () => leaveGrownUpArea(router),
                });
              } catch (error) {
                showUiError(error);
              }
            })();
          },
        },
      ],
    );
  };

  return (
    <ScreenHeader
      title={title}
      titleIcon={titleIcon}
      backLabel="Dashboard"
      onBack={() => leaveGrownUpArea(router)}
      right={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Lock settings"
          onPress={confirmLockAndLeave}
          hitSlop={8}
          style={styles.lockButton}>
          <UiIcon icon={Lock} size={20} color={colors.ink} />
        </Pressable>
      }
    />
  );
}

const styles = StyleSheet.create({
  lockButton: {
    padding: 4,
  },
});
