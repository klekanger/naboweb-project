import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import Showcase from "@/components/sections/Showcase";
import NewUserIntro from "@/components/NewUserIntro";
import { sanityFetch } from "@/sanity/lib/live";

import {
  frontpageHeroQuery,
  frontpageServicesQuery,
  showcaseQuery,
  newUserIntroQuery,
} from "@/sanity/lib/queries";

export default async function Home() {
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
