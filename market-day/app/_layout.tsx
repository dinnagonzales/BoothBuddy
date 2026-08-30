import 'react-native-gesture-handler';
import '../global.css';

import { useFonts } from 'expo-font';

import { APP_FONT_FACES } from '@/constants/app-fonts';
import { colors } from '@/constants/theme';
import { ActivityIndicator, Text, View } from 'react-native';
import { SQLiteProvider } from 'expo-sqlite';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { HeroUINativeProvider } from 'heroui-native/provider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Suspense, useEffect } from 'react';

import { CartProvider } from '@/context/CartContext';
import { GrownUpSessionProvider } from '@/context/GrownUpSessionContext';
import { initDatabase } from '@/lib/db/schema';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts(APP_FONT_FACES);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.purple} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HeroUINativeProvider>
        <Suspense
          fallback={
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.screen }}>
              <ActivityIndicator size="large" color={colors.purple} />
              <Text style={{ color: colors.inkSoft, fontFamily: 'Nunito_700Bold', marginTop: 12 }}>
                Loading Market Day…
              </Text>
            </View>
          }>
          <SQLiteProvider databaseName="market-day-v1.db" onInit={initDatabase} useSuspense>
            <CartProvider>
              <GrownUpSessionProvider>
              <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.screen } }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="setup" options={{ gestureEnabled: false }} />
                <Stack.Screen name="sell" />
                <Stack.Screen name="payment" />
                <Stack.Screen name="market-day" />
                <Stack.Screen name="settings" />
                <Stack.Screen name="inventory" />
                <Stack.Screen name="preorders" />
                <Stack.Screen name="sales" />
                <Stack.Screen name="business" />
                <Stack.Screen name="sale/[saleNumber]" />
                <Stack.Screen name="past/[id]" />
                <Stack.Screen
                  name="celebration"
                  options={{ presentation: 'transparentModal', animation: 'fade' }}
                />
              </Stack>
              </GrownUpSessionProvider>
            </CartProvider>
          </SQLiteProvider>
        </Suspense>
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}
