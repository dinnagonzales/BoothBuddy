import { createCatalog } from '@/lib/catalog';
import {
  ActiveMarketDayExistsError,
  NoActiveMarketDayError,
  NothingToUndoCloseError,
  formatMarketDayDate,
  marketDayIdForSale,
  marketDayStartedAtIso,
  suggestMarketDayName,
} from '@/lib/market-day';

test('admin can start a Market Day with a name', async () => {
  const catalog = createCatalog();

  await catalog.startMarketDay('Spring Fair 2026');

  expect(await catalog.getActiveMarketDay()).toEqual({
    id: expect.any(Number),
    name: 'Spring Fair 2026',
  });
});

test('Sell something! is enabled only during an Active Market Day', async () => {
  const catalog = createCatalog();

  expect(await catalog.getActiveMarketDay()).toBeNull();

  await catalog.startMarketDay('Spring Fair 2026');

  expect(await catalog.getActiveMarketDay()).not.toBeNull();
});

test('admin can end an Active Market Day', async () => {
  const catalog = createCatalog();

  await catalog.startMarketDay('Spring Fair 2026');
  await catalog.closeActiveMarketDay();

  expect(await catalog.getActiveMarketDay()).toBeNull();
});

test('admin can undo close on the most recently closed Market Day', async () => {
  const catalog = createCatalog();

  await catalog.startMarketDay('Spring Fair 2026');
  await catalog.closeActiveMarketDay();
  await catalog.undoCloseMostRecentMarketDay();

  expect(await catalog.getActiveMarketDay()).toEqual({
    id: expect.any(Number),
    name: 'Spring Fair 2026',
  });
});

test('only one Active Market Day can exist at a time', async () => {
  const catalog = createCatalog();

  await catalog.startMarketDay('Spring Fair 2026');

  await expect(catalog.startMarketDay('Fall Fair 2026')).rejects.toThrow(ActiveMarketDayExistsError);
});

test('undo close is unavailable after a Market Day is exported', async () => {
  const catalog = createCatalog();

  const started = await catalog.startMarketDay('Spring Fair 2026');
  await catalog.closeActiveMarketDay();
  await catalog.exportMarketDay(started.id);

  expect(await catalog.canUndoClose()).toBe(false);
  await expect(catalog.undoCloseMostRecentMarketDay()).rejects.toThrow(NothingToUndoCloseError);
});

test('suggested Market Day name uses today’s date', () => {
  const name = suggestMarketDayName(new Date('2026-09-18T12:00:00'));

  expect(name).toBe('Market Day – Sep 18, 2026');
});

test('admin can start a Market Day with a custom name and date', async () => {
  const catalog = createCatalog();
  const startedAt = marketDayStartedAtIso(new Date('2026-09-18T12:00:00'));

  const { id } = await catalog.startMarketDay('Spring Fair 2026', startedAt);
  const day = await catalog.getMarketDayById(id);

  expect(day).toEqual({
    id,
    name: 'Spring Fair 2026',
    startedAt,
    closedAt: null,
    exportedAt: null,
    needsReexport: false,
  });
  expect(formatMarketDayDate(startedAt)).toBe('Sep 18, 2026');
});

test('Sales logged during an Active Market Day belong to that Market Day', () => {
  expect(marketDayIdForSale({ id: 3 })).toBe(3);
});

test('Sales cannot be logged without an Active Market Day', () => {
  expect(() => marketDayIdForSale(null)).toThrow(NoActiveMarketDayError);
});
