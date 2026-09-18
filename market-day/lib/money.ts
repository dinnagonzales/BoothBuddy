export function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/** Parse a free-typed dollar string into integer cents without float math. */
export function parseMoneyInput(value: string): number {
  const cleaned = value.replace(/[^0-9.]/g, '');
  if (!cleaned) return 0;

  const [wholePart = '', fractionPart = ''] = cleaned.split('.', 2);
  const dollars = wholePart === '' ? 0 : Number.parseInt(wholePart, 10);
  if (Number.isNaN(dollars)) return 0;

  const fractionDigits = fractionPart.replace(/\D/g, '');
  if (fractionDigits.length === 0) {
    return dollars * 100;
  }

  if (fractionDigits.length <= 2) {
    return dollars * 100 + Number.parseInt(fractionDigits.padEnd(2, '0'), 10);
  }

  // Half-up round from the third decimal digit using only integers.
  const floorCents = dollars * 100 + Number.parseInt(fractionDigits.slice(0, 2), 10);
  const roundUp = Number.parseInt(fractionDigits[2]!, 10) >= 5;
  return floorCents + (roundUp ? 1 : 0);
}
