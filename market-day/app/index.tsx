import { Redirect, useFocusEffect, useRouter } from 'expo-router';
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

import { PassCodeSheet } from '@/components/PassCodeSheet';
import { Screen } from '@/components/Screen';
import { colors } from '@/constants/theme';
import { useCart } from '@/context/CartContext';
import { useGrownUpSession } from '@/context/GrownUpSessionContext';
import { createSqliteCatalog } from '@/lib/db/catalog';
import { getHomeItems, getActiveMarketDay } from '@/lib/db/queries';
import { deviceParentalGate } from '@/lib/device-parental-gate';
import { formatMarketDayDate } from '@/lib/market-day';
import { formatMoney } from '@/lib/money';
import { resetAppForForgottenCode } from '@/lib/reset-app';
import { isSetupComplete } from '@/lib/setup';
import type { Item } from '@/lib/types';

type HomeItem = Item & { soldOut?: boolean };

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
            <Stop offset="100%" stopColor={colors.purple} />
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
  const { addItem, setIsQuickSale } = useCart();
  const { unlocked, unlock } = useGrownUpSession();
  const [setupReady, setSetupReady] = useState<boolean | null>(null);
  const [items, setItems] = useState<HomeItem[]>([]);
  const [canSell, setCanSell] = useState(false);
  const [activeMarket, setActiveMarket] = useState<ActiveMarketSummary | null>(null);
  const [passCodeOpen, setPassCodeOpen] = useState(false);

  const openQuickSale = () => {
    setIsQuickSale(true);
    router.push('/sell');
  };

  const openSettings = () => {
    if (unlocked) {
      router.push('/settings');
      return;
    }
    setPassCodeOpen(true);
  };

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      const catalog = createSqliteCatalog(db);

      isSetupComplete(deviceParentalGate, catalog)
        .then(async (complete) => {
          if (cancelled) return;
          setSetupReady(complete);
          if (complete) {
            setItems(await getHomeItems(db));
            const marketDay = await getActiveMarketDay(db);
            if (marketDay) {
              setCanSell(true);
              setActiveMarket({
                name: marketDay.name,
                dateLabel: formatMarketDayDate(marketDay.startedAt),
              });
            } else {
              setCanSell(false);
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
    if (!canSell || item.soldOut) return;
    addItem({
      itemId: item.id,
      name: item.name,
      emoji: item.emoji,
      priceCents: item.priceCents,
      costCents: item.costCents,
    });
    router.push('/sell');
  };

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
              accessibilityLabel="Settings"
              style={styles.gearButton}
              onPress={openSettings}>
              <Text style={styles.gearIcon}>⚙️</Text>
            </Pressable>
            <Text style={styles.title}>🎪 Market Day</Text>
            <Pressable
              accessibilityLabel="Quick Sale"
              style={styles.quickSaleButton}
              onPress={openQuickSale}>
              <Text style={styles.quickSaleIcon}>+</Text>
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

          <Text style={styles.menuLabel}>🍭 Available Items</Text>


          <FlatList
            data={items}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.itemList}
            style={styles.itemListScroll}
            ListEmptyComponent={
              <Text style={styles.emptyItems}>
                No items yet — ask a grown-up to add some in setup.
              </Text>
            }
            renderItem={({ item }) => (
              <Pressable
                accessibilityRole="button"
                disabled={!canSell || item.soldOut}
                onPress={() => openSellWithItem(item)}
                style={({ pressed }) => [
                  styles.menuRow,
                  item.soldOut ? styles.menuRowSoldOut : null,
                  pressed && canSell && !item.soldOut ? styles.menuRowPressed : null,
                ]}>
                <Text style={styles.menuEmoji}>{item.emoji}</Text>
                <View style={styles.menuNameWrap}>
                  <Text style={[styles.menuName, item.soldOut ? styles.menuNameSoldOut : null]}>
                    {item.name}
                  </Text>
                  {item.soldOut ? <Text style={styles.soldOutLabel}>Sold out</Text> : null}
                </View>
                <Text style={[styles.menuPrice, item.soldOut ? styles.menuPriceSoldOut : null]}>
                  {formatMoney(item.priceCents)}
                </Text>
              </Pressable>
            )}
          />

          <View style={styles.sellButtonWrap}>
            {!canSell ? (
              <Text style={styles.sellHint}>No active Market Day — start one in ⚙️ settings.</Text>
            ) : null}
            <Pressable
              accessibilityRole="button"
              disabled={!canSell}
              onPress={() => router.push('/sell')}
              style={({ pressed }) => [
                styles.sellButtonOuter,
                !canSell ? styles.sellButtonDisabled : null,
                pressed && canSell ? styles.sellButtonOuterPressed : null,
              ]}>
              <View style={styles.sellButtonInner}>
                <Text style={styles.sellButtonLabel}>Make a Sale</Text>
              </View>
            </Pressable>
          </View>
        </View>
      </View>

      <PassCodeSheet
        visible={passCodeOpen}
        onClose={() => setPassCodeOpen(false)}
        onSubmit={(code) => deviceParentalGate.verify(code)}
        onSuccess={() => {
          unlock();
          setPassCodeOpen(false);
          router.push('/settings');
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
    paddingHorizontal: 16,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  title: {
    flex: 1,
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 21,
    color: colors.ink,
    textAlign: 'center',
  },
  quickSaleButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickSaleIcon: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 24,
    color: colors.white,
    lineHeight: 26,
  },
  gearButton: {
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
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: colors.white,
    opacity: 0.85,
    letterSpacing: 0.6,
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: colors.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  menuLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.inkSoft,
    marginBottom: 8,
  },
  menuHint: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: colors.inkSoft,
    marginBottom: 10,
  },
  itemList: {
    gap: 8,
    paddingBottom: 120,
  },
  itemListScroll: {
    flex: 1,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  menuRowPressed: {
    opacity: 0.88,
  },
  menuRowSoldOut: {
    opacity: 0.65,
  },
  menuEmoji: {
    width: 28,
    fontSize: 22,
    textAlign: 'center',
  },
  menuName: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: colors.ink,
  },
  menuNameWrap: {
    flex: 1,
    gap: 2,
  },
  menuNameSoldOut: {
    color: colors.inkSoft,
  },
  soldOutLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: colors.inkSoft,
  },
  menuPrice: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 15,
    color: colors.purpleDark,
  },
  menuPriceSoldOut: {
    color: colors.inkSoft,
  },
  emptyItems: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: colors.inkSoft,
    textAlign: 'center',
    paddingVertical: 24,
  },
  sellHint: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: colors.inkSoft,
    textAlign: 'center',
    marginBottom: 10,
  },
  sellButtonWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 40,
  },
  sellButtonOuter: {
    borderRadius: 22,
    backgroundColor: colors.greenDark,
    paddingBottom: 6,
  },
  sellButtonOuterPressed: {
    paddingBottom: 2,
    marginTop: 4,
  },
  sellButtonInner: {
    backgroundColor: colors.green,
    borderRadius: 22,
    paddingVertical: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellButtonDisabled: {
    opacity: 0.45,
  },
  sellButtonLabel: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 21,
    color: colors.white,
  },
});
