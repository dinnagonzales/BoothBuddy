import { createCatalog } from '@/lib/catalog';
import { createMemorySecretStore, createParentalGate } from '@/lib/parental-gate';
import { beginFreshSetupIfNoCode, getSetupStep, isSetupComplete } from '@/lib/setup';

test('setup is incomplete on a fresh app', async () => {
  const gate = createParentalGate(createMemorySecretStore());
  const catalog = createCatalog();

  expect(await isSetupComplete(gate, catalog)).toBe(false);
});

test('setup is complete after a parental code and a first Item', async () => {
  const gate = createParentalGate(createMemorySecretStore());
  const catalog = createCatalog();

  await gate.setCode('1234');
  await catalog.createItem({
    name: 'Dragon',
    emoji: '🐉',
    costCents: 100,
    priceCents: 400,
  });

  expect(await isSetupComplete(gate, catalog)).toBe(true);
});

test('setup is incomplete with a parental code but no Items', async () => {
  const gate = createParentalGate(createMemorySecretStore());
  const catalog = createCatalog();

  await gate.setCode('1234');

  expect(await isSetupComplete(gate, catalog)).toBe(false);
});

test('setup is incomplete with an Item but no parental code', async () => {
  const gate = createParentalGate(createMemorySecretStore());
  const catalog = createCatalog();

  await catalog.createItem({
    name: 'Dragon',
    emoji: '🐉',
    costCents: 100,
    priceCents: 400,
  });

  expect(await isSetupComplete(gate, catalog)).toBe(false);
});

test('setup is incomplete when the only Item is archived', async () => {
  const gate = createParentalGate(createMemorySecretStore());
  const catalog = createCatalog();

  await gate.setCode('1234');
  const item = await catalog.createItem({
    name: 'Dragon',
    emoji: '🐉',
    costCents: 100,
    priceCents: 400,
  });
  await catalog.archive(item.id);

  expect(await isSetupComplete(gate, catalog)).toBe(false);
});

test('seller cannot sell after setup when there is no Active Market Day', async () => {
  const gate = createParentalGate(createMemorySecretStore());
  const catalog = createCatalog();

  await gate.setCode('1234');
  await catalog.createItem({
    name: 'Dragon',
    emoji: '🐉',
    costCents: 100,
    priceCents: 400,
  });

  expect(await isSetupComplete(gate, catalog)).toBe(true);
  expect(await catalog.getActiveMarketDay()).toBeNull();
});

test('missing code always starts at the code setup step', async () => {
  const gate = createParentalGate(createMemorySecretStore());
  const catalog = createCatalog();

  await catalog.createItem({
    name: 'Dragon',
    emoji: '🐉',
    costCents: 100,
    priceCents: 400,
  });

  expect(await getSetupStep(gate, catalog)).toBe('code');
});

test('beginFreshSetupIfNoCode clears shop data when no code exists', async () => {
  const gate = createParentalGate(createMemorySecretStore());
  const catalog = createCatalog();
  let shopCleared = false;

  await catalog.createItem({
    name: 'Dragon',
    emoji: '🐉',
    costCents: 100,
    priceCents: 400,
  });

  await beginFreshSetupIfNoCode(gate, async () => {
    shopCleared = true;
  });

  expect(shopCleared).toBe(true);
  expect(await getSetupStep(gate, catalog)).toBe('code');
});
