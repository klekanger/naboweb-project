import { describe, expect, it } from "vitest";
import {
  groqSliceRange,
  pageNumberFromOptionalCatchAll,
  totalPagesFromCount,
} from "./pagination";

describe("groqSliceRange", () => {
  it("returns zero-based GROQ slice for page 1", () => {
    expect(groqSliceRange(1, 5)).toEqual({ start: 0, end: 5 });
  });

  it("returns slice for page 2", () => {
    expect(groqSliceRange(2, 20)).toEqual({ start: 20, end: 40 });
  });
});

describe("totalPagesFromCount", () => {
  it("returns at least 1 for empty total", () => {
    expect(totalPagesFromCount(0, 5)).toBe(1);
  });

  it("ceil division for partial last page", () => {
    expect(totalPagesFromCount(11, 5)).toBe(3);
  });
});

describe("pageNumberFromOptionalCatchAll", () => {
  it("treats missing segments as page 1", () => {
    expect(pageNumberFromOptionalCatchAll(undefined)).toBe(1);
    expect(pageNumberFromOptionalCatchAll([])).toBe(1);
  });

  it("parses single numeric segment", () => {
    expect(pageNumberFromOptionalCatchAll(["3"])).toBe(3);
  });

  it("rejects multiple segments", () => {
    expect(pageNumberFromOptionalCatchAll(["2", "3"])).toBeNull();
  });

  it("rejects non-integer strings", () => {
    expect(pageNumberFromOptionalCatchAll(["2a"])).toBeNull();
  });
});
