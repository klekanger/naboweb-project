import ArticleGrid from "@/components/ArticleGrid";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import type { TypeForsidetekstSkeleton } from "@/types/contentful-types";
import { Spacer } from "@nextui-org/react";
import * as contentful from "contentful";

async function getFrontPageData() {
  const client = contentful.createClient({
    space: process.env.CONTENTFUL_SPACE_ID ?? "",
    accessToken: process.env.CONTENTFUL_ACCESS_TOKEN ?? "",
  });

  const heroData =
    await client.withoutUnresolvableLinks.getEntries<TypeForsidetekstSkeleton>({
      content_type: "forsidetekst",
    });

  const introboxData = await client.withoutUnresolvableLinks.getEntries({
    content_type: "introboxes",
  });

  return { heroData, introboxData };
}

export default async function Home() {
  const frontPageData = await getFrontPageData();

  const { pageTitle, excerpt, pageImage } =
    frontPageData.heroData.items[0].fields;

  return (
    <>
      <Hero
        pageTitle={pageTitle}
        excerpt={excerpt ?? ""}
        pageImage={pageImage}
      />
      <Spacer y={16} />
      <Services content={frontPageData.introboxData.items} />
      <ArticleGrid />
    </>
  );
}
