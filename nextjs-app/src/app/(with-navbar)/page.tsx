import NewUserIntro from "@/components/NewUserIntro";
import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import Showcase from "@/components/sections/Showcase";
import { sanityFetch } from "@/sanity/lib/live";
import { cacheLife, cacheTag } from "next/cache";

import {
  frontpageHeroQuery,
  frontpageServicesQuery,
  newUserIntroQuery,
  showcaseQuery,
} from "@/sanity/lib/queries";

export default async function Home() {
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
      return sanityFetch({ query: frontpageHeroQuery });
    })(),
    (async () => {
      cacheTag("frontpage-services");
      return sanityFetch({ query: frontpageServicesQuery });
    })(),
    (async () => {
      cacheTag("frontpage-showcase");
      cacheTag("blogPost");
      return sanityFetch({ query: showcaseQuery });
    })(),
    (async () => {
      cacheTag("frontpage-new-user-intro");
      return sanityFetch({ query: newUserIntroQuery });
    })(),
  ]);

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
