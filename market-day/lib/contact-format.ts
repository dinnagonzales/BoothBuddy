export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

export function looksLikeEmail(value: string): boolean {
  return value.includes('@');
}

export function looksLikePhone(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || looksLikeEmail(trimmed)) return false;
  const digits = digitsOnly(trimmed);
  return digits.length >= 7;
}

export function formatPhoneNumber(value: string): string {
  const digits = digitsOnly(value);
  if (digits.length === 0) return '';

  const local =
    digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;

  if (local.length === 10) {
    return `(${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6)}`;
  }

  if (local.length < 10) {
    if (local.length <= 3) return local;
    if (local.length <= 6) return `(${local.slice(0, 3)}) ${local.slice(3)}`;
    return `(${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6)}`;
  }

  if (digits.length === 11 && digits.startsWith('1')) {
    const rest = digits.slice(1);
    return `+1 (${rest.slice(0, 3)}) ${rest.slice(3, 6)}-${rest.slice(6)}`;
  }

  return value.trim();
}

export function formatZelleContact(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (looksLikeEmail(trimmed)) return trimmed;
  if (looksLikePhone(trimmed)) return formatPhoneNumber(trimmed);
  return trimmed;
}

export function normalizeZelleContactInput(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (looksLikeEmail(trimmed)) return trimmed;
  if (looksLikePhone(trimmed)) return digitsOnly(trimmed);
  return trimmed;
}

export function formatZelleContactForInput(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (looksLikeEmail(trimmed)) return trimmed;
  return formatPhoneNumber(trimmed);
}
