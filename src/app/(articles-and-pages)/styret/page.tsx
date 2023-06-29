import Article from '@/components/article';
import type { TypePageSkeleton } from '@/types/contentful-types';
import * as contentful from 'contentful';

async function getPageData() {
  const client = contentful.createClient({
    space: process.env.CONTENTFUL_SPACE_ID!,
    accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
  });

  const data = await client.getEntry<TypePageSkeleton>(
    '7CuzbRltnJgiJtib2jSmt5'
  );

  return data;
}

export default async function Page() {
  const pageData = await getPageData();
  const { pageTitle, excerpt, pageText, pageImage } = pageData.fields;
  const { createdAt, updatedAt } = pageData.sys;

  return (
    <>
      <Article
        title={pageTitle}
        bodyText={pageText}
        createdAt={createdAt}
        updatedAt={updatedAt}
        MainImage={pageImage}
        buttonLink="/"
      />
    </>
  );
}
