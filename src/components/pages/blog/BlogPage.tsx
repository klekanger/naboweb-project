import Article from "@/components/Article";
import { Authors } from "@/types/sanity.types";
import type { BlogPageProps } from "@/types/types";
import { Author } from "next/dist/lib/metadata/types/metadata-types";
import { Image } from "sanity";

export default function BlogPage(props: BlogPageProps) {
  const { data } = props;
  const { title, bodyText, _createdAt, _updatedAt, featuredImage, author } =
    data ?? {};

  return (
    <>
      <Article
        title={title}
        bodyText={bodyText}
        createdAt={_createdAt}
        updatedAt={_updatedAt}
        mainImage={featuredImage as Image & { alt?: string }}
        authors={author as Authors[] | undefined}
        buttonLink="/blog"
      />
    </>
  );
}
