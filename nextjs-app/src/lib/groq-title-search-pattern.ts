/** Escape special characters for GROQ `match` glob patterns. */
export function escapeGlobToken(term: string): string {
  return term.replace(/\\/g, "\\\\").replace(/[*?\[\]]/g, "\\$&");
}

/** Lowercased trimmed term as `*substring*` for `lower(title) match $PATTERN`. */
export function buildTitleSearchPattern(trimmedLower: string): string {
  return `*${escapeGlobToken(trimmedLower)}*`;
}
