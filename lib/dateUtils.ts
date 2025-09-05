/**
 * Utility functions for date handling
 */

/**
 * Parse dates in yyyy/mm/dd format
 */
export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("/").map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Format a date object to yyyy/mm/dd format
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}/${month}/${day}`;
}
