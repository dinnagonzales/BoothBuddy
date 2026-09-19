import { initDatabase } from '@/lib/db/schema';
import {
  createItem,
  createSale,
  getSalesExportRows,
  startMarketDay,
} from '@/lib/db/queries';
import { formatSaleTime, parseSqliteUtc } from '@/lib/market-day';
import { createTestDb } from '../test-utils/sqlite-test-db';

async function seedSaleAtUtc(createdAtSqlite: string) {
  const { db } = createTestDb();
  await initDatabase(db);

  const item = await createItem(db, {
    name: 'Dragon',
    icon: '🐉',
    costCents: 100,
    priceCents: 400,
  });
  const marketDay = await startMarketDay(db, 'Evening Fair', '2026-09-18T19:00:00.000Z');
  const sale = await createSale(db, {
    marketDayId: marketDay.id,
    lines: [
      {
        itemId: item.id,
        name: 'Dragon',
        icon: '🐉',
        priceCents: 400,
        costCents: 100,
        quantity: 1,
      },
    ],
    paymentMethod: 'cash',
    cashReceivedCents: 400,
  });

  await db.runAsync('UPDATE sales SET created_at = ? WHERE id = ?', createdAtSqlite, sale.id);
  return db;
}

test('evening America/Los_Angeles sale exports on the local calendar day, not UTC day', async () => {
  // 2026-09-18 19:30 PDT = 2026-09-19 02:30 UTC
  const db = await seedSaleAtUtc('2026-09-19 02:30:00');

  expect(await getSalesExportRows(db, '2026-09-18', '2026-09-18')).toHaveLength(1);
  expect(await getSalesExportRows(db, '2026-09-19', '2026-09-19')).toHaveLength(0);
});

test('sale just after local midnight belongs to that local day', async () => {
  // 2026-09-18 00:15 PDT = 2026-09-18 07:15 UTC
  const db = await seedSaleAtUtc('2026-09-18 07:15:00');

  expect(await getSalesExportRows(db, '2026-09-18', '2026-09-18')).toHaveLength(1);
  expect(await getSalesExportRows(db, '2026-09-17', '2026-09-17')).toHaveLength(0);
});

test('DST spring-forward boundary keeps local calendar days', async () => {
  // 2026-03-08 02:00 PDT skipped; 01:30 PST = 09:30 UTC, 03:30 PDT = 10:30 UTC
  const before = await seedSaleAtUtc('2026-03-08 09:30:00');
  expect(await getSalesExportRows(before, '2026-03-08', '2026-03-08')).toHaveLength(1);

  const after = await seedSaleAtUtc('2026-03-08 10:30:00');
  expect(await getSalesExportRows(after, '2026-03-08', '2026-03-08')).toHaveLength(1);
  expect(await getSalesExportRows(after, '2026-03-07', '2026-03-07')).toHaveLength(0);
});

test('date range spanning months includes sales on both sides of the month boundary', async () => {
  const db = await seedSaleAtUtc('2026-09-01 06:00:00'); // Aug 31 23:00 PDT
  expect(await getSalesExportRows(db, '2026-08-31', '2026-09-01')).toHaveLength(1);
  expect(await getSalesExportRows(db, '2026-09-01', '2026-09-01')).toHaveLength(0);
});

test('parseSqliteUtc treats datetime(now) strings as UTC for display', () => {
  const date = parseSqliteUtc('2026-09-19 02:30:00');
  expect(date.toISOString()).toBe('2026-09-19T02:30:00.000Z');
  expect(formatSaleTime('2026-09-19 02:30:00')).toBe('7:30 PM');
});
