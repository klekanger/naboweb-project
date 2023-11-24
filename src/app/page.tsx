import ArticleGrid from "@/components/ArticleGrid";
import HeroWide from "@/components/HeroWide";
import type { TypeForsidetekstSkeleton } from "@/types/contentful-types";
import * as contentful from "contentful";

async function getFrontPageData() {
  const client = contentful.createClient({
    space: process.env.CONTENTFUL_SPACE_ID!,
    accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
  });

  const data =
    await client.withoutUnresolvableLinks.getEntries<TypeForsidetekstSkeleton>({
      content_type: "forsidetekst",
    });

  return data;
}

export default async function Home() {
  const frontPageData = await getFrontPageData();

  const { pageTitle, excerpt, pageImage } = frontPageData.items[0].fields;

  return (
    <>
      <HeroWide
        pageTitle={pageTitle}
        excerpt={excerpt ?? ""}
        pageImage={pageImage}
      />
      <ArticleGrid />
    </>
  );
}
