import * as SecureStore from 'expo-secure-store';

import { createParentalGate, type SecretStore } from '@/lib/parental-gate';

export const deviceSecretStore: SecretStore = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  deleteItem: (key) => SecureStore.deleteItemAsync(key),
};

export const deviceParentalGate = createParentalGate(deviceSecretStore);
