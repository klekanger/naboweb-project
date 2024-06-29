import { PageProps } from "@/types/types";
import Article from "@/components/Article";
import { Image } from "sanity";

export default function Page(props: PageProps) {
  const { data } = props;
  const { title, body, _createdAt, _updatedAt, mainImage } = data ?? {};

  return (
    <>
      <Article
        title={title}
        bodyText={body}
        createdAt={_createdAt}
        updatedAt={_updatedAt}
        mainImage={mainImage as Image & { alt?: string }}
        buttonLink="/"
      />
    </>
  );
}
