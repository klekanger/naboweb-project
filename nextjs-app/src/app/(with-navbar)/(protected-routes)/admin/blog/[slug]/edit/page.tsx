import BlogEditPageContent from "@/components/admin/BlogEditPageContent";
import { currentUser } from "@clerk/nextjs/server";
import { client } from "@/sanity/lib/client";
import { getAuthorPortraitUrlForClerkUser } from "@/sanity/lib/get-author-portrait-url";
import { urlForImage } from "@/sanity/lib/utils";
import { allBlogBySlugQuery } from "@/sanity/lib/queries";
import { notFound } from "next/navigation";
import type { Image } from "sanity";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function EditBlogPostPage({ params }: Props) {
  const { slug } = await params;

  const [post, user] = await Promise.all([
    client.fetch(allBlogBySlugQuery, { slug }),
    currentUser(),
  ]);

  const roles = (user?.publicMetadata?.roles as string[]) ?? [];
  const authorDisplayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    user?.primaryEmailAddress?.emailAddress ||
    "Ukjent bruker";

  if (!post) notFound();

  const currentAuthorPortraitUrl = await getAuthorPortraitUrlForClerkUser(
    user?.id ?? "",
    user?.primaryEmailAddress?.emailAddress ?? "",
  );

  type FeaturedImage = {
    asset?: { _ref?: string };
    caption?: string;
    alt?: string;
  };
  const featuredImg = post.featuredImage as FeaturedImage | undefined;

  const initialData = {
    _id: post._id,
    title: post.title ?? "",
    slug: post.slug ?? "",
    privatePost: post.privatePost ?? false,
    excerpt: post.excerpt ?? [],
    bodyText: post.bodyText ?? [],
    featuredImage: featuredImg
      ? {
          asset: { _ref: featuredImg.asset?._ref ?? "" },
          caption: featuredImg.caption,
          alt: featuredImg.alt,
        }
      : undefined,
    author: (post.author ?? [])
      .map(
        (a: {
          _id?: string;
          firstName?: string | null;
          lastName?: string | null;
          email?: string | null;
          authorImage?: Image;
        }) => ({
          _id: a._id ?? "",
          firstName: a.firstName ?? null,
          lastName: a.lastName ?? null,
          email: a.email ?? null,
          portraitUrl:
            urlForImage(a.authorImage)
              ?.width(128)
              .height(128)
              .fit("crop")
              .url() ?? null,
        }),
      )
      .filter((a) => a._id),
  };

  return (
    <BlogEditPageContent
      postSlug={post.slug ?? ""}
      initialData={initialData}
      currentAuthorId={user?.id ?? ""}
      authorDisplayName={authorDisplayName}
      currentUserEmail={user?.primaryEmailAddress?.emailAddress ?? ""}
      currentAuthorPortraitUrl={currentAuthorPortraitUrl}
      isAdmin={roles.includes("admin")}
    />
  );
}
