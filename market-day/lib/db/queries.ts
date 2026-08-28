import type { SQLiteDatabase } from 'expo-sqlite';

import type { CartLine, Item, MarketDay, PaymentMethod, Sale } from '@/lib/types';

type ItemRow = {
  id: number;
  name: string;
  emoji: string;
  photo_uri: string | null;
  cost_cents: number;
  price_cents: number;
  retired: number;
};

function mapItem(row: ItemRow): Item {
  return {
    id: row.id,
    name: row.name,
    emoji: row.emoji,
    photoUri: row.photo_uri,
    costCents: row.cost_cents,
    priceCents: row.price_cents,
    retired: row.retired === 1,
  };
}

export function getActiveItems(db: SQLiteDatabase): Item[] {
  return db
    .getAllSync<ItemRow>(
      'SELECT * FROM items WHERE retired = 0 ORDER BY name COLLATE NOCASE',
    )
    .map(mapItem);
}

export function getActiveMarketDay(db: SQLiteDatabase): MarketDay | null {
  const row = db.getFirstSync<{
    id: number;
    name: string;
    started_at: string;
    closed_at: string | null;
    exported_at: string | null;
  }>(
    `SELECT * FROM market_days WHERE closed_at IS NULL ORDER BY started_at DESC LIMIT 1`,
  );

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    startedAt: row.started_at,
    closedAt: row.closed_at,
    exportedAt: row.exported_at,
  };
}

export function startMarketDay(db: SQLiteDatabase, name: string): void {
  db.runSync('UPDATE market_days SET closed_at = datetime(\'now\') WHERE closed_at IS NULL');
  db.runSync('INSERT INTO market_days (name) VALUES (?)', name);
}

export function cartTotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.priceCents * line.quantity, 0);
}

export function createSale(
  db: SQLiteDatabase,
  params: {
    marketDayId: number;
    lines: CartLine[];
    paymentMethod: PaymentMethod;
    cashReceivedCents: number | null;
  },
): Sale {
  const totalCents = cartTotal(params.lines);
  const nextNumber =
    db.getFirstSync<{ n: number }>('SELECT COALESCE(MAX(sale_number), 0) + 1 AS n FROM sales')?.n ?? 1;

  const result = db.runSync(
    `INSERT INTO sales (sale_number, market_day_id, total_cents, payment_method, cash_received_cents)
     VALUES (?, ?, ?, ?, ?)`,
    nextNumber,
    params.marketDayId,
    totalCents,
    params.paymentMethod,
    params.cashReceivedCents,
  );

  const saleId = result.lastInsertRowId;

  for (const line of params.lines) {
    db.runSync(
      `INSERT INTO line_items (sale_id, item_id, quantity, price_cents, cost_cents)
       VALUES (?, ?, ?, ?, ?)`,
      saleId,
      line.itemId,
      line.quantity,
      line.priceCents,
      line.costCents,
    );
  }

  return {
    id: saleId,
    saleNumber: nextNumber,
    marketDayId: params.marketDayId,
    totalCents,
    paymentMethod: params.paymentMethod,
    cashReceivedCents: params.cashReceivedCents,
    createdAt: new Date().toISOString(),
  };
}

export function getSale(db: SQLiteDatabase, saleId: number): Sale | null {
  const row = db.getFirstSync<{
    id: number;
    sale_number: number;
    market_day_id: number | null;
    total_cents: number;
    payment_method: PaymentMethod;
    cash_received_cents: number | null;
    created_at: string;
  }>('SELECT * FROM sales WHERE id = ?', saleId);

  if (!row) return null;

  return {
    id: row.id,
    saleNumber: row.sale_number,
    marketDayId: row.market_day_id,
    totalCents: row.total_cents,
    paymentMethod: row.payment_method,
    cashReceivedCents: row.cash_received_cents,
    createdAt: row.created_at,
  };
}

export function getSaleLineItems(db: SQLiteDatabase, saleId: number): CartLine[] {
  return db
    .getAllSync<{
      item_id: number;
      name: string;
      emoji: string;
      quantity: number;
      price_cents: number;
      cost_cents: number;
    }>(
      `SELECT li.item_id, i.name, i.emoji, li.quantity, li.price_cents, li.cost_cents
       FROM line_items li
       JOIN items i ON i.id = li.item_id
       WHERE li.sale_id = ?`,
      saleId,
    )
    .map((row) => ({
      itemId: row.item_id,
      name: row.name,
      emoji: row.emoji,
      priceCents: row.price_cents,
      costCents: row.cost_cents,
      quantity: row.quantity,
    }));
}

export function deleteSale(db: SQLiteDatabase, saleId: number): void {
  db.runSync('DELETE FROM line_items WHERE sale_id = ?', saleId);
  db.runSync('DELETE FROM sales WHERE id = ?', saleId);
}

export function getMarketDayStats(db: SQLiteDatabase, marketDayId: number) {
  const row = db.getFirstSync<{
    total_cents: number;
    item_count: number;
    cash_cents: number;
    venmo_cents: number;
  }>(
    `SELECT
       COALESCE(SUM(s.total_cents), 0) AS total_cents,
       COALESCE(SUM((SELECT SUM(li.quantity) FROM line_items li WHERE li.sale_id = s.id)), 0) AS item_count,
       COALESCE(SUM(CASE WHEN s.payment_method = 'cash' THEN s.total_cents ELSE 0 END), 0) AS cash_cents,
       COALESCE(SUM(CASE WHEN s.payment_method = 'venmo_zelle' THEN s.total_cents ELSE 0 END), 0) AS venmo_cents
     FROM sales s
     WHERE s.market_day_id = ?`,
    marketDayId,
  );

  return {
    totalCents: row?.total_cents ?? 0,
    itemCount: row?.item_count ?? 0,
    cashCents: row?.cash_cents ?? 0,
    venmoCents: row?.venmo_cents ?? 0,
  };
}
