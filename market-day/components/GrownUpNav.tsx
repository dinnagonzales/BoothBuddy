import { usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/theme';

type Tab = 'events' | 'inventory' | 'preorders' | 'sales' | 'business';

function activeTab(pathname: string): Tab {
  if (pathname.includes('inventory')) return 'inventory';
  if (pathname.includes('preorders')) return 'preorders';
  if (pathname.includes('sales')) return 'sales';
  if (pathname.includes('business')) return 'business';
  return 'events';
}

export function GrownUpNav() {
  const router = useRouter();
  const pathname = usePathname();
  const current = activeTab(pathname);

  return (
    <View style={styles.nav}>
      <NavItem
        icon="🎪"
        label="Events"
        active={current === 'events'}
        onPress={() => router.replace('/settings')}
      />
      <NavItem
        icon="📦"
        label="Inventory"
        active={current === 'inventory'}
        onPress={() => router.replace('/inventory')}
      />
      <NavItem
        icon="📋"
        label="Preorders"
        active={current === 'preorders'}
        onPress={() => router.replace('/preorders')}
      />
      <NavItem
        icon="🧾"
        label="Sales"
        active={current === 'sales'}
        onPress={() => router.replace('/sales')}
      />
      <NavItem
        icon="⚙️"
        label="Settings"
        active={current === 'business'}
        onPress={() => router.replace('/business')}
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
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingTop: 10,
    paddingBottom: 4,
  },
  navItem: {
    alignItems: 'center',
    minWidth: 64,
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
