import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import type { SQLiteDatabase } from 'expo-sqlite';
import { Platform } from 'react-native';

import {
  exportMarketDay,
  getMarketDayById,
  getMarketDayExportRows,
  getPreorderExportRows,
  getPreorderPrepSummary,
  getSalesExportRows,
  type PreorderExportRow,
  type PreorderPrepItem,
} from '@/lib/db/queries';
import { formatSaleTime, paymentMethodLabel, parseSqliteUtc } from '@/lib/market-day';
import { formatMoney } from '@/lib/money';
import { cancelReasonDisplayLabel } from '@/lib/sale-cancel';

const CSV_HEADERS = [
  'Sale Number',
  'Date/Time',
  'Market Day',
  'Item Name',
  'Quantity',
  'Unit Price',
  'Unit Cost',
  'Line Total',
  'Line Profit',
  'Sale Total',
  'Payment Method',
  'Cash Received',
  'Change Kept',
  'Customer Name',
  'Status',
  'Cancel Reason',
] as const;

function escapeCsvField(value: string | number): string {
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** Prefix free-text values that spreadsheets treat as formulas. */
export function neutralizeSpreadsheetFormula(value: string): string {
  if (/^[=+\-@\t\r]/.test(value)) {
    return `'${value}`;
  }
  return value;
}

function escapeCsvTextField(value: string): string {
  return escapeCsvField(neutralizeSpreadsheetFormula(value));
}

function formatCentsForCsv(cents: number): string {
  return (cents / 100).toFixed(2);
}

function formatSaleDateTime(iso: string): string {
  const date = parseSqliteUtc(iso);
  return `${date.toLocaleDateString('en-US')} ${formatSaleTime(iso)}`;
}

export type CsvExportSummary = {
  zelleOrderTotalCents: number;
  zelleTipsTotalCents: number;
  cashOrderTotalCents: number;
  cashTipsTotalCents: number;
  orderOverallTotalCents: number;
  tipsOverallTotalCents: number;
  overallProfitCents: number;
};

export function computeExportSummary(
  rows: Awaited<ReturnType<typeof getMarketDayExportRows>>,
): CsvExportSummary {
  const sales = new Map<
    number,
    { saleTotalCents: number; changeKeptCents: number; paymentMethod: string }
  >();
  let overallProfitCents = 0;

  for (const row of rows) {
    overallProfitCents += (row.priceCents - row.costCents) * row.quantity;

    if (!sales.has(row.saleNumber)) {
      sales.set(row.saleNumber, {
        saleTotalCents: row.saleTotalCents,
        changeKeptCents: row.changeKeptCents,
        paymentMethod: row.paymentMethod,
      });
    }
  }

  let zelleOrderTotalCents = 0;
  let zelleTipsTotalCents = 0;
  let cashOrderTotalCents = 0;
  let cashTipsTotalCents = 0;
  let orderOverallTotalCents = 0;
  let tipsOverallTotalCents = 0;

  for (const sale of sales.values()) {
    orderOverallTotalCents += sale.saleTotalCents;
    tipsOverallTotalCents += sale.changeKeptCents;

    if (sale.paymentMethod === 'cash') {
      cashOrderTotalCents += sale.saleTotalCents;
      cashTipsTotalCents += sale.changeKeptCents;
    } else if (sale.paymentMethod === 'venmo_zelle') {
      zelleOrderTotalCents += sale.saleTotalCents;
      zelleTipsTotalCents += sale.changeKeptCents;
    }
  }

  return {
    zelleOrderTotalCents,
    zelleTipsTotalCents,
    cashOrderTotalCents,
    cashTipsTotalCents,
    orderOverallTotalCents,
    tipsOverallTotalCents,
    overallProfitCents,
  };
}

const SALE_TOTAL_COLUMN_INDEX = CSV_HEADERS.indexOf('Sale Total');

function formatSummaryRow(label: string, cents: number): string {
  const fields = Array.from({ length: CSV_HEADERS.length }, () => '');
  fields[0] = label;
  fields[SALE_TOTAL_COLUMN_INDEX] = formatCentsForCsv(cents);
  return fields.map(escapeCsvField).join(',');
}

function appendSummaryRows(
  lines: string[],
  rows: Awaited<ReturnType<typeof getMarketDayExportRows>>,
): void {
  if (rows.length === 0) return;

  const summary = computeExportSummary(rows);
  lines.push('');
  lines.push(
    formatSummaryRow(
      'Zelle total',
      summary.zelleOrderTotalCents + summary.zelleTipsTotalCents,
    ),
  );
  lines.push(formatSummaryRow('Zelle order total', summary.zelleOrderTotalCents));
  lines.push(formatSummaryRow('Zelle tips total', summary.zelleTipsTotalCents));
  lines.push('');
  lines.push(
    formatSummaryRow(
      'Cash total',
      summary.cashOrderTotalCents + summary.cashTipsTotalCents,
    ),
  );
  lines.push(formatSummaryRow('Cash order total', summary.cashOrderTotalCents));
  lines.push(formatSummaryRow('Cash tips total', summary.cashTipsTotalCents));
  lines.push('');
  lines.push(
    formatSummaryRow(
      'Overall total',
      summary.orderOverallTotalCents + summary.tipsOverallTotalCents,
    ),
  );
  lines.push(formatSummaryRow('Order overall total', summary.orderOverallTotalCents));
  lines.push(formatSummaryRow('Tips overall total', summary.tipsOverallTotalCents));
  lines.push(formatSummaryRow('Overall profit', summary.overallProfitCents));
}

export function buildMarketDayCsv(
  rows: Awaited<ReturnType<typeof getMarketDayExportRows>>,
): string {
  const lines = [CSV_HEADERS.join(',')];

  for (const row of rows) {
    const lineTotalCents = row.priceCents * row.quantity;
    const lineProfitCents = (row.priceCents - row.costCents) * row.quantity;
    const cancelReason =
      cancelReasonDisplayLabel(row.cancelReason, row.cancelNote) ?? '';
    lines.push(
      [
        escapeCsvField(row.saleNumber),
        escapeCsvField(formatSaleDateTime(row.createdAt)),
        escapeCsvTextField(row.marketDayName),
        escapeCsvTextField(row.itemName),
        escapeCsvField(row.quantity),
        escapeCsvField(formatCentsForCsv(row.priceCents)),
        escapeCsvField(formatCentsForCsv(row.costCents)),
        escapeCsvField(formatCentsForCsv(lineTotalCents)),
        escapeCsvField(formatCentsForCsv(lineProfitCents)),
        escapeCsvField(formatCentsForCsv(row.saleTotalCents)),
        escapeCsvField(paymentMethodLabel(row.paymentMethod)),
        escapeCsvField(row.cashReceivedCents == null ? '' : formatCentsForCsv(row.cashReceivedCents)),
        escapeCsvField(row.changeKeptCents > 0 ? formatCentsForCsv(row.changeKeptCents) : ''),
        escapeCsvTextField(row.customerName ?? ''),
        escapeCsvField(row.cancelled ? 'Cancelled' : ''),
        escapeCsvTextField(cancelReason),
      ].join(','),
    );
  }

  appendSummaryRows(lines, rows);

  return `${lines.join('\n')}\n`;
}

export function marketDayExportFilename(marketDayName: string, startedAt: string): string {
  const date = parseSqliteUtc(startedAt);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  const datePart = `${month}-${day}-${year}`;
  const slug = marketDayName
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);
  return `${datePart}_${slug || 'market-day'}.csv`;
}

