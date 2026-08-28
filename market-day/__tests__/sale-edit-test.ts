import {
  cashReceivedForEditedSale,
  paymentCanComplete,
  saleHasUnsavedChanges,
} from '@/lib/sale-edit';

test('sale edit save stays disabled until a field changes', () => {
  const saved = {
    paymentMethod: 'cash' as const,
    name: null,
    notes: null,
  };

  expect(
    saleHasUnsavedChanges(saved, {
      paymentMethod: 'cash',
      name: '',
      notes: '',
    }),
  ).toBe(false);

  expect(
    saleHasUnsavedChanges(saved, {
      paymentMethod: 'venmo_zelle',
      name: '',
      notes: '',
    }),
  ).toBe(true);

  expect(
    saleHasUnsavedChanges(saved, {
      paymentMethod: 'cash',
      name: 'Emma',
      notes: '',
    }),
  ).toBe(true);

  expect(
    saleHasUnsavedChanges(saved, {
      paymentMethod: 'cash',
      name: '',
      notes: 'Preorder',
    }),
  ).toBe(true);
});

test('read-only sale detail never reports unsaved changes', () => {
  expect(
    saleHasUnsavedChanges(
      { paymentMethod: 'cash', name: null, notes: null },
      { paymentMethod: 'venmo_zelle', name: 'Emma', notes: 'Tab' },
      true,
    ),
  ).toBe(false);
});

test('edited cash sale cannot complete until cash is prefilled', () => {
  expect(paymentCanComplete('cash', 0, 2500)).toBe(false);
  expect(paymentCanComplete('cash', 2500, 2500)).toBe(true);
  expect(paymentCanComplete('cash', 5000, 2500)).toBe(true);
});

test('edited venmo sale can complete without cash entry', () => {
  expect(paymentCanComplete('venmo_zelle', 0, 2500)).toBe(true);
});

test('cashReceivedForEditedSale falls back to the sale total', () => {
  expect(cashReceivedForEditedSale('cash', null, 2500)).toBe(2500);
  expect(cashReceivedForEditedSale('cash', 5000, 2500)).toBe(5000);
  expect(cashReceivedForEditedSale('venmo_zelle', null, 2500)).toBe(0);
});
