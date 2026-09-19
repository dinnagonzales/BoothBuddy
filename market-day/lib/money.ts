export function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/** Soft ceiling for typed amounts ($999,999.99). */
export const MONEY_INPUT_MAX_CENTS = 99_999_999;

export type MoneyParseResult =
  | { ok: true; cents: number }
  | { ok: false; message: string };

function centsFromCleanedDecimal(cleaned: string): number {
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

function isThousandsCommaAmount(value: string): boolean {
  // 1234.56 or 1,234 or 1,234.56 — groups after the first comma must be exactly 3 digits.
  return /^\d{1,3}(,\d{3})+(\.\d*)?$/.test(value) || /^\d{1,3}(,\d{3})+$/.test(value);
}

/**
 * Parse a free-typed dollar string into integer cents without float math.
 * Rejects negatives and comma-as-decimal; commas are thousands separators only.
 */
export function tryParseMoneyInput(value: string): MoneyParseResult {
  const trimmed = value.trim();
  if (!trimmed || trimmed === '.' || trimmed === '$' || trimmed === '$.') {
    return { ok: true, cents: 0 };
  }

  if (trimmed.includes('-')) {
    return { ok: false, message: 'Amount can’t be negative.' };
  }

  const withoutDollar = trimmed.replace(/^\$/, '').trim();
  if (withoutDollar.includes(',')) {
    if (!isThousandsCommaAmount(withoutDollar)) {
      return { ok: false, message: 'Use a period for cents (like 1.50).' };
    }
  }

  const cleaned = withoutDollar.replace(/,/g, '');
  if (!/^\d*\.?\d*$/.test(cleaned)) {
    return { ok: false, message: 'Enter a valid dollar amount.' };
  }

  const cents = centsFromCleanedDecimal(cleaned);
  if (cents > MONEY_INPUT_MAX_CENTS) {
    return { ok: false, message: 'Amount is too large. Enter less than $1,000,000.' };
  }

  return { ok: true, cents };
}

/** Parse a free-typed dollar string into integer cents without float math. */
export function parseMoneyInput(value: string): number {
  const result = tryParseMoneyInput(value);
  return result.ok ? result.cents : 0;
}
