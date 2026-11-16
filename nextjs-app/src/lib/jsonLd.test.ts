import { describe, it, expect } from "vitest";
import { serializeJsonLd } from "./jsonLd";

describe("serializeJsonLd", () => {
  const malicious = {
    "@type": "BlogPosting",
    headline: 'T</script><script>alert(document.domain)</script>',
  };

  it("cannot close the surrounding script tag", () => {
    const out = serializeJsonLd(malicious);

    expect(out).not.toMatch(/<\/script/i);
    expect(out).not.toContain("<");
    expect(out).not.toContain(">");
  });

  it("escapes &, U+2028 and U+2029", () => {
    const out = serializeJsonLd({ name: "A & B\u2028\u2029" });

    expect(out).not.toContain("&");
    expect(out).not.toContain("\u2028");
    expect(out).not.toContain("\u2029");
  });

  it("still parses back to the same data", () => {
    const data = { ...malicious, name: "Dugnad & grillfest <3\u2028" };

    expect(JSON.parse(serializeJsonLd(data))).toEqual(data);
  });

  it("does not break a script element when rendered as HTML", () => {
    document.body.innerHTML = `<script type="application/ld+json">${serializeJsonLd(
      malicious,
    )}</script>`;

    const scripts = document.querySelectorAll("script");
    expect(scripts).toHaveLength(1);
    expect(JSON.parse(scripts[0].textContent ?? "")).toEqual(malicious);
  });
});
