import { generateStaticSlugs } from "@/sanity/loader/generateStaticSlugs";
import { loadPrivateBlogPageBySlug } from "@/sanity/loader/loadQuery";
import BlogPage from "@/components/pages/blog/BlogPage";
import BlogPagePreview from "@/components/pages/blog/BlogPagePreview";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { ResolvingMetadata } from "next";

type Props = {
  params: { slug: string };
};

//
// Generate all possible routes
//
export function generateStaticParams() {
  return generateStaticSlugs("blogPost");
}

//
// Generate the blog page
//
export default async function PageBlogRoute({ params }: Props) {
  const initial = await loadPrivateBlogPageBySlug(params?.slug);

  if (draftMode().isEnabled) {
    return <BlogPagePreview params={params} initial={initial} />;
  }

  if (!initial.data) {
    notFound();
  }

  return <BlogPage data={initial.data} />;
}
