import type { SQLiteDatabase } from 'expo-sqlite';

import {
  ActiveMarketDayExistsError,
  CannotDeleteActiveMarketDayError,
  ItemHasSalesError,
  NothingToUndoCloseError,
} from '@/lib/market-day';
import type {
  AllTimeSaleSummary,
  CartLine,
  Item,
  MarketDay,
  PaymentMethod,
  Sale,
  SaleSummary,
  ClosedMarketDaySummary,
} from '@/lib/types';

type ItemRow = {
  id: number;
  name: string;
  icon: string;
  photo_uri: string | null;
  cost_cents: number;
  price_cents: number;
  archived: number;
};

function mapItem(row: ItemRow): Item {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    photoUri: row.photo_uri,
    costCents: row.cost_cents,
    priceCents: row.price_cents,
    archived: row.archived === 1,
  };
}

export async function getActiveItems(db: SQLiteDatabase): Promise<Item[]> {
  const rows = await db.getAllAsync<ItemRow>(
    'SELECT * FROM items WHERE archived = 0 ORDER BY name COLLATE NOCASE',
  );
  return rows.map(mapItem);
}

type MenuItemRow = {
  id: number;
  name: string;
  icon: string;
  photo_uri: string | null;
  cost_cents: number;
  price_cents: number;
  sold_out: number;
};

async function populateMenuForMarketDay(db: SQLiteDatabase, marketDayId: number): Promise<void> {
  await db.runAsync(
    `INSERT INTO menu_items (market_day_id, item_id, sold_out, removed)
     SELECT ?, id, 0, 0 FROM items WHERE archived = 0`,
    marketDayId,
  );
}

export async function ensureActiveMarketDayMenu(db: SQLiteDatabase): Promise<void> {
  const active = await getActiveMarketDay(db);
  if (!active) return;

  await db.runAsync(
    `INSERT OR IGNORE INTO menu_items (market_day_id, item_id, sold_out, removed)
     SELECT ?, id, 0, 0 FROM items WHERE archived = 0`,
    active.id,
  );
}

async function addItemToActiveMenu(db: SQLiteDatabase, itemId: number): Promise<void> {
  const active = await getActiveMarketDay(db);
  if (!active) return;

  await db.runAsync(
    `INSERT OR IGNORE INTO menu_items (market_day_id, item_id, sold_out, removed)
     VALUES (?, ?, 0, 0)`,
    active.id,
    itemId,
  );
}

async function removeItemFromActiveMenu(db: SQLiteDatabase, itemId: number): Promise<void> {
  const active = await getActiveMarketDay(db);
  if (!active) return;

  await db.runAsync(
    `UPDATE menu_items
     SET removed = 1, sold_out = 0
     WHERE market_day_id = ? AND item_id = ?`,
    active.id,
    itemId,
  );
}

function mapMenuItem(row: MenuItemRow): Item & { soldOut: boolean } {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    photoUri: row.photo_uri,
    costCents: row.cost_cents,
    priceCents: row.price_cents,
    archived: false,
    soldOut: row.sold_out === 1,
  };
}

export async function getHomeItems(db: SQLiteDatabase): Promise<Array<Item & { soldOut?: boolean }>> {
  const active = await getActiveMarketDay(db);
  if (!active) {
    return getActiveItems(db);
  }

  await ensureActiveMarketDayMenu(db);

  const rows = await db.getAllAsync<MenuItemRow>(
    `SELECT i.id, i.name, i.icon, i.photo_uri, i.cost_cents, i.price_cents, m.sold_out
     FROM menu_items m
     JOIN items i ON i.id = m.item_id
     WHERE m.market_day_id = ? AND m.removed = 0
     ORDER BY i.name COLLATE NOCASE`,
    active.id,
  );

  return rows.map(mapMenuItem);
}

export async function getCheckoutItems(db: SQLiteDatabase): Promise<Item[]> {
  const active = await getActiveMarketDay(db);
  if (!active) return getActiveItems(db);

  await ensureActiveMarketDayMenu(db);

  const rows = await db.getAllAsync<ItemRow>(
    `SELECT i.*
     FROM menu_items m
     JOIN items i ON i.id = m.item_id
     WHERE m.market_day_id = ? AND m.removed = 0 AND m.sold_out = 0
     ORDER BY i.name COLLATE NOCASE`,
    active.id,
  );

  return rows.map(mapItem);
}

export async function getRunningTabItems(db: SQLiteDatabase): Promise<Item[]> {
  return getActiveItems(db);
}

export async function getMenuForAdmin(db: SQLiteDatabase) {
  const active = await getActiveMarketDay(db);
  if (!active) return [];

  await ensureActiveMarketDayMenu(db);

  const rows = await db.getAllAsync<{
    id: number;
    name: string;
    icon: string;
    price_cents: number;
    sold_out: number;
  }>(
    `SELECT i.id, i.name, i.icon, i.price_cents, m.sold_out
     FROM menu_items m
     JOIN items i ON i.id = m.item_id
     WHERE m.market_day_id = ? AND m.removed = 0
     ORDER BY i.name COLLATE NOCASE`,
    active.id,
  );

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    icon: row.icon,
    priceCents: row.price_cents,
    soldOut: row.sold_out === 1,
  }));
}

