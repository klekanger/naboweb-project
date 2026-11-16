import { describe, it, expect } from "vitest";
import {
  MAX_TEXT_LENGTH,
  MAX_TITLE_LENGTH,
  parseMessageInput,
} from "./messageInput";

const block = (overrides: Record<string, unknown> = {}) => ({
  _type: "block",
  _key: "b1",
  style: "normal",
  markDefs: [],
  children: [{ _type: "span", _key: "s1", text: "Hei", marks: [] }],
  ...overrides,
});

const parse = (overrides: Record<string, unknown> = {}) =>
  parseMessageInput({ title: "Tittel", bodyText: [block()], ...overrides });

describe("parseMessageInput", () => {
  it("accepts editor output with h2 and decorators", () => {
    const result = parse({
      bodyText: [
        block({ style: "h2" }),
        block({
          _key: "b2",
          children: [{ _type: "span", _key: "s2", text: "Fet", marks: ["strong", "em"] }],
        }),
      ],
    });
    expect(result.error).toBeUndefined();
  });

  it("accepts safe links and list items from Studio-edited messages", () => {
    const result = parse({
      bodyText: [
        block({
          listItem: "bullet",
          level: 1,
          markDefs: [{ _type: "link", _key: "l1", href: "https://example.com" }],
          children: [{ _type: "span", _key: "s1", text: "Lenke", marks: ["l1"] }],
        }),
      ],
    });
    expect(result.error).toBeUndefined();
  });

  it.each([
    ["javascript: link", { markDefs: [{ _type: "link", _key: "l1", href: "javascript:alert(1)" }] }],
    ["data: link", { markDefs: [{ _type: "link", _key: "l1", href: "data:text/html,x" }] }],
    ["unknown style", { style: "h1" }],
    ["unknown mark", { children: [{ _type: "span", _key: "s1", text: "x", marks: ["code"] }] }],
    ["non-text child", { children: [{ _type: "image", _key: "s1" }] }],
    ["object as text", { children: [{ _type: "span", _key: "s1", text: { a: 1 }, marks: [] }] }],
    ["bad key", { _key: "a b\"" }],
  ])("rejects %s", (_label, overrides) => {
    expect(parse({ bodyText: [block(overrides)] }).error).toBeDefined();
  });

  it("rejects an over-long title", () => {
    expect(parse({ title: "x".repeat(MAX_TITLE_LENGTH + 1) }).error).toBeDefined();
  });

  it("rejects over-long text", () => {
    const children = [{ _type: "span", _key: "s1", text: "x".repeat(MAX_TEXT_LENGTH + 1), marks: [] }];
    expect(parse({ bodyText: [block({ children })] }).error).toBeDefined();
  });

  it("rejects an image value that is not an image asset id", () => {
    expect(parse({ image: "file-abc-pdf" }).error).toBeDefined();
    expect(parse({ image: "image-abc123-800x600-jpg" }).error).toBeUndefined();
  });
});
