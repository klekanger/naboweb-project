import {
  getSanityAdminEditorAuth,
  simpleErrorResponse,
  simpleSuccessResponse,
} from "@/app/api/_utils/routeUtils";
import {
  CMS_CONFLICT_MESSAGE,
  deleteCmsDocument,
  isBoundedString,
  isDocumentId,
  isImageAssetId,
  readJsonObject,
} from "@/app/api/_utils/cmsDocuments";
import { isRevisionConflict } from "@/app/api/_utils/messageAccess";
import { clientWithWriteAccess } from "@/sanity/lib/client";
import { BLOG_POST_FOR_UPDATE_QUERY } from "@/sanity/lib/queries";
import { type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";

const DOC_TYPE = "blogPost";
const MAX_TITLE = 200;
const MAX_CAPTION = 500;
const MAX_BLOCKS = 1_000;
const MAX_AUTHORS = 20;
// URL-safe slug: the editor's slugify output, without quotes or markup.
const SLUG_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{0,199}$/;

function revalidateBlog(...slugs: (string | null | undefined)[]) {
  revalidateTag(DOC_TYPE, "max");
  for (const slug of new Set(slugs)) {
    if (slug) revalidateTag(`${DOC_TYPE}:${slug}`, "max");
  }
}

function authorRefsFromIds(ids: string[]) {
  return [...new Set(ids)].map((id) => ({
    _type: "reference" as const,
    _ref: id,
    _key: id,
  }));
}

const isBlockArray = (v: unknown): v is Record<string, unknown>[] =>
  Array.isArray(v) &&
  v.length <= MAX_BLOCKS &&
  v.every(
    (b) =>
      typeof b === "object" &&
      b !== null &&
      !Array.isArray(b) &&
      typeof (b as { _type?: unknown })._type === "string",
  );

type BlogFields = {
  title: string;
  slug: string;
  excerpt: Record<string, unknown>[];
  bodyText: Record<string, unknown>[];
  privatePost: boolean | undefined;
  featuredImage?: Record<string, unknown>;
  authorIds?: string[];
};

/** Validates the blog payload; returns an error message or the fields. */
function parseFields(body: Record<string, unknown>): BlogFields | string {
  const {
    title,
    slug,
    excerpt,
    bodyText,
    privatePost,
    featuredImageId,
    featuredImageCaption,
    featuredImageAlt,
    authorIds,
  } = body;

  if (!isBoundedString(title, MAX_TITLE) || !title.trim()) {
    return "title, slug and bodyText are required";
  }
  if (typeof slug !== "string" || !SLUG_PATTERN.test(slug)) {
    return "Ugyldig slug (bruk bokstaver, tall og bindestrek)";
  }
  if (!isBlockArray(bodyText)) return "title, slug and bodyText are required";
  if (excerpt !== undefined && excerpt !== null && !isBlockArray(excerpt)) {
    return "Ugyldig ingress";
  }
  if (privatePost !== undefined && typeof privatePost !== "boolean") {
    return "Ugyldig verdi for privatePost";
  }
  if (authorIds !== undefined) {
    if (
      !Array.isArray(authorIds) ||
      authorIds.length > MAX_AUTHORS ||
      !authorIds.every(isDocumentId)
    ) {
      return "Ugyldig forfattervalg";
    }
  }

  const fields: BlogFields = {
    title,
    slug,
    excerpt: (excerpt as Record<string, unknown>[] | null | undefined) ?? [],
    bodyText,
    privatePost,
    authorIds: authorIds as string[] | undefined,
  };

  if (featuredImageId !== undefined && featuredImageId !== null && featuredImageId !== "") {
    if (!isImageAssetId(featuredImageId)) return "Ugyldig bilde";
    if (featuredImageCaption != null && !isBoundedString(featuredImageCaption, MAX_CAPTION)) {
      return "Ugyldig bildetekst";
    }
    if (featuredImageAlt != null && !isBoundedString(featuredImageAlt, MAX_CAPTION)) {
      return "Ugyldig alt-tekst";
    }
    fields.featuredImage = {
      _type: "image",
      asset: { _ref: featuredImageId, _type: "reference" },
      ...(featuredImageCaption ? { caption: featuredImageCaption } : {}),
      ...(featuredImageAlt ? { alt: featuredImageAlt } : {}),
    };
  }

  return fields;
}

async function getBlogPost(id: unknown) {
  if (!isDocumentId(id)) return null;
  return clientWithWriteAccess.fetch(
    BLOG_POST_FOR_UPDATE_QUERY,
    { id },
    { perspective: "published" },
  );
}

export async function POST(request: NextRequest) {
  const auth = await getSanityAdminEditorAuth();
  if ("errorResponse" in auth) return auth.errorResponse;

  const { clerkUserId, isAdmin } = auth;
  const body = await readJsonObject(request);
  if (!body) return simpleErrorResponse("Ugyldig forespørsel", 400);

  const fields = parseFields(body);
  if (typeof fields === "string") return simpleErrorResponse(fields, 400);

  const doc: Record<string, unknown> = {
    _type: DOC_TYPE,
    title: fields.title,
    slug: { _type: "slug", current: fields.slug },
    // Only admins may make a post private.
    privatePost: isAdmin ? (fields.privatePost ?? false) : false,
    excerpt: fields.excerpt,
    bodyText: fields.bodyText,
    author: authorRefsFromIds([clerkUserId]),
    ...(fields.featuredImage ? { featuredImage: fields.featuredImage } : {}),
  };

  try {
    const result = await clientWithWriteAccess.create(
      doc as Parameters<typeof clientWithWriteAccess.create>[0],
    );
    revalidateBlog(fields.slug);
    return simpleSuccessResponse({ _id: result._id, slug: fields.slug });
  } catch (error) {
    console.error("Blog post creation failed:", error);
    return simpleErrorResponse("Noe gikk galt ved lagring av blogginnlegget.", 500);
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await getSanityAdminEditorAuth();
  if ("errorResponse" in auth) return auth.errorResponse;

  const { clerkUserId, isAdmin } = auth;
  const body = await readJsonObject(request);
  if (!body) return simpleErrorResponse("Ugyldig forespørsel", 400);

  if (!isDocumentId(body._id)) {
    return simpleErrorResponse("_id is required for update", 400);
  }
  const existing = await getBlogPost(body._id);
  if (!existing) return simpleErrorResponse("Fant ikke blogginnlegget", 404);

  const fields = parseFields(body);
  if (typeof fields === "string") return simpleErrorResponse(fields, 400);

  if (!fields.authorIds || fields.authorIds.length === 0) {
    return simpleErrorResponse("Minst én forfatter er påkrevd", 400);
  }
  const allowedAuthorIds = new Set([...existing.authorIds, clerkUserId]);
  if (!fields.authorIds.every((id) => allowedAuthorIds.has(id))) {
    return simpleErrorResponse("Ugyldig forfattervalg", 400);
  }

  const patch: Record<string, unknown> = {
    title: fields.title,
    slug: { _type: "slug", current: fields.slug },
    // Non-admins keep the stored value, read with the write client.
    privatePost: isAdmin
      ? (fields.privatePost ?? false)
      : Boolean(existing.privatePost),
    excerpt: fields.excerpt,
    bodyText: fields.bodyText,
    author: authorRefsFromIds(fields.authorIds),
    ...(fields.featuredImage ? { featuredImage: fields.featuredImage } : {}),
  };

  try {
    await clientWithWriteAccess
      .patch(existing._id)
      .ifRevisionId(existing._rev)
      .set(patch)
      .commit();
    revalidateBlog(existing.slug, fields.slug);
    return simpleSuccessResponse();
  } catch (error) {
    if (isRevisionConflict(error)) {
      return simpleErrorResponse(CMS_CONFLICT_MESSAGE, 409);
    }
    console.error("Blog post update failed:", error);
    return simpleErrorResponse("Noe gikk galt ved oppdatering av blogginnlegget.", 500);
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await getSanityAdminEditorAuth();
  if ("errorResponse" in auth) return auth.errorResponse;

  const body = await readJsonObject(request);
  if (!body) return simpleErrorResponse("Ugyldig forespørsel", 400);

  if (!isDocumentId(body._id)) {
    return simpleErrorResponse("_id is required", 400);
  }
  const existing = await getBlogPost(body._id);
  if (!existing) return simpleErrorResponse("Fant ikke blogginnlegget", 404);

  try {
    if (!(await deleteCmsDocument(DOC_TYPE, existing))) {
      return simpleErrorResponse(CMS_CONFLICT_MESSAGE, 409);
    }
    // Revalidate the stored slug, not one sent by the client.
    revalidateBlog(existing.slug);
    return simpleSuccessResponse();
  } catch (error) {
    console.error("Blog post deletion failed:", error);
    return simpleErrorResponse("Noe gikk galt ved sletting av blogginnlegget.", 500);
  }
}