export async function getRemovedMenuItems(db: SQLiteDatabase) {
  const active = await getActiveMarketDay(db);
  if (!active) return [];

  await ensureActiveMarketDayMenu(db);

  const rows = await db.getAllAsync<{
    id: number;
    name: string;
    icon: string;
    price_cents: number;
  }>(
    `SELECT i.id, i.name, i.icon, i.price_cents
     FROM menu_items m
     JOIN items i ON i.id = m.item_id
     WHERE m.market_day_id = ? AND m.removed = 1 AND i.archived = 0
     ORDER BY i.name COLLATE NOCASE`,
    active.id,
  );

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    icon: row.icon,
    priceCents: row.price_cents,
  }));
}

export async function removeFromMenu(db: SQLiteDatabase, itemId: number): Promise<void> {
  const active = await getActiveMarketDay(db);
  if (!active) return;

  await db.runAsync(
    `UPDATE menu_items
     SET removed = 1, sold_out = 0
     WHERE market_day_id = ? AND item_id = ?`,
    active.id,
    itemId,
  );
}

export async function markSoldOut(db: SQLiteDatabase, itemId: number): Promise<void> {
  const active = await getActiveMarketDay(db);
  if (!active) return;

  await db.runAsync(
    `UPDATE menu_items
     SET sold_out = 1
     WHERE market_day_id = ? AND item_id = ? AND removed = 0`,
    active.id,
    itemId,
  );
}

export async function markAvailable(db: SQLiteDatabase, itemId: number): Promise<void> {
  const active = await getActiveMarketDay(db);
  if (!active) return;

  await db.runAsync(
    `UPDATE menu_items
     SET sold_out = 0
     WHERE market_day_id = ? AND item_id = ? AND removed = 0`,
    active.id,
    itemId,
  );
}

export async function addToMenu(db: SQLiteDatabase, itemId: number): Promise<void> {
  const active = await getActiveMarketDay(db);
  if (!active) return;

  const result = await db.runAsync(
    `UPDATE menu_items
     SET removed = 0, sold_out = 0
     WHERE market_day_id = ? AND item_id = ? AND removed = 1`,
    active.id,
    itemId,
  );

  if ((result.changes ?? 0) === 0) {
    await addItemToActiveMenu(db, itemId);
  }
}

export async function createItem(
  db: SQLiteDatabase,
  draft: {
    name: string;
    icon: string;
    costCents: number;
    priceCents: number;
    photoUri?: string | null;
  },
): Promise<{ id: number }> {
  const result = await db.runAsync(
    'INSERT INTO items (name, icon, photo_uri, cost_cents, price_cents) VALUES (?, ?, ?, ?, ?)',
    draft.name,
    draft.icon,
    draft.photoUri ?? null,
    draft.costCents,
    draft.priceCents,
  );
  const id = Number(result.lastInsertRowId);
  await addItemToActiveMenu(db, id);
  return { id };
}

export async function getAllItems(db: SQLiteDatabase): Promise<Item[]> {
  const rows = await db.getAllAsync<ItemRow>(
    'SELECT * FROM items ORDER BY archived ASC, name COLLATE NOCASE',
  );
  return rows.map(mapItem);
}

export async function updateItem(
  db: SQLiteDatabase,
  id: number,
  draft: {
    name: string;
    icon: string;
    costCents: number;
    priceCents: number;
    photoUri?: string | null;
  },
): Promise<void> {
  await db.runAsync(
    'UPDATE items SET name = ?, icon = ?, photo_uri = ?, cost_cents = ?, price_cents = ? WHERE id = ?',
    draft.name,
    draft.icon,
    draft.photoUri ?? null,
    draft.costCents,
    draft.priceCents,
    id,
  );
}

export async function archiveItem(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('UPDATE items SET archived = 1 WHERE id = ?', id);
  await removeItemFromActiveMenu(db, id);
}

export async function unarchiveItem(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('UPDATE items SET archived = 0 WHERE id = ?', id);
  await addItemToActiveMenu(db, id);
}

export async function deleteItem(db: SQLiteDatabase, id: number): Promise<void> {
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM line_items WHERE item_id = ?',
    id,
  );
  if (row && row.count > 0) {
    throw new ItemHasSalesError();
  }

  await db.runAsync('DELETE FROM menu_items WHERE item_id = ?', id);
  await db.runAsync('DELETE FROM items WHERE id = ?', id);
}

export async function getActiveMarketDay(db: SQLiteDatabase): Promise<MarketDay | null> {
  const row = await db.getFirstAsync<{
    id: number;
    name: string;
    started_at: string;
    closed_at: string | null;
    exported_at: string | null;
    needs_reexport: number;
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
    needsReexport: row.needs_reexport === 1,
  };
}

