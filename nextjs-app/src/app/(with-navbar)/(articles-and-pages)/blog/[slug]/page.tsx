import Article from "@/components/Article";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { sanityFetch } from "@/sanity/lib/live";
import { blogBySlugQuery, blogSlugs } from "@/sanity/lib/queries";
import { urlForOpenGraphImage } from "@/sanity/lib/utils";
import { Authors } from "@/types/sanity.types";
import { Metadata, ResolvingMetadata } from "next";
import { toPlainText } from "next-sanity";
import type { Image as SanityImage } from "sanity";
import { cacheLife, cacheTag } from "next/cache";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(
  props: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  "use cache";
  cacheLife("days");

  const params = await props.params;
  cacheTag("blogPost");
  cacheTag(`blogPost:${params.slug}`);

  const { data } = await sanityFetch({
    query: blogBySlugQuery,
    params: { slug: params.slug },
    perspective: "published",
    stega: false,
  });

  const parentResult = await parent;
  const previousImages = parentResult.openGraph?.images ?? [];

  const { title, excerpt, featuredImage } = data ?? {};
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
      url: `${SITE_URL}/blog/${params.slug}`,
    },
  };
}

//
// Generate all possible routes
//
export async function generateStaticParams() {
  "use cache";
  // Cache static params generation
  cacheLife("days");
  cacheTag("blogPost");

  const { data } = await sanityFetch({
    query: blogSlugs,
    perspective: "published",
    stega: false,
  });
  return data;
}

//
// Generate the blog page
//
export default async function BlogRoute(props: Props) {
  "use cache";
  // Cache blog posts with long lifetime, revalidated via tags when content changes
  cacheLife("days");

  const params = await props.params;
  cacheTag("blogPost");
  cacheTag(`blogPost:${params.slug}`);

  const { data } = await sanityFetch({
    query: blogBySlugQuery,
    params: { slug: params.slug },
  });

  return (
    <Article
      title={data?.title ?? ""}
      bodyText={data?.bodyText}
      createdAt={data?._createdAt}
      updatedAt={data?._updatedAt}
      mainImage={data?.featuredImage as SanityImage & { lqip: string | null }}
      authors={data?.author as Authors[] | undefined}
      buttonLink="/blog"
    />
  );
}
