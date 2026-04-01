import { Transaction, Category } from '@/types/finance';
import { format } from 'date-fns';

export interface CsvRow {
  date: string;
  description: string;
  amount: string;
  type: string;
  category: string;
  notes: string;
}

export interface CsvValidationError {
  row: number;
  field: string;
  message: string;
}

export interface ParsedCsvResult {
  rows: CsvRow[];
  errors: CsvValidationError[];
}

/**
 * Export transactions to CSV string.
 */
export function exportTransactionsToCsv(
  transactions: Transaction[],
  categories: Category[]
): string {
  const categoryMap = new Map(categories.map(c => [c.id, c.name]));
  const header = 'Date,Description,Amount,Type,Category,Notes';
  const rows = transactions.map(tx => {
    const date = tx.date;
    const desc = escapeCsvField(tx.description);
    const amount = (tx.amount / 100).toFixed(2);
    const type = tx.type;
    const category = escapeCsvField(categoryMap.get(tx.categoryId) || 'Unknown');
    const notes = escapeCsvField(tx.notes);
    return `${date},${desc},${amount},${type},${category},${notes}`;
  });
  return [header, ...rows].join('\n');
}

function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Parse CSV string into rows with validation.
 */
export function parseCsvString(csvText: string, categories: Category[]): ParsedCsvResult {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) {
    return { rows: [], errors: [{ row: 0, field: 'file', message: 'CSV must have a header row and at least one data row' }] };
  }

  const header = parseCsvLine(lines[0]).map(h => h.toLowerCase().trim());
  const dateIdx = header.findIndex(h => h === 'date');
  const descIdx = header.findIndex(h => h === 'description');
  const amountIdx = header.findIndex(h => h === 'amount');
  const typeIdx = header.findIndex(h => h === 'type');
  const categoryIdx = header.findIndex(h => h === 'category');
  const notesIdx = header.findIndex(h => h === 'notes');

  const errors: CsvValidationError[] = [];

  if (dateIdx === -1) errors.push({ row: 0, field: 'header', message: 'Missing "Date" column' });
  if (descIdx === -1) errors.push({ row: 0, field: 'header', message: 'Missing "Description" column' });
  if (amountIdx === -1) errors.push({ row: 0, field: 'header', message: 'Missing "Amount" column' });
  if (typeIdx === -1) errors.push({ row: 0, field: 'header', message: 'Missing "Type" column' });

  if (errors.length > 0) return { rows: [], errors };

  const categoryNames = new Map(categories.map(c => [c.name.toLowerCase(), c.name]));
  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i]);
    if (fields.length === 0 || (fields.length === 1 && fields[0].trim() === '')) continue;

    const date = fields[dateIdx]?.trim() || '';
    const description = fields[descIdx]?.trim() || '';
    const amount = fields[amountIdx]?.trim() || '';
    const type = fields[typeIdx]?.trim().toLowerCase() || '';
    const category = categoryIdx >= 0 ? fields[categoryIdx]?.trim() || '' : '';
    const notes = notesIdx >= 0 ? fields[notesIdx]?.trim() || '' : '';

    const rowErrors: CsvValidationError[] = [];

    // Validate and normalize date
    let normalizedDate = date;
    if (!date) {
      rowErrors.push({ row: i, field: 'date', message: 'Date is required' });
    } else {
      const parsed = new Date(date);
      if (isNaN(parsed.getTime())) {
        rowErrors.push({ row: i, field: 'date', message: `Invalid date: "${date}"` });
      } else {
        normalizedDate = format(parsed, 'yyyy-MM-dd');
      }
    }
    if (!description) {
      rowErrors.push({ row: i, field: 'description', message: 'Description is required' });
    }
    if (!amount || isNaN(parseFloat(amount))) {
      rowErrors.push({ row: i, field: 'amount', message: `Invalid amount: "${amount}"` });
    }
    if (type !== 'income' && type !== 'expense') {
      rowErrors.push({ row: i, field: 'type', message: `Type must be "income" or "expense", got: "${type}"` });
    }
    if (category && !categoryNames.has(category.toLowerCase())) {
      rowErrors.push({ row: i, field: 'category', message: `Unknown category: "${category}"` });
    }

    errors.push(...rowErrors);

    if (rowErrors.length === 0) {
      rows.push({ date: normalizedDate, description, amount, type, category, notes });
    }
  }

  return { rows, errors };
}

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        fields.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }
  fields.push(current);
  return fields;
}

/**
 * Trigger a CSV file download in the browser.
 */
export function downloadCsv(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
