import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import type { SQLiteDatabase } from 'expo-sqlite';
import { Platform } from 'react-native';

import { exportMarketDay, exportRunningTabSales, getMarketDayById, getMarketDayExportRows, getRunningTabExportRows } from '@/lib/db/queries';
import { formatSaleTime, paymentMethodLabel } from '@/lib/market-day';

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
  'Customer Name',
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
        row.customerName ?? '',
      ]
        .map(escapeCsvField)
        .join(','),
    );
  }

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

export function runningTabExportFilename(startDate: string, endDate: string): string {
  return `quick-sales-${startDate}-to-${endDate}.csv`;
}

async function shareCsvFile(csv: string, filename: string): Promise<void> {
  if (Platform.OS === 'web') {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
    return;
  }

  const fileUri = `${FileSystem.cacheDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(fileUri, csv, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Sharing is not available on this device');
  }

  await Sharing.shareAsync(fileUri, {
    mimeType: 'text/csv',
    UTI: 'public.comma-separated-values-text',
  });
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

export async function shareRunningTabCsv(
  db: SQLiteDatabase,
  startDate: string,
  endDate: string,
): Promise<void> {
  const rows = await getRunningTabExportRows(db, startDate, endDate);
  if (rows.length === 0) {
    throw new Error('No off-day sales to export in that date range');
  }

  const csv = buildMarketDayCsv(rows);
  const filename = runningTabExportFilename(startDate, endDate);

  await shareCsvFile(csv, filename);
  await exportRunningTabSales(db, startDate, endDate);
}
