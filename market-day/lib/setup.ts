import { isAdminProfileComplete, type AdminProfile } from '@/lib/admin-profile';

export type SetupDeps = {
  gate: { isConfigured(): Promise<boolean> };
  profile: { get(): Promise<AdminProfile> };
};

export async function isSetupComplete(deps: SetupDeps): Promise<boolean> {
  if (!isAdminProfileComplete(await deps.profile.get())) return false;
  return deps.gate.isConfigured();
}

export async function beginFreshSetupIfNoCode(
  gate: { isConfigured(): Promise<boolean> },
  clearShop: () => Promise<void>,
): Promise<void> {
  if (!(await gate.isConfigured())) {
    await clearShop();
  }
}

export type SetupStep = 'profile' | 'code';

export async function getSetupStep(deps: SetupDeps): Promise<SetupStep | 'complete'> {
  if (!isAdminProfileComplete(await deps.profile.get())) return 'profile';
  if (!(await deps.gate.isConfigured())) return 'code';
  return 'complete';
}
