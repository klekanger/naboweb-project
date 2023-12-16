import Article from "@/components/Article";
import { getPageWithId } from "@/lib/api";

export default async function Page() {
  const pageContent = await getPageWithId("1pHKpZ9olO41ThivHkP3Iu");

  const {
    pageTitle,
    pageImage,
    sys: { publishedAt, firstPublishedAt },
  } = pageContent.data.page;

  const pageText = pageContent.data.page.pageText;

  return (
    <>
      <Article
        title={pageTitle}
        bodyText={pageText}
        firstPublishedAt={firstPublishedAt}
        publishedAt={publishedAt}
        mainImage={pageImage}
        buttonLink="/"
      />
    </>
  );
}