export async function startMarketDay(
  db: SQLiteDatabase,
  name: string,
  startedAt: string,
): Promise<MarketDay> {
  const active = await getActiveMarketDay(db);
  if (active) {
    throw new ActiveMarketDayExistsError();
  }

  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error('Market Day name is required');
  }

  const result = await db.runAsync(
    'INSERT INTO market_days (name, started_at) VALUES (?, ?)',
    trimmedName,
    startedAt,
  );
  const row = await db.getFirstAsync<{
    id: number;
    name: string;
    started_at: string;
    closed_at: string | null;
    exported_at: string | null;
    needs_reexport: number;
  }>('SELECT * FROM market_days WHERE id = ?', result.lastInsertRowId);

  if (!row) {
    throw new Error('Failed to create Market Day');
  }

  await populateMenuForMarketDay(db, row.id);

  return {
    id: row.id,
    name: row.name,
    startedAt: row.started_at,
    closedAt: row.closed_at,
    exportedAt: row.exported_at,
    needsReexport: row.needs_reexport === 1,
  };
}

export async function closeActiveMarketDay(db: SQLiteDatabase): Promise<void> {
  await db.runAsync(`UPDATE market_days SET closed_at = datetime('now') WHERE closed_at IS NULL`);
}

export async function undoCloseMostRecentMarketDay(db: SQLiteDatabase): Promise<void> {
  const closed = await db.getFirstAsync<{ id: number }>(
    `SELECT id FROM market_days
     WHERE closed_at IS NOT NULL AND exported_at IS NULL
     ORDER BY closed_at DESC, id DESC
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
    `UPDATE market_days SET exported_at = datetime('now'), needs_reexport = 0 WHERE id = ?`,
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
    needs_reexport: number;
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
    needsReexport: row.needs_reexport === 1,
  };
}

export function cartTotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.priceCents * line.quantity, 0);
}

export function cartProfit(lines: CartLine[]): number {
  return lines.reduce(
    (sum, line) => sum + (line.priceCents - line.costCents) * line.quantity,
    0,
  );
}

export async function getNextSaleNumber(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ n: number }>(
    'SELECT COALESCE(MAX(sale_number), 0) + 1 AS n FROM sales',
  );
  return row?.n ?? 1;
}

function assertValidSaleLines(lines: CartLine[]): void {
  if (lines.length === 0) {
    throw new Error('Sale must have at least one line item');
  }
  for (const line of lines) {
    if (!Number.isFinite(line.quantity) || line.quantity <= 0) {
      throw new Error('Sale line quantities must be positive');
    }
  }
}

function normalizeOptionalText(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function mapSaleRow(row: {
  id: number;
  sale_number: number;
  market_day_id: number | null;
  total_cents: number;
  payment_method: PaymentMethod;
  cash_received_cents: number | null;
  change_kept?: number;
  name: string | null;
  notes: string | null;
  complete_date: string | null;
  is_preorder: number;
  created_at: string;
}): Sale {
  return {
    id: row.id,
    saleNumber: row.sale_number,
    marketDayId: row.market_day_id,
    totalCents: row.total_cents,
    paymentMethod: row.payment_method,
    cashReceivedCents: row.cash_received_cents,
    changeKept: (row.change_kept ?? 0) === 1,
    name: row.name,
    notes: row.notes,
    completeDate: row.complete_date,
    isPreorder: row.is_preorder === 1,
    createdAt: row.created_at,
  };
}

export async function createSale(
  db: SQLiteDatabase,
  params: {
    marketDayId: number | null;
    lines: CartLine[];
    paymentMethod: PaymentMethod;
    cashReceivedCents: number | null;
    changeKept?: boolean;
    name?: string | null;
    notes?: string | null;
    completeDate?: string | null;
    isPreorder?: boolean;
    /** Reuse an existing invoice number (e.g. after edit-sale delete). */
    saleNumber?: number;
  },
): Promise<Sale> {
  assertValidSaleLines(params.lines);

  const totalCents = cartTotal(params.lines);
  const name = normalizeOptionalText(params.name);
  const notes = normalizeOptionalText(params.notes);
  const completeDate = normalizeOptionalText(params.completeDate);
  const isPreorder = params.isPreorder === true ? 1 : 0;
  const changeKept =
    params.changeKept === true && (params.cashReceivedCents ?? 0) > totalCents ? 1 : 0;

  if (isPreorder === 1 && (!name || !notes || !completeDate)) {
    throw new Error('Preorder requires name, notes, and complete date');
  }

  let created: Sale | null = null;

  await db.withExclusiveTransactionAsync(async (txn) => {
    const saleNumber =
      params.saleNumber != null && params.saleNumber > 0
        ? params.saleNumber
        : (
            await txn.getFirstAsync<{ n: number }>(
              'SELECT COALESCE(MAX(sale_number), 0) + 1 AS n FROM sales',
            )
          )?.n ?? 1;

    const result = await txn.runAsync(
      `INSERT INTO sales (sale_number, market_day_id, total_cents, payment_method, cash_received_cents, change_kept, name, notes, complete_date, is_preorder)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      saleNumber,
      params.marketDayId,
      totalCents,
      params.paymentMethod,
      params.cashReceivedCents,
      changeKept,
      name,
      notes,
      completeDate,
      isPreorder,
    );

    const saleId = result.lastInsertRowId;

    for (const line of params.lines) {
      await txn.runAsync(
        `INSERT INTO line_items (sale_id, item_id, quantity, price_cents, cost_cents)
         VALUES (?, ?, ?, ?, ?)`,
        saleId,
        line.itemId,
        line.quantity,
        line.priceCents,
        line.costCents,
      );
    }

    const createdAtRow = await txn.getFirstAsync<{ created_at: string }>(
      'SELECT created_at FROM sales WHERE id = ?',
      saleId,
    );

    created = {
      id: saleId,
      saleNumber,
      marketDayId: params.marketDayId,
      totalCents,
      paymentMethod: params.paymentMethod,
      cashReceivedCents: params.cashReceivedCents,
      changeKept: changeKept === 1,
      name,
      notes,
      completeDate,
      isPreorder: isPreorder === 1,
      createdAt: createdAtRow?.created_at ?? new Date().toISOString(),
    };
  });

  return created!;
}

