import Article from '@/components/article';
import { getPageData } from '@/lib/api';
import { parseContentfulImage } from '@/lib/parse-contentful-image';
import type { EntryFieldTypes } from 'contentful';

export default async function Page() {
  const data = await getPageData('7PSsSBGU8MnlNvPIem8ij');
  const { pageTitle, createdAt, updatedAt, pageImage } = data;
  const parsedImage = parseContentfulImage(pageImage);
  const pageText = data.pageText as unknown as EntryFieldTypes.RichText;

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
