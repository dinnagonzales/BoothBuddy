import type { PaymentMethod } from '@/lib/types';

type SavedSaleFields = {
  paymentMethod: PaymentMethod;
  name: string | null;
  notes: string | null;
};

type SaleDraftFields = {
  paymentMethod: PaymentMethod | null;
  name: string;
  notes: string;
};

export function saleHasUnsavedChanges(
  sale: SavedSaleFields,
  draft: SaleDraftFields,
  readOnly = false,
): boolean {
  if (readOnly || draft.paymentMethod == null) return false;

  return (
    draft.paymentMethod !== sale.paymentMethod ||
    draft.name.trim() !== (sale.name ?? '') ||
    draft.notes.trim() !== (sale.notes ?? '')
  );
}

export function paymentCanComplete(
  paymentMethod: PaymentMethod,
  cashReceivedCents: number,
  totalCents: number,
): boolean {
  return (
    paymentMethod === 'venmo_zelle' ||
    paymentMethod === 'pay_on_pickup' ||
    cashReceivedCents >= totalCents
  );
}

export function paymentMethodCompletesPreorder(paymentMethod: PaymentMethod): boolean {
  return paymentMethod === 'cash' || paymentMethod === 'venmo_zelle';
}

export function preorderMetadataValid(name: string, notes: string): boolean {
  return name.trim().length > 0 && notes.trim().length > 0;
}

export function cashReceivedForEditedSale(
  paymentMethod: PaymentMethod,
  cashReceivedCents: number | null,
  totalCents: number,
): number {
  if (paymentMethod !== 'cash') return 0;
  return cashReceivedCents ?? totalCents;
}