/**
 * Replace an existing sale's payment fields and line items in one transaction.
 * Keeps id, sale_number, created_at, market_day_id, and is_preorder.
 */
export async function replaceSaleContents(
  db: SQLiteDatabase,
  saleId: number,
  params: {
    lines: CartLine[];
    paymentMethod: PaymentMethod;
    cashReceivedCents: number | null;
    changeKept?: boolean;
    name?: string | null;
    notes?: string | null;
    completeDate?: string | null;
  },
): Promise<Sale> {
  assertValidSaleLines(params.lines);

  const existing = await getSale(db, saleId);
  if (!existing) {
    throw new Error('Sale not found');
  }

  const totalCents = cartTotal(params.lines);
  const name = normalizeOptionalText(params.name);
  const notes = normalizeOptionalText(params.notes);
  const completeDate = normalizeOptionalText(params.completeDate);
  const changeKept =
    params.changeKept === true && (params.cashReceivedCents ?? 0) > totalCents ? 1 : 0;

  let updated: Sale | null = null;

  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.runAsync(
      `UPDATE sales
       SET total_cents = ?, payment_method = ?, cash_received_cents = ?, change_kept = ?,
           name = ?, notes = ?, complete_date = ?
       WHERE id = ?`,
      totalCents,
      params.paymentMethod,
      params.cashReceivedCents,
      changeKept,
      name,
      notes,
      completeDate,
      saleId,
    );

    await txn.runAsync('DELETE FROM line_items WHERE sale_id = ?', saleId);

    for (const line of params.lines) {
      await txn.runAsync(
        `INSERT INTO line_items (sale_id, item_id, quantity, price_cents, cost_cents)
         VALUES (?, ?, ?, ?, ?)`,
        saleId,
        line.itemId,
        line.quantity,
        line.priceCents,
        line.costCents,
      );
    }

    updated = {
      id: saleId,
      saleNumber: existing.saleNumber,
      marketDayId: existing.marketDayId,
      totalCents,
      paymentMethod: params.paymentMethod,
      cashReceivedCents: params.cashReceivedCents,
      changeKept: changeKept === 1,
      name,
      notes,
      completeDate,
      isPreorder: existing.isPreorder,
      createdAt: existing.createdAt,
    };
  });

  await flagMarketDayReexportIfExported(db, existing.marketDayId);

  return updated!;
}

export async function getSale(db: SQLiteDatabase, saleId: number): Promise<Sale | null> {
  const row = await db.getFirstAsync<{
    id: number;
    sale_number: number;
    market_day_id: number | null;
    total_cents: number;
    payment_method: PaymentMethod;
    cash_received_cents: number | null;
    change_kept?: number;
  name: string | null;
    notes: string | null;
    complete_date: string | null;
    is_preorder: number;
    created_at: string;
  }>('SELECT * FROM sales WHERE id = ?', saleId);

  if (!row) return null;

  return mapSaleRow(row);
}

export async function getSaleLineItems(db: SQLiteDatabase, saleId: number): Promise<CartLine[]> {
  const rows = await db.getAllAsync<{
    item_id: number;
    name: string;
    icon: string;
    quantity: number;
    price_cents: number;
    cost_cents: number;
  }>(
    `SELECT li.item_id, i.name, i.icon, li.quantity, li.price_cents, li.cost_cents
     FROM line_items li
     JOIN items i ON i.id = li.item_id
     WHERE li.sale_id = ?`,
    saleId,
  );

  return rows.map((row) => ({
    itemId: row.item_id,
    name: row.name,
    icon: row.icon,
    priceCents: row.price_cents,
    costCents: row.cost_cents,
    quantity: row.quantity,
  }));
}

export async function deleteSale(db: SQLiteDatabase, saleId: number): Promise<void> {
  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.runAsync('DELETE FROM line_items WHERE sale_id = ?', saleId);
    await txn.runAsync('DELETE FROM sales WHERE id = ?', saleId);
  });
}

async function flagMarketDayReexportIfExported(
  db: SQLiteDatabase,
  marketDayId: number | null,
): Promise<void> {
  if (marketDayId == null) return;
  await db.runAsync(
    `UPDATE market_days SET needs_reexport = 1 WHERE id = ? AND exported_at IS NOT NULL`,
    marketDayId,
  );
}

