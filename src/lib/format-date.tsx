/**
 * Convert a date from ISO date format to a more readable date
 *
 * @param {string} dateToFormat A date in ISO 8601 format
 * @param {string} [locale] Locale - default is 'nb-no' (Norwegian bokmål)
 * @returns {string}
 */

export function formatDate(dateToFormat: string, locale = "no-NO"): string {
  // Format the dates shown at the bottom of every article page
  return new Date(dateToFormat).toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
