import { usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/theme';

type Tab = 'settings' | 'inventory';

function activeTab(pathname: string): Tab {
  return pathname.includes('inventory') ? 'inventory' : 'settings';
}

export function GrownUpNav() {
  const router = useRouter();
  const pathname = usePathname();
  const current = activeTab(pathname);

  return (
    <View style={styles.nav}>
      <NavItem
        icon="⚙️"
        label="Settings"
        active={current === 'settings'}
        onPress={() => router.replace('/settings')}
      />
      <NavItem
        icon="📦"
        label="Inventory"
        active={current === 'inventory'}
        onPress={() => router.replace('/inventory')}
      />
    </View>
  );
}

function NavItem({
  icon,
  label,
  active,
  onPress,
}: {
  icon: string;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.navItem}>
      <Text style={styles.navIcon}>{icon}</Text>
      <Text style={[styles.navLabel, active ? styles.navLabelActive : null]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#E4DDF5',
    paddingTop: 10,
    paddingBottom: 4,
  },
  navItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  navIcon: {
    fontSize: 22,
    marginBottom: 2,
  },
  navLabel: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 11,
    color: colors.inkSoft,
  },
  navLabelActive: {
    color: colors.purpleDark,
  },
});