export async function getSaleByNumber(
  db: SQLiteDatabase,
  saleNumber: number,
): Promise<Sale | null> {
  const row = await db.getFirstAsync<{
    id: number;
    sale_number: number;
    market_day_id: number | null;
    total_cents: number;
    payment_method: PaymentMethod;
    cash_received_cents: number | null;
    change_kept?: number;
  name: string | null;
    notes: string | null;
    complete_date: string | null;
    is_preorder: number;
    created_at: string;
  }>('SELECT * FROM sales WHERE sale_number = ?', saleNumber);

  if (!row) return null;

  return mapSaleRow(row);
}

export async function removeSaleByNumber(db: SQLiteDatabase, saleNumber: number): Promise<void> {
  const sale = await getSaleByNumber(db, saleNumber);
  if (!sale) return;

  await deleteSale(db, sale.id);
  await flagMarketDayReexportIfExported(db, sale.marketDayId);
}

export async function updateSalePaymentMethod(
  db: SQLiteDatabase,
  saleNumber: number,
  paymentMethod: PaymentMethod,
): Promise<void> {
  await updateSale(db, saleNumber, { paymentMethod });
}

export async function updateSale(
  db: SQLiteDatabase,
  saleNumber: number,
  updates: {
    paymentMethod?: PaymentMethod;
    cashReceivedCents?: number | null;
    changeKept?: boolean;
    name?: string | null;
    notes?: string | null;
    completeDate?: string | null;
  },
): Promise<void> {
  const sale = await getSaleByNumber(db, saleNumber);
  if (!sale) return;

  const paymentMethod = updates.paymentMethod ?? sale.paymentMethod;
  const name = updates.name !== undefined ? normalizeOptionalText(updates.name) : sale.name;
  const notes = updates.notes !== undefined ? normalizeOptionalText(updates.notes) : sale.notes;
  const completeDate =
    updates.completeDate !== undefined
      ? normalizeOptionalText(updates.completeDate)
      : sale.completeDate;

  let cashReceivedCents: number | null;
  let changeKept: boolean;

  if (updates.cashReceivedCents !== undefined || updates.changeKept !== undefined) {
    cashReceivedCents =
      updates.cashReceivedCents !== undefined
        ? updates.cashReceivedCents
        : sale.cashReceivedCents;
    const received = cashReceivedCents ?? 0;
    changeKept = updates.changeKept === true && received > sale.totalCents;
  } else if (updates.paymentMethod !== undefined) {
    if (paymentMethod === 'cash' || paymentMethod === 'venmo_zelle') {
      cashReceivedCents = sale.cashReceivedCents ?? sale.totalCents;
      changeKept =
        sale.changeKept && cashReceivedCents != null && cashReceivedCents > sale.totalCents;
    } else {
      cashReceivedCents = null;
      changeKept = false;
    }
  } else {
    cashReceivedCents = sale.cashReceivedCents;
    changeKept = sale.changeKept;
  }

  await db.runAsync(
    `UPDATE sales SET payment_method = ?, cash_received_cents = ?, change_kept = ?, name = ?, notes = ?, complete_date = ? WHERE id = ?`,
    paymentMethod,
    cashReceivedCents,
    changeKept ? 1 : 0,
    name,
    notes,
    completeDate,
    sale.id,
  );
  await flagMarketDayReexportIfExported(db, sale.marketDayId);
}

export async function completePreorder(
  db: SQLiteDatabase,
  saleNumber: number,
  params: {
    paymentMethod: PaymentMethod;
    cashReceivedCents?: number | null;
    changeKept?: boolean;
    name?: string | null;
    notes?: string | null;
    completeDate?: string | null;
  },
): Promise<void> {
  const sale = await getSaleByNumber(db, saleNumber);
  if (!sale?.isPreorder) return;
  if (params.paymentMethod === 'pay_on_pickup') return;

  const name = params.name !== undefined ? normalizeOptionalText(params.name) : sale.name;
  const notes = params.notes !== undefined ? normalizeOptionalText(params.notes) : sale.notes;
  const completeDate =
    params.completeDate !== undefined
      ? normalizeOptionalText(params.completeDate)
      : sale.completeDate;
  if (!name || !notes) return;
  const cashReceivedCents =
    params.paymentMethod === 'cash' || params.paymentMethod === 'venmo_zelle'
      ? (params.cashReceivedCents ?? sale.totalCents)
      : null;
  const changeKept =
    params.changeKept === true &&
    cashReceivedCents != null &&
    cashReceivedCents > sale.totalCents
      ? 1
      : 0;

  await db.runAsync(
    `UPDATE sales
     SET payment_method = ?, cash_received_cents = ?, change_kept = ?, name = ?, notes = ?, complete_date = ?, is_preorder = 0
     WHERE id = ?`,
    params.paymentMethod,
    cashReceivedCents,
    changeKept,
    name,
    notes,
    completeDate,
    sale.id,
  );
  await flagMarketDayReexportIfExported(db, sale.marketDayId);
}

