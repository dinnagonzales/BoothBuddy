import { localDayFromExportDate, toExportDate } from '@/lib/market-day';

test('export date round-trip keeps the local calendar day for web date inputs', () => {
  const day = localDayFromExportDate('2026-09-20');
  expect(toExportDate(day)).toBe('2026-09-20');
});
