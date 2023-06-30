import type { TypePageSkeleton } from '@/types/contentful-types';
import type { getPageDataReturnTypes } from '@/types/types';
import * as contentful from 'contentful';

const client = contentful.createClient({
  space: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
});

export async function getPageData(id: string): Promise<getPageDataReturnTypes> {
  const data = await client.withoutUnresolvableLinks.getEntry<TypePageSkeleton>(
    id
  );

  return {
    pageTitle: data.fields.pageTitle,
    excerpt: data.fields.excerpt,
    pageText: data.fields
      .pageText as unknown as contentful.EntryFieldTypes.RichText,
    slug: data.fields.slug,
    id: data.sys.id,
    pageImage: data.fields
      .pageImage as unknown as contentful.EntryFieldTypes.AssetLink,
    createdAt: data.sys.createdAt,
    updatedAt: data.sys.updatedAt,
  };
}
