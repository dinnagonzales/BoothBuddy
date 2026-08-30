import {
  formatVenmoHandle,
  hasVenmoPaymentInfo,
  hasVenmoZellePaymentInfo,
  hasZellePaymentInfo,
  venmoPayUrl,
} from '@/lib/venmo-payment';
import { EMPTY_BUSINESS_SETTINGS, normalizeBusinessSettings } from '@/lib/business-settings';

test('hasVenmoZellePaymentInfo detects configured zelle or venmo fields', () => {
  expect(hasVenmoZellePaymentInfo(EMPTY_BUSINESS_SETTINGS)).toBe(false);
  expect(
    hasZellePaymentInfo(
      normalizeBusinessSettings({ zelleContact: 'mom@email.com' }),
    ),
  ).toBe(true);
  expect(
    hasVenmoPaymentInfo(
      normalizeBusinessSettings({ venmoHandle: 'emma-shop' }),
    ),
  ).toBe(true);
  expect(
    hasZellePaymentInfo(
      normalizeBusinessSettings({ zelleName: 'Emma Gonzalez' }),
    ),
  ).toBe(true);
  expect(
    hasVenmoZellePaymentInfo(
      normalizeBusinessSettings({ zelleQrUri: 'file://zelle.png' }),
    ),
  ).toBe(true);
});

test('venmoPayUrl encodes handle, amount, and note', () => {
  const url = venmoPayUrl('emma-shop', 650, 'Invoice #12');
  expect(url).toContain('txn=pay');
  expect(url).toContain('recipients=emma-shop');
  expect(url).toContain('amount=6.50');
  expect(url).toContain('note=Invoice');
});

test('formatVenmoHandle prefixes @ when missing', () => {
  expect(formatVenmoHandle('emma-shop')).toBe('@emma-shop');
  expect(formatVenmoHandle('@emma-shop')).toBe('@emma-shop');
});
