import { Redirect, useFocusEffect, useRouter, type Href } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Defs, LinearGradient as SvgGradient, Rect, Stop } from 'react-native-svg';

import { BoothBuddyLogo } from '@/components/BoothBuddyLogo';
import { PassCodeSheet } from '@/components/PassCodeSheet';
import { Screen } from '@/components/Screen';
import { IconTile } from '@/components/ui/IconTile';
import { colors } from '@/constants/theme';
import { fonts, radii, spacing } from '@/constants/visual';
import { useCart } from '@/context/CartContext';
import { useGrownUpSession } from '@/context/GrownUpSessionContext';
import { getAdminProfile } from '@/lib/db/admin-profile';
import { getHomeItems, getActiveMarketDay } from '@/lib/db/queries';
import { getPasscodeGateEnabled } from '@/lib/db/passcode-gate-settings';
import { deviceParentalGate } from '@/lib/device-parental-gate';
import { formatMarketDayDate } from '@/lib/market-day';
import { formatMoney } from '@/lib/money';
import { resetAppForForgottenCode } from '@/lib/reset-app';
import { isSetupComplete } from '@/lib/setup';
import { homeVisualSize, resolveItemVisual, iconTileProps, HOME_MENU_ICON_SIZE } from '@/lib/item-visual';
import type { Item } from '@/lib/types';

type HomeItem = Item & { soldOut?: boolean };

type MenuRow = HomeItem[];

function chunkMenuRows(items: HomeItem[]): MenuRow[] {
  const rows: MenuRow[] = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push(items.slice(i, i + 2));
  }
  return rows;
}

type ActiveMarketSummary = {
  name: string;
  dateLabel: string;
};

function HeroCard({ children }: { children: ReactNode }) {
  return (
    <View style={styles.heroCard}>
      <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none">
        <Defs>
          <SvgGradient id="heroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.pink} />
            <Stop offset="100%" stopColor={colors.pink600} />
          </SvgGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#heroGradient)" />
      </Svg>
      <View style={styles.heroContent}>{children}</View>
    </View>
  );
}

