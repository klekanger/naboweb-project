import Article from '@/components/article';
import { getPageData } from '@/lib/api';
import { parseContentfulImage } from '@/lib/parse-contentful-image';
import type { EntryFieldTypes } from 'contentful';

export default async function Page() {
  const data = await getPageData('1pHKpZ9olO41ThivHkP3Iu');

  const { pageTitle, createdAt, updatedAt, pageImage } = data;
  const pageText = data.pageText as unknown as EntryFieldTypes.RichText;
  const parsedImage = parseContentfulImage(pageImage);

  return (
    <>
      <Article
        title={pageTitle}
        bodyText={pageText}
        createdAt={createdAt}
        updatedAt={updatedAt}
        mainImage={parsedImage}
        buttonLink="/"
      ></Article>
    </>
  );
}
