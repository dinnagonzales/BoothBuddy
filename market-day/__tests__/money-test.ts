import { formatMoney, parseMoneyInput, tryParseMoneyInput } from '@/lib/money';

test('parseMoneyInput converts whole dollars and two-decimal amounts', () => {
  expect(parseMoneyInput('1')).toBe(100);
  expect(parseMoneyInput('1.5')).toBe(150);
  expect(parseMoneyInput('1.50')).toBe(150);
  expect(parseMoneyInput('$12.34')).toBe(1234);
  expect(parseMoneyInput('')).toBe(0);
  expect(parseMoneyInput('.')).toBe(0);
});

test('parseMoneyInput rounds binary-float edge amounts without float math', () => {
  // parseFloat("1.005") * 100 === 100.4999… so Math.round would yield 100.
  expect(parseMoneyInput('1.005')).toBe(101);
  expect(parseMoneyInput('2.005')).toBe(201);
  expect(parseMoneyInput('0.005')).toBe(1);
  expect(parseMoneyInput('1.004')).toBe(100);
  expect(parseMoneyInput('1.995')).toBe(200);
});

test('formatMoney renders cents as dollars', () => {
  expect(formatMoney(0)).toBe('$0.00');
  expect(formatMoney(101)).toBe('$1.01');
});

test('amount fields use decimal-pad but iPad can still enter minus/comma via full keyboard or paste', () => {
  // keyboardType="decimal-pad" has no minus key, but iPad may switch to the full
  // keyboard (or accept paste / hardware keys), so parseMoneyInput must not trust the pad.
  expect(tryParseMoneyInput('-5')).toEqual({
    ok: false,
    message: 'Amount can’t be negative.',
  });
  expect(parseMoneyInput('-5')).toBe(0);

  expect(tryParseMoneyInput('1,50')).toEqual({
    ok: false,
    message: 'Use a period for cents (like 1.50).',
  });
  expect(parseMoneyInput('1,50')).toBe(0);

  expect(tryParseMoneyInput('1,234.56')).toEqual({ ok: true, cents: 123456 });
  expect(parseMoneyInput('1,234.56')).toBe(123456);

  expect(tryParseMoneyInput('1000000')).toEqual({
    ok: false,
    message: 'Amount is too large. Enter less than $1,000,000.',
  });
  expect(parseMoneyInput('1000000')).toBe(0);
});
