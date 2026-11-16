import Article from "@/components/Article";
import { sanityFetch } from "@/sanity/lib/live";
import { privateBlogBySlugQuery } from "@/sanity/lib/queries";
import NotLoggedIn from "@/components/NotLoggedIn";
import { getUserWithRole, RESIDENT_ROLES } from "@/lib/requireRole";
import { Authors } from "@/types/sanity.types";
import { notFound } from "next/navigation";
import type { Image as SanityImage } from "sanity";

type Props = {
  params: Promise<{ slug: string }>;
};

//
// Generate the blog page
//
export default async function PrivateBlogRoute(props: Props) {
  // Check the role here, not only in the layout, and before fetching data.
  if (!(await getUserWithRole(RESIDENT_ROLES))) return <NotLoggedIn />;

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
