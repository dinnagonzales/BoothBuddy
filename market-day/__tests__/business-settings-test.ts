import {
  businessSettingsEqual,
  normalizeBusinessSettings,
  normalizeVenmoHandle,
} from '@/lib/business-settings';

test('normalizeBusinessSettings trims text and strips leading @ from venmo handle', () => {
  expect(
    normalizeBusinessSettings({
      businessName: '  Dragon Shop  ',
      businessLogoUri: ' file://logo.png ',
      zelleContact: 'mom@email.com',
      zelleQrUri: ' file://zelle.png ',
      venmoHandle: '@emma-shop',
      venmoQrUri: ' file://venmo.png ',
    }),
  ).toEqual({
    businessName: 'Dragon Shop',
    businessLogoUri: 'file://logo.png',
    zelleName: '',
    zelleContact: 'mom@email.com',
    zelleQrUri: 'file://zelle.png',
    venmoHandle: 'emma-shop',
    venmoQrUri: 'file://venmo.png',
  });
});

test('normalizeBusinessSettings clears empty optional values', () => {
  expect(
    normalizeBusinessSettings({
      businessName: '',
      businessLogoUri: '   ',
      zelleContact: '',
      zelleQrUri: null,
      venmoHandle: '   ',
      venmoQrUri: undefined,
    }),
  ).toEqual({
    businessName: '',
    businessLogoUri: null,
    zelleName: '',
    zelleContact: '',
    zelleQrUri: null,
    venmoHandle: '',
    venmoQrUri: null,
  });
});

test('normalizeBusinessSettings stores phone digits for zelle contact', () => {
  expect(
    normalizeBusinessSettings({
      zelleContact: '(555) 123-4567',
    }).zelleContact,
  ).toBe('5551234567');
});

test('normalizeVenmoHandle removes leading @ characters', () => {
  expect(normalizeVenmoHandle('@shop')).toBe('shop');
  expect(normalizeVenmoHandle('@@@shop')).toBe('shop');
});

test('businessSettingsEqual compares every field', () => {
  const left = normalizeBusinessSettings({
    businessName: 'Shop',
    venmoHandle: 'emma',
  });
  const right = normalizeBusinessSettings({
    businessName: 'Shop',
    venmoHandle: 'emma',
  });
  const different = normalizeBusinessSettings({
    businessName: 'Other Shop',
    venmoHandle: 'emma',
  });

  expect(businessSettingsEqual(left, right)).toBe(true);
  expect(businessSettingsEqual(left, different)).toBe(false);
});