export default function HomeScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { addItem, setIsQuickSale, setIsPreorder } = useCart();
  const { unlocked, unlock } = useGrownUpSession();
  const [setupReady, setSetupReady] = useState<boolean | null>(null);
  const [items, setItems] = useState<HomeItem[]>([]);
  const [activeMarket, setActiveMarket] = useState<ActiveMarketSummary | null>(null);
  const [passCodeOpen, setPassCodeOpen] = useState(false);
  const [passcodeGateEnabled, setPasscodeGateEnabled] = useState(true);
  const [postUnlockPath, setPostUnlockPath] = useState<Href>('/settings');

  const openPreorder = () => {
    setIsQuickSale(true);
    setIsPreorder(true);
    router.push('/sell');
  };

  const openGrownUpRoute = (path: '/settings' | '/inventory' | '/inventory?add=1') => {
    if (!passcodeGateEnabled) {
      unlock();
      router.push(path);
      return;
    }
    if (unlocked) {
      router.push(path);
      return;
    }
    setPostUnlockPath(path);
    setPassCodeOpen(true);
  };

  const openSettings = () => openGrownUpRoute('/settings');
  const openInventory = () => openGrownUpRoute('/inventory?add=1');

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      isSetupComplete({
        gate: deviceParentalGate,
        profile: { get: () => getAdminProfile(db) },
      })
        .then(async (complete) => {
          if (cancelled) return;
          setSetupReady(complete);
          setPasscodeGateEnabled(await getPasscodeGateEnabled(db));
          if (complete) {
            setItems(await getHomeItems(db));
            const marketDay = await getActiveMarketDay(db);
            if (marketDay) {
              setActiveMarket({
                name: marketDay.name,
                dateLabel: formatMarketDayDate(marketDay.startedAt),
              });
            } else {
              setActiveMarket(null);
            }
          }
        })
        .catch(() => {
          if (!cancelled) setSetupReady(false);
        });

      return () => {
        cancelled = true;
      };
    }, [db]),
  );

  const openSellWithItem = (item: HomeItem) => {
    if (item.soldOut) return;
    addItem({
      itemId: item.id,
      name: item.name,
      icon: item.icon,
      priceCents: item.priceCents,
      costCents: item.costCents,
    });
    router.push('/sell');
  };

  const menuRows = chunkMenuRows(items);

  if (setupReady === null) {
    return (
      <Screen>
        <View style={styles.page}>
          <View style={styles.container}>
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={colors.purple} />
            </View>
          </View>
        </View>
      </Screen>
    );
  }

  if (!setupReady) {
    return <Redirect href="/setup" />;
  }

  return (
    <Screen>
      <View style={styles.page}>
        <View style={styles.container}>
          <View style={styles.topBar}>
            <Pressable
              accessibilityLabel="Events"
              style={styles.gearButton}
              onPress={openSettings}>
              <Text style={styles.gearIcon}>⚙️</Text>
            </Pressable>
            <View pointerEvents="none" style={styles.titleWrap}>
              <BoothBuddyLogo variant="long" />
            </View>
            <Pressable
              accessibilityLabel="Pre-order"
              style={styles.preorderButton}
              onPress={openPreorder}>
              <Text style={styles.preorderButtonLabel}>+ Pre-order</Text>
            </Pressable>
          </View>

          {activeMarket ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`View ${activeMarket.name} sales`}
              onPress={() => router.push('/market-day')}
              style={({ pressed }) => [styles.heroCardWrap, pressed && styles.heroCardPressed]}>
              <HeroCard>
                <Text style={styles.heroEyebrow}>
                  {activeMarket.name.toUpperCase()} · {activeMarket.dateLabel.toUpperCase()}
                </Text>
                <Text style={styles.heroSubtitle}>Tap for today&apos;s sales · sell something below</Text>
              </HeroCard>
            </Pressable>
          ) : null}

          <View style={styles.sellButtonWrap}>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setIsQuickSale(false);
                setIsPreorder(false);
                router.push('/sell');
              }}
              style={({ pressed }) => [
                styles.sellButtonOuter,
                pressed ? styles.sellButtonOuterPressed : null,
              ]}>
              <View style={styles.sellButtonInner}>
                <Text style={styles.sellButtonLabel}>Make a Sale</Text>
              </View>
            </Pressable>
          </View>

          <Text style={styles.menuLabel}>🍭 Available Items</Text>
          <Text style={styles.menuHint}>Tap an item to start a sale</Text>

          {items.length === 0 ? (
            <View style={styles.itemList}>
              <Text style={styles.emptyMenuText}>Update Inventory to Complete a Sale</Text>
              <View style={styles.menuGridRow}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Add Item"
                  onPress={openInventory}
                  style={({ pressed }) => [styles.menuTile, styles.addItemTile, pressed && styles.menuTilePressed]}>
                  <Text style={styles.addItemPlus}>+</Text>
                  <Text style={styles.addItemLabel}>Add Item</Text>
                </Pressable>
                <View style={styles.menuTileSpacer} />
              </View>
            </View>
          ) : (
            <FlatList
              key="home-menu-grid"
              data={menuRows}
              keyExtractor={(row) => String(row[0]?.id ?? 'empty-row')}
              contentContainerStyle={styles.itemList}
              style={styles.itemListScroll}
              renderItem={({ item: row }) => (
                <View style={styles.menuGridRow}>
                  {row.map((item) => {
                    const visual = resolveItemVisual(item);
                    const tileSize = visual ? homeVisualSize(visual) : HOME_MENU_ICON_SIZE;
                    return (
                    <Pressable
                      key={item.id}
                      accessibilityRole="button"
                      disabled={item.soldOut}
                      onPress={() => openSellWithItem(item)}
                      style={({ pressed }) => [
                        styles.menuTile,
                        item.soldOut ? styles.menuTileSoldOut : null,
                        pressed && !item.soldOut ? styles.menuTilePressed : null,
                      ]}>
                      <IconTile
                        {...iconTileProps(item)}
                        size={tileSize}
                        style={styles.menuTileIconWrap}
                      />
                      <Text
                        style={[styles.menuTileName, item.soldOut ? styles.menuTileNameSoldOut : null]}
                        numberOfLines={2}>
                        {item.name}
                      </Text>
                      <Text
                        style={[
                          styles.menuTilePrice,
                          item.soldOut ? styles.menuTilePriceSoldOut : null,
                        ]}>
                        {formatMoney(item.priceCents)}
                      </Text>
                      {item.soldOut ? <Text style={styles.soldOutLabel}>Sold out</Text> : null}
                    </Pressable>
                    );
                  })}
                  {row.length === 1 ? <View style={styles.menuTileSpacer} /> : null}
                </View>
              )}
            />
          )}
        </View>
      </View>

      <PassCodeSheet
        visible={passCodeOpen}
        onClose={() => setPassCodeOpen(false)}
        onSubmit={(code) => deviceParentalGate.verify(code)}
        onSuccess={() => {
          unlock();
          setPassCodeOpen(false);
          router.push(postUnlockPath);
        }}
        onForgotCode={async () => {
          await resetAppForForgottenCode(db, deviceParentalGate);
          setPassCodeOpen(false);
          router.replace('/setup');
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: 'center',
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 440,
    paddingHorizontal: spacing.screen,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBar: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 38,
    marginBottom: 12,
  },
  titleWrap: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearButton: {
    zIndex: 1,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearIcon: {
    fontSize: 16,
  },
  preorderButton: {
    zIndex: 1,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.green,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preorderButtonLabel: {
    fontFamily: fonts.heading.semiBold,
    fontSize: 13,
    color: colors.green,
  },
  heroCard: {
    borderRadius: 26,
    overflow: 'hidden',
  },
  heroCardPressed: {
    opacity: 0.92,
  },
  heroCardWrap: {
    marginBottom: 18,
  },
  heroContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  heroEyebrow: {
    fontFamily: fonts.body.bold,
    fontSize: 12,
    color: colors.ink,
    opacity: 0.85,
    letterSpacing: 0.6,
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontFamily: fonts.body.bold,
    fontSize: 13,
    color: colors.ink,
    opacity: 0.9,
    textAlign: 'center',
  },
  menuLabel: {
    fontFamily: fonts.body.extraBold,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.inkSoft,
    marginBottom: 8,
  },
  menuHint: {
    fontFamily: fonts.body.regular,
    fontSize: 12,
    color: colors.inkSoft,
    marginBottom: 10,
  },
  emptyMenuText: {
    fontFamily: fonts.body.semiBold,
    fontSize: 14,
    color: colors.inkSoft,
    textAlign: 'center',
    marginBottom: 12,
  },
  itemList: {
    paddingBottom: 40,
  },
  itemListScroll: {
    flex: 1,
  },
  menuGridRow: {
    flexDirection: 'row',
    gap: spacing.itemListGap,
    marginBottom: spacing.itemListGap,
  },
  menuTile: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: colors.white,
    borderRadius: radii.itemRow,
    paddingHorizontal: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  menuTileSpacer: {
    flex: 1,
  },
  menuTilePressed: {
    opacity: 0.88,
  },
  menuTileSoldOut: {
    opacity: 0.65,
  },
  menuTileIconWrap: {
    marginBottom: 2,
  },
  menuTileName: {
    fontFamily: fonts.body.extraBold,
    fontSize: 15,
    color: colors.ink,
    textAlign: 'center',
  },
  menuTileNameSoldOut: {
    color: colors.inkSoft,
  },
  soldOutLabel: {
    fontFamily: fonts.body.bold,
    fontSize: 10,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: colors.inkSoft,
  },
  menuTilePrice: {
    fontFamily: fonts.heading.semiBold,
    fontSize: 17,
    color: colors.purpleDark,
  },
  menuTilePriceSoldOut: {
    color: colors.inkSoft,
  },
  addItemTile: {
    borderWidth: 2,
    borderColor: colors.purple,
    borderStyle: 'dashed',
    backgroundColor: colors.white,
  },
  addItemPlus: {
    fontFamily: fonts.heading.semiBold,
    fontSize: 52,
    lineHeight: 58,
    color: colors.purple,
    textAlign: 'center',
  },
  addItemLabel: {
    fontFamily: fonts.body.extraBold,
    fontSize: 15,
    color: colors.purpleDark,
    textAlign: 'center',
  },
  sellButtonWrap: {
    marginBottom: 18,
  },
  sellButtonOuter: {
    borderRadius: radii.sellCta,
    backgroundColor: colors.greenDark,
    paddingBottom: 6,
  },
  sellButtonOuterPressed: {
    paddingBottom: 2,
    marginTop: 4,
  },
  sellButtonInner: {
    backgroundColor: colors.green,
    borderRadius: radii.sellCta,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellButtonLabel: {
    fontFamily: fonts.heading.semiBold,
    fontSize: 18,
    color: colors.white,
  },
});
