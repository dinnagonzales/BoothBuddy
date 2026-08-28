export async function isSetupComplete(
  gate: { isConfigured(): Promise<boolean> },
  catalog: { listForSeller(): unknown[] },
): Promise<boolean> {
  return (await gate.isConfigured()) && (await catalog.listForSeller()).length > 0;
}
