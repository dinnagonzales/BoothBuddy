import { formatMoney, parseMoneyInput } from '@/lib/money';

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
