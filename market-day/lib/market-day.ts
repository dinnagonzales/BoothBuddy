export function formatMarketDayDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function suggestMarketDayName(now = new Date()): string {
  const formatted = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return `Market Day – ${formatted}`;
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

export function marketDayIdForSale(active: { id: number } | null): number {
  if (!active) {
    throw new NoActiveMarketDayError();
  }
  return active.id;
}