export async function getPreorderSales(db: SQLiteDatabase): Promise<SaleSummary[]> {
  const rows = await db.getAllAsync<{
    sale_number: number;
    total_cents: number;
    payment_method: PaymentMethod;
    change_kept?: number;
  name: string | null;
    notes: string | null;
    complete_date: string | null;
    created_at: string;
  }>(
    `SELECT sale_number, total_cents, payment_method, name, notes, complete_date, created_at
     FROM sales
     WHERE is_preorder = 1
     ORDER BY
       CASE WHEN complete_date IS NULL THEN 1 ELSE 0 END,
       complete_date ASC,
       sale_number ASC`,
  );

  return rows.map((row) => ({
    saleNumber: row.sale_number,
    totalCents: row.total_cents,
    paymentMethod: row.payment_method,
    name: row.name,
    notes: row.notes,
    completeDate: row.complete_date,
    createdAt: row.created_at,
  }));
}

export async function marketDayNeedsReexport(
  db: SQLiteDatabase,
  marketDayId: number,
): Promise<boolean> {
  const row = await db.getFirstAsync<{ needs_reexport: number }>(
    'SELECT needs_reexport FROM market_days WHERE id = ?',
    marketDayId,
  );
  return row?.needs_reexport === 1;
}

export async function getMarketDaySaleCount(
  db: SQLiteDatabase,
  marketDayId: number,
): Promise<number> {
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM sales WHERE market_day_id = ?',
    marketDayId,
  );
  return row?.count ?? 0;
}

export async function getMarketDayStats(db: SQLiteDatabase, marketDayId: number) {
  const row = await db.getFirstAsync<{
    total_cents: number;
    item_count: number;
    profit_cents: number;
    cash_cents: number;
    venmo_cents: number;
    tips_cents: number;
  }>(
    `SELECT
       COALESCE(SUM(s.total_cents), 0) AS total_cents,
       COALESCE(SUM((SELECT SUM(li.quantity) FROM line_items li WHERE li.sale_id = s.id)), 0) AS item_count,
       COALESCE(SUM(
         (SELECT SUM((li.price_cents - li.cost_cents) * li.quantity)
          FROM line_items li
          WHERE li.sale_id = s.id)
       ), 0) AS profit_cents,
       COALESCE(SUM(CASE WHEN s.payment_method = 'cash' THEN s.total_cents ELSE 0 END), 0) AS cash_cents,
       COALESCE(SUM(CASE WHEN s.payment_method = 'venmo_zelle' THEN s.total_cents ELSE 0 END), 0) AS venmo_cents,
       COALESCE(SUM(
         CASE
           WHEN s.change_kept = 1 AND s.cash_received_cents IS NOT NULL AND s.cash_received_cents > s.total_cents
           THEN s.cash_received_cents - s.total_cents
           ELSE 0
         END
       ), 0) AS tips_cents
     FROM sales s
     WHERE s.market_day_id = ?`,
    marketDayId,
  );

  return {
    totalCents: row?.total_cents ?? 0,
    itemCount: row?.item_count ?? 0,
    profitCents: row?.profit_cents ?? 0,
    cashCents: row?.cash_cents ?? 0,
    venmoCents: row?.venmo_cents ?? 0,
    tipsCents: row?.tips_cents ?? 0,
  };
}

export async function getAllTimeStats(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<{
    total_cents: number;
    item_count: number;
    profit_cents: number;
    cash_cents: number;
    venmo_cents: number;
    tips_cents: number;
  }>(
    `SELECT
       COALESCE(SUM(s.total_cents), 0) AS total_cents,
       COALESCE(SUM((SELECT SUM(li.quantity) FROM line_items li WHERE li.sale_id = s.id)), 0) AS item_count,
       COALESCE(SUM(
         (SELECT SUM((li.price_cents - li.cost_cents) * li.quantity)
          FROM line_items li
          WHERE li.sale_id = s.id)
       ), 0) AS profit_cents,
       COALESCE(SUM(CASE WHEN s.payment_method = 'cash' THEN s.total_cents ELSE 0 END), 0) AS cash_cents,
       COALESCE(SUM(CASE WHEN s.payment_method = 'venmo_zelle' THEN s.total_cents ELSE 0 END), 0) AS venmo_cents,
       COALESCE(SUM(
         CASE
           WHEN s.change_kept = 1 AND s.cash_received_cents IS NOT NULL AND s.cash_received_cents > s.total_cents
           THEN s.cash_received_cents - s.total_cents
           ELSE 0
         END
       ), 0) AS tips_cents
     FROM sales s
     WHERE s.is_preorder = 0`,
  );

  return {
    totalCents: row?.total_cents ?? 0,
    itemCount: row?.item_count ?? 0,
    profitCents: row?.profit_cents ?? 0,
    cashCents: row?.cash_cents ?? 0,
    venmoCents: row?.venmo_cents ?? 0,
    tipsCents: row?.tips_cents ?? 0,
  };
}

