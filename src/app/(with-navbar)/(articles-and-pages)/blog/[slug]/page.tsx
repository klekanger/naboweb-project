import { generateStaticSlugs } from "@/sanity/loader/generateStaticSlugs";
import { loadBlogPageBySlug } from "@/sanity/loader/loadQuery";
import BlogPage from "@/components/pages/blog/BlogPage";
// import BlogPagePreview from "@/components/pages/blog/BlogPagePreview";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { Metadata, ResolvingMetadata } from "next";
import { toPlainText } from "next-sanity";
import { urlForOpenGraphImage } from "@/sanity/lib/utils";
import type { Image as SanityImage } from "sanity";
import dynamic from "next/dynamic";

const BlogPagePreview = dynamic(
  () => import("@/components/pages/blog/BlogPagePreview"),
);

type Props = {
  params: { slug: string };
};

//
// Generate metadata for the current page
//
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const slug = params?.slug ?? "";
  const post = await loadBlogPageBySlug(slug);

  const parentResult = await parent;
  const previousImages = parentResult.openGraph?.images ?? [];

  const { title, excerpt, featuredImage } = post.data ?? {};
  const plainTextExcerpt = toPlainText(excerpt ?? []);
  const ogImage = urlForOpenGraphImage(featuredImage as SanityImage) ?? "";

  return {
    title: title,
    description: plainTextExcerpt,
    openGraph: {
      images: [ogImage, ...previousImages],
      type: "article",
      title: title ?? "",
      description: plainTextExcerpt ?? "",
      locale: "nb_NO",
      siteName: "Boligsameiet Gartnerihagen",
      url: `https://gartnerihagen-askim.no/blog/${slug}`,
    },
  };
}

//
// Generate all possible routes
//
export async function generateStaticParams() {
  return await generateStaticSlugs("blogPost");
}

//
// Generate the blog page
//
export default async function BlogRoute({
  params,
}: {
  params: { slug: string };
}) {
  const initial = await loadBlogPageBySlug(params?.slug);

  if (draftMode().isEnabled) {
    return <BlogPagePreview params={params} initial={initial} />;
  }

  if (!initial.data) {
    notFound();
  }

  return <BlogPage data={initial.data} />;
}
