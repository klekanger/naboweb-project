import { groq } from "next-sanity";

export const frontpageHeroQuery = groq`
  *[_type=="frontpage-hero"]{
    showButton,
    buttonText,
    heroImage,
    bodyText
  }
`;
