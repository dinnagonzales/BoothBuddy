import { EMPTY_ADMIN_PROFILE, normalizeAdminProfile, type AdminProfile } from '@/lib/admin-profile';
import { createCatalog } from '@/lib/catalog';
import { createMemorySecretStore, createParentalGate } from '@/lib/parental-gate';
import { beginFreshSetupIfNoCode, getSetupStep, isSetupComplete } from '@/lib/setup';

function createMemoryProfileStore(initial: AdminProfile = EMPTY_ADMIN_PROFILE) {
  let profile = normalizeAdminProfile(initial);

  return {
    get: async () => profile,
    save: async (next: AdminProfile) => {
      profile = normalizeAdminProfile(next);
    },
  };
}

function createSetupDeps(
  gate = createParentalGate(createMemorySecretStore()),
  profile = createMemoryProfileStore(),
) {
  return { gate, profile };
}

test('setup is incomplete on a fresh app', async () => {
  const deps = createSetupDeps();

  expect(await isSetupComplete(deps)).toBe(false);
  expect(await getSetupStep(deps)).toBe('profile');
});

test('setup is incomplete with profile only', async () => {
  const deps = createSetupDeps();
  await deps.profile.save({
    firstName: 'Emma',
    lastName: 'Gonzalez',
    businessName: 'Dragon Shop',
  });

  expect(await isSetupComplete(deps)).toBe(false);
  expect(await getSetupStep(deps)).toBe('code');
});

test('setup is complete after profile and a parental code are set', async () => {
  const deps = createSetupDeps();
  await deps.profile.save({
    firstName: 'Emma',
    lastName: 'Gonzalez',
    businessName: 'Dragon Shop',
  });
  await deps.gate.setCode('1234');

  expect(await isSetupComplete(deps)).toBe(true);
  expect(await getSetupStep(deps)).toBe('complete');
});

test('setup is complete with profile and pass code even when there are no Items', async () => {
  const deps = createSetupDeps();
  await deps.profile.save({
    firstName: 'Emma',
    lastName: 'Gonzalez',
    businessName: 'Dragon Shop',
  });
  await deps.gate.setCode('1234');

  expect(await isSetupComplete(deps)).toBe(true);
});

test('setup is incomplete with an Item but no profile or parental code', async () => {
  const deps = createSetupDeps();
  const catalog = createCatalog();

  await catalog.createItem({
    name: 'Dragon',
    emoji: '🐉',
    costCents: 100,
    priceCents: 400,
  });

  expect(await isSetupComplete(deps)).toBe(false);
});

test('seller can reach Home after setup when there is no Active Market Day', async () => {
  const deps = createSetupDeps();
  const catalog = createCatalog();

  await deps.profile.save({
    firstName: 'Emma',
    lastName: 'Gonzalez',
    businessName: 'Dragon Shop',
  });
  await deps.gate.setCode('1234');

  expect(await isSetupComplete(deps)).toBe(true);
  expect(await catalog.getActiveMarketDay()).toBeNull();
});

test('setup stays complete when today\'s Menu is empty but Items exist in the catalog', async () => {
  const deps = createSetupDeps();
  const catalog = createCatalog();

  await deps.profile.save({
    firstName: 'Emma',
    lastName: 'Gonzalez',
    businessName: 'Dragon Shop',
  });
  await deps.gate.setCode('1234');
  const dragon = await catalog.createItem({
    name: 'Dragon',
    emoji: '🐉',
    costCents: 100,
    priceCents: 400,
  });

  await catalog.startMarketDay('Spring Fair 2026');
  await catalog.removeFromMenu(dragon.id);

  expect(await catalog.listForSeller()).toEqual([]);
  expect(await isSetupComplete(deps)).toBe(true);
  expect(await getSetupStep(deps)).toBe('complete');
});

test('missing profile always starts at the profile setup step', async () => {
  const deps = createSetupDeps();

  expect(await getSetupStep(deps)).toBe('profile');
});

test('beginFreshSetupIfNoCode clears shop data when no code exists', async () => {
  const deps = createSetupDeps();
  const catalog = createCatalog();
  let shopCleared = false;

  await catalog.createItem({
    name: 'Dragon',
    emoji: '🐉',
    costCents: 100,
    priceCents: 400,
  });

  await beginFreshSetupIfNoCode(deps.gate, async () => {
    shopCleared = true;
  });

  expect(shopCleared).toBe(true);
  expect(await getSetupStep(deps)).toBe('profile');
});
