import Article from "@/components/Article";
import { sanityFetch } from "@/sanity/lib/live";
import { pageBySlugQuery, pageSlugs } from "@/sanity/lib/queries";
import { urlForOpenGraphImage } from "@/sanity/lib/utils";
import { Metadata, ResolvingMetadata } from "next";
import { toPlainText } from "next-sanity";
import type { Image as SanityImage } from "sanity";
import { cacheLife, cacheTag } from "next/cache";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

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
  cacheTag("page");
  cacheTag(`page:${params.slug}`);

  const { data: pageData } = await sanityFetch({
    query: pageBySlugQuery,
    params: { slug: params.slug },
    // Use the published perspective in generateMetadata
    perspective: "published",
    stega: false,
  });

  const description = toPlainText(pageData?.overview ?? []) ?? "";
  let ogImage = "/og_naboweb.webp";

  if (!pageData) {
    return {
      title: SITE_NAME,
      description: "",
      robots: {
        index: false,
        follow: false,
        googleBot: { index: false, follow: false },
      },
    };
  }

  if (pageData && "mainImage" in pageData) {
    ogImage =
      urlForOpenGraphImage(pageData.mainImage as SanityImage) ?? ogImage;
  }

  return {
    title: pageData?.title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${params.slug}`,
    },
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

// Cached function for fetching page data (only used when not in draft mode)
async function fetchCachedPage(slug: string) {
  "use cache";
  // Cache pages with long lifetime, revalidated via tags when content changes
  cacheLife("days");

  cacheTag("page");
  cacheTag(`page:${slug}`);

  const { data } = await sanityFetch({
    query: pageBySlugQuery,
    params: { slug },
    perspective: "published",
  });

  return data;
}

// Dynamic function for fetching page data (used when in draft mode)
async function fetchDynamicPage(slug: string) {
  const { data } = await sanityFetch({
    query: pageBySlugQuery,
    params: { slug },
  });

  return data;
}

export default async function PageSlugRoute(props: Props) {
  // Check draft mode outside of cache scope
  const { isEnabled: isDraftMode } = await draftMode();

  const params = await props.params;

  // Use cached version when not in draft mode, dynamic version when in draft mode
  const data = isDraftMode
    ? await fetchDynamicPage(params.slug)
    : await fetchCachedPage(params.slug);

  if (!data) notFound();

  const canonicalUrl = `${SITE_URL}/${params.slug}`;
  const description = toPlainText(data.overview ?? []);
  const imageUrl =
    urlForOpenGraphImage(data.mainImage as SanityImage) ?? undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Hjem",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: data.title ?? "",
            item: canonicalUrl,
          },
        ],
      },
      {
        "@type": "WebPage",
        name: data.title ?? "",
        description,
        url: canonicalUrl,
        primaryImageOfPage: imageUrl
          ? {
              "@type": "ImageObject",
              url: imageUrl,
            }
          : undefined,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        // JSON-LD is not executed as JS; this is the recommended way to embed it in Next.js.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Article
        title={data?.title ?? ""}
        bodyText={data?.body}
        createdAt={data?._createdAt}
        updatedAt={data?._updatedAt}
        mainImage={data?.mainImage as SanityImage & { lqip: string | null }}
        buttonLink="/"
      />
    </>
  );
}
