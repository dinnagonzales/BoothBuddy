import {
  formatPhoneNumber,
  formatZelleContact,
  formatZelleContactForInput,
  normalizeZelleContactInput,
} from '@/lib/contact-format';

test('formatPhoneNumber formats US 10-digit numbers', () => {
  expect(formatPhoneNumber('5551234567')).toBe('(555) 123-4567');
  expect(formatPhoneNumber('(555) 123-4567')).toBe('(555) 123-4567');
  expect(formatPhoneNumber('15551234567')).toBe('(555) 123-4567');
});

test('formatPhoneNumber formats partial numbers while typing', () => {
  expect(formatPhoneNumber('555')).toBe('555');
  expect(formatPhoneNumber('5551')).toBe('(555) 1');
  expect(formatPhoneNumber('5551234')).toBe('(555) 123-4');
});

test('formatZelleContact keeps email and formats phone', () => {
  expect(formatZelleContact('mom@email.com')).toBe('mom@email.com');
  expect(formatZelleContact('5551234567')).toBe('(555) 123-4567');
});

test('normalizeZelleContactInput stores digits for phone and email as-is', () => {
  expect(normalizeZelleContactInput('mom@email.com')).toBe('mom@email.com');
  expect(normalizeZelleContactInput('(555) 123-4567')).toBe('5551234567');
});

test('formatZelleContactForInput mirrors display formatting', () => {
  expect(formatZelleContactForInput('5551234567')).toBe('(555) 123-4567');
  expect(formatZelleContactForInput('mom@email.com')).toBe('mom@email.com');
});
