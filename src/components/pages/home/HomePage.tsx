import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import Showcase from "@/components/sections/Showcase";
import type { HomePageProps } from "@/types/types";

export default function HomePage({ data }: HomePageProps) {
  const {
    frontpageHeroContent,
    frontpageServicesContent,
    frontpageShowcaseContent,
  } = data ?? {};

  if (
    !frontpageHeroContent ||
    !frontpageServicesContent ||
    !frontpageShowcaseContent
  ) {
    console.error("Missing content from sanity");
    return null;
  }

  return (
    <>
      <Hero content={frontpageHeroContent} />
      <Services content={frontpageServicesContent} />
      <Showcase content={frontpageShowcaseContent} />
    </>
  );
}
