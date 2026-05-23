import { describe, it, expect } from "vitest";
import { chunkArray, SES_BCC_RECIPIENT_LIMIT } from "./email-batch";

describe("email-batch", () => {
  it("SES_BCC_RECIPIENT_LIMIT is 50", () => {
    expect(SES_BCC_RECIPIENT_LIMIT).toBe(50);
  });

  it("chunkArray splits items into fixed-size chunks", () => {
    expect(chunkArray([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    expect(chunkArray(["a"], 50)).toEqual([["a"]]);
    expect(chunkArray([], 50)).toEqual([]);
  });

  it("chunkArray throws for invalid chunk size", () => {
    expect(() => chunkArray([1], 0)).toThrow("Chunk size must be at least 1");
  });
});
