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
import { SITE_NAME, SITE_URL } from "@/lib/constants";

const BlogPagePreview = dynamic(
  () => import("@/components/pages/blog/BlogPagePreview"),
);

type Props = {
  params: Promise<{ slug: string }>;
};

//
// Generate metadata for the current page
//
export async function generateMetadata(
  props: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const params = await props.params;
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
      siteName: SITE_NAME,
      url: `${SITE_URL}/blog/${slug}`,
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
export default async function BlogRoute(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const initial = await loadBlogPageBySlug(params?.slug);

  if ((await draftMode()).isEnabled) {
    return <BlogPagePreview params={params} initial={initial} />;
  }

  if (!initial.data) {
    notFound();
  }

  return <BlogPage data={initial.data} />;
}
