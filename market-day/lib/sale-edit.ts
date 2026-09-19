import type { PaymentMethod } from '@/lib/types'

type SavedSaleFields = {
  paymentMethod: PaymentMethod
  name: string | null
  notes: string | null
}

type SaleDraftFields = {
  paymentMethod: PaymentMethod | null
  name: string
  notes: string
}

export function saleHasUnsavedChanges(
  sale: SavedSaleFields,
  draft: SaleDraftFields,
  readOnly = false,
): boolean {
  if (readOnly || draft.paymentMethod == null) return false

  return (
    draft.paymentMethod !== sale.paymentMethod ||
    draft.name.trim() !== (sale.name ?? '') ||
    draft.notes.trim() !== (sale.notes ?? '')
  )
}

export function paymentCanComplete(
  paymentMethod: PaymentMethod,
  cashReceivedCents: number,
  totalCents: number,
): boolean {
  if (paymentMethod === 'pay_on_pickup') return true
  return cashReceivedCents >= totalCents
}

export function paymentMethodCompletesPreorder(
  paymentMethod: PaymentMethod,
): boolean {
  return paymentMethod === 'cash' || paymentMethod === 'venmo_zelle'
}

export function preorderMetadataValid(
  name: string,
  notes: string,
  completeDate: string | null,
): boolean {
  return (
    name.trim().length > 0 &&
    notes.trim().length > 0 &&
    completeDate != null &&
    completeDate.trim().length > 0
  )
}

export function cashReceivedForEditedSale(
  paymentMethod: PaymentMethod,
  cashReceivedCents: number | null,
  totalCents: number,
): number {
  if (paymentMethod === 'pay_on_pickup') return 0
  return cashReceivedCents ?? totalCents
}

export function cashChangeCents(
  cashReceivedCents: number,
  totalCents: number,
): number {
  return Math.max(cashReceivedCents - totalCents, 0)
}

export function saleTipCents(
  changeKept: boolean,
  cashReceivedCents: number | null,
  totalCents: number,
  cancelled = false,
): number {
  if (cancelled || !changeKept || cashReceivedCents == null) return 0
  return Math.max(cashReceivedCents - totalCents, 0)
}

export function salePaymentBottomLabel(
  paymentMethod: string,
  tipCents: number,
  totalCents: number,
  format: (cents: number) => string,
): string {
  if (tipCents > 0) {
    const dollars = (cents: number) => (cents / 100).toFixed(2)
    return `${paymentMethod}: ${dollars(totalCents)} + ${dollars(tipCents)}(tip) = ${format(totalCents + tipCents)}`
  }
  return paymentMethod
}

export function cashChangeStatusLabel(
  changeCents: number,
  keepChange: boolean,
  format: (cents: number) => string,
): string {
  if (keepChange) {
    return `Keeping ${format(changeCents)} — no change back`
  }
  return `Change: ${format(changeCents)}`
}
