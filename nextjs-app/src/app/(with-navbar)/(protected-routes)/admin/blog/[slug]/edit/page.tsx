import BlogEditor from "@/components/admin/BlogEditor";
import BackButton from "@/components/BackButton";
import { client } from "@/sanity/lib/client";
import { allAuthorsQuery, allBlogBySlugQuery } from "@/sanity/lib/queries";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function EditBlogPostPage({ params }: Props) {
  const { slug } = await params;

  const [post, authors] = await Promise.all([
    client.fetch(allBlogBySlugQuery, { slug }),
    client.fetch(allAuthorsQuery),
  ]);

  if (!post) notFound();

  type FeaturedImage = { asset?: { _ref?: string }; caption?: string; alt?: string };
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
    author: (post.author ?? []).map((a: { _id?: string }) => ({
      _id: a._id ?? "",
    })),
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-semibold mb-2">Rediger innlegg</h1>
      <p className="text-foreground/60 mb-8 font-mono text-sm">/{post.slug}</p>

      <BlogEditor
        mode="edit"
        initialData={initialData}
        authors={authors ?? []}
      />

      <div className="mt-10">
        <BackButton buttonLink="/admin/blog" />
      </div>
    </div>
  );
}
