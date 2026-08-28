import 'react-native-gesture-handler';
import '../global.css';

import { useFonts } from 'expo-font';
import {
  Fredoka_500Medium,
  Fredoka_600SemiBold,
  Fredoka_700Bold,
} from '@expo-google-fonts/fredoka';
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';
import { ActivityIndicator, Text, View } from 'react-native';
import { SQLiteProvider } from 'expo-sqlite';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { HeroUINativeProvider } from 'heroui-native/provider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Suspense, useEffect } from 'react';

import { CartProvider } from '@/context/CartContext';
import { initDatabase } from '@/lib/db/schema';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Fredoka_500Medium,
    Fredoka_600SemiBold,
    Fredoka_700Bold,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EDE9F5' }}>
        <ActivityIndicator size="large" color="#9B5DE5" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HeroUINativeProvider>
        <Suspense
          fallback={
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3E9FF' }}>
              <ActivityIndicator size="large" color="#9B5DE5" />
              <Text style={{ color: '#6E6480', fontWeight: '700', marginTop: 12 }}>
                Loading Market Day…
              </Text>
            </View>
          }>
          <SQLiteProvider databaseName="market-day-v1.db" onInit={initDatabase} useSuspense>
            <CartProvider>
              <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F3E9FF' } }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="setup" options={{ gestureEnabled: false }} />
                <Stack.Screen name="sell" />
                <Stack.Screen name="payment" />
                <Stack.Screen name="market-day" />
                <Stack.Screen name="settings" />
                <Stack.Screen name="inventory" />
                <Stack.Screen name="sales" />
                <Stack.Screen
                  name="celebration"
                  options={{ presentation: 'transparentModal', animation: 'fade' }}
                />
              </Stack>
            </CartProvider>
          </SQLiteProvider>
        </Suspense>
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}
