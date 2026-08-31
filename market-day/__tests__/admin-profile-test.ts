import {
  adminProfileDisplayName,
  isAdminProfileComplete,
  normalizeAdminProfile,
} from '@/lib/admin-profile';

test('normalizeAdminProfile trims text fields', () => {
  expect(
    normalizeAdminProfile({
      firstName: '  Emma  ',
      lastName: ' Gonzalez ',
      businessName: ' Dragon Shop ',
    }),
  ).toEqual({
    firstName: 'Emma',
    lastName: 'Gonzalez',
    businessName: 'Dragon Shop',
  });
});

test('isAdminProfileComplete requires first name, last name, and business name', () => {
  expect(
    isAdminProfileComplete({
      firstName: 'Emma',
      lastName: 'Gonzalez',
      businessName: 'Dragon Shop',
    }),
  ).toBe(true);

  expect(
    isAdminProfileComplete({
      firstName: '',
      lastName: 'Gonzalez',
      businessName: 'Dragon Shop',
    }),
  ).toBe(false);
});

test('adminProfileDisplayName joins first and last name', () => {
  expect(
    adminProfileDisplayName({
      firstName: 'Emma',
      lastName: 'Gonzalez',
      businessName: 'Dragon Shop',
    }),
  ).toBe('Emma Gonzalez');
});
