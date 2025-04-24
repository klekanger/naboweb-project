import Article from "@/app/components/Article";
import { sanityFetch } from "@/sanity/lib/live";
import { privateBlogBySlugQuery, privateBlogSlugs } from "@/sanity/lib/queries";
import { Authors } from "@/types/sanity.types";
import { notFound } from "next/navigation";
import type { Image as SanityImage } from "sanity";

type Props = {
  params: Promise<{ slug: string }>;
};

//
// Generate all possible routes
//
export async function generateStaticParams() {
  const { data } = await sanityFetch({
    query: privateBlogSlugs,
    perspective: "published",
    stega: false,
  });

  return data;
}

//
// Generate the blog page
//
export default async function PrivateBlogRoute(props: Props) {
  const params = await props.params;

  const { data } = await sanityFetch({
    query: privateBlogBySlugQuery,
    params: { slug: params.slug },
  });

  if (!data) {
    notFound();
  }

  return (
    <Article
      title={data?.title ?? ""}
      bodyText={data?.bodyText}
      createdAt={data?._createdAt}
      updatedAt={data?._updatedAt}
      mainImage={data?.featuredImage as SanityImage & { lqip: string | null }}
      authors={data?.author as Authors[] | undefined}
      buttonLink="/information"
    />
  );
}
