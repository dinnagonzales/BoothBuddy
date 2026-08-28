export function formatMarketDayDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatSaleTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function paymentMethodLabel(method: 'cash' | 'venmo_zelle'): string {
  return method === 'cash' ? 'Cash' : 'Venmo/Zelle';
}

export function suggestMarketDayName(now = new Date()): string {
  const formatted = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return `Market Day – ${formatted}`;
}

export function defaultMarketDayName(): string {
  return 'Market Day';
}

export function startOfLocalDay(date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function marketDayStartedAtIso(date: Date): string {
  const local = startOfLocalDay(date);
  local.setHours(12, 0, 0, 0);
  return local.toISOString();
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
