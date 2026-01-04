import NewUserIntro from "@/components/NewUserIntro";
import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import Showcase from "@/components/sections/Showcase";
import { sanityFetch } from "@/sanity/lib/live";
import { cacheLife, cacheTag } from "next/cache";
import { draftMode } from "next/headers";

import {
  frontpageHeroQuery,
  frontpageServicesQuery,
  newUserIntroQuery,
  showcaseQuery,
} from "@/sanity/lib/queries";

// Cached function for fetching frontpage data (only used when not in draft mode)
async function fetchCachedFrontpageData() {
  "use cache";
  // Cache frontpage content with long cache lifetime, revalidated via tags
  cacheLife("days");

  const [
    { data: heroContent },
    { data: servicesContent },
    { data: showcaseContent },
    { data: newUserIntroContent },
  ] = await Promise.all([
    (async () => {
      cacheTag("frontpage-hero");
      return sanityFetch({
        query: frontpageHeroQuery,
        perspective: "published",
      });
    })(),
    (async () => {
      cacheTag("frontpage-services");
      return sanityFetch({
        query: frontpageServicesQuery,
        perspective: "published",
      });
    })(),
    (async () => {
      cacheTag("frontpage-showcase");
      cacheTag("blogPost");
      return sanityFetch({
        query: showcaseQuery,
        perspective: "published",
      });
    })(),
    (async () => {
      cacheTag("frontpage-new-user-intro");
      return sanityFetch({
        query: newUserIntroQuery,
        perspective: "published",
      });
    })(),
  ]);

  return {
    heroContent,
    servicesContent,
    showcaseContent,
    newUserIntroContent,
  };
}

// Dynamic function for fetching frontpage data (used when in draft mode)
async function fetchDynamicFrontpageData() {
  const [
    { data: heroContent },
    { data: servicesContent },
    { data: showcaseContent },
    { data: newUserIntroContent },
  ] = await Promise.all([
    sanityFetch({ query: frontpageHeroQuery }),
    sanityFetch({ query: frontpageServicesQuery }),
    sanityFetch({ query: showcaseQuery }),
    sanityFetch({ query: newUserIntroQuery }),
  ]);

  return {
    heroContent,
    servicesContent,
    showcaseContent,
    newUserIntroContent,
  };
}

export default async function Home() {
  // Check draft mode outside of cache scope
  const { isEnabled: isDraftMode } = await draftMode();

  // Use cached version when not in draft mode, dynamic version when in draft mode
  const { heroContent, servicesContent, showcaseContent, newUserIntroContent } =
    isDraftMode
      ? await fetchDynamicFrontpageData()
      : await fetchCachedFrontpageData();

  const { enableShowcase } = showcaseContent || {};
  const { enableNewUserIntro } = newUserIntroContent || {};

  return (
    <>
      <Hero content={heroContent} />
      <Services content={servicesContent} />
      {enableNewUserIntro && <NewUserIntro content={newUserIntroContent} />}
      {enableShowcase && <Showcase content={showcaseContent} />}
    </>
  );
}
