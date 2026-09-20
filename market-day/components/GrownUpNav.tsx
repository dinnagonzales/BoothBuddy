import { usePathname, useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ClipboardList, Receipt, Settings, ShelvingUnit, Store } from 'lucide-react-native';

import { UiIcon } from '@/components/ui/UiIcon';
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
  const insets = useSafeAreaInsets();
  const current = activeTab(pathname);
  const iconColor = (active: boolean) => (active ? colors.purpleDark : colors.inkSoft);

  return (
    <View style={[styles.nav, { paddingBottom: Math.max(insets.bottom, 4) }]}>
      <NavItem
        icon={<UiIcon icon={Store} size={22} color={iconColor(current === 'events')} />}
        label="Events"
        active={current === 'events'}
        onPress={() => router.replace('/settings')}
      />
      <NavItem
        icon={<UiIcon icon={ShelvingUnit} size={22} color={iconColor(current === 'inventory')} />}
        label="Inventory"
        active={current === 'inventory'}
        onPress={() => router.replace('/inventory')}
      />
      <NavItem
        icon={<UiIcon icon={ClipboardList} size={22} color={iconColor(current === 'preorders')} />}
        label="Preorders"
        active={current === 'preorders'}
        onPress={() => router.replace('/preorders')}
      />
      <NavItem
        icon={<UiIcon icon={Receipt} size={22} color={iconColor(current === 'sales')} />}
        label="Sales"
        active={current === 'sales'}
        onPress={() => router.replace('/sales')}
      />
      <NavItem
        icon={<UiIcon icon={Settings} size={22} color={iconColor(current === 'business')} />}
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
  icon: ReactNode;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.navItem}>
      <View style={styles.navIcon}>{icon}</View>
      <Text style={[styles.navLabel, active ? styles.navLabelActive : null]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
    paddingTop: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
  navIcon: {
    marginBottom: 2,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
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
