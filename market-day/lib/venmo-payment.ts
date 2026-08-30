import type { BusinessSettings } from '@/lib/business-settings';

export function hasZellePaymentInfo(settings: BusinessSettings): boolean {
  return (
    settings.zelleName.length > 0 ||
    settings.zelleContact.length > 0 ||
    settings.zelleQrUri != null
  );
}

export function hasVenmoPaymentInfo(settings: BusinessSettings): boolean {
  return settings.venmoHandle.length > 0 || settings.venmoQrUri != null;
}

export function hasVenmoZellePaymentInfo(settings: BusinessSettings): boolean {
  return hasZellePaymentInfo(settings) || hasVenmoPaymentInfo(settings);
}

export function venmoPayUrl(handle: string, amountCents: number, note?: string): string {
  const params = new URLSearchParams({
    txn: 'pay',
    recipients: handle,
    amount: (amountCents / 100).toFixed(2),
  });
  const trimmedNote = note?.trim();
  if (trimmedNote) {
    params.set('note', trimmedNote);
  }
  return `https://venmo.com/?${params.toString()}`;
}

export function formatVenmoHandle(handle: string): string {
  return handle.startsWith('@') ? handle : `@${handle}`;
}
