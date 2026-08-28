import type { SQLiteDatabase } from 'expo-sqlite';

import { ActiveMarketDayExistsError, NothingToUndoCloseError } from '@/lib/market-day';
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

export async function getActiveItems(db: SQLiteDatabase): Promise<Item[]> {
  const rows = await db.getAllAsync<ItemRow>(
    'SELECT * FROM items WHERE retired = 0 ORDER BY name COLLATE NOCASE',
  );
  return rows.map(mapItem);
}

export async function getAllItems(db: SQLiteDatabase): Promise<Item[]> {
  const rows = await db.getAllAsync<ItemRow>(
    'SELECT * FROM items ORDER BY retired ASC, name COLLATE NOCASE',
  );
  return rows.map(mapItem);
}

export async function updateItem(
  db: SQLiteDatabase,
  id: number,
  draft: { name: string; emoji: string; costCents: number; priceCents: number },
): Promise<void> {
  await db.runAsync(
    'UPDATE items SET name = ?, emoji = ?, cost_cents = ?, price_cents = ? WHERE id = ?',
    draft.name,
    draft.emoji,
    draft.costCents,
    draft.priceCents,
    id,
  );
}

export async function getActiveMarketDay(db: SQLiteDatabase): Promise<MarketDay | null> {
  const row = await db.getFirstAsync<{
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

export async function startMarketDay(db: SQLiteDatabase, name: string): Promise<MarketDay> {
  const active = await getActiveMarketDay(db);
  if (active) {
    throw new ActiveMarketDayExistsError();
  }

  const result = await db.runAsync('INSERT INTO market_days (name) VALUES (?)', name);
  const row = await db.getFirstAsync<{
    id: number;
    name: string;
    started_at: string;
    closed_at: string | null;
    exported_at: string | null;
  }>('SELECT * FROM market_days WHERE id = ?', result.lastInsertRowId);

  if (!row) {
    throw new Error('Failed to create Market Day');
  }

  return {
    id: row.id,
    name: row.name,
    startedAt: row.started_at,
    closedAt: row.closed_at,
    exportedAt: row.exported_at,
  };
}

export async function closeActiveMarketDay(db: SQLiteDatabase): Promise<void> {
  await db.runAsync(`UPDATE market_days SET closed_at = datetime('now') WHERE closed_at IS NULL`);
}

export async function undoCloseMostRecentMarketDay(db: SQLiteDatabase): Promise<void> {
  const closed = await db.getFirstAsync<{ id: number }>(
    `SELECT id FROM market_days
     WHERE closed_at IS NOT NULL AND exported_at IS NULL
     ORDER BY closed_at DESC
     LIMIT 1`,
  );

  if (!closed) {
    throw new NothingToUndoCloseError();
  }

  await db.runAsync('UPDATE market_days SET closed_at = NULL WHERE id = ?', closed.id);
}

export async function canUndoCloseMarketDay(db: SQLiteDatabase): Promise<boolean> {
  const row = await db.getFirstAsync<{ id: number }>(
    `SELECT id FROM market_days
     WHERE closed_at IS NOT NULL AND exported_at IS NULL
     LIMIT 1`,
  );
  return row !== null;
}

export async function exportMarketDay(db: SQLiteDatabase, marketDayId: number): Promise<void> {
  await db.runAsync(
    `UPDATE market_days SET exported_at = datetime('now') WHERE id = ?`,
    marketDayId,
  );
}

export async function getDashboardMarketDay(db: SQLiteDatabase): Promise<MarketDay | null> {
  const active = await getActiveMarketDay(db);
  if (active) return active;

  const row = await db.getFirstAsync<{
    id: number;
    name: string;
    started_at: string;
    closed_at: string | null;
    exported_at: string | null;
  }>(
    `SELECT * FROM market_days
     ORDER BY COALESCE(closed_at, started_at) DESC
     LIMIT 1`,
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

export function cartTotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.priceCents * line.quantity, 0);
}

export async function createSale(
  db: SQLiteDatabase,
  params: {
    marketDayId: number;
    lines: CartLine[];
    paymentMethod: PaymentMethod;
    cashReceivedCents: number | null;
  },
): Promise<Sale> {
  const totalCents = cartTotal(params.lines);
  const nextRow = await db.getFirstAsync<{ n: number }>(
    'SELECT COALESCE(MAX(sale_number), 0) + 1 AS n FROM sales',
  );
  const nextNumber = nextRow?.n ?? 1;

  const result = await db.runAsync(
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
    await db.runAsync(
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

export async function getSale(db: SQLiteDatabase, saleId: number): Promise<Sale | null> {
  const row = await db.getFirstAsync<{
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

export async function getSaleLineItems(db: SQLiteDatabase, saleId: number): Promise<CartLine[]> {
  const rows = await db.getAllAsync<{
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
  );

  return rows.map((row) => ({
    itemId: row.item_id,
    name: row.name,
    emoji: row.emoji,
    priceCents: row.price_cents,
    costCents: row.cost_cents,
    quantity: row.quantity,
  }));
}

export async function deleteSale(db: SQLiteDatabase, saleId: number): Promise<void> {
  await db.runAsync('DELETE FROM line_items WHERE sale_id = ?', saleId);
  await db.runAsync('DELETE FROM sales WHERE id = ?', saleId);
}

export async function getMarketDayStats(db: SQLiteDatabase, marketDayId: number) {
  const row = await db.getFirstAsync<{
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
