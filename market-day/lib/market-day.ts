/**
 * Parse timestamps stored by SQLite datetime('now') (UTC, no trailing Z) as UTC.
 * Also accepts ISO strings that already include a zone designator.
 */
export function parseSqliteUtc(value: string): Date {
  const trimmed = value.trim();
  if (/[zZ]$|[+-]\d{2}:?\d{2}$/.test(trimmed)) {
    return new Date(trimmed);
  }
  const normalized = trimmed.includes('T') ? trimmed : trimmed.replace(' ', 'T');
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?$/.test(normalized)) {
    return new Date(`${normalized}Z`);
  }
  return new Date(trimmed);
}

function toSqliteUtcTimestamp(date: Date): string {
  return date.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, '');
}

/**
 * Convert an inclusive local-calendar date range (YYYY-MM-DD) into a half-open
 * UTC timestamp range for filtering created_at. Does not use SQLite localtime.
 */
export function localDateRangeToUtcBounds(
  startDate: string,
  endDate: string,
): { startUtc: string; endUtcExclusive: string } {
  const [startY, startM, startD] = startDate.split('-').map(Number);
  const [endY, endM, endD] = endDate.split('-').map(Number);
  const startLocal = new Date(startY, startM - 1, startD);
  const endExclusiveLocal = new Date(endY, endM - 1, endD + 1);
  return {
    startUtc: toSqliteUtcTimestamp(startLocal),
    endUtcExclusive: toSqliteUtcTimestamp(endExclusiveLocal),
  };
}

export function isCreatedAtInLocalDateRange(
  createdAt: string,
  startDate: string,
  endDate: string,
): boolean {
  const { startUtc, endUtcExclusive } = localDateRangeToUtcBounds(startDate, endDate);
  const t = parseSqliteUtc(createdAt).getTime();
  return t >= parseSqliteUtc(startUtc).getTime() && t < parseSqliteUtc(endUtcExclusive).getTime();
}

export function formatMarketDayDate(iso: string): string {
  return parseSqliteUtc(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatSaleTime(iso: string): string {
  return parseSqliteUtc(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function paymentMethodLabel(method: 'cash' | 'venmo_zelle' | 'pay_on_pickup'): string {
  if (method === 'cash') return 'Cash';
  if (method === 'pay_on_pickup') return 'Pay on pickup';
  return 'Venmo/Zelle';
}

export function suggestMarketDayName(now = new Date()): string {
  const formatted = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return `Market Day – ${formatted}`;
}

export function startOfLocalDay(date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function marketDayStartedAtIso(date: Date): string {
  const local = startOfLocalDay(date);
  local.setHours(12, 0, 0, 0);
  return local.toISOString();
}

export function toExportDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function localDayFromExportDate(exportDate: string): Date {
  const [year, month, day] = exportDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatCompleteDate(exportDate: string): string {
  return formatMarketDayDate(localDayFromExportDate(exportDate).toISOString());
}

export function defaultCompleteDate(now = new Date()): string {
  return toExportDate(startOfLocalDay(now));
}

export function isCompleteDateOverdue(completeDate: string, today = startOfLocalDay()): boolean {
  return completeDate < toExportDate(today);
}

export class ActiveMarketDayExistsError extends Error {
  constructor() {
    super('An Active Market Day already exists');
    this.name = 'ActiveMarketDayExistsError';
  }
}

export class NothingToUndoCloseError extends Error {
  constructor() {
    super('No closed Market Day can be reopened');
    this.name = 'NothingToUndoCloseError';
  }
}

export class NoActiveMarketDayError extends Error {
  constructor() {
    super('No Active Market Day');
    this.name = 'NoActiveMarketDayError';
  }
}

export class CannotDeleteActiveMarketDayError extends Error {
  constructor() {
    super('Active Market Day cannot be deleted');
    this.name = 'CannotDeleteActiveMarketDayError';
  }
}

export class ItemHasSalesError extends Error {
  constructor() {
    super('Item appears in past sales and cannot be deleted');
    this.name = 'ItemHasSalesError';
  }
}

export function marketDayIdForSale(active: { id: number } | null): number {
  if (!active) {
    throw new NoActiveMarketDayError();
  }
  return active.id;
}
