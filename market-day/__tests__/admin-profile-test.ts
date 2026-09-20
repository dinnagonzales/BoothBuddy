import {
  adminProfileDisplayName,
  adminProfileEqual,
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

test('isAdminProfileComplete requires first name and business name; last name optional', () => {
  expect(
    isAdminProfileComplete({
      firstName: 'Emma',
      lastName: 'Gonzalez',
      businessName: 'Dragon Shop',
    }),
  ).toBe(true);

  expect(
    isAdminProfileComplete({
      firstName: 'Emma',
      lastName: '',
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

test('adminProfileEqual compares every field', () => {
  const left = normalizeAdminProfile({
    firstName: 'Emma',
    lastName: 'Gonzalez',
    businessName: 'Dragon Shop',
  });
  const right = normalizeAdminProfile({
    firstName: 'Emma',
    lastName: 'Gonzalez',
    businessName: 'Dragon Shop',
  });
  const different = normalizeAdminProfile({
    firstName: 'Emma',
    lastName: 'Smith',
    businessName: 'Dragon Shop',
  });

  expect(adminProfileEqual(left, right)).toBe(true);
  expect(adminProfileEqual(left, different)).toBe(false);
});
