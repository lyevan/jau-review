/**
 * Format a Date object to YYYY-MM-DD string in local timezone
 * This avoids timezone-related date shifts when using toISOString()
 */
export function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Format year, month (0-indexed), and day to YYYY-MM-DD string
 */
export function formatToYYYYMMDD(
  year: number,
  month: number,
  day: number
): string {
  const monthStr = String(month + 1).padStart(2, "0");
  const dayStr = String(day).padStart(2, "0");
  return `${year}-${monthStr}-${dayStr}`;
}
