import Hero from "@/app/components/sections/Hero";
import Services from "@/app/components/sections/Services";
import Showcase from "@/app/components/sections/Showcase";
import { sanityFetch } from "@/sanity/lib/live";
import {
  frontpageHeroQuery,
  frontpageServicesQuery,
  showcaseQuery,
} from "@/sanity/lib/queries";

export default async function Home() {
  const [
    { data: heroContent },
    { data: servicesContent },
    { data: showcaseContent },
  ] = await Promise.all([
    sanityFetch({ query: frontpageHeroQuery }),
    sanityFetch({ query: frontpageServicesQuery }),
    sanityFetch({ query: showcaseQuery }),
  ]);

  return (
    <>
      <Hero content={heroContent} />
      <Services content={servicesContent} />
      <Showcase content={showcaseContent} />
    </>
  );
}
