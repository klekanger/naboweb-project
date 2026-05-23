import {
  getSanityAdminEditorAuth,
  simpleErrorResponse,
  simpleSuccessResponse,
} from "@/app/api/_utils/routeUtils";
import { client, clientWithWriteAccess } from "@/sanity/lib/client";
import { type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import type { PortableTextBlock } from "@portabletext/types";

type BlogPostBody = {
  _id?: string;
  title: string;
  slug: string;
  privatePost: boolean;
  excerpt: PortableTextBlock[];
  bodyText: PortableTextBlock[];
  featuredImageId?: string;
  featuredImageCaption?: string;
  featuredImageAlt?: string;
  authorIds?: string[];
};

function authorRefsFromIds(ids: string[]) {
  const unique = [...new Set(ids)];
  return unique.map((id) => ({
    _type: "reference" as const,
    _ref: id,
    _key: id,
  }));
}

function revalidateBlog(slug: string) {
  revalidateTag("blogPost", "max");
  if (slug) revalidateTag(`blogPost:${slug}`, "max");
}

export async function POST(request: NextRequest) {
  const auth = await getSanityAdminEditorAuth();
  if ("errorResponse" in auth) return auth.errorResponse;

  const { clerkUserId, isAdmin } = auth;
  const body: BlogPostBody = await request.json();
  const { title, slug, privatePost, excerpt, bodyText, featuredImageId, featuredImageCaption, featuredImageAlt } = body;

  if (!title || !slug || !bodyText) {
    return simpleErrorResponse("title, slug and bodyText are required", 400);
  }

  const privatePostToSet = isAdmin ? (privatePost ?? false) : false;

  const doc: Record<string, unknown> = {
    _type: "blogPost",
    title,
    slug: { _type: "slug", current: slug },
    privatePost: privatePostToSet,
    excerpt: excerpt ?? [],
    bodyText,
    author: authorRefsFromIds([clerkUserId]),
  };

  if (featuredImageId) {
    doc.featuredImage = {
      _type: "image",
      asset: { _ref: featuredImageId, _type: "reference" },
      ...(featuredImageCaption ? { caption: featuredImageCaption } : {}),
      ...(featuredImageAlt ? { alt: featuredImageAlt } : {}),
    };
  }

  try {
    const result = await clientWithWriteAccess.create(doc as Parameters<typeof clientWithWriteAccess.create>[0]);
    revalidateBlog(slug);
    return simpleSuccessResponse({ _id: result._id, slug });
  } catch (error) {
    console.error("Blog post creation failed:", error);
    return simpleErrorResponse("Noe gikk galt ved lagring av blogginnlegget.", 500);
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await getSanityAdminEditorAuth();
  if ("errorResponse" in auth) return auth.errorResponse;

  const { clerkUserId, isAdmin } = auth;
  const body: BlogPostBody = await request.json();
  const {
    _id,
    title,
    slug,
    privatePost,
    excerpt,
    bodyText,
    featuredImageId,
    featuredImageCaption,
    featuredImageAlt,
    authorIds,
  } = body;

  if (!_id) {
    return simpleErrorResponse("_id is required for update", 400);
  }

  let privatePostToSet: boolean;
  if (isAdmin) {
    privatePostToSet = privatePost ?? false;
  } else {
    const existingPrivate = await client.fetch<boolean | null>(
      `*[_type == "blogPost" && _id == $_id][0].privatePost`,
      { _id },
    );
    privatePostToSet = Boolean(existingPrivate);
  }

  const existingAuthorRefs =
    (await client.fetch<string[]>(
      `coalesce(*[_type == "blogPost" && _id == $_id][0].author[]._ref, [])`,
      { _id },
    )) ?? [];

  if (!authorIds || authorIds.length === 0) {
    return simpleErrorResponse("Minst én forfatter er påkrevd", 400);
  }

  const uniqueAuthorIds = [...new Set(authorIds)];
  const allowedAuthorIds = new Set([...existingAuthorRefs, clerkUserId]);
  if (!uniqueAuthorIds.every((id) => allowedAuthorIds.has(id))) {
    return simpleErrorResponse("Ugyldig forfattervalg", 400);
  }

  const patch: Record<string, unknown> = {
    title,
    slug: { _type: "slug", current: slug },
    privatePost: privatePostToSet,
    excerpt: excerpt ?? [],
    bodyText,
    author: authorRefsFromIds(uniqueAuthorIds),
  };

  if (featuredImageId) {
    patch.featuredImage = {
      _type: "image",
      asset: { _ref: featuredImageId, _type: "reference" },
      ...(featuredImageCaption ? { caption: featuredImageCaption } : {}),
      ...(featuredImageAlt ? { alt: featuredImageAlt } : {}),
    };
  }

  try {
    await clientWithWriteAccess.patch(_id).set(patch).commit();
    revalidateBlog(slug ?? "");
    return simpleSuccessResponse();
  } catch (error) {
    console.error("Blog post update failed:", error);
    return simpleErrorResponse("Noe gikk galt ved oppdatering av blogginnlegget.", 500);
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await getSanityAdminEditorAuth();
  if ("errorResponse" in auth) return auth.errorResponse;

  const { _id, slug } = await request.json();

  if (!_id) {
    return simpleErrorResponse("_id is required", 400);
  }

  try {
    await clientWithWriteAccess.delete(_id);
    revalidateBlog(slug ?? "");
    return simpleSuccessResponse();
  } catch (error) {
    console.error("Blog post deletion failed:", error);
    return simpleErrorResponse("Noe gikk galt ved sletting av blogginnlegget.", 500);
  }
}
