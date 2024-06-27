import Showcase from "@/components/sections/Showcase";
import Services from "@/components/sections/Services";
import Hero from "@/components/sections/Hero";
import type { HomePageProps } from "@/types/types";

export default function HomePage({ data }: HomePageProps) {
  const {
    frontpageHeroContent,
    frontpageServicesContent,
    frontpageShowcaseContent,
  } = data;

  return (
    <>
      <Hero content={frontpageHeroContent} />
      <Services content={frontpageServicesContent} />
      <Showcase content={frontpageShowcaseContent} />
    </>
  );
}
