/**
 * Convert a date value to a readable string (dd.mm.yyyy)
 *
 * @param {string | number | Date | null} dateToFormat - Date in ISO 8601 format, timestamp, or Date object
 * @param {string} [locale] - Locale, default is 'nb-NO' (Norwegian bokmål)
 * @returns {string} Formatted date string or empty string if invalid
 */

export function formatDate(
  dateToFormat: string | number | null | Date,
  locale = "nb-NO",
): string {
  if (!dateToFormat) {
    return "";
  }
  const date = new Date(dateToFormat);
  if (isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
