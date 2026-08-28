import * as Crypto from 'expo-crypto';

export type SecretStore = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
};

const CODE_KEY = 'parental-gate-code';

async function hashCode(code: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, code);
}

export function createMemorySecretStore(): SecretStore {
  const records = new Map<string, string>();
  return {
    async getItem(key) {
      return records.get(key) ?? null;
    },
    async setItem(key, value) {
      records.set(key, value);
    },
  };
}

export function createParentalGate(store: SecretStore) {
  return {
    async isConfigured(): Promise<boolean> {
      return (await store.getItem(CODE_KEY)) != null;
    },
    async setCode(code: string): Promise<void> {
      await store.setItem(CODE_KEY, await hashCode(code));
    },
    async verify(code: string): Promise<boolean> {
      const stored = await store.getItem(CODE_KEY);
      if (stored == null) return false;
      return stored === (await hashCode(code));
    },
  };
}
