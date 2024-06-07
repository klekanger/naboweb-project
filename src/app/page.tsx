import ArticleGrid from "@/components/ArticleGrid";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import Services from "@/components/Services";

import type {
  TypeBlogPostSkeleton,
  TypeForsidetekstSkeleton,
} from "@/types/contentful-types";
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

  const articleGridData =
    await client.withoutUnresolvableLinks.getEntries<TypeBlogPostSkeleton>({
      content_type: "blogPost",
      limit: 4,
      // @ts-expect-error: Ignore type mismatch on this one.
      "fields.privatePost": false,
    });

  return { heroData, introboxData, articleGridData };
}

export default async function Home() {
  const frontPageData = await getFrontPageData();

  const { pageTitle, excerpt, pageImage } =
    frontPageData.heroData.items[0].fields;

  const servicesContent = frontPageData.introboxData.items.map((item) => ({
    fields: {
      description: item.fields.description ?? "",
      title: item.fields.title ?? "",
      icon: item.fields.icon ?? "",
      locked: item.fields.locked ?? false,
      url: item.fields.url ?? undefined,
    },
    sys: {
      id: item.sys.id,
    },
  }));

  return (
    <>
      <main className="flex min-h-screen flex-col mx-auto max-w-7xl px-2 sm:px-5">
        <Navbar />
        <div className="mt-4 sm:mt-8 md:mt-16 container">
          <Hero
            pageTitle={pageTitle}
            excerpt={excerpt ?? ""}
            pageImage={pageImage}
          />
          {/* @ts-expect-error: Ignore type mismatch on this one. TODO*/}
          <Services content={servicesContent} />
          <ArticleGrid articles={frontPageData.articleGridData.items} />
        </div>
      </main>
      <Footer />
    </>
  );
}
