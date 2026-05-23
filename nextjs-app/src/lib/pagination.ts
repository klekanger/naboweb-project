import type { PaginationData } from "@/types/types";

/** GROQ slice range `[ $start ... $end ]` (end exclusive). */
export function groqSliceRange(
  pageNumber: number,
  pageSize: number,
): { start: number; end: number } {
  return {
    start: (pageNumber - 1) * pageSize,
    end: pageNumber * pageSize,
  };
}

/** Total pages for a count; at least 1 so empty lists still have a valid “first page”. */
export function totalPagesFromCount(totalCount: number, pageSize: number): number {
  return Math.max(1, Math.ceil(totalCount / pageSize));
}

/** Parse a `?page=` search param; invalid or missing values resolve to page 1. */
export function pageNumberFromSearchParam(
  value: string | string[] | undefined,
): number {
  if (!value) return 1;
  if (Array.isArray(value)) return 1;
  if (!/^\d+$/.test(value)) return 1;
  const pageNumber = Number(value);
  if (pageNumber < 1) return 1;
  return pageNumber;
}

/** Clerk-style list pagination (user admin, tables). */
export function calculatePaginationData(
  currentPage: number,
  totalCount: number,
  limit: number,
): PaginationData {
  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  return {
    currentPage,
    totalPages,
    totalCount,
    hasNextPage,
    hasPreviousPage,
  };
}

/**
 * Parse a single numeric segment from an optional catch-all param.
 * `/resource` → 1; `/resource/3` → 3. Multiple segments → null (invalid).
 */
export function pageNumberFromOptionalCatchAll(
  segments: string[] | undefined,
): number | null {
  if (!segments?.length) return 1;
  if (segments.length !== 1) return null;
  const n = Number(segments[0]);
  if (!Number.isFinite(n) || n < 1) return null;
  if (!/^\d+$/.test(segments[0])) return null;
  return n;
}
