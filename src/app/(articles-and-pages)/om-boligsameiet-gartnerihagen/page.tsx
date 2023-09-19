import Article from '@/components/Article';
import { getPageWithId } from '@/lib/api';
import { parseContentfulImage } from '@/lib/parse-contentful-image';
import type { EntryFieldTypes } from 'contentful';
import { MailOpenIcon } from 'lucide-react';

export default async function Page() {
  const pageContent = await getPageWithId('7PSsSBGU8MnlNvPIem8ij');

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
        firstPublishedAt={publishedAt}
        publishedAt={firstPublishedAt}
        mainImage={pageImage}
        buttonLink="/"
      ></Article>
    </>
  );
}
