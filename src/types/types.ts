import type { Asset, EntryFieldTypes, EntryFields } from 'contentful';
import { TypeBlogPostFields, TypePageFields } from './contentful-types';

export type ContentImage = {
  title: string;
  url: string;
  description: string;
  width: number;
  height: number;
};

export type ArticleProps = {
  title: string;
  authors?: {
    fields: {
      firstName: string;
      lastName: string;
    };
  }[];
  bodyText: TypePageFields['pageText'];
  firstPublishedAt: EntryFields.Date;
  publishedAt: EntryFields.Date;
  mainImage?: ContentImage;
  buttonLink: string;
};

export type BlogPostItemProps = {
  sys: {
    id: string;
    createdAt: EntryFields.Date;
    updatedAt: EntryFields.Date;
  };
  fields: {
    privatePost: boolean;
    title: string;
    excerpt: string;
    featuredImage: EntryFieldTypes.AssetLink | undefined;
    slug: string;
  };
};

export type BlogPostListProps = {
  sys: {
    id: string;
  };
  posts: BlogPostItemProps[];
};

export type fetchGraphQLReturnTypeForPage = {
  data: {
    page: TypePageFields & {
      sys: {
        id: string;
        publishedAt: EntryFields.Date;
        firstPublishedAt: EntryFields.Date;
      };
    };
  };
};

export type fetchGraphQLReturnTypeForBlogPosts = {
  data: {
    blogPostCollection: {
      total: number;
      items: {
        sys: {
          id: string;
          publishedAt: `${number}-${number}-${number}T${number}:${number}:${number}Z`;
          firstPublishedAt: `${number}-${number}-${number}T${number}:${number}:${number}Z`;
        };
        privatePost: boolean;
        title: string;
        excerpt: string;
        featuredImage?: EntryFieldTypes.AssetLink;
        bodyText: EntryFieldTypes.RichText;
        author?: {
          firstName: string;
          lastName: string;
          authorImage?: EntryFieldTypes.AssetLink;
        };
        slug: string;
      }[];
    };
  };
};

export type getPageDataReturnTypes = {
  pageTitle: string;
  excerpt?: string;
  pageText: EntryFieldTypes.RichText;
  slug: string;
  id: string;
  pageImage?: EntryFieldTypes.AssetLink;
  createdAt: EntryFields.Date;
  updatedAt: EntryFields.Date;
};

export type EmbeddedAsset = {
  title: string;
  description: string;
  file: {
    url: string;
    details: {
      size: number;
      image: {
        width: number;
        height: number;
      };
    };
    fileName: string;
    contentType: string;
  };
};

export type HeroWideProps = {
  pageTitle: string;
  excerpt: string;
  pageImage: Asset<'WITHOUT_UNRESOLVABLE_LINKS'> | undefined;
};
