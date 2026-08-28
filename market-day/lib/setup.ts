export async function isSetupComplete(
  gate: { isConfigured(): Promise<boolean> },
  catalog: { listForSeller(): Promise<unknown[]> },
): Promise<boolean> {
  if (!(await gate.isConfigured())) return false;
  return (await catalog.listForSeller()).length > 0;
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
  catalog: { listForSeller(): Promise<unknown[]> },
): Promise<SetupStep | 'complete'> {
  if (!(await gate.isConfigured())) return 'code';
  if ((await catalog.listForSeller()).length === 0) return 'item';
  return 'complete';
}
