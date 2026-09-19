import { Alert } from 'react-native';

import {
  runBusyAction,
  showUiError,
  UI_ERROR_MESSAGE,
  UI_ERROR_TITLE,
} from '@/lib/ui-errors';

test('showUiError alerts a friendly message and warns in __DEV__', () => {
  const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  const error = new Error('FOREIGN KEY constraint failed');

  showUiError(error);

  expect(alertSpy).toHaveBeenCalledWith(UI_ERROR_TITLE, UI_ERROR_MESSAGE);
  expect(warnSpy).toHaveBeenCalledWith('[ui-error]', error);

  alertSpy.mockRestore();
  warnSpy.mockRestore();
});

test('runBusyAction shows Alert and clears busy when a write rejects', async () => {
  const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  let busy = false;
  const setBusy = (next: boolean) => {
    busy = next;
  };

  await runBusyAction(async () => {
    expect(busy).toBe(true);
    throw new Error('FOREIGN KEY constraint failed');
  }, setBusy);

  expect(busy).toBe(false);
  expect(alertSpy).toHaveBeenCalledWith(UI_ERROR_TITLE, UI_ERROR_MESSAGE);

  alertSpy.mockRestore();
  warnSpy.mockRestore();
});
