import 'react-native-gesture-handler';
import '../global.css';

import { ActivityIndicator, Text, View } from 'react-native';
import { SQLiteProvider } from 'expo-sqlite';
import { Stack } from 'expo-router';
import { HeroUINativeProvider } from 'heroui-native/provider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Suspense } from 'react';

import { CartProvider } from '@/context/CartContext';
import { initDatabase } from '@/lib/db/schema';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HeroUINativeProvider>
        <SQLiteProvider databaseName="market-day-v1.db" onInit={initDatabase}>
          <CartProvider>
            <Suspense
              fallback={
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3E9FF' }}>
                  <ActivityIndicator size="large" color="#9B5DE5" />
                  <Text style={{ color: '#6E6480', fontWeight: '700', marginTop: 12 }}>
                    Loading Market Day…
                  </Text>
                </View>
              }>
              <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F3E9FF' } }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="setup" options={{ gestureEnabled: false }} />
                <Stack.Screen name="sell" />
                <Stack.Screen name="payment" />
                <Stack.Screen name="settings" />
                <Stack.Screen
                  name="celebration"
                  options={{ presentation: 'transparentModal', animation: 'fade' }}
                />
              </Stack>
            </Suspense>
          </CartProvider>
        </SQLiteProvider>
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}
