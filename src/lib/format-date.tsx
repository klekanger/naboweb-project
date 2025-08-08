/**
 * Convert a date to a more readable format
 * Handles various input formats including:
 * - ISO 8601 strings
 * - Unix timestamps (in seconds or milliseconds)
 * - Date objects
 * - null/undefined values
 *
 * @param {string | number | Date | null | undefined} dateToFormat The date to format
 * @param {string} [locale] Locale - default is 'no-NO' (Norwegian bokmål)
 * @param {Intl.DateTimeFormatOptions} [options] Custom format options
 * @returns {string} Formatted date string or empty string if invalid
 */

export function formatDate(
  dateToFormat: string | number | Date | null | undefined,
  locale = "no-NO",
  options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  },
): string {
  try {
    if (!dateToFormat) {
      return "";
    }

    let date: Date;

    if (dateToFormat instanceof Date) {
      date = dateToFormat;
    } else if (typeof dateToFormat === "number") {
      // Handle both seconds and milliseconds timestamps
      date = new Date(
        dateToFormat > 999999999999 ? dateToFormat : dateToFormat * 1000,
      );
    } else {
      date = new Date(dateToFormat);
    }

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date format: ${dateToFormat}`);
      return "";
    }

    return date.toLocaleDateString(locale, options);
  } catch (error) {
    console.error(`Error formatting date: ${dateToFormat}`, error);
    return "";
  }
}
