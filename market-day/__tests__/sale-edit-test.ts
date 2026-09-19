import {
  cashChangeCents,
  cashChangeStatusLabel,
  cashReceivedForEditedSale,
  paymentCanComplete,
  saleHasUnsavedChanges,
  salePaymentBottomLabel,
  saleTipCents,
} from '@/lib/sale-edit'
import { formatMoney } from '@/lib/money'

test('sale edit save stays disabled until a field changes', () => {
  const saved = {
    paymentMethod: 'cash' as const,
    name: null,
    notes: null,
  }

  expect(
    saleHasUnsavedChanges(saved, {
      paymentMethod: 'cash',
      name: '',
      notes: '',
    }),
  ).toBe(false)

  expect(
    saleHasUnsavedChanges(saved, {
      paymentMethod: 'venmo_zelle',
      name: '',
      notes: '',
    }),
  ).toBe(true)

  expect(
    saleHasUnsavedChanges(saved, {
      paymentMethod: 'cash',
      name: 'Emma',
      notes: '',
    }),
  ).toBe(true)

  expect(
    saleHasUnsavedChanges(saved, {
      paymentMethod: 'cash',
      name: '',
      notes: 'Preorder',
    }),
  ).toBe(true)
})

test('read-only sale detail never reports unsaved changes', () => {
  expect(
    saleHasUnsavedChanges(
      { paymentMethod: 'cash', name: null, notes: null },
      { paymentMethod: 'venmo_zelle', name: 'Emma', notes: 'Tab' },
      true,
    ),
  ).toBe(false)
})

test('edited cash sale cannot complete until cash is prefilled', () => {
  expect(paymentCanComplete('cash', 0, 2500)).toBe(false)
  expect(paymentCanComplete('cash', 2500, 2500)).toBe(true)
  expect(paymentCanComplete('cash', 5000, 2500)).toBe(true)
})

test('edited venmo sale cannot complete until amount is at least the total', () => {
  expect(paymentCanComplete('venmo_zelle', 0, 2500)).toBe(false)
  expect(paymentCanComplete('venmo_zelle', 2500, 2500)).toBe(true)
  expect(paymentCanComplete('venmo_zelle', 3000, 2500)).toBe(true)
})

test('cashReceivedForEditedSale falls back to the sale total', () => {
  expect(cashReceivedForEditedSale('cash', null, 2500)).toBe(2500)
  expect(cashReceivedForEditedSale('cash', 5000, 2500)).toBe(5000)
  expect(cashReceivedForEditedSale('venmo_zelle', null, 2500)).toBe(2500)
  expect(cashReceivedForEditedSale('venmo_zelle', 3000, 2500)).toBe(3000)
})

test('cashChangeCents is zero when cash received does not exceed total', () => {
  expect(cashChangeCents(1700, 1700)).toBe(0)
  expect(cashChangeCents(1500, 1700)).toBe(0)
  expect(cashChangeCents(2000, 1700)).toBe(300)
})

test('cashChangeStatusLabel shows give-back or keep-change copy', () => {
  expect(cashChangeStatusLabel(300, false, formatMoney)).toBe('Change: $3.00')
  expect(cashChangeStatusLabel(300, true, formatMoney)).toBe(
    'Keeping $3.00 — no change back',
  )
})

test('saleTipCents only counts kept change over the sale total', () => {
  expect(saleTipCents(true, 1000, 800)).toBe(200)
  expect(saleTipCents(false, 1000, 800)).toBe(0)
  expect(saleTipCents(true, null, 800)).toBe(0)
  expect(saleTipCents(true, 1000, 800, true)).toBe(0)
})

test('salePaymentBottomLabel shows tip only when present', () => {
  expect(salePaymentBottomLabel('Cash', 200, 800, formatMoney)).toBe(
    'Cash: 8.00 + 2.00(tip) = $10.00',
  )
  expect(salePaymentBottomLabel('Venmo/Zelle', 0, 800, formatMoney)).toBe(
    'Venmo/Zelle',
  )
})
