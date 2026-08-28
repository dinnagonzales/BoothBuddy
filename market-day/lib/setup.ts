export async function isSetupComplete(
  gate: { isConfigured(): Promise<boolean> },
  catalog: { hasActiveItems(): Promise<boolean> },
): Promise<boolean> {
  if (!(await gate.isConfigured())) return false;
  return catalog.hasActiveItems();
}

export async function beginFreshSetupIfNoCode(
  gate: { isConfigured(): Promise<boolean> },
  clearShop: () => Promise<void>,
): Promise<void> {
  if (!(await gate.isConfigured())) {
    await clearShop();
  }
}

export type SetupStep = 'code' | 'item';

export async function getSetupStep(
  gate: { isConfigured(): Promise<boolean> },
  catalog: { hasActiveItems(): Promise<boolean> },
): Promise<SetupStep | 'complete'> {
  if (!(await gate.isConfigured())) return 'code';
  if (!(await catalog.hasActiveItems())) return 'item';
  return 'complete';
}
