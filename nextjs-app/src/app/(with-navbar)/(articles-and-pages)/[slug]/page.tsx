import Article from "@/components/Article";
import { sanityFetch } from "@/sanity/lib/live";
import { pageBySlugQuery, pageSlugs } from "@/sanity/lib/queries";
import { urlForOpenGraphImage } from "@/sanity/lib/utils";
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
  const params = await props.params;

  const { data: pageData } = await sanityFetch({
    query: pageBySlugQuery,
    params: { slug: params.slug },
    // Use the published perspective in generateMetadata
    perspective: "published",
    stega: false,
  });

  const description = toPlainText(pageData?.overview ?? []) ?? "";
  let ogImage = "/og_naboweb.webp";

  if (pageData && "mainImage" in pageData) {
    ogImage =
      urlForOpenGraphImage(pageData.mainImage as SanityImage) ?? ogImage;
  }

  return {
    title: pageData?.title,
    description,
    openGraph: {
      title: pageData?.title || "",
      description,
      images: [ogImage],
    },
  };
}

export async function generateStaticParams() {
  "use cache";
  // Cache static params generation
  cacheLife("days");
  cacheTag("page");

  const { data } = await sanityFetch({
    query: pageSlugs,
    // Use the published perspective in generateStaticParams
    perspective: "published",
    stega: false,
  });
  return data;
}

export default async function PageSlugRoute(props: Props) {
  "use cache";
  // Cache pages with long lifetime, revalidated via tags when content changes
  cacheLife("days");

  const params = await props.params;
  cacheTag("page");
  cacheTag(`page:${params.slug}`);

  const { data } = await sanityFetch({
    query: pageBySlugQuery,
    params: { slug: params.slug },
  });

  return (
    <Article
      title={data?.title ?? ""}
      bodyText={data?.body}
      createdAt={data?._createdAt}
      updatedAt={data?._updatedAt}
      mainImage={data?.mainImage as SanityImage & { lqip: string | null }}
      buttonLink="/"
    />
  );
}