export function salesExportFilename(startDate: string, endDate: string): string {
  return `sales-${startDate}-to-${endDate}.csv`;
}

export function preorderExportFilename(): string {
  const today = new Date().toISOString().slice(0, 10);
  return `preorders-${today}.txt`;
}

function formatLineMoney(cents: number): string {
  return formatMoney(cents).replace('$', '');
}

export function buildPreorderPrintout(
  prepSummary: PreorderPrepItem[],
  rows: PreorderExportRow[],
): string {
  const lines: string[] = ['MARKET DAY — PREORDERS', ''];

  lines.push('PREP SUMMARY');
  if (prepSummary.length === 0) {
    lines.push('  (none)');
  } else {
    for (const item of prepSummary) {
      lines.push(
        `  ${item.quantity}x ${item.icon} ${neutralizeSpreadsheetFormula(item.name)}`,
      );
    }
  }
  lines.push('');

  const orders = new Map<number, PreorderExportRow[]>();
  for (const row of rows) {
    const existing = orders.get(row.saleNumber) ?? [];
    existing.push(row);
    orders.set(row.saleNumber, existing);
  }

  lines.push(`ORDERS (${orders.size})`);
  lines.push('');

  for (const [saleNumber, orderRows] of orders) {
    const header = orderRows[0];
    const titleParts = [
      `#${saleNumber}`,
      neutralizeSpreadsheetFormula(header.customerName),
      neutralizeSpreadsheetFormula(header.notes),
    ].filter(Boolean);
    lines.push(titleParts.join(' · '));
    for (const row of orderRows) {
      const lineTotal = row.priceCents * row.quantity;
      lines.push(
        `  [ ] ${row.quantity}x ${row.icon} ${neutralizeSpreadsheetFormula(row.itemName)} ($${formatLineMoney(lineTotal)})`,
      );
    }
    lines.push(`  Total: ${formatMoney(header.saleTotalCents)}`);
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}

async function shareTextFile(text: string, filename: string, mimeType: string): Promise<void> {
  if (Platform.OS === 'web') {
    const blob = new Blob([text], { type: `${mimeType};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
    return;
  }

  const fileUri = `${FileSystem.cacheDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(fileUri, text, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Sharing is not available on this device');
  }

  await Sharing.shareAsync(fileUri, {
    mimeType,
    UTI: mimeType === 'text/plain' ? 'public.plain-text' : 'public.comma-separated-values-text',
  });
}

async function shareCsvFile(csv: string, filename: string): Promise<void> {
  await shareTextFile(csv, filename, 'text/csv');
}

export async function shareMarketDayCsv(
  db: SQLiteDatabase,
  marketDayId: number,
): Promise<void> {
  const marketDay = await getMarketDayById(db, marketDayId);
  if (!marketDay?.closedAt) {
    throw new Error('Only closed Market Days can be exported');
  }

  const rows = await getMarketDayExportRows(db, marketDayId);
  const csv = buildMarketDayCsv(rows);
  const filename = marketDayExportFilename(marketDay.name, marketDay.startedAt);

  await shareCsvFile(csv, filename);

  await exportMarketDay(db, marketDayId);
}

export async function shareSalesCsv(
  db: SQLiteDatabase,
  startDate: string,
  endDate: string,
): Promise<void> {
  const rows = await getSalesExportRows(db, startDate, endDate);
  if (rows.length === 0) {
    throw new Error('No sales to export in that date range');
  }

  const csv = buildMarketDayCsv(rows);
  const filename = salesExportFilename(startDate, endDate);

  await shareCsvFile(csv, filename);
}

export async function sharePreorderPrintout(db: SQLiteDatabase): Promise<void> {
  const [prepSummary, rows] = await Promise.all([
    getPreorderPrepSummary(db),
    getPreorderExportRows(db),
  ]);
  if (rows.length === 0) {
    throw new Error('No preorders to export');
  }

  const text = buildPreorderPrintout(prepSummary, rows);
  await shareTextFile(text, preorderExportFilename(), 'text/plain');
}
