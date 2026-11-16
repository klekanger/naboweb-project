import { describe, expect, it } from "vitest";
import {
  type Content,
  emailTemplate,
  escapeHtmlText,
  sanityAssetHref,
  siteHref,
} from "./email-template";

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

// Lead 13: CMS values in link targets must not be able to change the markup.
describe("siteHref", () => {
  it("builds a normal link", () => {
    expect(siteHref("https://example.com", "blog", "dugnad-2026")).toBe(
      "https://example.com/blog/dugnad-2026",
    );
  });

  it("encodes each segment so quotes, markup and slashes stay inside it", () => {
    const href = siteHref("https://example.com", "blog", 'x"><img src=y>/../a');
    expect(href).not.toMatch(/["<>]/);
    expect(href).toBe(
      "https://example.com/blog/x%22%3E%3Cimg%20src%3Dy%3E%2F..%2Fa",
    );
  });
});

describe("sanityAssetHref", () => {
  it("keeps Sanity CDN file URLs", () => {
    const url = "https://cdn.sanity.io/files/p/production/abc.pdf";
    expect(sanityAssetHref(url)).toBe(url);
  });

  it.each([
    "javascript:alert(1)",
    "https://evil.example/file.pdf",
    "https://cdn.sanity.io.evil.example/x.pdf",
    "not a url",
    null,
  ])("drops %s", (url) => {
    expect(sanityAssetHref(url)).toBe("");
  });
});

describe("emailTemplate", () => {
  const content: Content = {
    messages: [],
    messagesWithNewComments: [],
    fileMeetingMinutes: [],
    fileOtherDocuments: [],
    posts: [
      {
        _id: "post-1",
        _createdAt: "2026-11-15T10:00:00Z",
        title: "Dugnad",
        privatePost: false,
        slug: { current: 'x" onmouseover="alert(1)' },
      },
    ] as unknown as Content["posts"],
  };

  it("does not let a slug add attributes to the post link", () => {
    const html = emailTemplate({ content, baseUrl: "https://example.com" });

    expect(html).not.toContain("onmouseover=");
    expect(html).toContain(
      'href="https://example.com/blog/x%22%20onmouseover%3D%22alert(1)"',
    );
  });
});
