export type HomeSetupTaskId = 'inventory' | 'payment' | 'logo';

export type HomeSetupTaskKind = 'required' | 'optional';

export type HomeSetupCompletions = {
  hasInventory: boolean;
  hasPaymentMethod: boolean;
  hasLogo: boolean;
};

export type HomeSetupTask = {
  id: HomeSetupTaskId;
  kind: HomeSetupTaskKind;
  title: string;
  subtitle: string;
  complete: boolean;
};

export const HOME_SETUP_REQUIRED_SUBTEXT = 'Add an item to start selling';
export const HOME_SETUP_READY_SUBTEXT = 'Ready to sell ✓ — optional steps below';
export const HOME_SETUP_HIDDEN_STRIP =
  '✓ Ready to sell — tap to see optional setup steps.';

export function buildHomeSetupTasks(completions: HomeSetupCompletions): HomeSetupTask[] {
  return [
    {
      id: 'inventory',
      kind: 'required',
      title: 'Add your first item',
      subtitle: 'So you have something to sell',
      complete: completions.hasInventory,
    },
    {
      id: 'payment',
      kind: 'optional',
      title: 'Add a mobile payment method',
      subtitle: 'Venmo, CashApp, Zelle, etc.',
      complete: completions.hasPaymentMethod,
    },
    {
      id: 'logo',
      kind: 'optional',
      title: 'Add your logo',
      subtitle: 'Shows on your receipts',
      complete: completions.hasLogo,
    },
  ];
}

export function isHomeSetupRequiredComplete(completions: HomeSetupCompletions): boolean {
  return completions.hasInventory;
}

export function isHomeSetupFullyComplete(completions: HomeSetupCompletions): boolean {
  return completions.hasInventory && completions.hasPaymentMethod && completions.hasLogo;
}

/** Progress is binary: required task only. */
export function homeSetupProgress(completions: HomeSetupCompletions): number {
  return isHomeSetupRequiredComplete(completions) ? 1 : 0;
}

export function homeSetupHeaderSubtext(completions: HomeSetupCompletions): string {
  return isHomeSetupRequiredComplete(completions)
    ? HOME_SETUP_READY_SUBTEXT
    : HOME_SETUP_REQUIRED_SUBTEXT;
}

/** Hide only appears once the seller can actually sell. */
export function canHideHomeSetupChecklist(completions: HomeSetupCompletions): boolean {
  return isHomeSetupRequiredComplete(completions);
}

/** Card stays until every task is done, or the user Hides after required is met. */
export function shouldShowHomeSetupChecklist(completions: HomeSetupCompletions): boolean {
  return !isHomeSetupFullyComplete(completions);
}
