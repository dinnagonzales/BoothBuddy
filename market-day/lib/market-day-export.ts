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
import { formatSaleTime, paymentMethodLabel } from '@/lib/market-day';
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

function formatCentsForCsv(cents: number): string {
  return (cents / 100).toFixed(2);
}

function formatSaleDateTime(iso: string): string {
  const date = new Date(iso);
  return `${date.toLocaleDateString('en-US')} ${formatSaleTime(iso)}`;
}

export type CsvExportSummary = {
  totalWithoutTipsCents: number;
  grossWithoutTipsCents: number;
  profitWithoutTipsCents: number;
  tipsTotalCents: number;
};

export function computeExportSummary(
  rows: Awaited<ReturnType<typeof getMarketDayExportRows>>,
): CsvExportSummary {
  const sales = new Map<number, { saleTotalCents: number; changeKeptCents: number }>();
  let grossWithoutTipsCents = 0;
  let profitWithoutTipsCents = 0;

  for (const row of rows) {
    const lineTotalCents = row.priceCents * row.quantity;
    const lineProfitCents = (row.priceCents - row.costCents) * row.quantity;
    grossWithoutTipsCents += lineTotalCents;
    profitWithoutTipsCents += lineProfitCents;

    if (!sales.has(row.saleNumber)) {
      sales.set(row.saleNumber, {
        saleTotalCents: row.saleTotalCents,
        changeKeptCents: row.changeKeptCents,
      });
    }
  }

  let totalWithoutTipsCents = 0;
  let tipsTotalCents = 0;
  for (const sale of sales.values()) {
    totalWithoutTipsCents += sale.saleTotalCents;
    tipsTotalCents += sale.changeKeptCents;
  }

  return {
    totalWithoutTipsCents,
    grossWithoutTipsCents,
    profitWithoutTipsCents,
    tipsTotalCents,
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
  lines.push(formatSummaryRow('Total (without tips)', summary.totalWithoutTipsCents));
  lines.push(formatSummaryRow('Gross (without tips)', summary.grossWithoutTipsCents));
  lines.push(formatSummaryRow('Profit (without tips)', summary.profitWithoutTipsCents));
  lines.push(formatSummaryRow('Tips total', summary.tipsTotalCents));
}

export function buildMarketDayCsv(
  rows: Awaited<ReturnType<typeof getMarketDayExportRows>>,
): string {
  const lines = [CSV_HEADERS.join(',')];

  for (const row of rows) {
    const lineTotalCents = row.priceCents * row.quantity;
    const lineProfitCents = (row.priceCents - row.costCents) * row.quantity;
    lines.push(
      [
        row.saleNumber,
        formatSaleDateTime(row.createdAt),
        row.marketDayName,
        row.itemName,
        row.quantity,
        formatCentsForCsv(row.priceCents),
        formatCentsForCsv(row.costCents),
        formatCentsForCsv(lineTotalCents),
        formatCentsForCsv(lineProfitCents),
        formatCentsForCsv(row.saleTotalCents),
        paymentMethodLabel(row.paymentMethod),
        row.cashReceivedCents == null ? '' : formatCentsForCsv(row.cashReceivedCents),
        row.changeKeptCents > 0 ? formatCentsForCsv(row.changeKeptCents) : '',
        row.customerName ?? '',
        row.cancelled ? 'Cancelled' : '',
        cancelReasonDisplayLabel(row.cancelReason, row.cancelNote) ?? '',
      ]
        .map(escapeCsvField)
        .join(','),
    );
  }

  appendSummaryRows(lines, rows);

  return `${lines.join('\n')}\n`;
}

export function marketDayExportFilename(marketDayName: string): string {
  const slug = marketDayName
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);
  return `${slug || 'market-day'}-sales.csv`;
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
      lines.push(`  ${item.quantity}x ${item.icon} ${item.name}`);
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
    const titleParts = [`#${saleNumber}`, header.customerName, header.notes].filter(Boolean);
    lines.push(titleParts.join(' · '));
    for (const row of orderRows) {
      const lineTotal = row.priceCents * row.quantity;
      lines.push(`  [ ] ${row.quantity}x ${row.icon} ${row.itemName} ($${formatLineMoney(lineTotal)})`);
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
  const filename = marketDayExportFilename(marketDay.name);

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
