// Validates and normalizes message input from the messageboard editor before
// it is written with the Sanity write token. Output contains only the fields
// the message schema allows, so unknown keys from the client are dropped.

export const MAX_TITLE_LENGTH = 200;
export const MAX_BLOCKS = 300;
export const MAX_TEXT_LENGTH = 20_000;

export const KEY_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
export const IMAGE_ASSET_ID_PATTERN = /^image-[A-Za-z0-9]+-\d+x\d+-[a-z0-9]+$/;
const STYLES = new Set(["normal", "h2"]);
const DECORATORS = new Set(["strong", "em", "underline"]);
const LIST_ITEMS = new Set(["bullet", "number"]);
const LINK_SCHEMES = new Set(["http:", "https:", "mailto:", "tel:"]);

type Span = { _type: "span"; _key: string; text: string; marks: string[] };
type LinkMarkDef = { _type: "link"; _key: string; href: string };
type Block = {
  _type: "block";
  _key: string;
  style: string;
  markDefs: LinkMarkDef[];
  children: Span[];
  listItem?: string;
  level?: number;
};

export type MessageInput = {
  title: string;
  bodyText: Block[];
  image: string | null;
};

type Result =
  | { value: MessageInput; error?: never }
  | { value?: never; error: string };

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const isKey = (v: unknown): v is string =>
  typeof v === "string" && KEY_PATTERN.test(v);

function isAllowedHref(href: unknown): href is string {
  if (typeof href !== "string" || href.length > 2000) return false;
  if (href.startsWith("/") && !href.startsWith("//")) return true;
  try {
    return LINK_SCHEMES.has(new URL(href).protocol);
  } catch {
    return false;
  }
}

function parseBlock(raw: unknown): Block | string {
  if (!isObject(raw) || raw._type !== "block" || !isKey(raw._key)) {
    return "bodyText may only contain text blocks";
  }

  const style = raw.style ?? "normal";
  if (typeof style !== "string" || !STYLES.has(style)) {
    return "Unsupported text style";
  }

  const rawMarkDefs = raw.markDefs ?? [];
  if (!Array.isArray(rawMarkDefs)) return "Invalid markDefs";
  const markDefs: LinkMarkDef[] = [];
  for (const def of rawMarkDefs) {
    if (!isObject(def) || def._type !== "link" || !isKey(def._key)) {
      return "Unsupported annotation";
    }
    if (!isAllowedHref(def.href)) return "Unsupported link";
    markDefs.push({ _type: "link", _key: def._key, href: def.href });
  }
  const markDefKeys = new Set(markDefs.map((d) => d._key));

  if (!Array.isArray(raw.children) || raw.children.length === 0) {
    return "Invalid block children";
  }
  const children: Span[] = [];
  for (const child of raw.children) {
    if (
      !isObject(child) ||
      child._type !== "span" ||
      !isKey(child._key) ||
      typeof child.text !== "string"
    ) {
      return "Blocks may only contain text";
    }
    const marks = child.marks ?? [];
    if (
      !Array.isArray(marks) ||
      !marks.every(
        (m) =>
          typeof m === "string" && (DECORATORS.has(m) || markDefKeys.has(m)),
      )
    ) {
      return "Unsupported text formatting";
    }
    children.push({
      _type: "span",
      _key: child._key,
      text: child.text,
      marks: marks as string[],
    });
  }

  const block: Block = {
    _type: "block",
    _key: raw._key,
    style,
    markDefs,
    children,
  };

  if (raw.listItem !== undefined) {
    if (typeof raw.listItem !== "string" || !LIST_ITEMS.has(raw.listItem)) {
      return "Unsupported list type";
    }
    const level = raw.level ?? 1;
    if (typeof level !== "number" || !Number.isInteger(level) || level < 1 || level > 5) {
      return "Invalid list level";
    }
    block.listItem = raw.listItem;
    block.level = level;
  }

  return block;
}

export function parseMessageInput(body: Record<string, unknown>): Result {
  const { title, bodyText, image } = body;

  if (typeof title !== "string" || title.trim().length === 0) {
    return { error: "Title is required" };
  }
  if (title.length > MAX_TITLE_LENGTH) {
    return { error: `Title can be at most ${MAX_TITLE_LENGTH} characters` };
  }

  if (!Array.isArray(bodyText) || bodyText.length === 0) {
    return { error: "bodyText must be a non-empty array" };
  }
  if (bodyText.length > MAX_BLOCKS) {
    return { error: `bodyText can have at most ${MAX_BLOCKS} blocks` };
  }

  const blocks: Block[] = [];
  let textLength = 0;
  for (const raw of bodyText) {
    const block = parseBlock(raw);
    if (typeof block === "string") return { error: block };
    textLength += block.children.reduce((n, c) => n + c.text.length, 0);
    blocks.push(block);
  }
  if (textLength > MAX_TEXT_LENGTH) {
    return { error: `Message can be at most ${MAX_TEXT_LENGTH} characters` };
  }

  if (image != null && (typeof image !== "string" || !IMAGE_ASSET_ID_PATTERN.test(image))) {
    return { error: "image must be an image asset id" };
  }

  return { value: { title, bodyText: blocks, image: image ?? null } };
}

export function messageImageField(image: string) {
  return {
    _type: "image",
    asset: { _type: "reference", _ref: image },
  };
}
