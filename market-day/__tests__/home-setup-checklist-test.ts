import {
  HOME_SETUP_HIDDEN_STRIP,
  HOME_SETUP_READY_SUBTEXT,
  HOME_SETUP_REQUIRED_SUBTEXT,
  buildHomeSetupTasks,
  canHideHomeSetupChecklist,
  homeSetupHeaderSubtext,
  homeSetupProgress,
  isHomeSetupFullyComplete,
  isHomeSetupRequiredComplete,
  shouldShowHomeSetupChecklist,
  type HomeSetupCompletions,
} from '@/lib/home-setup-checklist';

const incomplete: HomeSetupCompletions = {
  hasInventory: false,
  hasPaymentMethod: false,
  hasLogo: false,
};

const requiredOnly: HomeSetupCompletions = {
  hasInventory: true,
  hasPaymentMethod: false,
  hasLogo: false,
};

const allDone: HomeSetupCompletions = {
  hasInventory: true,
  hasPaymentMethod: true,
  hasLogo: true,
};

test('only inventory is required; payment and logo are optional', () => {
  const tasks = buildHomeSetupTasks(incomplete);
  expect(tasks.map((task) => [task.id, task.kind])).toEqual([
    ['inventory', 'required'],
    ['payment', 'optional'],
    ['logo', 'optional'],
  ]);
});

test('progress and header follow the required task only', () => {
  expect(homeSetupProgress(incomplete)).toBe(0);
  expect(homeSetupHeaderSubtext(incomplete)).toBe(HOME_SETUP_REQUIRED_SUBTEXT);
  expect(isHomeSetupRequiredComplete(incomplete)).toBe(false);
  expect(canHideHomeSetupChecklist(incomplete)).toBe(false);

  expect(homeSetupProgress(requiredOnly)).toBe(1);
  expect(homeSetupHeaderSubtext(requiredOnly)).toBe(HOME_SETUP_READY_SUBTEXT);
  expect(isHomeSetupRequiredComplete(requiredOnly)).toBe(true);
  expect(canHideHomeSetupChecklist(requiredOnly)).toBe(true);
});

test('optional completions do not move progress or header text', () => {
  const optionalDone: HomeSetupCompletions = {
    hasInventory: false,
    hasPaymentMethod: true,
    hasLogo: true,
  };

  expect(homeSetupProgress(optionalDone)).toBe(0);
  expect(homeSetupHeaderSubtext(optionalDone)).toBe(HOME_SETUP_REQUIRED_SUBTEXT);
  expect(canHideHomeSetupChecklist(optionalDone)).toBe(false);

  const tasks = buildHomeSetupTasks(optionalDone);
  expect(tasks.find((task) => task.id === 'payment')?.complete).toBe(true);
  expect(tasks.find((task) => task.id === 'inventory')?.complete).toBe(false);
});

test('checklist leaves home only when every task is complete', () => {
  expect(shouldShowHomeSetupChecklist(requiredOnly)).toBe(true);
  expect(isHomeSetupFullyComplete(requiredOnly)).toBe(false);
  expect(shouldShowHomeSetupChecklist(allDone)).toBe(false);
  expect(isHomeSetupFullyComplete(allDone)).toBe(true);
  expect(HOME_SETUP_HIDDEN_STRIP).toContain('optional setup steps');
});
