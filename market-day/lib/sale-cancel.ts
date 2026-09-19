export const CANCEL_ERROR_NOTE_MAX_LENGTH = 80;

export type CancelSaleReason =
  | { kind: 'return' }
  | { kind: 'error'; note: string };

export type StoredCancelReason = 'return' | 'error';

export function normalizeCancelSaleReason(reason: CancelSaleReason): {
  kind: StoredCancelReason;
  note: string | null;
} {
  if (reason.kind === 'return') {
    return { kind: 'return', note: null };
  }

  const note = reason.note.trim();
  if (!note) {
    throw new Error('Error reason requires a short note');
  }
  if (note.length > CANCEL_ERROR_NOTE_MAX_LENGTH) {
    throw new Error(
      `Error note must be ${CANCEL_ERROR_NOTE_MAX_LENGTH} characters or fewer`,
    );
  }
  return { kind: 'error', note };
}

export function cancelReasonDisplayLabel(
  reason: StoredCancelReason | null,
  note: string | null,
): string | null {
  if (reason == null) return null;
  if (reason === 'return') return 'Return';
  return note ? `Error: ${note}` : 'Error';
}

export function countActiveSales(sales: { cancelled: boolean }[]): number {
  return sales.filter((sale) => !sale.cancelled).length;
}

export function countCancelledSales(sales: { cancelled: boolean }[]): number {
  return sales.filter((sale) => sale.cancelled).length;
}
