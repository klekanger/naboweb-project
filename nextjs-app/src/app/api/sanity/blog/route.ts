import { currentUser } from "@clerk/nextjs/server";
import { clientWithWriteAccess } from "@/sanity/lib/client";
import { type NextRequest, NextResponse } from "next/server";
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

function revalidateBlog(slug: string) {
  revalidateTag("blogPost", "max");
  if (slug) revalidateTag(`blogPost:${slug}`, "max");
}

export async function POST(request: NextRequest) {
  const user = await currentUser();
  const roles = (user?.publicMetadata?.roles as string[]) || [];

  if (!roles.includes("admin") && !roles.includes("editor")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body: BlogPostBody = await request.json();
  const { title, slug, privatePost, excerpt, bodyText, featuredImageId, featuredImageCaption, featuredImageAlt, authorIds } = body;

  if (!title || !slug || !bodyText) {
    return NextResponse.json({ error: "title, slug and bodyText are required" }, { status: 400 });
  }

  const doc: Record<string, unknown> = {
    _type: "blogPost",
    title,
    slug: { _type: "slug", current: slug },
    privatePost: privatePost ?? false,
    excerpt: excerpt ?? [],
    bodyText,
  };

  if (featuredImageId) {
    doc.featuredImage = {
      _type: "image",
      asset: { _ref: featuredImageId, _type: "reference" },
      ...(featuredImageCaption ? { caption: featuredImageCaption } : {}),
      ...(featuredImageAlt ? { alt: featuredImageAlt } : {}),
    };
  }

  if (authorIds && authorIds.length > 0) {
    doc.author = authorIds.map((id) => ({
      _type: "reference",
      _ref: id,
      _key: id,
    }));
  }

  try {
    const result = await clientWithWriteAccess.create(doc as Parameters<typeof clientWithWriteAccess.create>[0]);
    revalidateBlog(slug);
    return NextResponse.json({ success: true, _id: result._id, slug });
  } catch (error) {
    console.error("Blog post creation failed:", error);
    return NextResponse.json({ error: "Noe gikk galt ved lagring av blogginnlegget." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const user = await currentUser();
  const roles = (user?.publicMetadata?.roles as string[]) || [];

  if (!roles.includes("admin") && !roles.includes("editor")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body: BlogPostBody = await request.json();
  const { _id, title, slug, privatePost, excerpt, bodyText, featuredImageId, featuredImageCaption, featuredImageAlt, authorIds } = body;

  if (!_id) {
    return NextResponse.json({ error: "_id is required for update" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {
    title,
    slug: { _type: "slug", current: slug },
    privatePost: privatePost ?? false,
    excerpt: excerpt ?? [],
    bodyText,
  };

  if (featuredImageId) {
    patch.featuredImage = {
      _type: "image",
      asset: { _ref: featuredImageId, _type: "reference" },
      ...(featuredImageCaption ? { caption: featuredImageCaption } : {}),
      ...(featuredImageAlt ? { alt: featuredImageAlt } : {}),
    };
  }

  if (authorIds !== undefined) {
    patch.author = authorIds.map((id) => ({
      _type: "reference",
      _ref: id,
      _key: id,
    }));
  }

  try {
    await clientWithWriteAccess.patch(_id).set(patch).commit();
    revalidateBlog(slug ?? "");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Blog post update failed:", error);
    return NextResponse.json({ error: "Noe gikk galt ved oppdatering av blogginnlegget." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const user = await currentUser();
  const roles = (user?.publicMetadata?.roles as string[]) || [];

  if (!roles.includes("admin") && !roles.includes("editor")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { _id, slug } = await request.json();

  if (!_id) {
    return NextResponse.json({ error: "_id is required" }, { status: 400 });
  }

  try {
    await clientWithWriteAccess.delete(_id);
    revalidateBlog(slug ?? "");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Blog post deletion failed:", error);
    return NextResponse.json({ error: "Noe gikk galt ved sletting av blogginnlegget." }, { status: 500 });
  }
}