export async function getAllTimeSales(db: SQLiteDatabase): Promise<AllTimeSaleSummary[]> {
  const rows = await db.getAllAsync<{
    sale_number: number;
    total_cents: number;
    payment_method: PaymentMethod;
    change_kept?: number;
  name: string | null;
    created_at: string;
    market_day_name: string | null;
  }>(
    `SELECT
       s.sale_number,
       s.total_cents,
       s.payment_method,
       s.name,
       s.created_at,
       md.name AS market_day_name
     FROM sales s
     LEFT JOIN market_days md ON md.id = s.market_day_id
     WHERE s.is_preorder = 0
     ORDER BY s.created_at DESC, s.sale_number DESC`,
  );

  return rows.map((row) => ({
    saleNumber: row.sale_number,
    totalCents: row.total_cents,
    paymentMethod: row.payment_method,
    name: row.name,
    notes: null,
    completeDate: null,
    createdAt: row.created_at,
    marketDayName: row.market_day_name,
  }));
}

export async function getMarketDaySales(
  db: SQLiteDatabase,
  marketDayId: number,
): Promise<SaleSummary[]> {
  const rows = await db.getAllAsync<{
    sale_number: number;
    total_cents: number;
    payment_method: PaymentMethod;
    change_kept?: number;
  name: string | null;
    created_at: string;
  }>(
    `SELECT sale_number, total_cents, payment_method, name, created_at
     FROM sales
     WHERE market_day_id = ?
     ORDER BY sale_number ASC`,
    marketDayId,
  );

  return rows.map((row) => ({
    saleNumber: row.sale_number,
    totalCents: row.total_cents,
    paymentMethod: row.payment_method,
    name: row.name,
    notes: null,
    completeDate: null,
    createdAt: row.created_at,
  }));
}

type MarketDayRow = {
  id: number;
  name: string;
  started_at: string;
  closed_at: string | null;
  exported_at: string | null;
  needs_reexport: number;
};

function mapMarketDayRow(row: MarketDayRow): MarketDay {
  return {
    id: row.id,
    name: row.name,
    startedAt: row.started_at,
    closedAt: row.closed_at,
    exportedAt: row.exported_at,
    needsReexport: row.needs_reexport === 1,
  };
}

export async function getMarketDayById(
  db: SQLiteDatabase,
  marketDayId: number,
): Promise<MarketDay | null> {
  const row = await db.getFirstAsync<MarketDayRow>(
    'SELECT * FROM market_days WHERE id = ?',
    marketDayId,
  );
  if (!row) return null;
  return mapMarketDayRow(row);
}

export async function getClosedMarketDays(
  db: SQLiteDatabase,
): Promise<ClosedMarketDaySummary[]> {
  const rows = await db.getAllAsync<{
    id: number;
    name: string;
    started_at: string;
    closed_at: string;
    sale_count: number;
  }>(
    `SELECT md.id, md.name, md.started_at, md.closed_at,
            (SELECT COUNT(*) FROM sales s WHERE s.market_day_id = md.id) AS sale_count
     FROM market_days md
     WHERE md.closed_at IS NOT NULL
     ORDER BY md.closed_at DESC, md.id DESC`,
  );

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    startedAt: row.started_at,
    closedAt: row.closed_at,
    saleCount: row.sale_count,
  }));
}

export async function canReopenMarketDay(
  db: SQLiteDatabase,
  marketDayId: number,
): Promise<boolean> {
  const reopenable = await db.getFirstAsync<{ id: number }>(
    `SELECT id FROM market_days
     WHERE closed_at IS NOT NULL AND exported_at IS NULL
     ORDER BY closed_at DESC, id DESC
     LIMIT 1`,
  );
  return reopenable?.id === marketDayId;
}

export async function deleteMarketDay(db: SQLiteDatabase, marketDayId: number): Promise<void> {
  const day = await getMarketDayById(db, marketDayId);
  if (!day) return;
  if (!day.closedAt) {
    throw new CannotDeleteActiveMarketDayError();
  }

  const saleRows = await db.getAllAsync<{ id: number }>(
    'SELECT id FROM sales WHERE market_day_id = ?',
    marketDayId,
  );
  for (const sale of saleRows) {
    await deleteSale(db, sale.id);
  }

  await db.runAsync('DELETE FROM market_days WHERE id = ?', marketDayId);
}

export type MarketDayExportRow = {
  saleNumber: number;
  createdAt: string;
  marketDayName: string;
  itemName: string;
  quantity: number;
  priceCents: number;
  costCents: number;
  saleTotalCents: number;
  paymentMethod: PaymentMethod;
  cashReceivedCents: number | null;
  changeKeptCents: number;
  customerName: string | null;
};

