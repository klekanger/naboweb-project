// Serializes structured data for a <script type="application/ld+json"> tag.
//
// JSON.stringify alone is not safe inside a script element: a CMS value such
// as a title containing "</script>" would close the tag and inject HTML. The
// bundled Next.js docs (02-guides/json-ld.md) recommend escaping "<". We also
// escape ">" and "&" and the U+2028/U+2029 line separators. The output is
// still valid JSON that parses back to the same data.

const UNSAFE_CHARACTERS: Record<string, string> = {
  "<": "\\u003c",
  ">": "\\u003e",
  "&": "\\u0026",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029",
};

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(
    /[<>&\u2028\u2029]/g,
    (char) => UNSAFE_CHARACTERS[char],
  );
}
