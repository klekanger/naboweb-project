import { describe, expect, it } from "vitest";
import { escapeHtmlText } from "./email-template";

describe("escapeHtmlText", () => {
  it("returns empty string for nullish input", () => {
    expect(escapeHtmlText(null)).toBe("");
    expect(escapeHtmlText(undefined)).toBe("");
  });

  it("escapes HTML special characters", () => {
    expect(escapeHtmlText(`<script>alert("x")</script>`)).toBe(
      "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;",
    );
  });

  it("escapes ampersands", () => {
    expect(escapeHtmlText("Tom & Jerry")).toBe("Tom &amp; Jerry");
  });
});
