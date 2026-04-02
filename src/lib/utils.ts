/**
 * Format cents to a currency display string.
 */
export function formatCurrency(cents: number, currency: string = 'USD'): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(dollars);
}

/**
 * Get the symbol for a currency code (e.g. 'USD' → '$', 'EUR' → '€').
 */
export function getCurrencySymbol(currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(0).replace(/[\d.,\s]/g, '').trim();
}

/**
 * Parse a dollar string like "1,234.56" or "1234.56" into cents.
 */
export function parseCurrencyToCents(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, '');
  const dollars = parseFloat(cleaned);
  if (isNaN(dollars)) return 0;
  return Math.round(dollars * 100);
}

/**
 * Conditionally join classnames.
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Generate a simple unique ID.
 */
export function generateId(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
