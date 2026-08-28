import { createParentalGate, type SecretStore } from '@/lib/parental-gate';

// SecureStore is native-only; localStorage is enough for web dev/preview.
export const deviceSecretStore: SecretStore = {
  async getItem(key) {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(key);
  },
  async setItem(key, value) {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(key, value);
  },
};

export const deviceParentalGate = createParentalGate(deviceSecretStore);
