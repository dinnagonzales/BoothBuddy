import { Alert } from 'react-native';

export const UI_ERROR_TITLE = 'Something went wrong';
export const UI_ERROR_MESSAGE = 'Please try again.';

/** Friendly Alert for unexpected failures; logs the real error in __DEV__. */
export function showUiError(error: unknown): void {
  Alert.alert(UI_ERROR_TITLE, UI_ERROR_MESSAGE);
  if (__DEV__) {
    console.warn('[ui-error]', error);
  }
}

/** Run a write with busy flag + shared error Alert; always clears busy. */
export async function runBusyAction(
  action: () => Promise<void>,
  setBusy: (busy: boolean) => void,
): Promise<void> {
  setBusy(true);
  try {
    await action();
  } catch (error) {
    showUiError(error);
  } finally {
    setBusy(false);
  }
}