export async function getMarketDayExportRows(
  db: SQLiteDatabase,
  marketDayId: number,
): Promise<MarketDayExportRow[]> {
  const marketDay = await getMarketDayById(db, marketDayId);
  if (!marketDay) return [];

  const rows = await db.getAllAsync<{
    sale_number: number;
    created_at: string;
    total_cents: number;
    payment_method: PaymentMethod;
    cash_received_cents: number | null;
    change_kept?: number;
    name: string | null;
    item_name: string;
    quantity: number;
    price_cents: number;
    cost_cents: number;
  }>(
    `SELECT s.sale_number, s.created_at, s.total_cents, s.payment_method, s.cash_received_cents, s.change_kept, s.name,
            i.name AS item_name, li.quantity, li.price_cents, li.cost_cents
     FROM sales s
     JOIN line_items li ON li.sale_id = s.id
     JOIN items i ON i.id = li.item_id
     WHERE s.market_day_id = ?
     ORDER BY s.sale_number ASC, li.id ASC`,
    marketDayId,
  );

  return rows.map((row) => ({
    saleNumber: row.sale_number,
    createdAt: row.created_at,
    marketDayName: marketDay.name,
    itemName: row.item_name,
    quantity: row.quantity,
    priceCents: row.price_cents,
    costCents: row.cost_cents,
    saleTotalCents: row.total_cents,
    paymentMethod: row.payment_method,
    cashReceivedCents: row.cash_received_cents,
    changeKeptCents:
      row.change_kept === 1 && row.cash_received_cents != null
        ? Math.max(row.cash_received_cents - row.total_cents, 0)
        : 0,
    customerName: row.name,
  }));
}

export async function getSalesExportRows(
  db: SQLiteDatabase,
  startDate: string,
  endDate: string,
): Promise<MarketDayExportRow[]> {
  const rows = await db.getAllAsync<{
    sale_number: number;
    created_at: string;
    total_cents: number;
    payment_method: PaymentMethod;
    cash_received_cents: number | null;
    change_kept?: number;
    name: string | null;
    market_day_name: string | null;
    item_name: string;
    quantity: number;
    price_cents: number;
    cost_cents: number;
  }>(
    `SELECT s.sale_number, s.created_at, s.total_cents, s.payment_method, s.cash_received_cents, s.change_kept, s.name,
            md.name AS market_day_name,
            i.name AS item_name, li.quantity, li.price_cents, li.cost_cents
     FROM sales s
     JOIN line_items li ON li.sale_id = s.id
     JOIN items i ON i.id = li.item_id
     LEFT JOIN market_days md ON md.id = s.market_day_id
     WHERE s.is_preorder = 0
       AND date(s.created_at) >= date(?)
       AND date(s.created_at) <= date(?)
     ORDER BY s.sale_number ASC, li.id ASC`,
    startDate,
    endDate,
  );

  return rows.map((row) => ({
    saleNumber: row.sale_number,
    createdAt: row.created_at,
    marketDayName: row.market_day_name ?? '',
    itemName: row.item_name,
    quantity: row.quantity,
    priceCents: row.price_cents,
    costCents: row.cost_cents,
    saleTotalCents: row.total_cents,
    paymentMethod: row.payment_method,
    cashReceivedCents: row.cash_received_cents,
    changeKeptCents:
      row.change_kept === 1 && row.cash_received_cents != null
        ? Math.max(row.cash_received_cents - row.total_cents, 0)
        : 0,
    customerName: row.name,
  }));
}

export type PreorderPrepItem = {
  itemId: number;
  name: string;
  icon: string;
  quantity: number;
};

export async function getPreorderPrepSummary(db: SQLiteDatabase): Promise<PreorderPrepItem[]> {
  const rows = await db.getAllAsync<{
    item_id: number;
    name: string;
    icon: string;
    quantity: number;
  }>(
    `SELECT li.item_id, i.name, i.icon, SUM(li.quantity) AS quantity
     FROM sales s
     JOIN line_items li ON li.sale_id = s.id
     JOIN items i ON i.id = li.item_id
     WHERE s.is_preorder = 1
     GROUP BY li.item_id, i.name, i.icon
     ORDER BY i.name ASC`,
  );

  return rows.map((row) => ({
    itemId: row.item_id,
    name: row.name,
    icon: row.icon,
    quantity: row.quantity,
  }));
}

export type PreorderExportRow = {
  saleNumber: number;
  createdAt: string;
  customerName: string;
  notes: string;
  itemName: string;
  icon: string;
  quantity: number;
  priceCents: number;
  saleTotalCents: number;
};

export async function getPreorderExportRows(db: SQLiteDatabase): Promise<PreorderExportRow[]> {
  const rows = await db.getAllAsync<{
    sale_number: number;
    created_at: string;
    change_kept?: number;
  name: string | null;
    notes: string | null;
    item_name: string;
    icon: string;
    quantity: number;
    price_cents: number;
    total_cents: number;
  }>(
    `SELECT s.sale_number, s.created_at, s.name, s.notes,
            i.name AS item_name, i.icon, li.quantity, li.price_cents, s.total_cents
     FROM sales s
     JOIN line_items li ON li.sale_id = s.id
     JOIN items i ON i.id = li.item_id
     WHERE s.is_preorder = 1
     ORDER BY s.created_at ASC, s.sale_number ASC, li.id ASC`,
  );

  return rows.map((row) => ({
    saleNumber: row.sale_number,
    createdAt: row.created_at,
    customerName: row.name ?? '',
    notes: row.notes ?? '',
    itemName: row.item_name,
    icon: row.icon,
    quantity: row.quantity,
    priceCents: row.price_cents,
    saleTotalCents: row.total_cents,
  }));
}
