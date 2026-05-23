/** AWS SES caps BCC recipients per message (50 in production). */
export const SES_BCC_RECIPIENT_LIMIT = 50;

export function chunkArray<T>(items: T[], size: number): T[][] {
  if (size < 1) {
    throw new Error("Chunk size must be at least 1");
  }

  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}
