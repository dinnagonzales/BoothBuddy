export function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function parseMoneyInput(value: string): number {
  const cleaned = value.replace(/[^0-9.]/g, '');
  const dollars = parseFloat(cleaned);
  if (Number.isNaN(dollars)) return 0;
  return Math.round(dollars * 100);
}
