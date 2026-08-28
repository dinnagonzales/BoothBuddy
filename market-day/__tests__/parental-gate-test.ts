import { createMemorySecretStore, createParentalGate } from '@/lib/parental-gate';

test('parental gate does not verify when no code is set', async () => {
  const gate = createParentalGate(createMemorySecretStore());

  expect(await gate.verify('1234')).toBe(false);
});

test('parental gate verifies the code that was set', async () => {
  const gate = createParentalGate(createMemorySecretStore());

  await gate.setCode('1234');

  expect(await gate.verify('1234')).toBe(true);
});

test('parental gate does not verify a different code', async () => {
  const gate = createParentalGate(createMemorySecretStore());

  await gate.setCode('1234');

  expect(await gate.verify('9999')).toBe(false);
});

test('parental gate stores a hashed code, not the plaintext', async () => {
  const records: Record<string, string> = {};
  const gate = createParentalGate({
    getItem: async (key) => records[key] ?? null,
    setItem: async (key, value) => {
      records[key] = value;
    },
  });

  await gate.setCode('1234');

  expect(Object.values(records)).not.toContain('1234');
});

test('parental gate is not configured until a code is set', async () => {
  const gate = createParentalGate(createMemorySecretStore());

  expect(await gate.isConfigured()).toBe(false);

  await gate.setCode('1234');

  expect(await gate.isConfigured()).toBe(true);
});
